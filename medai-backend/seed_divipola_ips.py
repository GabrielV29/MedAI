import os
import pandas as pd
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# 1. Si tu contraseña tiene caracteres especiales, encódala con quote_plus:
# Ejemplo: si la clave es "MedAI2026*", quote_plus la convierte en un formato seguro.
db_user = "postgres"
db_pass = quote_plus("2903")  # Reemplaza con tu clave real de Postgres
db_host = "127.0.0.1"                           # Usa IP directa 127.0.0.1 en vez de localhost
db_port = "5433"
db_name = "medai_db"                            # Reemplaza con el nombre de tu BD

DATABASE_URL = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

# Agregamos client_encoding='utf8' en connect_args
engine = create_engine(
    DATABASE_URL, 
    connect_args={'client_encoding': 'utf8'}
)

def cargar_divipola(ruta_csv_divipola):
    print("⏳ Procesando y cargando DIVIPOLA...")
    try:
        df = pd.read_csv(ruta_csv_divipola, sep=';', dtype=str, encoding='latin-1')
        if 'cod_dep' not in df.columns:
            df = pd.read_csv(ruta_csv_divipola, sep=',', dtype=str, encoding='latin-1')
    except Exception:
        df = pd.read_csv(ruta_csv_divipola, sep=',', dtype=str, encoding='utf-8')

    # 1. Normalizar Departamentos (código de 2 dígitos)
    df_deptos = df[['cod_dep', 'dep']].drop_duplicates()
    df_deptos['code'] = df_deptos['cod_dep'].astype(str).str.strip().str.zfill(2)
    df_deptos['name'] = df_deptos['dep'].astype(str).str.strip().str.upper()

    # 2. Normalizar Municipios (código de 5 dígitos)
    df_muni = df[['cod_divipola', 'cod_dep', 'municipio']].drop_duplicates()
    df_muni['code'] = df_muni['cod_divipola'].astype(str).str.strip().str.zfill(5)
    df_muni['department_code'] = df_muni['cod_dep'].astype(str).str.strip().str.zfill(2)
    df_muni['name'] = df_muni['municipio'].astype(str).str.strip().str.upper()

    with engine.begin() as conn:
        for _, row in df_deptos.iterrows():
            conn.execute(
                text("INSERT INTO divipola_departments (code, name) VALUES (:code, :name) ON CONFLICT (code) DO NOTHING"),
                {"code": row['code'], "name": row['name']}
            )
        
        for _, row in df_muni.iterrows():
            conn.execute(
                text("INSERT INTO divipola_municipalities (code, department_code, name) VALUES (:code, :department_code, :name) ON CONFLICT (code) DO NOTHING"),
                {"code": row['code'], "department_code": row['department_code'], "name": row['name']}
            )
            
    print("✅ DIVIPOLA insertada correctamente.")

def cargar_ips(ruta_csv_ips):
    print("⏳ Procesando y cargando IPS...")
    try:
        df = pd.read_csv(ruta_csv_ips, sep=';', dtype=str, encoding='latin-1')
        if 'id_prestador' not in df.columns:
            df = pd.read_csv(ruta_csv_ips, sep=',', dtype=str, encoding='latin-1')
    except Exception:
        df = pd.read_csv(ruta_csv_ips, sep=',', dtype=str, encoding='utf-8')

    df_ips = pd.DataFrame()
    df_ips['id_prestador'] = df['id_prestador'].astype(str).str.strip()
    df_ips['nit'] = df.get('nit', '').fillna('').astype(str).str.strip()
    df_ips['nombre_prestador'] = df['nombre_prestador'].astype(str).str.strip().str.upper()
    df_ips['sede_name'] = df.get('sede_name', '').fillna('').astype(str).str.strip().str.upper()
    df_ips['address'] = df.get('address', '').fillna('').astype(str).str.strip()
    df_ips['phone'] = df.get('phone', '').fillna('').astype(str).str.strip()
    df_ips['email'] = df.get('email', '').fillna('').astype(str).str.strip()
    
    df_ips['nivel_atencion'] = pd.to_numeric(df.get('nivel_atencion', 1), errors='coerce').fillna(1).astype(int)
    df_ips['tipo_entidad'] = df.get('tipo_entidad', '').fillna('').astype(str).str.strip()
    df_ips['cod_divipola'] = df['cod_divipola'].astype(str).str.strip().str.zfill(5)

    with engine.begin() as conn:
        for _, row in df_ips.iterrows():
            conn.execute(
                text("""
                    INSERT INTO ips (id_prestador, nit, nombre_prestador, sede_name, address, phone, email, nivel_atencion, tipo_entidad, cod_divipola)
                    VALUES (:id_prestador, :nit, :nombre_prestador, :sede_name, :address, :phone, :email, :nivel_atencion, :tipo_entidad, :cod_divipola)
                    ON CONFLICT (id_prestador) DO UPDATE SET 
                        nombre_prestador = EXCLUDED.nombre_prestador,
                        address = EXCLUDED.address,
                        phone = EXCLUDED.phone;
                """),
                row.to_dict()
            )
    print("✅ IPS insertadas correctamente.")

if __name__ == "__main__":
    cargar_divipola("divipola.csv")
    cargar_ips("ips.csv")