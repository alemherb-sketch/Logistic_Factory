from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class Technician(Base):
    __tablename__ = "technicians"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, default="")
    hashed_password = Column(String)
    role = Column(String, default="technician")  # 'admin' | 'technician'

class Part(Base):
    __tablename__ = "parts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    stock = Column(Integer, default=0)

class Report(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, index=True) # UUID from mobile
    code = Column(String, unique=True, index=True)
    date = Column(String)
    technician = Column(String)
    vehicle = Column(String)
    plate = Column(String)
    brand = Column(String)
    issue = Column(String)
    actionTaken = Column(String)
    partsUsed = Column(String)
    finalStatus = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    owner_username = Column(String, index=True, nullable=True)  # técnico que lo creó
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
