from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from src.schemas import NoteCreate, NoteUpdate, NoteReorderRequest, UserSettingsBase

def get_notes_ref(db, uid: str):
    """
    Zwraca referencję do subkolekcji notatek zalogowanego użytkownika:
    users/{uid}/notes
    """
    return db.collection("users").document(uid).collection("notes")

def get_settings_ref(db, uid: str):
    return db.collection("users").document(uid).collection("settings").document("preferences")

def get_user_settings(db, uid: str) -> Dict[str, Any]:
    settings_doc = get_settings_ref(db, uid).get()
    if settings_doc.exists:
        return settings_doc.to_dict()
    # Default settings
    return {"trash_retention_days": 30}

def update_user_settings(db, uid: str, settings: UserSettingsBase) -> Dict[str, Any]:
    doc_ref = get_settings_ref(db, uid)
    settings_data = settings.model_dump()
    doc_ref.set(settings_data)
    return settings_data

def create_note(db, uid: str, note_in: NoteCreate) -> Dict[str, Any]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document()
    
    note_data = note_in.model_dump()
    note_data["user_id"] = uid
    note_data["created_at"] = datetime.now(timezone.utc)
    note_data["is_deleted"] = False
    note_data["deleted_at"] = None
    
    doc_ref.set(note_data)
    
    note_data["id"] = doc_ref.id
    return note_data

def get_notes(db, uid: str) -> List[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    docs = notes_ref.stream()
    
    notes = []
    for doc in docs:
        data = doc.to_dict()
        # Filter out deleted notes
        if data.get("is_deleted", False):
            continue
        data["id"] = doc.id
        notes.append(data)
        
    def get_sort_key(x):
        val = x.get("created_at")
        dt = datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, str):
            try:
                dt = datetime.fromisoformat(val)
            except:
                pass
        elif val:
            dt = val
            
        order_val = x.get("order", 0)
        return (order_val, -dt.timestamp())

    notes.sort(key=get_sort_key)
    return notes

def get_trash_notes(db, uid: str) -> List[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    docs = notes_ref.stream()
    
    user_settings = get_user_settings(db, uid)
    retention_days = user_settings.get("trash_retention_days", 30)
    
    notes = []
    now = datetime.now(timezone.utc)
    
    for doc in docs:
        data = doc.to_dict()
        if not data.get("is_deleted", False):
            continue
            
        deleted_at = data.get("deleted_at")
        if isinstance(deleted_at, str):
            try:
                deleted_at = datetime.fromisoformat(deleted_at)
            except:
                deleted_at = None
                
        # Lazy cleanup
        if retention_days > 0 and deleted_at:
            if now - deleted_at > timedelta(days=retention_days):
                # Expired, hard delete it now
                notes_ref.document(doc.id).delete()
                continue
                
        data["id"] = doc.id
        notes.append(data)
        
    def get_sort_key(x):
        val = x.get("deleted_at") or x.get("created_at")
        dt = datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, str):
            try:
                dt = datetime.fromisoformat(val)
            except:
                pass
        elif val:
            dt = val
        return -dt.timestamp()

    notes.sort(key=get_sort_key)
    return notes

def get_note(db, uid: str, note_id: str) -> Optional[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    return None

def update_note(db, uid: str, note_id: str, note_in: NoteUpdate) -> Optional[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return None
        
    update_data = note_in.model_dump(exclude_unset=True)
    if update_data:
        doc_ref.update(update_data)
        
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    data["id"] = updated_doc.id
    return data

def delete_note(db, uid: str, note_id: str) -> bool:
    """Soft delete a note"""
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
        
    # Set to deleted
    doc_ref.update({
        "is_deleted": True,
        "deleted_at": datetime.now(timezone.utc)
    })
    return True

def restore_note(db, uid: str, note_id: str) -> bool:
    """Restore a soft-deleted note"""
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
        
    doc_ref.update({
        "is_deleted": False,
        "deleted_at": None
    })
    return True

def hard_delete_note(db, uid: str, note_id: str) -> bool:
    """Permanently delete a note"""
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
        
    doc_ref.delete()
    return True

def reorder_notes(db, uid: str, reorder_request: NoteReorderRequest) -> bool:
    notes_ref = get_notes_ref(db, uid)
    batch = db.batch()
    
    for update in reorder_request.updates:
        doc_ref = notes_ref.document(update.id)
        batch.update(doc_ref, {"order": update.order})
        
    batch.commit()
    return True
