import os
import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from src.auth import verify_token
from src.database import get_db
from src.schemas import NoteCreate, NoteUpdate, NoteResponse, NoteReorderRequest, AIChatRequest, SendEmailRequest
from src.crud import create_note, get_notes, get_note, update_note, delete_note, reorder_notes, get_trash_notes, restore_note, hard_delete_note, get_user_settings, get_notes_ref
from src.services.ai_service import analyze_audio_note, analyze_video_note, chat_with_ai_about_note, generate_handoff_summary
from src.services.storage_service import save_media_file_local, sync_media_to_cloud_bg, process_media_and_cloud_sync_bg
from src.services.email_service import send_transcription_email
from pydantic import BaseModel, Field
from typing import Optional

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
        media_type=media_type,
        processing_status="pending"
    )
    created_note = create_note(db, uid, note_in)
    
    user_settings = get_user_settings(db, uid)
    user_tz = user_settings.get("timezone", "Europe/Warsaw")
    
    background_tasks.add_task(
        process_media_and_cloud_sync_bg,
        created_note["id"],
        uid,
        filepath,
        filename,
        file_bytes,
        media_type,
        False,
        db,
        user_tz
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
        media_type=media_type,
        processing_status="pending"
    )
    created_note = create_note(db, uid, note_in)
    
    user_settings = get_user_settings(db, uid)
    user_tz = user_settings.get("timezone", "Europe/Warsaw")
    
    background_tasks.add_task(
        process_media_and_cloud_sync_bg,
        created_note["id"],
        uid,
        filepath,
        filename,
        file_bytes,
        media_type,
        True,
        db,
        user_tz
    )
    return created_note

@router.post("/{note_id}/reanalyze", response_model=NoteResponse)
async def reanalyze_note_endpoint(
    note_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    note = get_note(db, uid, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Notatka o ID {note_id} nie została znaleziona."}
        )
    
    media_url = note.get("media_url")
    is_video = (note.get("media_type") or "").startswith("video")
    
    file_bytes = b""
    filepath = ""
    filename = ""
    content_type = note.get("media_type") or ("video/webm" if is_video else "audio/webm")

    if media_url and media_url.startswith("/uploads/"):
        rel_path = media_url.lstrip("/")
        if os.path.exists(rel_path):
            filepath = rel_path
            filename = os.path.basename(rel_path)
            with open(rel_path, "rb") as f:
                file_bytes = f.read()

    # Oznacz status notatki jako pending
    updated_note = update_note(db, uid, note_id, NoteUpdate(processing_status="pending"))

    user_settings = get_user_settings(db, uid)
    user_tz = user_settings.get("timezone", "Europe/Warsaw")

    if file_bytes and filepath:
        background_tasks.add_task(
            process_media_and_cloud_sync_bg,
            note_id,
            uid,
            filepath,
            filename,
            file_bytes,
            content_type,
            is_video,
            db,
            user_tz
        )
    else:
        # Awaryjna ponowna analiza na bazie zapisanej surowej transkrypcji (gdy brak oryginalnego pliku)
        raw_transcript = note.get("raw_transcript") or note.get("content")
        if raw_transcript and len(raw_transcript) > 5:
            def reanalyze_text_bg():
                from src.services.ai_service import get_ai_client_and_model, audio_system_prompt
                from src.crud import get_user_teams
                import json
                try:
                    team_members = []
                    try:
                        teams = get_user_teams(db, uid)
                        members_set = set()
                        for t in teams:
                            owner = t.get("owner_id")
                            if owner: members_set.add(owner)
                            for m in t.get("member_ids", []): members_set.add(m)
                        team_members = list(members_set)
                    except Exception as e:
                        print(f"[Reanalyze] Błąd pobierania członków zespołu: {e}")
                    
                    from datetime import datetime
                    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    context = f"\nBieżący czas (punkt odniesienia): {now_str} (Strefa czasowa: {user_tz})\n"
                    if team_members:
                        context += f"Oto lista aktualnych członków zespołu użytkownika (adresy email lub identyfikatory): {', '.join(team_members)}.\n"
                        context += "Jeśli w nagraniu padają imiona (np. Ola, Marek) współpracowników, postaraj się dopasować je do tej listy i w 'suggested_assignees' zwróć ich dokładny adres z powyższej listy zamiast samego imienia. Jeśli kogoś nie ma na liście, zwróć jego imię.\n"

                    llm_client, llm_model = get_ai_client_and_model("llm")
                    response = llm_client.chat.completions.create(
                        model=llm_model,
                        messages=[
                            {"role": "system", "content": audio_system_prompt + context},
                            {"role": "user", "content": f"Oto transkrypcja do ponownego sformatowania:\n\n{raw_transcript}"}
                        ]
                    )
                    res_text = response.choices[0].message.content.strip()
                    start_idx = res_text.find("{")
                    end_idx = res_text.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        parsed = json.loads(res_text[start_idx:end_idx+1])
                    else:
                        parsed = {"title": "Re-analiza AI", "content": res_text}

                    doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
                    upd = {
                        "title": parsed.get("title", "Notatka po re-analizie"),
                        "content": parsed.get("content", res_text),
                        "processing_status": "completed"
                    }
                    if "events" in parsed:
                        upd["events"] = parsed["events"]
                    if "suggested_assignees" in parsed and parsed["suggested_assignees"]:
                        upd["suggested_assignees"] = parsed["suggested_assignees"]
                    doc_ref.update(upd)
                except Exception as ex:
                    print(f"[Reanalyze Error] {ex}")
                    doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
                    doc_ref.update({
                        "processing_status": "error_ai",
                        "content": f"Nie udało się wykonać ponownej analizy AI: {ex}"
                    })
            background_tasks.add_task(reanalyze_text_bg)

    return updated_note or note


@router.get("", response_model=List[NoteResponse])
def read_notes(
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    email = user.get("email")
    return get_notes(db, uid, email=email)

@router.get("/trash", response_model=List[NoteResponse])
def read_trash_notes(
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    return get_trash_notes(db, uid)

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

@router.put("/{note_id}/restore")
def restore_deleted_note(
    note_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    success = restore_note(db, uid, note_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Notatka o ID {note_id} nie została znaleziona."}
        )
    return {"message": "Notatka została przywrócona."}

@router.delete("/{note_id}/hard")
def permanently_delete_note(
    note_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    success = hard_delete_note(db, uid, note_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Notatka o ID {note_id} nie została znaleziona."}
        )
    return {"message": "Notatka została trwale usunięta."}

@router.post("/{note_id}/ai-chat")
def ai_chat_note(
    note_id: str,
    chat_request: AIChatRequest,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    note = get_note(db, uid, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Notatka o ID {note_id} nie została znaleziona."}
        )
    
    ai_response = chat_with_ai_about_note(
        note_content=note["content"], 
        chat_history=chat_request.messages,
        media_url=note.get("media_url"),
        media_type=note.get("media_type"),
        events=note.get("events"),
        raw_transcript=note.get("raw_transcript")
    )
    return {"response": ai_response}

@router.post("/{note_id}/send-email")
def send_note_email_endpoint(
    note_id: str,
    email_req: SendEmailRequest,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    note = get_note(db, uid, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Notatka o ID {note_id} nie została znaleziona."}
        )
    
    sent_via_smtp = send_transcription_email(
        recipient_email=email_req.email,
        note_title=note.get("title") or "Notatka z nagrania",
        note_content=note.get("content") or "",
        raw_transcript=note.get("raw_transcript")
    )
    
    if not sent_via_smtp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "NO_SMTP_CONFIG",
                "message": "Brak skonfigurowanego serwera SMTP w .env (wymagane pola SMTP_USER i SMTP_PASSWORD). Użyj przycisku 'Program pocztowy', aby wysłać wiadomość ze swojego programu pocztowego."
            }
        )

    return {
        "success": True,
        "sent_via_smtp": True,
        "message": f"Transkrypcja została pomyślnie wysłana na adres {email_req.email}!"
    }


@router.post("/{note_id}/accept_invite")
def accept_invite(
    note_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    email = user.get("email")
    
    docs_uid = list(db.collection_group("notes").where("pending_user_ids", "array_contains", uid).stream())
    docs_email = []
    if email:
        docs_email = list(db.collection_group("notes").where("pending_user_ids", "array_contains", email).stream())
        
    note_doc = None
    for doc in docs_uid + docs_email:
        if doc.id == note_id:
            note_doc = doc
            break
            
    if not note_doc:
        raise HTTPException(status_code=404, detail="Zaproszenie nie zostało znaleziona lub zostało już zaakceptowane.")
        
    data = note_doc.to_dict()
    pending = set(data.get("pending_user_ids") or [])
    assigned = set(data.get("assigned_user_ids") or [])
    
    changed = False
    if uid in pending:
        pending.remove(uid)
        changed = True
    if email and email in pending:
        pending.remove(email)
        changed = True
        
    if changed:
        assigned.add(uid)
        note_doc.reference.update({
            "pending_user_ids": list(pending),
            "assigned_user_ids": list(assigned)
        })
        
    return {"status": "success", "message": "Zaproszenie zaakceptowane"}

@router.post("/{note_id}/reject_invite")
def reject_invite(
    note_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    email = user.get("email")
    
    docs_uid = list(db.collection_group("notes").where("pending_user_ids", "array_contains", uid).stream())
    docs_email = []
    if email:
        docs_email = list(db.collection_group("notes").where("pending_user_ids", "array_contains", email).stream())
        
    note_doc = None
    for doc in docs_uid + docs_email:
        if doc.id == note_id:
            note_doc = doc
            break
            
    if not note_doc:
        raise HTTPException(status_code=404, detail="Zaproszenie nie zostało znaleziona lub zostało już odrzucone.")
        
    data = note_doc.to_dict()
    pending = set(data.get("pending_user_ids") or [])
    
    changed = False
    if uid in pending:
        pending.remove(uid)
        changed = True
    if email and email in pending:
        pending.remove(email)
        changed = True
        
    if changed:
        note_doc.reference.update({
            "pending_user_ids": list(pending)
        })
        
    return {"status": "success", "message": "Zaproszenie odrzucone"}

class NoteHandoffRequest(BaseModel):
    delegate_name: str = Field(..., description="Imię/Nazwa odbiorcy")
    delegate_email: Optional[str] = Field(default=None, description="Opcjonalny e-mail odbiorcy")

@router.post("/{id}/handoff")
def handoff_note(
    id: str,
    handoff_in: NoteHandoffRequest,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    note = get_note(db, uid, id)
    if not note:
        raise HTTPException(status_code=404, detail="Notatka nie istnieje")
        
    share_token = str(uuid.uuid4())
    ai_summary = generate_handoff_summary(note["content"], handoff_in.delegate_name)
    
    note_ref = get_notes_ref(db, uid).document(id)
    delegation_ref = note_ref.collection("delegations").document()
    
    delegation_data = {
        "delegated_to_name": handoff_in.delegate_name,
        "delegated_to_email": handoff_in.delegate_email,
        "delegation_status": "sent",
        "share_token": share_token,
        "ai_summary_for_delegate": ai_summary,
        "created_at": datetime.now(timezone.utc)
    }
    delegation_ref.set(delegation_data)
    
    if handoff_in.delegate_email:
        try:
            from src.services.email_service import send_delegation_email
            send_delegation_email(
                recipient_email=handoff_in.delegate_email,
                delegate_name=handoff_in.delegate_name,
                note_title=note.get("title", ""),
                ai_summary=ai_summary,
                share_token=share_token
            )
        except Exception as e:
            print(f"Failed to send delegation email: {e}")
    
    return get_note(db, uid, id)

public_router = APIRouter(prefix="/api/v1/public/notes", tags=["public_notes"])

@public_router.get("/{share_token}")
def get_public_note(share_token: str, db = Depends(get_db)):
    delegations_group = db.collection_group("delegations").where("share_token", "==", share_token).stream()
    docs = list(delegations_group)
    if not docs:
        raise HTTPException(status_code=404, detail="Delegacja nie istnieje")
        
    doc = docs[0]
    data = doc.to_dict()
    
    if data.get("delegation_status") == "sent":
        doc.reference.update({"delegation_status": "viewed"})
        data["delegation_status"] = "viewed"
        
    note_ref = doc.reference.parent.parent
    note_title = ""
    if note_ref:
        note_doc = note_ref.get()
        if note_doc.exists:
            note_title = note_doc.to_dict().get("title") or ""
        
    return {
        "id": doc.id,
        "note_id": note_ref.id if note_ref else "",
        "title": note_title,
        "delegated_to_name": data.get("delegated_to_name"),
        "delegated_to_email": data.get("delegated_to_email"),
        "delegation_status": data.get("delegation_status"),
        "ai_summary_for_delegate": data.get("ai_summary_for_delegate"),
        "created_at": data.get("created_at")
    }

@public_router.post("/{share_token}/complete")
def complete_public_note(share_token: str, db = Depends(get_db)):
    delegations_group = db.collection_group("delegations").where("share_token", "==", share_token).stream()
    docs = list(delegations_group)
    if not docs:
        raise HTTPException(status_code=404, detail="Delegacja nie istnieje")
        
    doc = docs[0]
    doc.reference.update({"delegation_status": "done"})
    return {"status": "success", "message": "Zadanie oznaczone jako zrealizowane"}
