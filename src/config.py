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
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
    
    # Podstawowe dozwolone adresy (HTTP i HTTPS)
    _origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://localhost:3000",
        "https://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:5173"
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

