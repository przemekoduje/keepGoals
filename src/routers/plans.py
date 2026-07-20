import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from src.auth import verify_token
from src.database import get_db
from src.schemas import NoteCreate, NoteResponse
from src.crud import get_notes, create_note
from src.services.ai_service import generate_morning_plan

router = APIRouter(prefix="/api/v1/plans", tags=["plans"])

@router.post("/morning", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def generate_morning_plan_endpoint(
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    
    # 1. Pobieramy notatki użytkownika
    notes = get_notes(db, uid)
    
    # 2. Wyodrębniamy cele strategiczne (note_type == 'strategic')
    strategic_goals = [
        note.get("content") for note in notes
        if note.get("note_type") == "strategic" and note.get("content")
    ]
    
    # 3. Zabezpieczenie przed brakiem celów strategicznych
    if not strategic_goals:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "NO_STRATEGIC_GOALS",
                "message": "Nie można wygenerować planu. Użytkownik nie posiada żadnych zdefiniowanych celów strategicznych.",
                "trace_id": trace_id
            }
        )
        
    # 4. Generowanie planu przez Gemini
    plan_content = generate_morning_plan(strategic_goals)
    
    # 5. Zapis planu w bazie jako notatka o typie daily_morning
    note_in = NoteCreate(
        title="Plan Poranny",
        content=plan_content,
        note_type="daily_morning"
    )
    
    created_plan = create_note(db, uid, note_in)
    return created_plan
