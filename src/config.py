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
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
    
    # Podstawowe dozwolone adresy
    _origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Dodaj lokalne IP jeśli jest dostępne
    _local_ip = get_local_ip()
    if _local_ip:
        _origins.append(f"http://{_local_ip}:3000")
        _origins.append(f"http://{_local_ip}:5173")
        
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", ",".join(_origins)).split(",")

settings = Settings()

