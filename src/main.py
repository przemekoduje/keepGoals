from fastapi import FastAPI
from src.routers.notes import router as notes_router

app = FastAPI(title="KeepGoals API")

@app.get("/health")
def health_check():
    return {"status": "KeepGoals API is running"}

app.include_router(notes_router)

