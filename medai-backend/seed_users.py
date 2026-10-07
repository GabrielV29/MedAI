from app.db.database import SessionLocal
from app.core.security import get_password_hash, verify_password
from sqlalchemy import text

def test_and_seed():
    db = SessionLocal()
    email = "sistemas@medai.com"
    raw_password = "MedAi2026*"
    hashed_pwd = get_password_hash(raw_password)
    
    # 1. Reinsertar/Actualizar usuario
    query = text("""
        INSERT INTO users (email, password_hash, full_name, role, sub_role, is_active)
        VALUES (:email, :pwd, 'Ing. Gabriel Vega', 'HEALTHCARE_STAFF', 'DOCTOR', true)
        ON CONFLICT (email) DO UPDATE 
        SET password_hash = EXCLUDED.password_hash, is_active = true;
    """)
    db.execute(query, {"email": email, "pwd": hashed_pwd})
    db.commit()

    # 2. Consultar directamente cómo quedó guardado
    user_row = db.execute(
        text("SELECT email, password_hash, is_active FROM users WHERE email = :email"),
        {"email": email}
    ).fetchone()
    
    db.close()

    print(f"\n--- DIAGNÓSTICO ---")
    print(f"Usuario encontrado: {user_row.email}")
    print(f"Estado activo: {user_row.is_active}")
    print(f"Hash en BD: {user_row.password_hash[:25]}...")
    
    # 3. Probar verificación en vivo
    is_valid = verify_password(raw_password, user_row.password_hash)
    print(f"¿Verificación exitosa con '{raw_password}'?: {is_valid}")
    print(f"-------------------\n")

if __name__ == "__main__":
    test_and_seed()