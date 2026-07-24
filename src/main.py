import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.config import settings
from src.routers.notes import router as notes_router
from src.routers.plans import router as plans_router
from src.routers.users import router as users_router

app = FastAPI(title="KeepGoals API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "KeepGoals API is running"}

app.include_router(notes_router)
app.include_router(plans_router)
app.include_router(users_router)

