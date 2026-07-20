import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from src.auth import verify_token
from src.database import get_db
from src.schemas import NoteCreate, NoteUpdate, NoteResponse
from src.crud import create_note, get_notes, get_note, update_note, delete_note

router = APIRouter(prefix="/api/v1/notes", tags=["notes"])

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_new_note(
    note_in: NoteCreate,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    return create_note(db, uid, note_in)

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
