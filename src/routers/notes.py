import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from src.auth import verify_token
from src.database import get_db
from src.schemas import NoteCreate, NoteUpdate, NoteResponse, NoteReorderRequest
from src.crud import create_note, get_notes, get_note, update_note, delete_note, reorder_notes
from src.services.ai_service import analyze_audio_note, analyze_video_note
from src.services.storage_service import save_media_file_local, sync_media_to_cloud_bg, process_media_and_cloud_sync_bg

router = APIRouter(prefix="/api/v1/notes", tags=["notes"])

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_new_note(
    note_in: NoteCreate,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    return create_note(db, uid, note_in)

@router.post("/audio", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def upload_audio_note(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    file_bytes = await file.read()
    
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'webm'
    filename = f"{file_id}.{ext}"
    media_type = file.content_type or "audio/webm"
    
    filepath, local_media_url = save_media_file_local(file_bytes, filename)
    
    note_in = NoteCreate(
        title="Nagranie Głosowe",
        content="Przetwarzanie transkrypcji AI w tle...",
        note_type="daily_morning",
        media_url=local_media_url,
        media_type=media_type
    )
    created_note = create_note(db, uid, note_in)
    
    background_tasks.add_task(
        process_media_and_cloud_sync_bg,
        created_note["id"],
        uid,
        filepath,
        filename,
        file_bytes,
        media_type,
        False,
        db
    )
    return created_note

@router.post("/video", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def upload_video_note(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    file_bytes = await file.read()
    
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'webm'
    filename = f"{file_id}.{ext}"
    media_type = file.content_type or "video/webm"
    
    filepath, local_media_url = save_media_file_local(file_bytes, filename)
    
    note_in = NoteCreate(
        title="Nagranie Wideo",
        content="Przetwarzanie transkrypcji AI w tle...",
        note_type="daily_morning",
        media_url=local_media_url,
        media_type=media_type
    )
    created_note = create_note(db, uid, note_in)
    
    background_tasks.add_task(
        process_media_and_cloud_sync_bg,
        created_note["id"],
        uid,
        filepath,
        filename,
        file_bytes,
        media_type,
        True,
        db
    )
    return created_note


@router.get("", response_model=List[NoteResponse])
def read_notes(
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    return get_notes(db, uid)

@router.get("/{note_id}", response_model=NoteResponse)
def read_single_note(
    note_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    note = get_note(db, uid, note_id)
    if not note:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "NOTE_NOT_FOUND",
                "message": f"Notatka o ID {note_id} nie została znaleziona.",
                "trace_id": trace_id
            }
        )
    return note

@router.put("/reorder", response_model=dict)
def reorder_notes_endpoint(
    reorder_request: NoteReorderRequest,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    success = reorder_notes(db, uid, reorder_request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Nie udało się zaktualizować kolejności notatek."}
        )
    return {"message": "Kolejność została zaktualizowana."}

@router.put("/{note_id}", response_model=NoteResponse)
def update_single_note(
    note_id: str,
    note_in: NoteUpdate,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    updated_note = update_note(db, uid, note_id, note_in)
    if not updated_note:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "NOTE_NOT_FOUND",
                "message": f"Notatka o ID {note_id} nie została znaleziona.",
                "trace_id": trace_id
            }
        )
    return updated_note

@router.delete("/{note_id}")
def delete_single_note(
    note_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    success = delete_note(db, uid, note_id)
    if not success:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "NOTE_NOT_FOUND",
                "message": f"Notatka o ID {note_id} nie została znaleziona.",
                "trace_id": trace_id
            }
        )
    return {"message": "Notatka została pomyślnie usunięta."}
