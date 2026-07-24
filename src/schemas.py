from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class NoteEvent(BaseModel):
    title: str = Field(..., description="Tytuł wydarzenia")
    date_start: str = Field(..., description="Data i czas rozpoczęcia (format ISO, np. 20240101T120000Z)")
    date_end: str = Field(..., description="Data i czas zakończenia (format ISO, np. 20240101T130000Z)")
    description: Optional[str] = Field(default="", description="Opis wydarzenia")

class NoteBase(BaseModel):
    title: Optional[str] = Field(default=None, description="Opcjonalny tytuł notatki")
    content: str = Field(..., description="Główna treść notatki")
    note_type: str = Field(..., description="Kategoryzacja notatki (np. strategic, daily_morning, daily_evening)")
    is_pinned: bool = Field(default=False, description="Czy notatka jest przypięta")
    media_url: Optional[str] = Field(default=None, description="Opcjonalny URL do pliku multimedialnego (wideo/audio)")
    media_type: Optional[str] = Field(default=None, description="Typ mediów, np. 'audio', 'video'")
    raw_transcript: Optional[str] = Field(default=None, description="Surowy tekst transkrypcji z Whisper")
    order: int = Field(default=0, description="Kolejność sortowania na tablicy (rośnie)")
    is_deleted: bool = Field(default=False, description="Czy notatka jest w koszu")
    deleted_at: Optional[datetime] = Field(default=None, description="Kiedy notatka została usunięta (umieszczona w koszu)")
    events: Optional[List[NoteEvent]] = Field(default=[], description="Lista wykrytych wydarzeń terminowych")

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(default=None, description="Opcjonalny nowy tytuł notatki")
    content: Optional[str] = Field(default=None, description="Opcjonalna nowa treść notatki")
    note_type: Optional[str] = Field(default=None, description="Opcjonalny nowy typ notatki")
    is_pinned: Optional[bool] = Field(default=None, description="Opcjonalna zmiana stanu przypięcia")
    order: Optional[int] = Field(default=None, description="Opcjonalna zmiana kolejności sortowania")

class NoteOrderUpdate(BaseModel):
    id: str
    order: int

class NoteReorderRequest(BaseModel):
    updates: List[NoteOrderUpdate]

class NoteResponse(NoteBase):
    id: str = Field(..., description="Identyfikator dokumentu z Firestore")
    user_id: str = Field(..., description="Identyfikator właściciela notatki (uid)")
    created_at: datetime = Field(..., description="Timestamp utworzenia notatki")

    model_config = {
        "from_attributes": True
    }

class EveningReflectionIn(BaseModel):
    completed_tasks: list[str] = Field(..., description="Lista zadań zrealizowanych")
    uncompleted_tasks: list[str] = Field(..., description="Lista zadań niezrealizowanych")
    avoided_habits: list[str] = Field(..., description="Lista pozytywnych zaniechań / nawyków do uniknięcia")

class AIChatMessage(BaseModel):
    role: str = Field(..., description="Rola: 'user' lub 'assistant'")
    content: str = Field(..., description="Treść wiadomości")

class AIChatRequest(BaseModel):
    messages: List[AIChatMessage] = Field(..., description="Historia czatu dla danej notatki")

class UserSettingsBase(BaseModel):
    trash_retention_days: int = Field(default=30, description="Liczba dni po których notatki w koszu są trwale usuwane (0 oznacza Nigdy)")

class UserSettingsResponse(UserSettingsBase):
    pass

