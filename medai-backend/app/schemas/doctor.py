from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID

class DoctorCreate(BaseModel):
    email: EmailStr
    password: str
    document_type: str
    document_number: str
    first_name: str
    last_name: str
    medical_license: str
    specialty: Optional[str] = "Medicina General"
    phone: Optional[str] = None
    ips_ids: Optional[list[int]]

class DoctorResponse(BaseModel):
    id: int
    user_id: UUID
    email: str
    document_type: str
    document_number: str
    first_name: str
    last_name: str
    medical_license: str
    specialty: str
    phone: Optional[str] = None

class Config:
    from_attributes = True