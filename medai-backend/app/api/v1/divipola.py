from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from pydantic import BaseModel
from app.db.database import get_db

router = APIRouter(prefix="/divipola", tags=["Maestros DANE / DIVIPOLA"])

class DivipolaItem(BaseModel):
    code: str
    name: str

    class Config:
        from_attributes = True

@router.get("/departments", response_model=List[DivipolaItem])
def get_departments(db: Session = Depends(get_db)):
    sql = text("SELECT code, name FROM divipola_departments ORDER BY name ASC")
    result = db.execute(sql).mappings().all()
    return result

@router.get("/municipalities/{department_code}", response_model=List[DivipolaItem])
def get_municipalities(department_code: str, db: Session = Depends(get_db)):
    sql = text("SELECT code, name FROM divipola_municipalities WHERE department_code = :dept ORDER BY name ASC")
    result = db.execute(sql, {"dept": department_code}).mappings().all()
    return result