from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProjectStatus(str, Enum):
    active = "active"
    archived = "archived"
    completed = "completed"

class ProjectBase(BaseModel):
    name: str = Field(..., description="Nazwa projektu")
    description: Optional[str] = Field(default="", description="Opcjonalny opis projektu")
    color: str = Field(default="#3b82f6", description="Kod koloru/akcentu projektu")
    status: ProjectStatus = Field(default=ProjectStatus.active, description="Status projektu")

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    status: Optional[ProjectStatus] = None

class ProjectResponse(ProjectBase):
    id: str = Field(..., description="Identyfikator projektu z Firestore")
    user_id: str = Field(..., description="Identyfikator właściciela (uid)")
    created_at: datetime = Field(..., description="Timestamp utworzenia projektu")
    notes_count: int = Field(default=0, description="Liczba powiązanych notatek")

    model_config = {
        "from_attributes": True
    }

class TeamMember(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str = "member"

class TeamBase(BaseModel):
    name: str = Field(..., description="Nazwa zespołu")
    description: Optional[str] = Field(default="", description="Opis zespołu")

class TeamCreate(TeamBase):
    member_emails: Optional[List[str]] = Field(default=[], description="Opcjonalne e-maile zaproszonych członków")

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TeamResponse(TeamBase):
    id: str = Field(..., description="Identyfikator zespołu w Firestore")
    owner_id: str = Field(..., description="UID założyciela zespołu")
    member_ids: List[str] = Field(default=[], description="Lista UID/e-maili członków zespołu")
    created_at: datetime = Field(..., description="Timestamp utworzenia zespołu")

    model_config = {
        "from_attributes": True
    }

class TeamAddMemberRequest(BaseModel):
    email_or_uid: str = Field(..., description="Adres e-mail lub UID dodawanego członka")

class NoteEvent(BaseModel):
    title: str = Field(..., description="Tytuł wydarzenia")
    date_start: Optional[str] = Field(default=None, description="Data i czas rozpoczęcia (format ISO, np. 20240101T120000Z)")
    date_end: Optional[str] = Field(default=None, description="Data i czas zakończenia (format ISO, np. 20240101T130000Z)")
    description: Optional[str] = Field(default="", description="Opis wydarzenia")

class NoteBase(BaseModel):
    title: Optional[str] = Field(default=None, description="Opcjonalny tytuł notatki")
    content: str = Field(..., description="Główna treść notatki")
    note_type: str = Field(..., description="Kategoryzacja notatki (np. strategic, daily_morning, daily_evening)")
    project_id: Optional[str] = Field(default=None, description="Opcjonalny identyfikator powiązanego projektu (legacy)")
    project_ids: Optional[List[str]] = Field(default=[], description="Lista identyfikatorów przypisanych projektów")
    assigned_to: Optional[str] = Field(default=None, description="Identyfikator/opis przypisanej osoby (legacy)")
    assigned_user_ids: Optional[List[str]] = Field(default=[], description="Lista ID/opisu przypisanych osób (wieloosobowo)")
    pending_user_ids: Optional[List[str]] = Field(default=[], description="Lista ID osób oczekujących na potwierdzenie zaproszenia")
    is_pinned: bool = Field(default=False, description="Czy notatka jest przypięta")
    media_url: Optional[str] = Field(default=None, description="Opcjonalny URL do pliku multimedialnego (wideo/audio)")
    media_type: Optional[str] = Field(default=None, description="Typ mediów, np. 'audio', 'video'")
    raw_transcript: Optional[str] = Field(default=None, description="Surowy tekst transkrypcji z Whisper")
    processing_status: Optional[str] = Field(default="completed", description="Status analizy/transkrypcji: completed, pending, error_transcription, error_ai")
    order: int = Field(default=0, description="Kolejność sortowania na tablicy (rośnie)")
    is_deleted: bool = Field(default=False, description="Czy notatka jest w koszu")
    deleted_at: Optional[datetime] = Field(default=None, description="Kiedy notatka została usunięta (umieszczona w koszu)")
    events: Optional[List[NoteEvent]] = Field(default=[], description="Lista wykrytych wydarzeń terminowych")
    suggested_assignees: Optional[List[str]] = Field(default=[], description="Sugerowane przypisania - imiona/emaile wykryte przez AI w treści notatki")
    delegated_to_name: Optional[str] = Field(default=None, description="Imię/nazwa odbiorcy delegacji")
    delegated_to_email: Optional[str] = Field(default=None, description="E-mail odbiorcy delegacji")
    delegation_status: Optional[str] = Field(default=None, description="Status delegacji: sent, viewed, done")
    share_token: Optional[str] = Field(default=None, description="Token dostępu do publicznej strony")
    ai_summary_for_delegate: Optional[str] = Field(default=None, description="Strukturyzowane podsumowanie zadań przygotowane przez AI dla odbiorcy")

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(default=None, description="Opcjonalny nowy tytuł notatki")
    content: Optional[str] = Field(default=None, description="Opcjonalna nowa treść notatki")
    note_type: Optional[str] = Field(default=None, description="Opcjonalny nowy typ notatki")
    project_id: Optional[str] = Field(default=None, description="Opcjonalna zmiana przypisanego projektu (legacy)")
    project_ids: Optional[List[str]] = Field(default=None, description="Opcjonalna zmiana przypisanych projektów")
    assigned_to: Optional[str] = Field(default=None, description="Opcjonalna zmiana przypisanej osoby (legacy)")
    assigned_user_ids: Optional[List[str]] = Field(default=None, description="Opcjonalna zmiana przypisanych użytkowników")
    pending_user_ids: Optional[List[str]] = Field(default=None, description="Opcjonalna zmiana użytkowników oczekujących na zaproszenie")
    is_pinned: Optional[bool] = Field(default=None, description="Opcjonalna zmiana stanu przypięcia")
    processing_status: Optional[str] = Field(default=None, description="Opcjonalna zmiana statusu przetwarzania")
    order: Optional[int] = Field(default=None, description="Opcjonalna zmiana kolejności sortowania")
    suggested_assignees: Optional[List[str]] = Field(default=None, description="Opcjonalna zmiana sugerowanych przypisań")
    delegated_to_name: Optional[str] = Field(default=None, description="Opcjonalna zmiana imienia odbiorcy")
    delegated_to_email: Optional[str] = Field(default=None, description="Opcjonalna zmiana e-maila odbiorcy")
    delegation_status: Optional[str] = Field(default=None, description="Opcjonalna zmiana statusu delegacji")
    share_token: Optional[str] = Field(default=None, description="Opcjonalna zmiana tokenu")
    ai_summary_for_delegate: Optional[str] = Field(default=None, description="Opcjonalna zmiana podsumowania AI")

class NoteOrderUpdate(BaseModel):
    id: str
    order: int

class NoteReorderRequest(BaseModel):
    updates: List[NoteOrderUpdate]

class NoteResponse(NoteBase):
    id: str = Field(..., description="Identyfikator dokumentu z Firestore")
    user_id: str = Field(..., description="Identyfikator właściciela notatki (uid)")
    created_at: datetime = Field(..., description="Timestamp utworzenia notatki")
    delegations: List["DelegationResponse"] = Field(default=[], description="Lista aktywnych delegacji tej notatki")

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

class SendEmailRequest(BaseModel):
    email: str = Field(..., description="Adres e-mail odbiorcy")

class UserSettingsBase(BaseModel):
    trash_retention_days: int = Field(default=30, description="Liczba dni po których notatki w koszu są trwale usuwane (0 oznacza Nigdy)")
    timezone: Optional[str] = Field(default="Europe/Warsaw", description="Identyfikator strefy czasowej użytkownika (np. Europe/Warsaw, America/New_York)")

class UserSettingsResponse(UserSettingsBase):
    pass

class DelegationBase(BaseModel):
    delegated_to_name: str = Field(..., description="Imię/nazwa odbiorcy")
    delegated_to_email: Optional[str] = Field(default=None, description="Opcjonalny e-mail odbiorcy")
    delegation_status: str = Field(default="sent", description="Status delegacji: sent, viewed, done")
    share_token: str = Field(..., description="Unikalny token dostępu")
    ai_summary_for_delegate: Optional[str] = Field(default=None, description="Podsumowanie AI")
    created_at: datetime = Field(..., description="Data utworzenia delegacji")

class DelegationCreate(BaseModel):
    delegated_to_name: str
    delegated_to_email: Optional[str] = None

class DelegationResponse(DelegationBase):
    id: str = Field(..., description="Identyfikator delegacji z Firestore")
    note_id: str = Field(..., description="Identyfikator notatki nadrzędnej")

    model_config = {
        "from_attributes": True
    }

NoteResponse.model_rebuild()

class GoalHorizon(str, Enum):
    long_term = "long_term"  # Roczny / Długoterminowy
    quarterly = "quarterly"  # Kwartalny
    monthly = "monthly"      # Miesięczny

class KeyResult(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., description="Nazwa rezultatu kluczowego")
    current_value: float = Field(default=0.0, description="Aktualna wartość")
    target_value: float = Field(default=100.0, description="Wartość docelowa")
    unit: str = Field(default="%", description="Jednostka miary (%, PLN, szt, h)")

class GoalBase(BaseModel):
    title: str = Field(..., description="Tytuł celu strategicznego")
    description: Optional[str] = Field(default="", description="Opis lub założenia celu")
    horizon: GoalHorizon = Field(default=GoalHorizon.quarterly, description="Horyzont czasowy celu")
    key_results: List[KeyResult] = Field(default=[], description="Lista kluczowych rezultatów (Key Results)")
    project_id: Optional[str] = Field(default=None, description="Identyfikator powiązanego projektu")
    color: Optional[str] = Field(default="#fef3c7", description="Kolor kafelka w stylu Google Keep")
    is_completed: bool = Field(default=False, description="Czy cel został zrealizowany")
    completed_at: Optional[datetime] = Field(default=None, description="Data ukończenia celu")
    order: int = Field(default=0, description="Kolejność sortowania")

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    horizon: Optional[GoalHorizon] = None
    key_results: Optional[List[KeyResult]] = None
    project_id: Optional[str] = None
    color: Optional[str] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None
    order: Optional[int] = None

class GoalResponse(GoalBase):
    id: str = Field(..., description="Identyfikator celu z Firestore")
    user_id: str = Field(..., description="Identyfikator właściciela (uid)")
    created_at: datetime = Field(..., description="Timestamp utworzenia celu")
    updated_at: Optional[datetime] = Field(default=None, description="Timestamp ostatniej modyfikacji")

    model_config = {
        "from_attributes": True
    }

class AxisTileItem(BaseModel):
    id: str = Field(..., description="Unikalny identyfikator kafelka")
    title: str = Field(..., description="Tytuł / etykieta kafelka")
    x: float = Field(..., description="Pozycja X na osi w procentach (np. 5 - 95)")
    y: float = Field(..., description="Pozycja Y (wysokość / waga) w procentach (np. 14 - 84)")

class AxisTilesPayload(BaseModel):
    tiles: List[AxisTileItem] = Field(default=[], description="Lista kafelków na osi")

class GoalChatMessage(BaseModel):
    role: str = Field(..., description="user lub assistant")
    content: str = Field(..., description="Treść wiadomości")

class GoalChatRequest(BaseModel):
    messages: List[GoalChatMessage] = Field(..., description="Historia konwersacji")
    current_tiles: Optional[List[AxisTileItem]] = Field(default=[], description="Obecne kafelki na osi")

class GoalChatResponse(BaseModel):
    response: str = Field(..., description="Odpowiedź doradcy AI")
