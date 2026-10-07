from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.db.database import get_db
from app.schemas.doctor import DoctorCreate, DoctorResponse
from app.core.security import get_password_hash  # Ajusta la ruta a tu archivo de security.py

router = APIRouter(
    prefix="/api/v1/doctors",
    tags=["Doctors"]
)

@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(doctor_data: DoctorCreate, db: Session = Depends(get_db)):
    # 1. Verificar correo existente
    check_user = db.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": doctor_data.email}
    ).fetchone()
    if check_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )

    # 2. Verificar cédula o tarjeta profesional
    check_doc = db.execute(
        text("SELECT id FROM doctors WHERE document_number = :doc OR medical_license = :license"),
        {"doc": doctor_data.document_number, "license": doctor_data.medical_license}
    ).fetchone()
    if check_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El documento de identidad o la tarjeta profesional ya existen."
        )

    try:
        # 3. Hashear contraseña e insertar usuario
        hashed_pwd = get_password_hash(doctor_data.password)
        full_name = f"{doctor_data.first_name} {doctor_data.last_name}"

        user_query = text("""
            INSERT INTO users (email, password_hash, full_name, role, is_active)
            VALUES (:email, :pwd, :name, 'DOCTOR', TRUE)
            RETURNING id;
        """)
        user_result = db.execute(user_query, {
            "email": doctor_data.email,
            "pwd": hashed_pwd,
            "name": full_name
        }).fetchone()

        user_id = user_result.id

        # 4. Insertar en tabla doctors
        doctor_query = text("""
            INSERT INTO doctors (user_id, document_type, document_number, first_name, last_name, medical_license, specialty, phone)
            VALUES (:user_id, :doc_type, :doc_num, :first_name, :last_name, :license, :specialty, :phone)
            RETURNING id, user_id, document_type, document_number, first_name, last_name, medical_license, specialty, phone;
        """)
        doc_res = db.execute(doctor_query, {
            "user_id": user_id,
            "doc_type": doctor_data.document_type,
            "doc_num": doctor_data.document_number,
            "first_name": doctor_data.first_name,
            "last_name": doctor_data.last_name,
            "license": doctor_data.medical_license,
            "specialty": doctor_data.specialty,
            "phone": doctor_data.phone
        }).fetchone()

        doctor_id = doc_res.id

        # 5. Asignar IPS en tabla pivote doctor_ips
        if doctor_data.ips_ids:
            for ips_id in doctor_data.ips_ids:
                db.execute(
                    text("INSERT INTO doctor_ips (doctor_id, ips_id) VALUES (:doc_id, :ips_id) ON CONFLICT DO NOTHING;"),
                    {"doc_id": doctor_id, "ips_id": ips_id}
                )

        db.commit()

        return {
            "id": doc_res.id,
            "user_id": doc_res.user_id,
            "email": doctor_data.email,
            "document_type": doc_res.document_type,
            "document_number": doc_res.document_number,
            "first_name": doc_res.first_name,
            "last_name": doc_res.last_name,
            "medical_license": doc_res.medical_license,
            "specialty": doc_res.specialty,
            "phone": doc_res.phone
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en base de datos: {str(e)}")