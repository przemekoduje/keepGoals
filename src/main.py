from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.routers.notes import router as notes_router
from src.routers.plans import router as plans_router

app = FastAPI(title="KeepGoals API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "KeepGoals API is running"}

app.include_router(notes_router)
app.include_router(plans_router)

