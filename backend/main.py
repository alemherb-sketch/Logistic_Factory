from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Logistic Factory API")

# Allow CORS for the React web app and mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

last_error = None

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        global last_error
        last_error = traceback.format_exc()
        raise

@app.get("/api/dev/last-error")
def get_last_error():
    return {"error": last_error}


from sqlalchemy import text

@app.on_event("startup")
def on_startup():
    # Create the bootstrap admin account if none exists. Never let a seeding
    # hiccup take the whole API down.
    try:
        auth.seed_admin()
    except Exception as e:
        print(f"[startup] seed_admin failed: {e}")


@app.get("/api/dev/reset-db")
def reset_db():
    # Helper to clean the database if migrations fail
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    auth.seed_admin()
    return {"message": "Base de datos reiniciada correctamente"}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Logistic Factory API is running"}


# --- Auth ---
@app.post("/api/auth/login", response_model=schemas.Token)
def login(creds: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == creds.username).first()
    if not user or not auth.verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    return {
        "access_token": auth.create_access_token(user),
        "token_type": "bearer",
        "user": user,
    }


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def me(current: models.User = Depends(auth.get_current_user)):
    return current


# --- Users (admin only) ---
@app.get("/api/users", response_model=list[schemas.UserResponse])
def list_users(db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    return db.query(models.User).order_by(models.User.id).all()


@app.post("/api/users", response_model=schemas.UserResponse)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    user = models.User(
        username=payload.username,
        full_name=payload.full_name,
        role=payload.role if payload.role in ("admin", "technician") else "technician",
        hashed_password=auth.hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.delete("/api/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        if user.id == admin.id:
            raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
        db.delete(user)
        db.commit()
    return {"message": "Deleted"}


# --- Reports ---
@app.post("/api/reports/sync")
def sync_reports(
    request: schemas.ReportSyncRequest,
    db: Session = Depends(get_db),
):
    synced_ids = []
    for rep in request.reports:
        existing = db.query(models.Report).filter(models.Report.id == rep.id).first()
        if not existing:
            new_report = models.Report(
                id=rep.id,
                code=rep.code,
                date=rep.date,
                technician=rep.technician,  # fallback to the app's field
                vehicle=rep.vehicle,
                plate=rep.plate,
                brand=rep.brand,
                issue=rep.issue,
                actionTaken=rep.actionTaken,
                partsUsed=rep.partsUsed,
                finalStatus=rep.finalStatus,
                latitude=rep.location.latitude if rep.location else None,
                longitude=rep.location.longitude if rep.location else None,
                owner_username=None,
            )
            db.add(new_report)
        synced_ids.append(rep.id)

    db.commit()
    return {"message": "Synced successfully", "synced_ids": synced_ids}


@app.get("/api/reports")
def get_reports(
    db: Session = Depends(get_db),
):
    q = db.query(models.Report)
    return q.order_by(models.Report.created_at.desc()).all()


@app.delete("/api/reports/{report_id}")
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    rep = db.query(models.Report).filter(models.Report.id == report_id).first()
    if rep:
        db.delete(rep)
        db.commit()
    return {"message": "Deleted"}


# --- Technicians CRUD (admin only) ---
@app.get("/api/technicians", response_model=list[schemas.TechnicianResponse])
def get_technicians(db: Session = Depends(get_db)):
    # Public read so the mobile app (no login) can populate its dropdown.
    return db.query(models.Technician).all()


@app.post("/api/technicians", response_model=schemas.TechnicianResponse)
def create_technician(
    tech: schemas.TechnicianCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    db_tech = models.Technician(**tech.model_dump())
    db.add(db_tech)
    db.commit()
    db.refresh(db_tech)
    return db_tech


@app.delete("/api/technicians/{tech_id}")
def delete_technician(
    tech_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    db_tech = db.query(models.Technician).filter(models.Technician.id == tech_id).first()
    if db_tech:
        db.delete(db_tech)
        db.commit()
    return {"message": "Deleted"}


# --- Parts CRUD (admin only) ---
@app.get("/api/parts", response_model=list[schemas.PartResponse])
def get_parts(db: Session = Depends(get_db)):
    # Public read so the mobile app (no login) can populate its dropdown.
    return db.query(models.Part).all()


@app.post("/api/parts", response_model=schemas.PartResponse)
def create_part(
    part: schemas.PartCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    db_part = models.Part(**part.model_dump())
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part


@app.delete("/api/parts/{part_id}")
def delete_part(
    part_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    db_part = db.query(models.Part).filter(models.Part.id == part_id).first()
    if db_part:
        db.delete(db_part)
        db.commit()
    return {"message": "Deleted"}
