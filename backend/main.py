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

# Crud endpoints for Technicians, Users, Parts can be added here
