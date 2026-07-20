import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

settings = Settings()
