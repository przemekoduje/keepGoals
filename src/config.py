import os
import socket
from dotenv import load_dotenv

load_dotenv()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None

class Settings:
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or ""
    GROQ_API_KEY = os.getenv("GROQ_API_KEY") or ""
    
    _raw_smtp_host = os.getenv("SMTP_HOST") or os.getenv("EMAIL_HOST") or "smtp.gmail.com"
    SMTP_HOST = _raw_smtp_host.split("#")[0].strip()
    
    _raw_smtp_port = (os.getenv("SMTP_PORT") or os.getenv("EMAIL_PORT") or "587").split("#")[0].strip()
    try:
        SMTP_PORT = int(_raw_smtp_port)
    except Exception:
        SMTP_PORT = 587

    _raw_smtp_user = os.getenv("SMTP_USER") or os.getenv("EMAIL_USER") or os.getenv("EMAIL_USERNAME") or ""
    SMTP_USER = _raw_smtp_user.split("#")[0].strip()

    _raw_smtp_pass = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASSWORD") or ""
    SMTP_PASSWORD = _raw_smtp_pass.split("#")[0].replace(" ", "").strip()

    _raw_from_email = os.getenv("SMTP_FROM_EMAIL") or os.getenv("EMAIL_FROM") or SMTP_USER
    SMTP_FROM_EMAIL = _raw_from_email.split("#")[0].strip()
    
    # Podstawowe dozwolone adresy (HTTP i HTTPS)
    _origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://localhost:3000",
        "https://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:5173",
        "https://thread-provoking-fragrant.ngrok-free.dev",
        "https://keepgoals.przemokoduje.com",
        "http://keepgoals.przemokoduje.com",
        "https://przemokoduje.com",
        "https://www.przemokoduje.com",
        "https://ai-buddy-app-471817.web.app",
        "https://ai-buddy-app-471817.firebaseapp.com"
    ]
    
    # Dodaj lokalne IP jeśli jest dostępne (zarówno HTTP jak i HTTPS)
    _local_ip = get_local_ip()
    if _local_ip:
        _origins.append(f"http://{_local_ip}:3000")
        _origins.append(f"http://{_local_ip}:5173")
        _origins.append(f"https://{_local_ip}:3000")
        _origins.append(f"https://{_local_ip}:5173")
        
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", ",".join(_origins)).split(",")

settings = Settings()

