from pydantic import BaseModel
from typing import Optional, List

class Location(BaseModel):
    latitude: float
    longitude: float

class ReportBase(BaseModel):
    id: str
    code: str
    date: str
    technician: str
    vehicle: str
    plate: str
    brand: str
    issue: str
    actionTaken: str
    partsUsed: str
    finalStatus: str
    location: Optional[Location] = None

class ReportSyncRequest(BaseModel):
    reports: List[ReportBase]

class ReportResponse(ReportBase):
    pass
