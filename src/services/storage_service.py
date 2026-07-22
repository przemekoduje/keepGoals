import os
import base64
import uuid
import firebase_admin
from firebase_admin import storage
from src.config import settings

def save_media_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Zapisuje plik multimedialny tak, aby był zawsze widoczny na wszystkich urządzeniach:
    1. Jeśli skonfigurowany jest Firebase Storage Bucket -> wysyła do chmury Firebase.
    2. Jeśli brak bucketu, a plik mieści się w limicie 900 KB -> zapisuje jako Data URL w Firestore (dostępny wszędzie).
    3. W przeciwnym razie zapisuje lokalnie na dysku /uploads.
    """
    # 1. Próba wysłania do Firebase Storage Bucket (jeśli ustawiony w config/env)
    bucket_name = getattr(settings, "FIREBASE_STORAGE_BUCKET", "") or os.getenv("FIREBASE_STORAGE_BUCKET", "")
    if bucket_name and firebase_admin._apps:
        try:
            bucket = storage.bucket(bucket_name)
            blob_path = f"uploads/{filename}"
            blob = bucket.blob(blob_path)
            blob.upload_from_string(file_bytes, content_type=content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f"Ostrzeżenie: Nie udało się wysłać do Firebase Storage ({e}). Używanie metody rezerwowej.")

    # 2. Jeśli brak bucketu, a plik <= 900 KB -> Zapis jako Data URL (widoczny na każdym komputerze/telefonie z Firestore)
    if len(file_bytes) <= 900 * 1024:
        b64_str = base64.b64encode(file_bytes).decode("utf-8")
        return f"data:{content_type};base64,{b64_str}"

    # 3. Metoda lokalna jako awaryjna dla bardzo dużych plików (zapis w /uploads)
    os.makedirs("uploads", exist_ok=True)
    filepath = os.path.join("uploads", filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    return f"/uploads/{filename}"
