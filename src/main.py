from fastapi import FastAPI, Depends
from src.auth import verify_token

app = FastAPI(title="KeepGoals API")

@app.get("/health")
def health_check():
    return {"status": "KeepGoals API is running"}

@app.get("/api/v1/notes")
def get_notes(user: dict = Depends(verify_token)):
    return {
        "message": "To są twoje notatki", 
        "user": user
    }
