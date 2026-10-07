from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date
from uuid import UUID

class PatientBase(BaseModel):
    document_type: str = Field(..., description="CC, CE, TI, PA, RC")
    document_number: str
    first_name: str
    last_name: str
    birth_date: date
    gender: str
    department_code: str = Field(..., max_length=2, description="Código DANE Depto (ej: 13)")
    municipality_code: str = Field(..., max_length=5, description="Código DANE Munic (ej: 13001)")
    eps_name: Optional[str] = None
    regime: str = "CONTRIBUTIVO"
    zone: str = "URBANA"
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    allergies: Optional[List[str]] = []
    chronic_conditions: Optional[List[str]] = []

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: UUID

    class Config:
        from_attributes = True