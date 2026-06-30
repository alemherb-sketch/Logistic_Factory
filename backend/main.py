from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
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

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Logistic Factory API is running"}

@app.post("/api/reports/sync")
def sync_reports(request: schemas.ReportSyncRequest, db: Session = Depends(get_db)):
    synced_ids = []
    for rep in request.reports:
        # Check if already exists
        existing = db.query(models.Report).filter(models.Report.id == rep.id).first()
        if not existing:
            new_report = models.Report(
                id=rep.id,
                code=rep.code,
                date=rep.date,
                technician=rep.technician,
                vehicle=rep.vehicle,
                plate=rep.plate,
                brand=rep.brand,
                issue=rep.issue,
                actionTaken=rep.actionTaken,
                partsUsed=rep.partsUsed,
                finalStatus=rep.finalStatus,
                latitude=rep.location.latitude if rep.location else None,
                longitude=rep.location.longitude if rep.location else None
            )
            db.add(new_report)
        synced_ids.append(rep.id)
    
    db.commit()
    return {"message": "Synced successfully", "synced_ids": synced_ids}

@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(models.Report).order_by(models.Report.created_at.desc()).all()
    return reports

# --- Technicians CRUD ---
@app.get("/api/technicians", response_model=list[schemas.TechnicianResponse])
def get_technicians(db: Session = Depends(get_db)):
    return db.query(models.Technician).all()

@app.post("/api/technicians", response_model=schemas.TechnicianResponse)
def create_technician(tech: schemas.TechnicianCreate, db: Session = Depends(get_db)):
    db_tech = models.Technician(**tech.model_dump())
    db.add(db_tech)
    db.commit()
    db.refresh(db_tech)
    return db_tech

@app.delete("/api/technicians/{tech_id}")
def delete_technician(tech_id: int, db: Session = Depends(get_db)):
    db_tech = db.query(models.Technician).filter(models.Technician.id == tech_id).first()
    if db_tech:
        db.delete(db_tech)
        db.commit()
    return {"message": "Deleted"}

# --- Parts CRUD ---
@app.get("/api/parts", response_model=list[schemas.PartResponse])
def get_parts(db: Session = Depends(get_db)):
    return db.query(models.Part).all()

@app.post("/api/parts", response_model=schemas.PartResponse)
def create_part(part: schemas.PartCreate, db: Session = Depends(get_db)):
    db_part = models.Part(**part.model_dump())
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part

@app.delete("/api/parts/{part_id}")
def delete_part(part_id: int, db: Session = Depends(get_db)):
    db_part = db.query(models.Part).filter(models.Part.id == part_id).first()
    if db_part:
        db.delete(db_part)
        db.commit()
    return {"message": "Deleted"}
