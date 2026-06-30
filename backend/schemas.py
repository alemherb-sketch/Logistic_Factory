from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List

class Location(BaseModel):
    latitude: float
    longitude: float

class ReportBase(BaseModel):
    id: str
    code: str = ""
    date: str = ""
    technician: str = ""
    vehicle: str = ""
    plate: str = ""
    brand: str = ""
    issue: str = ""
    actionTaken: str = ""
    partsUsed: str = ""
    finalStatus: str = ""
    location: Optional[Location] = None

    # Be tolerant of legacy/partial reports from the app so a single bad record
    # never 422s the whole batch: coerce null text fields to "".
    @field_validator(
        "code", "date", "technician", "vehicle", "plate", "brand",
        "issue", "actionTaken", "partsUsed", "finalStatus",
        mode="before",
    )
    @classmethod
    def _none_to_empty(cls, v):
        return "" if v is None else v

    # Drop an incomplete GPS fix (missing/null lat or lng) instead of rejecting.
    @field_validator("location", mode="before")
    @classmethod
    def _clean_location(cls, v):
        if not isinstance(v, dict):
            return None
        if v.get("latitude") is None or v.get("longitude") is None:
            return None
        return v

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
