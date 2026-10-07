from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.db.database import get_db
from app.schemas.patient import PatientCreate, PatientResponse

router = APIRouter(prefix="/patients", tags=["Gestión de Pacientes"])

@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    # Verificar si el documento ya existe
    check_query = text("SELECT id FROM patients WHERE document_number = :doc")
    existing = db.execute(check_query, {"doc": patient.document_number}).fetchone()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un paciente registrado con este número de documento"
        )

    # Insertar paciente
    insert_query = text("""
        INSERT INTO patients (
            document_type, document_number, first_name, last_name, birth_date,
            gender, department_code, municipality_code, eps_name, regime, zone,
            phone, email, allergies, chronic_conditions
        ) VALUES (
            :doc_type, :doc_num, :first_name, :last_name, :birth_date,
            :gender, :dept_code, :munc_code, :eps, :regime, :zone,
            :phone, :email, :allergies, :conditions
        ) RETURNING id, document_type, document_number, first_name, last_name,
                    birth_date, gender, department_code, municipality_code,
                    eps_name, regime, zone, phone, email, allergies, chronic_conditions
    """)
    
    result = db.execute(insert_query, {
        "doc_type": patient.document_type,
        "doc_num": patient.document_number,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "birth_date": patient.birth_date,
        "gender": patient.gender,
        "dept_code": patient.department_code,
        "munc_code": patient.municipality_code,
        "eps": patient.eps_name,
        "regime": patient.regime,
        "zone": patient.zone,
        "phone": patient.phone,
        "email": patient.email,
        "allergies": patient.allergies,
        "conditions": patient.chronic_conditions
    }).fetchone()

    db.commit()
    return result

@router.get("/search", response_model=List[PatientResponse])
def search_patients(query_str: Optional[str] = "", db: Session = Depends(get_db)):
    search_term = f"%{query_str}%"
    sql = text("""
        SELECT id, document_type, document_number, first_name, last_name,
               birth_date, gender, department_code, municipality_code,
               eps_name, regime, zone, phone, email, allergies, chronic_conditions
        FROM patients
        WHERE document_number LIKE :q 
           OR LOWER(first_name) LIKE LOWER(:q) 
           OR LOWER(last_name) LIKE LOWER(:q)
        LIMIT 20
    """)
    return db.execute(sql, {"q": search_term}).fetchall()