from pydantic import BaseModel, ConfigDict
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

class TechnicianBase(BaseModel):
    name: str
    email: str
    phone: str

class TechnicianCreate(TechnicianBase):
    pass

class TechnicianResponse(TechnicianBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PartBase(BaseModel):
    name: str
    stock: int

class PartCreate(PartBase):
    pass

class PartResponse(PartBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
