import os
import base64
import firebase_admin
from firebase_admin import storage
from src.config import settings

def save_media_file_local(file_bytes: bytes, filename: str) -> tuple[str, str]:
    """
    Szybki zapis pliku lokalnie w folderze /uploads na potrzeby natychmiastowego podglądu i analizy AI.
    Zwraca krotkę (filepath, relative_url).
    """
    os.makedirs("uploads", exist_ok=True)
    filepath = os.path.join("uploads", filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    return filepath, f"/uploads/{filename}"

def sync_media_to_cloud_bg(note_id: str, uid: str, filepath: str, filename: str, content_type: str, db):
    """
    Zadanie wykonywane w tle (BackgroundTasks):
    1. Wysyła plik multimedialny z dysku serwera do Firebase Storage Bucket.
    2. W przypadku sukcesu otrzymuje trwały adres HTTPS (storage.googleapis.com).
    3. W przypadku braku bucketu chmurowego (dla plików <= 900 KB) konwertuje plik na Data URL Base64.
    4. Aktualizuje pole `media_url` notatki w chmurze Firestore.
    """
    if not os.path.exists(filepath):
        return

    cloud_url = None

    # 1. Próba wrzucenia do Firebase Storage Bucket
    bucket_candidates = []
    if settings.FIREBASE_STORAGE_BUCKET:
        bucket_candidates.append(settings.FIREBASE_STORAGE_BUCKET)
    
    # Domyślne nazwy bucketów Firebase dla projektu
    bucket_candidates.extend([
        "ai-buddy-app-471817.appspot.com",
        "ai-buddy-app-471817.firebasestorage.app"
    ])

    if firebase_admin._apps:
        for bucket_name in bucket_candidates:
            if not bucket_name:
                continue
            try:
                bucket = storage.bucket(bucket_name)
                blob_path = f"uploads/{filename}"
                blob = bucket.blob(blob_path)
                blob.upload_from_filename(filepath, content_type=content_type)
                blob.make_public()
                cloud_url = blob.public_url
                print(f"[Storage Sync BG] Pomyślnie wysłano plik {filename} do Firebase Storage ({bucket_name}): {cloud_url}")
                break
            except Exception as e:
                # Wypróbuj kolejną opcję z listy kandydatów
                continue

    # 2. Jeśli brak bucketu lub nie udało się połączyć -> użyj Data URL dla trwałości (dla plików <= 900 KB)
    if not cloud_url:
        try:
            file_size = os.path.getsize(filepath)
            if file_size <= 900 * 1024:
                with open(filepath, "rb") as f:
                    file_bytes = f.read()
                b64_str = base64.b64encode(file_bytes).decode("utf-8")
                cloud_url = f"data:{content_type};base64,{b64_str}"
                print(f"[Storage Sync BG] Przekonwertowano plik {filename} do Base64 Data URL.")
        except Exception as e:
            print(f"[Storage Sync BG] Błąd odczytu pliku do Data URL: {e}")

    # 3. Zaktualizuj pole media_url notatki w bazie danych (Firestore / Mock DB)
    if cloud_url and db:
        try:
            doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
            doc_ref.update({"media_url": cloud_url})
            print(f"[Storage Sync BG] Zaktualizowano notatkę {note_id} o trwały media_url w bazie.")
        except Exception as e:
            print(f"[Storage Sync BG] Błąd aktualizacji notatki w bazie: {e}")

def process_media_and_cloud_sync_bg(
    note_id: str,
    uid: str,
    filepath: str,
    filename: str,
    file_bytes: bytes,
    content_type: str,
    is_video: bool,
    db
):
    """
    Pełne przetwarzanie w tle (BackgroundTasks):
    1. Przeprowadza transkrypcję i analizę AI (ffmpeg + OpenAI Whisper + GPT-4o-mini).
    2. Aktualizuje tytuł i treść notatki w chmurze Firestore.
    3. Wysyła plik multimedialny do Firebase Storage i aktualizuje `media_url`.
    """
    from src.services.ai_service import analyze_audio_note, analyze_video_note

    # 1. Analiza AI w tle
    try:
        if is_video:
            ai_result = analyze_video_note(file_bytes, content_type)
        else:
            ai_result = analyze_audio_note(file_bytes, content_type)
            
        title = ai_result.get("title")
        content = ai_result.get("content")
        
        if db and title and content:
            try:
                doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
                doc_ref.update({
                    "title": title,
                    "content": content
                })
                print(f"[BG Process] Notatka {note_id} pomyślnie zaktualizowana o treść AI: '{title}'")
            except Exception as e:
                print(f"[BG Process Error] Błąd aktualizacji Firestore dla notatki {note_id}: {e}")
    except Exception as e:
        print(f"[BG Process Error] Wyjątek podczas analizy AI mediów: {e}")

    # 2. Synchronizacja pliku z Firebase Storage
    sync_media_to_cloud_bg(note_id, uid, filepath, filename, content_type, db)
