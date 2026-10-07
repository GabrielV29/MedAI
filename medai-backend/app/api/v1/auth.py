from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    email_clean = login_data.email.strip().lower()
    
    # Consultar usuario
    query = text("""
        SELECT id, email, password_hash, full_name, role::text, sub_role::text, is_active 
        FROM users 
        WHERE LOWER(email) = :email
    """)
    user = db.execute(query, {"email": email_clean}).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo en el sistema")
        
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # Generar Token JWT
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "sub_role": user.sub_role
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "sub_role": user.sub_role,
        "full_name": user.full_name
    }