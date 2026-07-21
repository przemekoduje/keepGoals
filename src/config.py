import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

settings = Settings()
