from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from app.db.database import get_db

router = APIRouter(
    prefix="/api/v1",
    tags=["Geolocation & IPS"]
)

@router.get("/geo/departments")
def get_departments(db: Session = Depends(get_db)):
    """Obtiene el listado de todos los departamentos de Colombia."""
    query = text("SELECT code, name FROM divipola_departments ORDER BY name ASC;")
    result = db.execute(query).fetchall()
    return [{"code": row.code, "name": row.name} for row in result]

@router.get("/geo/municipalities/{department_code}")
def get_municipalities_by_department(department_code: str, db: Session = Depends(get_db)):
    """Obtiene los municipios pertenecientes a un departamento dado."""
    query = text("""
        SELECT code, name, department_code
        FROM divipola_municipalities
        WHERE department_code = :dept_code
        ORDER BY name ASC;
    """)
    result = db.execute(query, {"dept_code": department_code.zfill(2)}).fetchall()
    return [{"code": row.code, "name": row.name, "department_code": row.department_code} for row in result]

@router.get("/ips/by-municipality/{cod_divipola}")
def get_ips_by_municipality(cod_divipola: str, db: Session = Depends(get_db)):
    """"Retorna las sedes de IPS registradas en un municipio específico."""
    query = text("""
        SELECT id, id_prestador, nit, nombre_prestador, sede_name, address, phone, email, nivel_atencion, tipo_entidad
        FROM ips
        WHERE cod_divipola = :cod_divipola
        ORDER BY nombre_prestador ASC;
    """)
    result = db.execute(query, {"cod_divipola": cod_divipola.zfill(5)}).fetchall()
    return[
        {
            "id": row.id,
            "id_prestador": row.id_prestador,
            "nit": row.nit,
            "nombre_prestador": row.nombre_prestador,
            "sede_name": row.sede_name,
            "address": row.address,
            "phone": row.phone,
            "email": row.email,
            "nivel_atencion": row.nivel_atencion,
            "tipo_entidad": row.tipo_entidad
        }
        for row in result
    ]
