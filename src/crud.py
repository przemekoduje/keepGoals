from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from src.schemas import NoteCreate, NoteUpdate, NoteReorderRequest

def get_notes_ref(db, uid: str):
    """
    Zwraca referencję do subkolekcji notatek zalogowanego użytkownika:
    users/{uid}/notes
    """
    return db.collection("users").document(uid).collection("notes")

def create_note(db, uid: str, note_in: NoteCreate) -> Dict[str, Any]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document()
    
    note_data = note_in.model_dump()
    note_data["user_id"] = uid
    note_data["created_at"] = datetime.now(timezone.utc)
    
    doc_ref.set(note_data)
    
    note_data["id"] = doc_ref.id
    return note_data

def get_notes(db, uid: str) -> List[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    docs = notes_ref.stream()
    
    notes = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        notes.append(data)
        
    def get_sort_key(x):
        # Sortowanie priorytetowe po order (domyślnie 0, więc ujemne wartości mogą oznaczać wyższą pozycję, rosnąco),
        # a w przypadku remisów - po dacie (od najnowszych, timestamp malejąco).
        # Używamy krotki: (order rosnąco, data malejąco - przez konwersję daty do ujemnego timestampu).
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
