from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    title: Optional[str] = Field(default=None, description="Opcjonalny tytuł notatki")
    content: str = Field(..., description="Główna treść notatki")
    note_type: str = Field(..., description="Kategoryzacja notatki (np. strategic, daily_morning, daily_evening)")

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(default=None, description="Opcjonalny nowy tytuł notatki")
    content: Optional[str] = Field(default=None, description="Opcjonalna nowa treść notatki")
    note_type: Optional[str] = Field(default=None, description="Opcjonalny nowy typ notatki")

class NoteResponse(NoteBase):
    id: str = Field(..., description="Identyfikator dokumentu z Firestore")
    user_id: str = Field(..., description="Identyfikator właściciela notatki (uid)")
    created_at: datetime = Field(..., description="Timestamp utworzenia notatki")

    model_config = {
        "from_attributes": True
    }
