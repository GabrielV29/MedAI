from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.divipola import router as divipola_router
from app.routers import geo_ips, doctors

app = FastAPI(
    title="MedAI Desktop Engine Core",
    version="2.0.0",
    description="Motor Backend para el ecosistema MedAI Desktop"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(patients_router, prefix="/api/v1")
app.include_router(divipola_router, prefix="/api/v1")
app.include_router(geo_ips.router)
app.include_router(doctors.router)

@app.get("/")
def root():
    return {"status": "online", "system": "MedAI Engine API", "version": "2.0.0"}