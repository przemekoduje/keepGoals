import os
import base64
import subprocess
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
    1. Wysyła plik multimedialny z dysku serwera do Firebase Storage Bucket (jeśli skonfigurowany).
    2. W przypadku braku bucketu chmurowego konwertuje plik na Data URL Base64 (z automatyczną kompresją ffmpeg dla większych plików).
    3. Aktualizuje pole `media_url` notatki w chmurze Firestore.
    """
    if not os.path.exists(filepath):
        return

    cloud_url = None
    updated_media_type = None
    clean_mime = (content_type or "audio/webm").split(";")[0].strip()

    # 0. Konwersja do uniwersalnego formatu (MP3 dla audio, MP4 dla wideo) kompatybilnego z Safari/iOS/Chrome
    upload_path = filepath
    upload_filename = filename
    upload_mime = clean_mime
    base_name = filename.rsplit(".", 1)[0] if "." in filename else filename
    converted_tmp = None

    try:
        if clean_mime.startswith("audio") and not filename.endswith(".mp3"):
            converted_tmp = filepath + ".universal.mp3"
            subprocess.run(
                ["ffmpeg", "-y", "-i", filepath, "-vn", "-ac", "1", "-ar", "24000", "-acodec", "libmp3lame", "-ab", "64k", converted_tmp],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True
            )
            if os.path.exists(converted_tmp):
                upload_path = converted_tmp
                upload_filename = f"{base_name}.mp3"
                upload_mime = "audio/mp3"
                updated_media_type = "audio/mp3"
        elif clean_mime.startswith("video") and not filename.endswith(".mp4"):
            converted_tmp = filepath + ".universal.mp4"
            subprocess.run(
                [
                    "ffmpeg", "-y", "-i", filepath,
                    "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
                    "-c:a", "aac", "-b:a", "64k", "-ac", "1",
                    "-movflags", "+faststart", converted_tmp
                ],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True
            )
            if os.path.exists(converted_tmp):
                upload_path = converted_tmp
                upload_filename = f"{base_name}.mp4"
                upload_mime = "video/mp4"
                updated_media_type = "video/mp4"
    except Exception as conv_err:
        print(f"[Storage Sync BG] Ostrzeżenie konwersji uniwersalnej ({conv_err}), użycie oryginalnego pliku.")
        converted_tmp = None

    try:
        # 1. Wrzucenie do Firebase Storage Bucket
        bucket_name = settings.FIREBASE_STORAGE_BUCKET or "ai-buddy-app-471817.firebasestorage.app"
        if bucket_name and firebase_admin._apps:
            try:
                bucket = storage.bucket(bucket_name)
                blob_path = f"uploads/{upload_filename}"
                blob = bucket.blob(blob_path)
                blob.upload_from_filename(upload_path, content_type=upload_mime)
                blob.make_public()
                cloud_url = blob.public_url
                print(f"[Storage Sync BG] Pomyślnie wysłano plik {upload_filename} do Firebase Storage: {cloud_url}")
            except Exception as e:
                print(f"[Storage Sync BG] Pominięto Firebase Storage ({e}), użycie Data URL.")

        # 2. Fallback do Data URL (gdyby Storage był niedostępny)
        max_raw_bytes = 720 * 1024
        if not cloud_url:
            if os.path.exists(upload_path) and os.path.getsize(upload_path) <= max_raw_bytes:
                with open(upload_path, "rb") as f:
                    file_bytes = f.read()
                b64_str = base64.b64encode(file_bytes).decode("utf-8")
                cloud_url = f"data:{upload_mime};base64,{b64_str}"
                print(f"[Storage Sync BG] Przekonwertowano plik {upload_filename} do Base64 Data URL.")
    finally:
        if converted_tmp and os.path.exists(converted_tmp):
            os.remove(converted_tmp)

    # 3. Zaktualizuj pole media_url notatki w bazie danych (Firestore / Mock DB)
    if cloud_url and db:
        try:
            doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
            upd = {"media_url": cloud_url}
            if updated_media_type:
                upd["media_type"] = updated_media_type
            doc_ref.update(upd)
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
    db,
    user_timezone: str = "Europe/Warsaw"
):
    """
    Pełne przetwarzanie w tle (BackgroundTasks):
    1. Przeprowadza transkrypcję i analizę AI z uwzględnieniem strefy czasowej użytkownika.
    2. Aktualizuje tytuł i treść notatki w chmurze Firestore.
    3. Wysyła plik multimedialny do Firebase Storage i aktualizuje `media_url`.
    """
    from src.services.ai_service import analyze_audio_note, analyze_video_note
    from src.crud import get_user_teams

    # 0. Przygotowanie kontekstu współpracowników
    team_members = []
    if db:
        try:
            teams = get_user_teams(db, uid)
            members_set = set()
            for t in teams:
                owner = t.get("owner_id")
                if owner:
                    members_set.add(owner)
                for member in t.get("member_ids", []):
                    members_set.add(member)
            # Upewniamy się, że nie zwracamy samego siebie, chociaż AI poradzi sobie z tym.
            team_members = list(members_set)
        except Exception as e:
            print(f"[BG Process] Błąd pobierania członków zespołu: {e}")

    # 1. Analiza AI w tle
    try:
        if is_video:
            ai_result = analyze_video_note(file_bytes, content_type, user_timezone=user_timezone, team_members=team_members)
        else:
            ai_result = analyze_audio_note(file_bytes, content_type, user_timezone=user_timezone, team_members=team_members)
            
        title = ai_result.get("title") or "Notatka z nagrania"
        content = ai_result.get("content") or "Brak przetworzonej treści."
        
        if db:
            try:
                doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
                update_data = {
                    "title": title,
                    "content": content,
                    "processing_status": "completed"
                }
                if "events" in ai_result:
                    update_data["events"] = ai_result["events"]
                if "raw_transcript" in ai_result:
                    update_data["raw_transcript"] = ai_result["raw_transcript"]
                if "suggested_assignees" in ai_result and ai_result["suggested_assignees"]:
                    update_data["suggested_assignees"] = ai_result["suggested_assignees"]
                
                doc_ref.update(update_data)
                print(f"[BG Process] Notatka {note_id} pomyślnie zaktualizowana o treść AI: '{title}'")
            except Exception as e:
                print(f"[BG Process Error] Błąd aktualizacji Firestore dla notatki {note_id}: {e}")
    except Exception as e:
        print(f"[BG Process Error] Wyjątek podczas analizy AI mediów: {e}")
        if db:
            try:
                doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
                doc_ref.update({
                    "processing_status": "error_ai",
                    "content": f"Błąd syntezy AI ({str(e)}). Surowe nagranie zostało zapisane. Kliknij 'Ponów analizę', aby spróbować ponownie."
                })
            except Exception as update_err:
                print(f"[BG Process Error] Błąd zapisu statusu awarii dla notatki {note_id}: {update_err}")

    # 2. Synchronizacja pliku z Firebase Storage
    sync_media_to_cloud_bg(note_id, uid, filepath, filename, content_type, db)
