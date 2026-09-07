import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.config import settings
from src.routers.notes import router as notes_router, public_router as public_notes_router
from src.routers.plans import router as plans_router
from src.routers.users import router as users_router
from src.routers.projects import router as projects_router
from src.routers.goals import router as goals_router

app = FastAPI(title="KeepGoals API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "KeepGoals API is running"}

app.include_router(notes_router)
app.include_router(public_notes_router)
app.include_router(plans_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(goals_router)

