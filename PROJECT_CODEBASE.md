# Full Project Codebase Dump - keepGoals
This document contains the full source code for the keepGoals project (Backend & Frontend) for analysis by external AI models.

## Table of Contents
- [requirements.txt](#file-requirements-txt)
- [.env.example](#file--env-example)
- [frontend/package.json](#file-frontend-package-json)
- [frontend/vite.config.ts](#file-frontend-vite-config-ts)
- [src/auth.py](#file-src-auth-py)
- [src/config.py](#file-src-config-py)
- [src/database.py](#file-src-database-py)
- [src/schemas.py](#file-src-schemas-py)
- [src/main.py](#file-src-main-py)
- [src/crud.py](#file-src-crud-py)
- [src/routers/users.py](#file-src-routers-users-py)
- [src/routers/teams.py](#file-src-routers-teams-py)
- [src/routers/notes.py](#file-src-routers-notes-py)
- [src/routers/plans.py](#file-src-routers-plans-py)
- [src/routers/projects.py](#file-src-routers-projects-py)
- [src/services/ai_service.py](#file-src-services-ai_service-py)
- [src/services/email_service.py](#file-src-services-email_service-py)
- [src/services/storage_service.py](#file-src-services-storage_service-py)
- [tests/test_cors.py](#file-tests-test_cors-py)
- [tests/test_plans.py](#file-tests-test_plans-py)
- [tests/test_auth.py](#file-tests-test_auth-py)
- [tests/__init__.py](#file-tests-__init__-py)
- [tests/test_projects.py](#file-tests-test_projects-py)
- [tests/test_teams.py](#file-tests-test_teams-py)
- [tests/test_notes.py](#file-tests-test_notes-py)
- [frontend/src/App.tsx](#file-frontend-src-App-tsx)
- [frontend/src/main.tsx](#file-frontend-src-main-tsx)
- [frontend/src/contexts/UserProfilesContext.tsx](#file-frontend-src-contexts-UserProfilesContext-tsx)
- [frontend/src/context/AuthContext.tsx](#file-frontend-src-context-AuthContext-tsx)
- [frontend/src/components/ProjectTimelineDrawer.tsx](#file-frontend-src-components-ProjectTimelineDrawer-tsx)
- [frontend/src/components/ProtectedRoute.tsx](#file-frontend-src-components-ProtectedRoute-tsx)
- [frontend/src/components/TimezoneModal.tsx](#file-frontend-src-components-TimezoneModal-tsx)
- [frontend/src/components/AvatarStack.tsx](#file-frontend-src-components-AvatarStack-tsx)
- [frontend/src/components/EveningReflectionForm.tsx](#file-frontend-src-components-EveningReflectionForm-tsx)
- [frontend/src/components/NoteAIChatModal.tsx](#file-frontend-src-components-NoteAIChatModal-tsx)
- [frontend/src/components/MediaRecorderBase.tsx](#file-frontend-src-components-MediaRecorderBase-tsx)
- [frontend/src/components/MobileBottomBar.tsx](#file-frontend-src-components-MobileBottomBar-tsx)
- [frontend/src/components/MarkdownRenderer.tsx](#file-frontend-src-components-MarkdownRenderer-tsx)
- [frontend/src/components/CreateGoalForm.tsx](#file-frontend-src-components-CreateGoalForm-tsx)
- [frontend/src/components/NoteCard.tsx](#file-frontend-src-components-NoteCard-tsx)
- [frontend/src/components/Sidebar.tsx](#file-frontend-src-components-Sidebar-tsx)
- [frontend/src/components/Modal.tsx](#file-frontend-src-components-Modal-tsx)
- [frontend/src/components/MobileTopBar.tsx](#file-frontend-src-components-MobileTopBar-tsx)
- [frontend/src/components/KeepInputBar.tsx](#file-frontend-src-components-KeepInputBar-tsx)
- [frontend/src/components/NoteModal.tsx](#file-frontend-src-components-NoteModal-tsx)
- [frontend/src/layouts/MainLayout.tsx](#file-frontend-src-layouts-MainLayout-tsx)
- [frontend/src/pages/Settings.tsx](#file-frontend-src-pages-Settings-tsx)
- [frontend/src/pages/Projects.tsx](#file-frontend-src-pages-Projects-tsx)
- [frontend/src/pages/Goals.tsx](#file-frontend-src-pages-Goals-tsx)
- [frontend/src/pages/Login.tsx](#file-frontend-src-pages-Login-tsx)
- [frontend/src/pages/Dashboard.tsx](#file-frontend-src-pages-Dashboard-tsx)
- [frontend/src/pages/ProjectDetail.tsx](#file-frontend-src-pages-ProjectDetail-tsx)
- [frontend/src/pages/Teams.tsx](#file-frontend-src-pages-Teams-tsx)
- [frontend/src/pages/Trash.tsx](#file-frontend-src-pages-Trash-tsx)
- [frontend/src/config/firebase.ts](#file-frontend-src-config-firebase-ts)
- [frontend/src/utils/dateUtils.ts](#file-frontend-src-utils-dateUtils-ts)
- [frontend/src/services/api.ts](#file-frontend-src-services-api-ts)
- [frontend/src/App.css](#file-frontend-src-App-css)
- [frontend/src/index.css](#file-frontend-src-index-css)

---

## requirements.txt <a name="file-requirements-txt"></a>

```text
fastapi
uvicorn
firebase-admin
openai
python-dotenv
pytest
httpx
aiofiles
python-multipart

```


## .env.example <a name="file--env-example"></a>

```
OPENAI_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
FIREBASE_CREDENTIALS_PATH=firebase-adminsdk.json

# Konfiguracja SMTP do wysyłania transkrypcji na e-mail z poziomu serwera
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=twojadomena@gmail.com
SMTP_PASSWORD=abcd-efgh-ijkl-mnop

```


## frontend/package.json <a name="file-frontend-package-json"></a>

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "firebase": "^10.8.0",
    "lucide-react": "^1.25.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-markdown": "^9.0.1",
    "react-router-dom": "^6.22.0",
    "remark-gfm": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.13.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-basic-ssl": "^2.3.0",
    "@vitejs/plugin-react": "^6.0.3",
    "autoprefixer": "^10.4.16",
    "oxlint": "^1.71.0",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.1",
    "typescript": "~6.0.2",
    "vite": "^8.1.1"
  }
}

```


## frontend/vite.config.ts <a name="file-frontend-vite-config-ts"></a>

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})

```


## src/auth.py <a name="file-src-auth-py"></a>

```py
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

security = HTTPBearer(auto_error=False)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": "MISSING_TOKEN",
                "message": "Brak tokenu autoryzacyjnego.",
                "trace_id": trace_id
            }
        )

    token = credentials.credentials
    if token == "mock-jwt-token-123":
        return {
            "uid": "mock-user-123",
            "email": "demo-user@keepgoals.com"
        }

    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email")
        }
    except Exception as e:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": "INVALID_TOKEN",
                "message": "Token jest nieprawidłowy lub wygasł.",
                "trace_id": trace_id
            }
        )

```


## src/config.py <a name="file-src-config-py"></a>

```py
import os
import socket
from dotenv import load_dotenv

load_dotenv()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None

class Settings:
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or ""
    GROQ_API_KEY = os.getenv("GROQ_API_KEY") or ""
    
    SMTP_HOST = os.getenv("SMTP_HOST") or os.getenv("EMAIL_HOST") or "smtp.gmail.com"
    SMTP_PORT = int(os.getenv("SMTP_PORT") or os.getenv("EMAIL_PORT") or "587")
    SMTP_USER = (os.getenv("SMTP_USER") or os.getenv("EMAIL_USER") or os.getenv("EMAIL_USERNAME") or "").strip()
    SMTP_PASSWORD = (os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASSWORD") or "").replace(" ", "").strip()
    SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL") or os.getenv("EMAIL_FROM") or SMTP_USER
    
    # Podstawowe dozwolone adresy (HTTP i HTTPS)
    _origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://localhost:3000",
        "https://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:5173",
        "https://thread-provoking-fragrant.ngrok-free.dev"
    ]
    
    # Dodaj lokalne IP jeśli jest dostępne (zarówno HTTP jak i HTTPS)
    _local_ip = get_local_ip()
    if _local_ip:
        _origins.append(f"http://{_local_ip}:3000")
        _origins.append(f"http://{_local_ip}:5173")
        _origins.append(f"https://{_local_ip}:3000")
        _origins.append(f"https://{_local_ip}:5173")
        
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", ",".join(_origins)).split(",")

settings = Settings()


```


## src/database.py <a name="file-src-database-py"></a>

```py
import os
import uuid
import firebase_admin
from firebase_admin import credentials, firestore
from src.config import settings

class MockDocumentSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self):
        return self._data.copy() if self._data else {}

class MockDocumentReference:
    def __init__(self, collection_ref, doc_id=None):
        self.collection_ref = collection_ref
        self.id = doc_id or str(uuid.uuid4())
        self.db = collection_ref.db

    def collection(self, name):
        path = f"{self.collection_ref.path}/{self.id}/{name}"
        if path not in self.db.collections:
            self.db.collections[path] = MockCollectionReference(self.db, path)
        return self.db.collections[path]

    def set(self, data):
        self.collection_ref.data[self.id] = data

    def get(self):
        data = self.collection_ref.data.get(self.id)
        return MockDocumentSnapshot(self.id, data)

    def update(self, data):
        if self.id in self.collection_ref.data:
            self.collection_ref.data[self.id].update(data)

    def delete(self):
        self.collection_ref.data.pop(self.id, None)

class MockCollectionReference:
    def __init__(self, db, path):
        self.db = db
        self.path = path
        self.data = {}

    def document(self, doc_id=None):
        return MockDocumentReference(self, doc_id)

    def stream(self):
        return [MockDocumentSnapshot(doc_id, data) for doc_id, data in self.data.items()]

class MockFirestoreClient:
    def __init__(self):
        self.collections = {}

    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollectionReference(self, name)
        return self.collections[name]

_mock_db_instance = MockFirestoreClient()

def init_firebase():
    if not firebase_admin._apps:
        options = {}
        if settings.FIREBASE_STORAGE_BUCKET:
            options['storageBucket'] = settings.FIREBASE_STORAGE_BUCKET

        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            try:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred, options if options else None)
            except Exception as e:
                print(f"Ostrzeżenie: Nie udało się zainicjalizować Firebase z certyfikatu: {e}")
        else:
            try:
                firebase_admin.initialize_app(options=options if options else None)
            except Exception as e:
                print(f"Ostrzeżenie: Brak domyślnych credentials Firebase: {e}")

init_firebase()

def get_db():
    if not settings.FIREBASE_CREDENTIALS_PATH or not os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        return _mock_db_instance
    try:
        return firestore.client()
    except Exception as e:
        print(f"Błąd pobierania Firestore client: {e}. Używanie Mock DB.")
        return _mock_db_instance


```


## src/schemas.py <a name="file-src-schemas-py"></a>

```py
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

class SendEmailRequest(BaseModel):
    email: str = Field(..., description="Adres e-mail odbiorcy")

class UserSettingsBase(BaseModel):
    trash_retention_days: int = Field(default=30, description="Liczba dni po których notatki w koszu są trwale usuwane (0 oznacza Nigdy)")
    timezone: Optional[str] = Field(default="Europe/Warsaw", description="Identyfikator strefy czasowej użytkownika (np. Europe/Warsaw, America/New_York)")

class UserSettingsResponse(UserSettingsBase):
    pass



```


## src/main.py <a name="file-src-main-py"></a>

```py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.config import settings
from src.routers.notes import router as notes_router
from src.routers.plans import router as plans_router
from src.routers.users import router as users_router
from src.routers.projects import router as projects_router
from src.routers.teams import router as teams_router

app = FastAPI(title="KeepGoals API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "KeepGoals API is running"}

app.include_router(notes_router)
app.include_router(plans_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(teams_router)


```


## src/crud.py <a name="file-src-crud-py"></a>

```py
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from src.schemas import NoteCreate, NoteUpdate, NoteReorderRequest, UserSettingsBase, ProjectCreate, ProjectUpdate, TeamCreate, TeamUpdate

def get_notes_ref(db, uid: str):
    """
    Zwraca referencję do subkolekcji notatek zalogowanego użytkownika:
    users/{uid}/notes
    """
    return db.collection("users").document(uid).collection("notes")

def get_projects_ref(db, uid: str):
    """
    Zwraca referencję do subkolekcji projektów zalogowanego użytkownika:
    users/{uid}/projects
    """
    return db.collection("users").document(uid).collection("projects")

def get_settings_ref(db, uid: str):
    return db.collection("users").document(uid).collection("settings").document("preferences")

def create_project(db, uid: str, project_in: ProjectCreate) -> Dict[str, Any]:
    projects_ref = get_projects_ref(db, uid)
    doc_ref = projects_ref.document()
    
    project_data = project_in.model_dump()
    project_data["user_id"] = uid
    project_data["created_at"] = datetime.now(timezone.utc)
    
    doc_ref.set(project_data)
    project_data["id"] = doc_ref.id
    project_data["notes_count"] = 0
    return project_data

def get_projects(db, uid: str) -> List[Dict[str, Any]]:
    projects_ref = get_projects_ref(db, uid)
    project_docs = projects_ref.stream()
    
    # Calculate notes count per project
    notes = get_notes(db, uid)
    notes_count_map: Dict[str, int] = {}
    for n in notes:
        pids = set(n.get("project_ids") or [])
        if n.get("project_id"):
            pids.add(n.get("project_id"))
        for pid in pids:
            notes_count_map[pid] = notes_count_map.get(pid, 0) + 1

    projects = []
    for doc in project_docs:
        data = doc.to_dict()
        data["id"] = doc.id
        data["notes_count"] = notes_count_map.get(doc.id, 0)
        projects.append(data)
        
    def get_sort_key(p):
        val = p.get("created_at")
        dt = datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, str):
            try:
                dt = datetime.fromisoformat(val)
            except:
                pass
        elif val:
            dt = val
        return -dt.timestamp()

    projects.sort(key=get_sort_key)
    return projects

def get_project(db, uid: str, project_id: str) -> Optional[Dict[str, Any]]:
    projects_ref = get_projects_ref(db, uid)
    doc = projects_ref.document(project_id).get()
    if not doc.exists:
        return None
        
    data = doc.to_dict()
    data["id"] = doc.id
    
    # Fetch notes belonging to this project
    all_notes = get_notes(db, uid, project_id=project_id)
    data["notes"] = all_notes
    data["notes_count"] = len(all_notes)
    return data

def delete_project(db, uid: str, project_id: str) -> bool:
    projects_ref = get_projects_ref(db, uid)
    doc_ref = projects_ref.document(project_id)
    if not doc_ref.get().exists:
        return False
        
    doc_ref.delete()
    
    # Unassign project_id from notes associated with this project
    notes_ref = get_notes_ref(db, uid)
    notes_docs = notes_ref.stream()
    for n_doc in notes_docs:
        n_data = n_doc.to_dict()
        pids = n_data.get("project_ids") or []
        single_pid = n_data.get("project_id")
        if project_id in pids or single_pid == project_id:
            new_pids = [p for p in pids if p != project_id]
            new_single = single_pid if single_pid != project_id else (new_pids[0] if new_pids else None)
            notes_ref.document(n_doc.id).update({
                "project_ids": new_pids,
                "project_id": new_single
            })
            
    return True

def get_user_settings(db, uid: str) -> Dict[str, Any]:
    settings_doc = get_settings_ref(db, uid).get()
    if settings_doc.exists:
        data = settings_doc.to_dict()
        if "timezone" not in data or not data["timezone"]:
            data["timezone"] = "Europe/Warsaw"
        return data
    # Default settings
    return {"trash_retention_days": 30, "timezone": "Europe/Warsaw"}

def update_user_settings(db, uid: str, settings: UserSettingsBase) -> Dict[str, Any]:
    doc_ref = get_settings_ref(db, uid)
    settings_data = settings.model_dump()
    doc_ref.set(settings_data)
    return settings_data

def get_teams_ref(db):
    return db.collection("teams")

def create_team(db, uid: str, team_in: TeamCreate) -> Dict[str, Any]:
    teams_ref = get_teams_ref(db)
    doc_ref = teams_ref.document()
    
    team_data = team_in.model_dump()
    team_data["owner_id"] = uid
    team_data["created_at"] = datetime.now(timezone.utc)
    
    members = list(set(team_data.get("member_emails") or []))
    if uid not in members:
        members.append(uid)
    team_data["member_ids"] = members
    if "member_emails" in team_data:
        del team_data["member_emails"]
        
    doc_ref.set(team_data)
    team_data["id"] = doc_ref.id
    return team_data

def get_user_teams(db, uid: str) -> List[Dict[str, Any]]:
    teams_ref = get_teams_ref(db)
    docs = teams_ref.stream()
    
    user_teams = []
    for doc in docs:
        data = doc.to_dict()
        owner = data.get("owner_id")
        members = data.get("member_ids") or []
        if owner == uid or uid in members:
            data["id"] = doc.id
            user_teams.append(data)
    return user_teams

def get_team(db, team_id: str) -> Optional[Dict[str, Any]]:
    doc_ref = get_teams_ref(db).document(team_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    return None

def delete_team(db, uid: str, team_id: str) -> bool:
    team = get_team(db, team_id)
    if not team or team.get("owner_id") != uid:
        return False
    get_teams_ref(db).document(team_id).delete()
    return True

def add_team_member(db, uid: str, team_id: str, email_or_uid: str) -> Optional[Dict[str, Any]]:
    team = get_team(db, team_id)
    if not team:
        return None
    members = team.get("member_ids") or []
    if email_or_uid not in members:
        members.append(email_or_uid)
        get_teams_ref(db).document(team_id).update({"member_ids": members})
        team["member_ids"] = members
    return team

def remove_team_member(db, uid: str, team_id: str, member_id: str) -> Optional[Dict[str, Any]]:
    team = get_team(db, team_id)
    if not team:
        return None
    members = team.get("member_ids") or []
    if member_id in members:
        members.remove(member_id)
        get_teams_ref(db).document(team_id).update({"member_ids": members})
        team["member_ids"] = members
    return team

def create_note(db, uid: str, note_in: NoteCreate) -> Dict[str, Any]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document()
    
    note_data = note_in.model_dump()
    note_data["user_id"] = uid
    note_data["created_at"] = datetime.now(timezone.utc)
    note_data["is_deleted"] = False
    note_data["deleted_at"] = None
    if "processing_status" not in note_data or not note_data["processing_status"]:
        note_data["processing_status"] = "completed"
    
    pids = note_data.get("project_ids") or []
    if note_data.get("project_id") and note_data["project_id"] not in pids:
        pids.append(note_data["project_id"])
    note_data["project_ids"] = pids
    note_data["project_id"] = pids[0] if pids else None

    # Sync assigned_user_ids and assigned_to
    assignees = list(note_data.get("assigned_user_ids") or [])
    if note_data.get("assigned_to") and note_data["assigned_to"] not in assignees:
        assignees.append(note_data["assigned_to"])
    if uid not in assignees:
        assignees.append(uid)
    note_data["assigned_user_ids"] = assignees
    note_data["assigned_to"] = assignees[0] if assignees else None

    # Firestore max document limit safety (1MB limit)
    if isinstance(note_data.get("content"), str) and len(note_data["content"].encode('utf-8')) > 1000000:
        note_data["content"] = note_data["content"][:500000] + "\n\n[Treść notatki została skrócona ze względu na limit rozmiaru dokumentu w bazie danych]"

    doc_ref.set(note_data)
    
    note_data["id"] = doc_ref.id
    return note_data

def get_notes(db, uid: str, email: Optional[str] = None, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
    # 1. Moje notatki
    notes_ref = get_notes_ref(db, uid)
    docs_my = list(notes_ref.stream())
    
    # 2. Notatki, do których jestem przypisany (współdzielone)
    docs_shared = list(db.collection_group("notes").where("assigned_user_ids", "array_contains", uid).stream())
    
    # 3. Notatki, do których zostałem zaproszony (po uid i emailu)
    docs_pending = list(db.collection_group("notes").where("pending_user_ids", "array_contains", uid).stream())
    docs_pending_email = []
    if email:
        docs_pending_email = list(db.collection_group("notes").where("pending_user_ids", "array_contains", email).stream())
    
    # Unikalne notatki
    all_docs = {}
    for doc in docs_my + docs_shared + docs_pending + docs_pending_email:
        all_docs[doc.id] = doc

    notes = []
    for doc_id, doc in all_docs.items():
        data = doc.to_dict()
        # Filter out deleted notes
        if data.get("is_deleted", False):
            continue

        pids = set(data.get("project_ids") or [])
        if data.get("project_id"):
            pids.add(data.get("project_id"))

        if project_id and project_id not in pids:
            continue

        data["id"] = doc.id
        data["project_ids"] = list(pids)
        data["project_id"] = data["project_ids"][0] if data["project_ids"] else None
        
        assignees = list(data.get("assigned_user_ids") or [])
        if data.get("assigned_to") and data["assigned_to"] not in assignees:
            assignees.append(data["assigned_to"])
        data["assigned_user_ids"] = assignees
        data["assigned_to"] = assignees[0] if assignees else None
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
        data["processing_status"] = data.get("processing_status", "completed")
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
        data["processing_status"] = data.get("processing_status", "completed")
        assignees = list(data.get("assigned_user_ids") or [])
        if data.get("assigned_to") and data["assigned_to"] not in assignees:
            assignees.append(data["assigned_to"])
        data["assigned_user_ids"] = assignees
        data["assigned_to"] = assignees[0] if assignees else None
        return data
    return None

def update_note(db, uid: str, note_id: str, note_in: NoteUpdate) -> Optional[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return None
        
    data = doc.to_dict()
    update_data = note_in.model_dump(exclude_unset=True)
    if update_data:
        if "project_ids" in update_data and update_data["project_ids"] is not None:
            pids = update_data["project_ids"]
            update_data["project_id"] = pids[0] if pids else None
        elif "project_id" in update_data:
            pid = update_data["project_id"]
            update_data["project_ids"] = [pid] if pid else []

        if "assigned_user_ids" in update_data and update_data["assigned_user_ids"] is not None:
            new_assignees = set(update_data["assigned_user_ids"])
            current_assignees = set(data.get("assigned_user_ids") or [])
            current_pending = set(data.get("pending_user_ids") or [])
            
            added = new_assignees - current_assignees
            removed = (current_assignees | current_pending) - new_assignees

            final_assignees = current_assignees - removed
            final_pending = (current_pending - removed) | added

            # Wyjątek: właściciel nie jest 'pending' jeśli sam przypisze się w UI
            if uid in final_pending:
                final_pending.remove(uid)
                final_assignees.add(uid)

            update_data["assigned_user_ids"] = list(final_assignees)
            update_data["pending_user_ids"] = list(final_pending)
            update_data["assigned_to"] = update_data["assigned_user_ids"][0] if update_data["assigned_user_ids"] else None

        data.update(update_data)
        doc_ref.update(update_data)
        
    data["id"] = doc.id
    pids = list(set(data.get("project_ids") or []))
    if data.get("project_id") and data["project_id"] not in pids:
        pids.append(data["project_id"])
    data["project_ids"] = pids
    data["project_id"] = pids[0] if pids else None
    data["processing_status"] = data.get("processing_status", "completed")
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

```


## src/routers/users.py <a name="file-src-routers-users-py"></a>

```py
from fastapi import APIRouter, Depends, HTTPException, status
from src.auth import verify_token
from src.database import get_db
from src.schemas import UserSettingsBase, UserSettingsResponse
from src.crud import get_user_settings, update_user_settings

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/settings", response_model=UserSettingsResponse)
def read_user_settings(
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    settings = get_user_settings(db, uid)
    return settings

@router.put("/settings", response_model=UserSettingsResponse)
def update_settings(
    settings_in: UserSettingsBase,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    updated_settings = update_user_settings(db, uid, settings_in)
    return updated_settings

@router.post("/profiles")
def get_user_profiles(
    uids: list[str],
    user: dict = Depends(verify_token)
):
    """Pobiera dane profilowe dla listy UID korzystając z Firebase Auth."""
    from firebase_admin import auth
    
    # Filtrujemy, żeby przetwarzać tylko UID-y (odrzucamy zwykłe adresy e-mail)
    valid_uids = [uid for uid in uids if "@" not in uid]
    
    if not valid_uids:
        return {}
        
    try:
        # get_users przyjmuje listę obiektów UidIdentifier
        identifiers = [auth.UidIdentifier(uid) for uid in valid_uids]
        result = auth.get_users(identifiers)
        
        profiles = {}
        for user_record in result.users:
            profiles[user_record.uid] = {
                "email": user_record.email,
                "display_name": user_record.display_name or user_record.email
            }
        return profiles
    except Exception as e:
        print(f"Error fetching user profiles: {e}")
        return {}

```


## src/routers/teams.py <a name="file-src-routers-teams-py"></a>

```py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from src.auth import verify_token
from src.database import get_db
from src.schemas import TeamCreate, TeamResponse, TeamAddMemberRequest
from src.crud import create_team, get_user_teams, get_team, delete_team, add_team_member, remove_team_member

router = APIRouter(prefix="/api/v1/teams", tags=["teams"])

@router.get("", response_model=List[TeamResponse])
def read_teams(
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    return get_user_teams(db, uid)

@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_new_team(
    team_in: TeamCreate,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    return create_team(db, uid, team_in)

@router.get("/{team_id}", response_model=TeamResponse)
def read_team_details(
    team_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    team = get_team(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Zespół o ID {team_id} nie został znaleziony."}
        )
    return team

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_team(
    team_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    success = delete_team(db, uid, team_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Nie możesz usunąć tego zespołu (tylko założyciel może usuwać zespół)."}
        )
    return None

@router.post("/{team_id}/members", response_model=TeamResponse)
def add_member_to_team(
    team_id: str,
    member_in: TeamAddMemberRequest,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    team = add_team_member(db, uid, team_id, member_in.email_or_uid)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Zespół o ID {team_id} nie został znaleziony."}
        )
    return team

@router.delete("/{team_id}/members/{member_id:path}", response_model=TeamResponse)
def remove_member_from_team(
    team_id: str,
    member_id: str,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    team = remove_team_member(db, uid, team_id, member_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Zespół o ID {team_id} nie został znaleziony."}
        )
    return team

```


## src/routers/notes.py <a name="file-src-routers-notes-py"></a>

```py
import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from src.auth import verify_token
from src.database import get_db
from src.schemas import NoteCreate, NoteUpdate, NoteResponse, NoteReorderRequest, AIChatRequest, SendEmailRequest
from src.crud import create_note, get_notes, get_note, update_note, delete_note, reorder_notes, get_trash_notes, restore_note, hard_delete_note, get_user_settings
from src.services.ai_service import analyze_audio_note, analyze_video_note, chat_with_ai_about_note
from src.services.storage_service import save_media_file_local, sync_media_to_cloud_bg, process_media_and_cloud_sync_bg
from src.services.email_service import send_transcription_email

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

```


## src/routers/plans.py <a name="file-src-routers-plans-py"></a>

```py
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from src.auth import verify_token
from src.database import get_db
from src.schemas import NoteCreate, NoteResponse, EveningReflectionIn
from src.crud import get_notes, create_note
from src.services.ai_service import generate_morning_plan, generate_evening_reflection

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
        
    # 4. Generowanie planu przez OpenAI
    plan_content = generate_morning_plan(strategic_goals)
    
    # 5. Zapis planu w bazie jako notatka o typie daily_morning
    note_in = NoteCreate(
        title="Plan Poranny",
        content=plan_content,
        note_type="daily_morning"
    )
    
    created_plan = create_note(db, uid, note_in)
    return created_plan

@router.post("/evening", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def generate_evening_reflection_endpoint(
    reflection_in: EveningReflectionIn,
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
        
    # 4. Generowanie podsumowania przez OpenAI
    reflection_content = generate_evening_reflection(reflection_in.model_dump(), strategic_goals)
    
    # 5. Zapis refleksji w bazie jako notatka o typie daily_evening
    note_in = NoteCreate(
        title="Refleksja Wieczorna",
        content=reflection_content,
        note_type="daily_evening"
    )
    
    created_reflection = create_note(db, uid, note_in)
    return created_reflection


```


## src/routers/projects.py <a name="file-src-routers-projects-py"></a>

```py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from src.auth import verify_token
from src.database import get_db
from src.schemas import ProjectCreate, ProjectResponse
from src import crud

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

@router.get("", response_model=List[ProjectResponse])
def read_projects(current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Pobiera listę wszystkich projektów zalogowanego użytkownika.
    """
    uid = current_user["uid"]
    return crud.get_projects(db, uid)

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(project_in: ProjectCreate, current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Tworzy nowy projekt dla zalogowanego użytkownika.
    """
    uid = current_user["uid"]
    return crud.create_project(db, uid, project_in)

@router.get("/{project_id}", response_model=Dict[str, Any])
def read_project_details(project_id: str, current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Pobiera szczegóły danego projektu wraz z filtrowaną listą powiązanych notatek.
    """
    uid = current_user["uid"]
    project = crud.get_project(db, uid, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie został znaleziony")
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(project_id: str, current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Usuwa podany projekt użytkownika.
    """
    uid = current_user["uid"]
    success = crud.delete_project(db, uid, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Projekt nie został znaleziony")
    return None

```


## src/services/ai_service.py <a name="file-src-services-ai_service-py"></a>

```py
import os
import json
import tempfile
import subprocess
import base64
import urllib.request
from openai import OpenAI
from src.config import settings

_client = None
_groq_client = None

def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = settings.OPENAI_API_KEY or None
        _client = OpenAI(api_key=api_key)
    return _client

def get_groq_client() -> OpenAI:
    global _groq_client
    if _groq_client is None:
        api_key = settings.GROQ_API_KEY or None
        _groq_client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key
        )
    return _groq_client

def get_ai_client_and_model(task_type: str = "llm") -> tuple[OpenAI, str]:
    """
    Zwraca odpowiedniego klienta (Groq lub OpenAI) oraz nazwę modelu w zależności od konfiguracji.
    task_type: "llm" lub "whisper"
    """
    if settings.GROQ_API_KEY:
        client = get_groq_client()
        model = "whisper-large-v3" if task_type == "whisper" else "llama-3.3-70b-versatile"
        return client, model
    else:
        client = get_openai_client()
        model = "whisper-1" if task_type == "whisper" else "gpt-4o-mini"
        return client, model

def generate_morning_plan(strategic_goals: list[str]) -> str:
    """
    Generuje plan poranny w oparciu o listę celów strategicznych użytkownika.
    Zwraca checklistę w formacie Markdown.
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return """# Twój Plan Poranny (Demo AI)

Oto zoptymalizowany plan dnia wspierający Twoje cele strategiczne:

- [ ] **Praca Głęboka**: Przeznacz 45 minut rano na główny blok zadań.
- [ ] **Aktywność fizyczna**: Wykonaj krótki trening lub rozciąganie.
- [ ] **Refaktoryzacja**: Uporządkuj pliki i zidentyfikuj wąskie gardła w projekcie.
- [ ] **Odpoczynek**: Odłącz się od ekranów na 30 minut przed snem.
"""

    try:
        client, model = get_ai_client_and_model("llm")
        goals_formatted = "\n".join([f"- {goal}" for goal in strategic_goals])
        
        prompt = f"""Jesteś osobistym asystentem produktywności.
Twoim zadaniem jest stworzenie planu na bieżący dzień w formacie czystej checklisty Markdown (z polami do odznaczenia typu `- [ ]`).
Plan musi bezpośrednio wspierać realizację poniższych celów strategicznych użytkownika:
{goals_formatted}

Zwróć wyłącznie plan dnia jako listę zadań do wykonania w formacie Markdown, bez żadnych wstępów, podsumowań czy komentarzy."""

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd OpenAI API: {e}. Fallback do demo planu.")
        return """# Twój Plan Poranny (Demo AI - Błąd Połączenia)

Oto zoptymalizowany plan dnia wspierający Twoje cele strategiczne:

- [ ] **Praca Głęboka**: Przeznacz 45 minut rano na główny blok zadań.
- [ ] **Aktywność fizyczna**: Wykonaj krótki trening lub rozciąganie.
- [ ] **Refaktoryzacja**: Uporządkuj pliki i zidentyfikuj wąskie gardła w projekcie.
- [ ] **Odpoczynek**: Odłącz się od ekranów na 30 minut przed snem.
"""

def generate_evening_reflection(reflection_data: dict, strategic_goals: list[str]) -> str:
    """
    Generuje wieczorną refleksję (mentor) analizując sukcesy i porażki dnia w odniesieniu do celów strategicznych.
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return """# Analiza Mentora (Demo AI)

Przeanalizowałem Twój dzisiejszy dzień w odniesieniu do celów strategicznych. Oto moje spostrzeżenia:

## Wyciągnięte wnioski
* **Świetna robota** z realizacją dzisiejszych zadań! Konsekwencja buduje nawyki.
* Niezrealizowane zadania to wartościowa lekcja – spróbuj jutro zaplanować je na porę dnia, gdy masz najwięcej energii.
* **Super**, że udało się uniknąć niepożądanych nawyków! Samodyscyplina jest kluczem do sukcesu.

## Rekomendacja na jutro
Zacznij dzień od najważniejszego zadania jako pierwszego (zasada *Eat That Frog*). Trzymam kciuki!
"""

    try:
        client, model = get_ai_client_and_model("llm")
        
        goals_formatted = "\n".join([f"- {goal}" for goal in strategic_goals])
        completed_formatted = "\n".join([f"- {task}" for task in reflection_data.get("completed_tasks", [])])
        uncompleted_formatted = "\n".join([f"- {task}" for task in reflection_data.get("uncompleted_tasks", [])])
        avoided_formatted = "\n".join([f"- {habit}" for habit in reflection_data.get("avoided_habits", [])])
        
        prompt = f"""Jesteś osobistym mentorem rozwoju osobistego i produktywności.
Twoim zadaniem jest przeanalizowanie dzisiejszych sukcesów i porażek użytkownika w kontekście jego celów strategicznych.

Cele strategiczne użytkownika:
{goals_formatted}

Dzisiejsza wieczorna refleksja:
- Zadania zrealizowane dzisiaj:
{completed_formatted or '- (brak)'}
- Zadania niezrealizowane dzisiaj:
{uncompleted_formatted or '- (brak)'}
- Uniknięte niechciane nawyki (pozytywne zaniechania):
{avoided_formatted or '- (brak)'}

Wygeneruj zwięzłe podsumowanie z konstruktywnymi wnioskami optymalizacyjnymi na jutro w formacie Markdown. Twoja odpowiedź powinna być wspierająca, obiektywna i skupiona na konkretnych krokach poprawy."""

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd OpenAI API: {e}. Fallback do demo refleksji.")
        return """# Analiza Mentora (Demo AI - Błąd Połączenia)

Przeanalizowałem Twój dzisiejszy dzień w odniesieniu do celów strategicznych. Oto moje spostrzeżenia:

## Wyciągnięte wnioski
* **Świetna robota** z realizacją dzisiejszych zadań! Konsekwencja buduje nawyki.
* Niezrealizowane zadania to wartościowa lekcja – spróbuj jutro zaplanować je na porę dnia, gdy masz najwięcej energii.
* **Super**, że udało się uniknąć niepożądanych nawyków! Samodyscyplina jest kluczem do sukcesu.

## Rekomendacja na jutro
Zacznij dzień od najważniejszego zadania jako pierwszego (zasada *Eat That Frog*). Trzymam kciuki!
"""


audio_system_prompt = """Jesteś wybitnym asystentem redakcyjnym. Twoim zadaniem jest przetworzenie załączonego nagrania głosowego na wysoce ustrukturyzowaną notatkę tekstową.

Zasady przetwarzania:
1. Korekta: Popraw błędy gramatyczne, składniowe i stylistyczne. Zmień luźny język mówiony na klarowny, profesjonalny i formalny tekst pisany.
2. Strukturyzacja (Krytyczne): Notatka w polu `content` MUSI składać się z dwóch części:
   a) Krótkie opisowe streszczenie (narracyjna relacja) nagranej rozmowy, opisujące kontekst, omawiane tematy i ogólne ustalenia.
   b) Następnie (po nagłówku, np. "### Zadania do wykonania" lub "### Ustalenia") lista zadań / akcji do podjęcia, sformatowana za pomocą checkboxów `- [ ]` w standardzie GFM Markdown.
3. Zwięzłość: Odrzuć zająknięcia, powtórzenia słów, dygresje i szum myślowy. Skup się na esencji przekazu.
4. Wydarzenia terminowe: Wykryj w treści wszelkie propozycje dat, terminów, spotkań czy przypomnień w czasie. Załóż, że bieżący rok to bieżący rok kalendarzowy (jeśli nie podano inaczej).
5. Wykrywanie osób: Wykryj wszystkie imiona, nazwiska lub adresy e-mail osób wymienionych w nagraniu (np. "wyślij to Oli", "Marek się tym zajmie"). Zwróć je w polu `suggested_assignees`. Jeśli brak osób - zwróć [].

Zwróć odpowiedź WYŁĄCZNIE jako czysty obiekt JSON (bez znaczników formatowania bloku kodu, takich jako ```json):
{
    "title": "Trafny, krótki tytuł notatki (max 5 słów)",
    "content": "Tutaj wpisz krótki, kilkuzdaniowy opisowy wstęp relacjonujący przebieg rozmowy i jej kontekst.\\n\\n### Zadania do wykonania\\n- [ ] Pierwsze zadanie do wykonania\\n- [ ] Drugie zadanie do wykonania",
    "suggested_assignees": ["Imię Osoby 1", "email@example.com"],
    "events": [
        {
            "title": "Krótki tytuł wydarzenia",
            "date_start": "Data i czas rozpoczęcia (standardowy format ISO-8601, np. 2024-01-01T12:00:00Z)",
            "date_end": "Data i czas zakończenia (standardowy format ISO-8601, np. 2024-01-01T13:00:00Z)",
            "description": "Krótki opis kontekstowy"
        }
    ]
}
"""

VIDEO_SYSTEM_PROMPT = """Jesteś wybitnym asystentem produktywności. Przeanalizuj załączone nagranie wideo.
Twoim celem jest wyciągnięcie kluczowych informacji i przekształcenie ich w zwięzłą, czytelną notatkę oraz wyodrębnienie wszelkich omawianych dat i spotkań.
Wykryj również wszystkie imiona, nazwiska lub adresy e-mail osób wymienionych w nagraniu i umieść je w `suggested_assignees`. Jeśli brak osób - zwróć [].

Zwróć odpowiedź WYŁĄCZNIE jako czysty obiekt JSON, bez żadnych dodatkowych komentarzy ani formatowania blokowego (typu ```json).

Wymagany schemat JSON:
{
    "title": "Krótki, chwytliwy tytuł podsumowujący główny wątek (max 5-6 słów).",
    "content": "Tutaj wpisz krótki, kilkuzdaniowy opisowy wstęp relacjonujący przebieg nagrania wideo i jego kontekst.\\n\\n### Zadania do wykonania\\n- [ ] Pierwsze zadanie do wykonania\\n- [ ] Drugie zadanie do wykonania",
    "suggested_assignees": ["Imię Osoby", "email@example.com"],
    "events": [
        {
            "title": "Tytuł spotkania / wydarzenia",
            "date_start": "Data i czas rozpoczęcia (standardowy format ISO-8601, np. 2024-01-01T12:00:00Z)",
            "date_end": "Data i czas zakończenia (standardowy format ISO-8601, np. 2024-01-01T13:00:00Z)",
            "description": "Krótki opis zdarzenia"
        }
    ]
}"""

def extract_audio_for_whisper(input_bytes: bytes, mime_type: str) -> str:
    """
    Ekstrahuje i kompresuje ścieżkę dźwiękową z nagrania wideo/audio za pomocą ffmpeg (do formatu MP3 64k).
    Dzięki temu nawet 50 MB wideo zamienia się w plik mp3 ~500 KB, co eliminuje błąd 413 (limit 25MB w OpenAI Whisper).
    """
    clean_mime = mime_type.split(';')[0].strip()
    ext = clean_mime.split('/')[-1] if '/' in clean_mime else 'webm'
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as in_file:
        in_file.write(input_bytes)
        in_path = in_file.name

    out_path = in_path + ".mp3"
    
    try:
        cmd = ['ffmpeg', '-y', '-i', in_path, '-vn', '-acodec', 'libmp3lame', '-ab', '64k', out_path]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        if os.path.exists(in_path):
            os.remove(in_path)
        return out_path
    except Exception as e:
        print(f"Ostrzeżenie: Kompresja ffmpeg pominięta ({e}). Używanie oryginalnego pliku.")
        if os.path.exists(out_path):
            os.remove(out_path)
        return in_path

def _analyze_media(file_bytes: bytes, mime_type: str, prompt: str) -> dict:
    # Fallback jeśli API key nie jest skonfigurowane
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return {
            "title": "Transkrypcja (Demo)",
            "content": "To jest przykładowa transkrypcja wygenerowana ponieważ brakuje kluczy API w pliku .env.\n\n- [ ] Przeanalizuj to zadanie\n- [ ] Zaplanuj kolejne kroki"
        }

    try:
        # Ekstrakcja audio z nagrania wideo/audio dla OpenAI Whisper (drastyczna redukcja rozmiaru pliku)
        temp_path = extract_audio_for_whisper(file_bytes, mime_type)

        try:
            # Pobierz odpowiedniego klienta i model dla transkrypcji
            whisper_client, whisper_model = get_ai_client_and_model("whisper")
            
            # Transkrypcja pliku za pomocą modelu Whisper
            with open(temp_path, "rb") as audio_file:
                transcript = whisper_client.audio.transcriptions.create(
                    model=whisper_model,
                    file=audio_file
                )
                
            transcribed_text = transcript.text
            
            # Opcjonalne zabezpieczenie przed pustą transkrypcją
            if not transcribed_text.strip():
                return {
                    "title": "Puste nagranie",
                    "content": "Nie udało się rozpoznać mowy w nagraniu."
                }

            # Pobierz odpowiedniego klienta i model dla analizy tekstu
            llm_client, llm_model = get_ai_client_and_model("llm")

            # Analiza i strukturyzacja przetranskrybowanego tekstu
            response = llm_client.chat.completions.create(
                model=llm_model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": f"Oto transkrypcja nagrania do przeanalizowania i sformatowania:\n\n{transcribed_text}"}
                ]
            )
            
            response_text = response.choices[0].message.content.strip()
            
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
                
            result = json.loads(response_text.strip())
            result["raw_transcript"] = transcribed_text
            return result
            
        finally:
            # Czyszczenie zasobów lokalnych
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        print(f"Błąd analizy mediów AI: {e}. Fallback do danych zastępczych.")
        return {
            "title": "Notatka z nagrania (Offline)",
            "content": f"Nagranie zostało zapisane. Transkrypcja i analiza przez AI są chwilowo niedostępne z powodu błędu: {e}"
        }

def analyze_audio_note(file_bytes: bytes, mime_type: str, user_timezone: str = "Europe/Warsaw", team_members: list = None) -> dict:
    from datetime import datetime
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    context = f"\nBieżący czas (punkt odniesienia): {now_str} (Strefa czasowa: {user_timezone})\n"
    if team_members:
        context += f"Oto lista aktualnych członków zespołu użytkownika (adresy email lub identyfikatory): {', '.join(team_members)}.\n"
        context += "Jeśli w nagraniu padają imiona (np. Ola, Marek) współpracowników, postaraj się dopasować je do tej listy i w 'suggested_assignees' zwróć ich dokładny adres z powyższej listy zamiast samego imienia. Jeśli kogoś nie ma na liście, zwróć jego imię.\n"
    return _analyze_media(file_bytes, mime_type, audio_system_prompt + context)

def analyze_video_note(file_bytes: bytes, mime_type: str, user_timezone: str = "Europe/Warsaw", team_members: list = None) -> dict:
    from datetime import datetime
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    context = f"\nBieżący czas (punkt odniesienia): {now_str} (Strefa czasowa: {user_timezone})\n"
    if team_members:
        context += f"Oto lista aktualnych członków zespołu użytkownika (adresy email lub identyfikatory): {', '.join(team_members)}.\n"
        context += "Jeśli w nagraniu padają imiona (np. Ola, Marek) współpracowników, postaraj się dopasować je do tej listy i w 'suggested_assignees' zwróć ich dokładny adres z powyższej listy zamiast samego imienia. Jeśli kogoś nie ma na liście, zwróć jego imię.\n"
    return _analyze_media(file_bytes, mime_type, VIDEO_SYSTEM_PROMPT + context)


CHAT_SYSTEM_PROMPT = """Jesteś inteligentnym asystentem redakcyjnym notatki.
Twoim zadaniem jest pomoc użytkownikowi w analizie, ulepszeniu lub modyfikacji obecnej treści notatki.
Rozmawiasz z użytkownikiem o tej notatce. 
Jeśli dojdziesz do wniosku, że należy zmodyfikować treść notatki lub użytkownik Cię o to poprosi, WYGENERUJ NOWĄ TREŚĆ NOTATKI obejmując ją bezwzględnie w znaczniki:
<REWRITTEN_NOTE>
Tutaj nowa treść notatki (w formacie Markdown)
</REWRITTEN_NOTE>
Jeśli nie modyfikujesz notatki, po prostu odpisz w czacie. Odpowiadaj zwięźle i profesjonalnie.
"""

def extract_video_frames(video_path: str, num_frames: int = 6) -> list[str]:
    import cv2
    import base64
    frames_b64 = []
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print("Nie można otworzyć wideo przez cv2.")
            return []
        
        # Przebieg 1: Zlicz klatki, ponieważ cap.get() i cap.set() nie działają poprawnie z plikami WebM.
        total_frames = 0
        while cap.grab():
            total_frames += 1
            
        if total_frames == 0:
            cap.release()
            return []
            
        step = max(1, total_frames // num_frames)
        
        # Przebieg 2: Wyciągnij wybrane klatki sekwencyjnie.
        cap.release()
        cap = cv2.VideoCapture(video_path)
        
        current_frame = 0
        target_frame = 0
        frames_extracted = 0
        
        while cap.isOpened() and frames_extracted < num_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            if current_frame == target_frame:
                success, buffer = cv2.imencode('.jpg', frame)
                if success:
                    b64 = base64.b64encode(buffer).decode('utf-8')
                    frames_b64.append(b64)
                    frames_extracted += 1
                target_frame += step
                
            current_frame += 1
                
        cap.release()
    except Exception as e:
        print(f"Błąd ekstrakcji klatek wideo (cv2): {e}")
    return frames_b64

def chat_with_ai_about_note(note_content: str, chat_history: list, media_url: str = None, media_type: str = None, events: list = None, raw_transcript: str = None) -> str:
    """
    Prowadzi konwersację z AI na temat podanej notatki.
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return "To jest wersja demo czatu z AI, ponieważ brak klucza API. Wyobraź sobie, że odpowiadam na Twoje pytanie!\n\n<REWRITTEN_NOTE>\nTo jest przykładowa (zmieniona) treść notatki.\n</REWRITTEN_NOTE>"

    try:
        client, model = get_ai_client_and_model("llm")
        # Przytnij historię do ostatnich 10 wiadomości, aby ograniczyć koszty tokenów
        trimmed_history = chat_history[-10:]
        
        system_prompt = f"{CHAT_SYSTEM_PROMPT}\n\n[OBECNA TREŚĆ NOTATKI]:\n{note_content}"
        
        if events:
            events_str = json.dumps(events, ensure_ascii=False, indent=2)
            system_prompt += f"\n\n[WYKRYTE WYDARZENIA W NOTATCE]:\n{events_str}"
            
        if raw_transcript:
            system_prompt += f"\n\n[SUROWA TRANSKRYPCJA Z NAGRANIA (DLA PEŁNEGO KONTEKSTU)]:\n{raw_transcript}"
            
        if media_url and media_type:
            if media_type.startswith("audio"):
                system_prompt += "\n\n[KONTEKST AUDIO]: Ta notatka została automatycznie wygenerowana na podstawie nagrania głosowego (audio). Powyższa treść i wydarzenia pochodzą bezpośrednio z tego nagrania."
            elif media_type.startswith("video"):
                system_prompt += "\n\n[KONTEKST WIDEO]: Ta notatka została automatycznie wygenerowana na podstawie nagrania wideo. Wraz z najnowszą wiadomością użytkownika otrzymałeś kilka klatek (zdjęć) wyciętych z tego filmu. Przeanalizuj je dokładnie, aby zrozumieć wizualny kontekst nagrania i móc na nim bazować w odpowiedziach. Powyższa treść i wydarzenia pochodzą bezpośrednio z tego nagrania."
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in trimmed_history:
            messages.append({"role": msg.role, "content": msg.content})

        # Klatki wideo tylko dla OpenAI (modele Groq są wyłącznie tekstowe)
        if media_url and media_type and media_type.startswith("video") and not settings.GROQ_API_KEY:
            frames_b64 = []
            if media_url.startswith("data:"):
                try:
                    header, b64_data = media_url.split(",", 1)
                    video_bytes = base64.b64decode(b64_data)
                    tmp_path = tempfile.mktemp(suffix=".webm")
                    with open(tmp_path, "wb") as f:
                        f.write(video_bytes)
                    frames_b64 = extract_video_frames(tmp_path)
                    os.remove(tmp_path)
                except Exception as e:
                    print(f"Błąd dekodowania wideo z base64: {e}")
            elif media_url.startswith("/uploads/"):
                local_path = "." + media_url
                if os.path.exists(local_path):
                    frames_b64 = extract_video_frames(local_path)
            elif media_url.startswith("http"):
                try:
                    tmp_path = tempfile.mktemp(suffix=".webm")
                    urllib.request.urlretrieve(media_url, tmp_path)
                    frames_b64 = extract_video_frames(tmp_path)
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)
                except Exception as e:
                    print(f"Błąd pobierania wideo do analizy: {e}")

            if frames_b64:
                last_user_idx = None
                for i in reversed(range(len(messages))):
                    if messages[i]["role"] == "user":
                        last_user_idx = i
                        break
                if last_user_idx is not None:
                    orig_text = messages[last_user_idx]["content"]
                    content_list = [{"type": "text", "text": orig_text}]
                    for b64 in frames_b64:
                        content_list.append({
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
                        })
                    messages[last_user_idx]["content"] = content_list

        response = client.chat.completions.create(
            model=model,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd OpenAI API w czacie notatki: {e}")
        return "Przepraszam, wystąpił problem z serwerami AI. Spróbuj ponownie później."

```


## src/services/email_service.py <a name="file-src-services-email_service-py"></a>

```py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.config import settings

def send_transcription_email(recipient_email: str, note_title: str, note_content: str, raw_transcript: str = None) -> bool:
    """
    Wysyła e-mail z pełną transkrypcją oraz przetworzoną treścią notatki do podanego odbiorcy.
    Zwraca True jeśli e-mail został wysłany przez SMTP, lub False jeśli brak danych logowania SMTP (symulacja/mailto fallback).
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"Brak konfiguracji SMTP w .env (SMTP_USER/SMTP_PASSWORD). E-mail do {recipient_email} obsłużony przez mailto / symulację.")
        return False

    try:
        title = note_title or "Notatka z nagrania"
        subject = f"[keepGoals] Pełna Transkrypcja (Słowo w słowo): {title}"

        transcript_to_send = raw_transcript if raw_transcript else note_content

        body = f"Cześć!\n\nPrzesyłamy pełną transkrypcję (słowo w słowo z nagrania) z aplikacji keepGoals.\n\n"
        body += f"========================================\n"
        body += f"TYTUŁ: {title}\n"
        body += f"========================================\n\n"
        body += f"--- PEŁNA TRANSKRYPCJA (SŁOWO W SŁOWO Z NAGRANIA) ---\n"
        body += f"{transcript_to_send}\n\n"

        if raw_transcript and note_content and note_content != raw_transcript:
            body += f"--- PODSUMOWANIE I ZADANIA AI ---\n"
            body += f"{note_content}\n\n"

        body += f"----------------------------------------\n"
        body += f"Wiadomość wygenerowana automatycznie przez keepGoals.\n"

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"E-mail z transkrypcją pomyślnie wysłany na adres: {recipient_email}")
        return True
    except Exception as e:
        print(f"Błąd podczas wysyłania e-maila: {e}")
        raise e

```


## src/services/storage_service.py <a name="file-src-services-storage_service-py"></a>

```py
import os
import base64
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
    1. Wysyła plik multimedialny z dysku serwera do Firebase Storage Bucket.
    2. W przypadku sukcesu otrzymuje trwały adres HTTPS (storage.googleapis.com).
    3. W przypadku braku bucketu chmurowego (dla plików <= 900 KB) konwertuje plik na Data URL Base64.
    4. Aktualizuje pole `media_url` notatki w chmurze Firestore.
    """
    if not os.path.exists(filepath):
        return

    cloud_url = None

    # 1. Próba wrzucenia do Firebase Storage Bucket
    bucket_candidates = []
    if settings.FIREBASE_STORAGE_BUCKET:
        bucket_candidates.append(settings.FIREBASE_STORAGE_BUCKET)
    
    # Domyślne nazwy bucketów Firebase dla projektu
    bucket_candidates.extend([
        "ai-buddy-app-471817.appspot.com",
        "ai-buddy-app-471817.firebasestorage.app"
    ])

    if firebase_admin._apps:
        for bucket_name in bucket_candidates:
            if not bucket_name:
                continue
            try:
                bucket = storage.bucket(bucket_name)
                blob_path = f"uploads/{filename}"
                blob = bucket.blob(blob_path)
                blob.upload_from_filename(filepath, content_type=content_type)
                blob.make_public()
                cloud_url = blob.public_url
                print(f"[Storage Sync BG] Pomyślnie wysłano plik {filename} do Firebase Storage ({bucket_name}): {cloud_url}")
                break
            except Exception as e:
                # Wypróbuj kolejną opcję z listy kandydatów
                continue

    # 2. Jeśli brak bucketu lub nie udało się połączyć -> użyj Data URL dla trwałości (dla plików <= 900 KB)
    if not cloud_url:
        try:
            file_size = os.path.getsize(filepath)
            if file_size <= 900 * 1024:
                with open(filepath, "rb") as f:
                    file_bytes = f.read()
                b64_str = base64.b64encode(file_bytes).decode("utf-8")
                cloud_url = f"data:{content_type};base64,{b64_str}"
                print(f"[Storage Sync BG] Przekonwertowano plik {filename} do Base64 Data URL.")
        except Exception as e:
            print(f"[Storage Sync BG] Błąd odczytu pliku do Data URL: {e}")

    # 3. Zaktualizuj pole media_url notatki w bazie danych (Firestore / Mock DB)
    if cloud_url and db:
        try:
            doc_ref = db.collection("users").document(uid).collection("notes").document(note_id)
            doc_ref.update({"media_url": cloud_url})
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

```


## tests/test_cors.py <a name="file-tests-test_cors-py"></a>

```py
from fastapi.testclient import TestClient
from unittest.mock import patch

# Mockujemy Firebase przed importem aplikacji
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app

client = TestClient(app)

def test_cors_headers_allowed():
    # Żądanie OPTIONS (Preflight) z dozwolonego źródła (Origin)
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-methods") is not None

def test_cors_headers_https_allowed():
    # Żądanie OPTIONS z HTTPS (Origin z HTTPS dla localhost/mobile)
    headers = {
        "Origin": "https://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization,Content-Type",
    }
    response = client.options("/api/v1/notes", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://localhost:5173"

def test_cors_headers_invalid_origin():
    # Żądanie OPTIONS z niedozwolonego źródła (Origin)
    headers = {
        "Origin": "http://unauthorized-domain.com",
        "Access-Control-Request-Method": "POST",
    }
    response = client.options("/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") is None

```


## tests/test_plans.py <a name="file-tests-test_plans-py"></a>

```py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.auth import verify_token
from src.database import get_db

# Mockujemy Firebase przed importem app
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app

client = TestClient(app)

@pytest.fixture
def mock_firestore():
    return MagicMock()

@pytest.fixture(autouse=True)
def override_dependencies(mock_firestore):
    app.dependency_overrides[verify_token] = lambda: {
        "uid": "test_uid_123",
        "email": "test@example.com"
    }
    app.dependency_overrides[get_db] = lambda: mock_firestore
    yield
    app.dependency_overrides.clear()

@patch("src.routers.plans.generate_morning_plan")
@patch("src.routers.plans.get_notes")
@patch("src.routers.plans.create_note")
def test_generate_morning_plan_success(mock_create_note, mock_get_notes, mock_gen_plan, mock_firestore):
    # Mockowanie pobierania notatek (zwracamy jedną notatkę strategiczną)
    mock_get_notes.return_value = [
        {
            "id": "goal_1",
            "title": "Cel 1",
            "content": "Improve coding skills",
            "note_type": "strategic",
            "user_id": "test_uid_123",
            "created_at": "2026-07-20T18:00:00"
        }
    ]
    
    # Mockowanie odpowiedzi z serwisu AI
    mock_gen_plan.return_value = "- [ ] Read a book\n- [ ] Write 100 lines of code"
    
    # Mockowanie tworzenia nowej notatki w bazie
    mock_create_note.return_value = {
        "id": "plan_id_123",
        "title": "Plan Poranny",
        "content": "- [ ] Read a book\n- [ ] Write 100 lines of code",
        "note_type": "daily_morning",
        "user_id": "test_uid_123",
        "created_at": "2026-07-20T19:00:00"
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/morning", headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "plan_id_123"
    assert json_data["note_type"] == "daily_morning"
    assert json_data["title"] == "Plan Poranny"
    
    mock_get_notes.assert_called_once_with(mock_firestore, "test_uid_123")
    mock_gen_plan.assert_called_once_with(["Improve coding skills"])
    mock_create_note.assert_called_once()

@patch("src.routers.plans.get_notes")
def test_generate_morning_plan_no_strategic_goals(mock_get_notes, mock_firestore):
    # Mockowanie pobierania notatek (zwracamy brak celów strategicznych)
    mock_get_notes.return_value = [
        {
            "id": "note_1",
            "title": "Note 1",
            "content": "Just a normal note",
            "note_type": "daily_evening",
            "user_id": "test_uid_123",
            "created_at": "2026-07-20T18:00:00"
        }
    ]
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/morning", headers=headers)
    
    assert response.status_code == 400
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "NO_STRATEGIC_GOALS"
    assert "trace_id" in json_data["detail"]

@patch("src.routers.plans.generate_evening_reflection")
@patch("src.routers.plans.get_notes")
@patch("src.routers.plans.create_note")
def test_generate_evening_reflection_success(mock_create_note, mock_get_notes, mock_gen_reflection, mock_firestore):
    mock_get_notes.return_value = [
        {
            "id": "goal_1",
            "title": "Cel 1",
            "content": "Improve coding skills",
            "note_type": "strategic",
            "user_id": "test_uid_123",
            "created_at": "2026-07-20T18:00:00"
        }
    ]
    
    mock_gen_reflection.return_value = "Świetna robota mentor: skup się bardziej na kodowaniu jutro."
    
    mock_create_note.return_value = {
        "id": "reflection_id_123",
        "title": "Refleksja Wieczorna",
        "content": "Świetna robota mentor: skup się bardziej na kodowaniu jutro.",
        "note_type": "daily_evening",
        "user_id": "test_uid_123",
        "created_at": "2026-07-20T21:00:00"
    }
    
    payload = {
        "completed_tasks": ["Read 10 pages", "Write tests"],
        "uncompleted_tasks": ["Go for a run"],
        "avoided_habits": ["No sugar"]
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/evening", json=payload, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "reflection_id_123"
    assert json_data["note_type"] == "daily_evening"
    assert json_data["title"] == "Refleksja Wieczorna"
    
    mock_get_notes.assert_called_once_with(mock_firestore, "test_uid_123")
    mock_gen_reflection.assert_called_once_with(payload, ["Improve coding skills"])
    mock_create_note.assert_called_once()

@patch("src.routers.plans.get_notes")
def test_generate_evening_reflection_no_strategic_goals(mock_get_notes, mock_firestore):
    mock_get_notes.return_value = []
    
    payload = {
        "completed_tasks": ["Read 10 pages"],
        "uncompleted_tasks": [],
        "avoided_habits": []
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/evening", json=payload, headers=headers)
    
    assert response.status_code == 400
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "NO_STRATEGIC_GOALS"
    assert "trace_id" in json_data["detail"]


```


## tests/test_auth.py <a name="file-tests-test_auth-py"></a>

```py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

# Mockujemy inicjalizację bazy danych Firebase aby testy nie zgłaszały błędów braku certyfikatu
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app
    from src.database import get_db
    from unittest.mock import MagicMock

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[get_db] = lambda: MagicMock()
    yield
    app.dependency_overrides.clear()

def test_access_notes_without_token():
    response = client.get("/api/v1/notes")
    assert response.status_code == 401
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "MISSING_TOKEN"
    assert "trace_id" in json_data["detail"]

@patch("src.auth.auth.verify_id_token")
def test_access_notes_with_valid_token(mock_verify_token):
    # Mocking successful token verification
    mock_verify_token.return_value = {
        "uid": "test_uid_123",
        "email": "test@example.com"
    }
    
    headers = {"Authorization": "Bearer mocked_valid_token"}
    response = client.get("/api/v1/notes", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert isinstance(json_data, list)

@patch("src.auth.auth.verify_id_token")
def test_access_notes_with_invalid_token(mock_verify_token):
    # Mocking failed token verification
    mock_verify_token.side_effect = Exception("Invalid token mock")
    
    headers = {"Authorization": "Bearer invalid_token_xyz"}
    response = client.get("/api/v1/notes", headers=headers)
    
    assert response.status_code == 401
    json_data = response.json()
    assert json_data["detail"]["error_code"] == "INVALID_TOKEN"
    assert "trace_id" in json_data["detail"]

```


## tests/__init__.py <a name="file-tests-__init__-py"></a>

```py
# Empty init

```


## tests/test_projects.py <a name="file-tests-test_projects-py"></a>

```py
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth import verify_token
from src.database import get_db, _mock_db_instance

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[verify_token] = lambda: {"uid": "test_projects_user_123", "email": "test@example.com"}
    app.dependency_overrides[get_db] = lambda: _mock_db_instance
    yield
    app.dependency_overrides.clear()

def test_create_and_get_projects():
    # 1. Create a new project
    project_payload = {
        "name": "Projekt Jesień 2026",
        "description": "Kolekcja jesienno-zimowa i rynki zagraniczne",
        "color": "#ec4899",
        "status": "active"
    }
    create_res = client.post("/api/v1/projects", json=project_payload)
    assert create_res.status_code == 201
    proj_data = create_res.json()
    assert proj_data["name"] == "Projekt Jesień 2026"
    assert proj_data["color"] == "#ec4899"
    assert "id" in proj_data
    
    project_id = proj_data["id"]

    # 2. Get list of projects
    list_res = client.get("/api/v1/projects")
    assert list_res.status_code == 200
    projects_list = list_res.json()
    assert any(p["id"] == project_id for p in projects_list)

    # 3. Create a note associated with this project
    note_payload = {
        "title": "Notatka projektowa",
        "content": "Ustalenia budżetowe dla kolekcji jesiennej",
        "note_type": "generic",
        "project_id": project_id
    }
    note_res = client.post("/api/v1/notes", json=note_payload)
    assert note_res.status_code == 201

    # 4. Fetch project details and verify notes list & notes_count
    detail_res = client.get(f"/api/v1/projects/{project_id}")
    assert detail_res.status_code == 200
    details = detail_res.json()
    assert details["id"] == project_id
    assert details["notes_count"] >= 1
    assert len(details["notes"]) >= 1
    assert details["notes"][0]["title"] == "Notatka projektowa"

    # 5. Delete project
    delete_res = client.delete(f"/api/v1/projects/{project_id}")
    assert delete_res.status_code == 204

    # 6. Verify project is deleted
    get_after_delete = client.get(f"/api/v1/projects/{project_id}")
    assert get_after_delete.status_code == 404

def test_update_note_project_assignment_and_unassignment():
    # 1. Create project
    proj_res = client.post("/api/v1/projects", json={"name": "Projekt Testowy A", "color": "#3b82f6"})
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # 2. Create note without project
    note_res = client.post("/api/v1/notes", json={"title": "Notatka Wolna", "content": "Bez projektu", "note_type": "generic"})
    assert note_res.status_code == 201
    note_id = note_res.json()["id"]

    # Verify project has 0 notes
    detail_res = client.get(f"/api/v1/projects/{proj_id}")
    assert detail_res.json()["notes_count"] == 0

    # 3. Attach note to project
    update_res = client.put(f"/api/v1/notes/{note_id}", json={"project_id": proj_id})
    assert update_res.status_code == 200
    assert update_res.json()["project_id"] == proj_id

    # Verify project detail has 1 note
    detail_res2 = client.get(f"/api/v1/projects/{proj_id}")
    assert detail_res2.json()["notes_count"] == 1
    assert detail_res2.json()["notes"][0]["id"] == note_id

    # 4. Unassign note from project (send null)
    unassign_res = client.put(f"/api/v1/notes/{note_id}", json={"project_id": None})
    assert unassign_res.status_code == 200
    assert unassign_res.json().get("project_id") is None

    # Verify project detail is now 0 notes again
    detail_res3 = client.get(f"/api/v1/projects/{proj_id}")
    assert detail_res3.json()["notes_count"] == 0
    assert len(detail_res3.json()["notes"]) == 0

def test_multi_project_assignment():
    p1 = client.post("/api/v1/projects", json={"name": "Projekt Alpha", "color": "#3b82f6"}).json()["id"]
    p2 = client.post("/api/v1/projects", json={"name": "Projekt Beta", "color": "#ec4899"}).json()["id"]

    # Create note assigned to both p1 and p2
    note_res = client.post("/api/v1/notes", json={
        "title": "Wspólna notatka",
        "content": "Strategia dla obu projektów",
        "note_type": "strategic",
        "project_ids": [p1, p2]
    })
    assert note_res.status_code == 201
    note_data = note_res.json()
    assert set(note_data["project_ids"]) == {p1, p2}

    # Verify both projects include this note
    d1 = client.get(f"/api/v1/projects/{p1}").json()
    d2 = client.get(f"/api/v1/projects/{p2}").json()
    assert any(n["id"] == note_data["id"] for n in d1["notes"])
    assert any(n["id"] == note_data["id"] for n in d2["notes"])

    # Update note to belong only to p2
    update_res = client.put(f"/api/v1/notes/{note_data['id']}", json={"project_ids": [p2]})
    assert update_res.status_code == 200
    assert update_res.json()["project_ids"] == [p2]

    # Verify p1 no longer has the note, but p2 still does
    d1_after = client.get(f"/api/v1/projects/{p1}").json()
    d2_after = client.get(f"/api/v1/projects/{p2}").json()
    assert not any(n["id"] == note_data["id"] for n in d1_after["notes"])
    assert any(n["id"] == note_data["id"] for n in d2_after["notes"])

```


## tests/test_teams.py <a name="file-tests-test_teams-py"></a>

```py
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth import verify_token
from src.database import get_db, _mock_db_instance

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[verify_token] = lambda: {"uid": "test_uid", "email": "test@example.com"}
    app.dependency_overrides[get_db] = lambda: _mock_db_instance
    yield
    app.dependency_overrides.clear()

def test_create_and_read_teams():
    # 1. Create a team
    response = client.post(
        "/api/v1/teams",
        json={"name": "Zespół Zadań", "description": "Opis zespołu testowego", "member_emails": ["partner@example.com"]}
    )
    assert response.status_code == 201
    team = response.json()
    assert team["name"] == "Zespół Zadań"
    assert "test_uid" in team["member_ids"]
    assert "partner@example.com" in team["member_ids"]
    team_id = team["id"]

    # 2. Get teams
    res_list = client.get("/api/v1/teams")
    assert res_list.status_code == 200
    teams = res_list.json()
    assert any(t["id"] == team_id for t in teams)

    # 3. Add member
    res_add = client.post(
        f"/api/v1/teams/{team_id}/members",
        json={"email_or_uid": "nowy_czlonek@example.com"}
    )
    assert res_add.status_code == 200
    updated_team = res_add.json()
    assert "nowy_czlonek@example.com" in updated_team["member_ids"]

    # 4. Remove member
    res_remove = client.delete(
        f"/api/v1/teams/{team_id}/members/nowy_czlonek@example.com"
    )
    assert res_remove.status_code == 200
    team_after_remove = res_remove.json()
    assert "nowy_czlonek@example.com" not in team_after_remove["member_ids"]

    # 5. Delete team
    res_del = client.delete(f"/api/v1/teams/{team_id}")
    assert res_del.status_code == 204

def test_note_multi_assignees():
    # Create note with assigned_user_ids
    response = client.post(
        "/api/v1/notes",
        json={
            "content": "Notatka z przypisanymi osobami",
            "note_type": "daily_morning",
            "assigned_user_ids": ["Anna Nowak", "Jan Kowalski"]
        }
    )
    assert response.status_code == 201
    note = response.json()
    assert note["assigned_user_ids"] == ["Anna Nowak", "Jan Kowalski"]
    assert note["assigned_to"] == "Anna Nowak"

    # Update assigned_user_ids
    note_id = note["id"]
    res_upd = client.put(
        f"/api/v1/notes/{note_id}",
        json={"assigned_user_ids": ["Marek Nowak", "Piotr Wiśniewski"]}
    )
    assert res_upd.status_code == 200
    updated_note = res_upd.json()
    assert updated_note["assigned_user_ids"] == ["Marek Nowak", "Piotr Wiśniewski"]
    assert updated_note["assigned_to"] == "Marek Nowak"

```


## tests/test_notes.py <a name="file-tests-test_notes-py"></a>

```py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime, timezone

# Mockujemy inicjalizację bazy danych Firebase aby testy nie zgłaszały błędów braku certyfikatu
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app

client = TestClient(app)

def create_mock_doc(doc_id, data_dict, exists=True):
    mock_doc = MagicMock()
    mock_doc.id = doc_id
    mock_doc.exists = exists
    mock_doc.to_dict.return_value = data_dict
    return mock_doc

from src.auth import verify_token
from src.database import get_db

@pytest.fixture
def mock_verify_token():
    return None

@pytest.fixture
def mock_firestore():
    mock_db = MagicMock()
    return mock_db

@pytest.fixture(autouse=True)
def override_dependencies(mock_firestore):
    app.dependency_overrides[verify_token] = lambda: {
        "uid": "test_uid_123",
        "email": "test@example.com"
    }
    app.dependency_overrides[get_db] = lambda: mock_firestore
    yield
    app.dependency_overrides.clear()

# ----------------- TESTY POST /api/v1/notes -----------------

def test_create_note_success(mock_verify_token, mock_firestore):
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new_note_id"
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    note_payload = {
        "title": "My Strategic Goal",
        "content": "Learn FastAPI and Firestore.",
        "note_type": "strategic"
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/notes", json=note_payload, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "new_note_id"
    assert json_data["title"] == "My Strategic Goal"
    assert json_data["content"] == "Learn FastAPI and Firestore."
    assert json_data["note_type"] == "strategic"
    assert json_data["user_id"] == "test_uid_123"
    assert "created_at" in json_data

# ----------------- TESTY GET /api/v1/notes -----------------

def test_get_notes_success(mock_verify_token, mock_firestore):
    mock_doc1 = create_mock_doc("note_1", {
        "title": "Title 1",
        "content": "Content 1",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": "2026-01-02T10:00:00Z"
    })
    mock_doc2 = create_mock_doc("note_2", {
        "title": "Title 2",
        "content": "Content 2",
        "note_type": "daily_morning",
        "user_id": "test_uid_123",
        "created_at": "2026-01-01T10:00:00Z"
    })
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .stream.return_value = [mock_doc1, mock_doc2]

    headers = {"Authorization": "Bearer valid_token"}
    response = client.get("/api/v1/notes", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) == 2
    assert json_data[0]["id"] == "note_1"
    assert json_data[1]["id"] == "note_2"

# ----------------- TESTY GET /api/v1/notes/{note_id} -----------------

def test_get_note_success(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("existing_note_id", {
        "title": "Existing Title",
        "content": "Existing Content",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": datetime.now(timezone.utc).isoformat()
    }, exists=True)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.get("/api/v1/notes/existing_note_id", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["id"] == "existing_note_id"
    assert json_data["title"] == "Existing Title"

def test_get_note_not_found(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("non_existing_id", {}, exists=False)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.get("/api/v1/notes/non_existing_id", headers=headers)
    
    assert response.status_code == 404
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "NOTE_NOT_FOUND"
    assert "trace_id" in json_data["detail"]

# ----------------- TESTY PUT /api/v1/notes/{note_id} -----------------

def test_update_note_success(mock_verify_token, mock_firestore):
    mock_doc_before = create_mock_doc("note_id_to_update", {
        "title": "Old Title",
        "content": "Old Content",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": datetime.now(timezone.utc).isoformat()
    }, exists=True)
    
    mock_doc_after = create_mock_doc("note_id_to_update", {
        "title": "New Title",
        "content": "New Content",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": datetime.now(timezone.utc).isoformat()
    }, exists=True)
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.get.side_effect = [mock_doc_before, mock_doc_after]
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    update_payload = {
        "title": "New Title",
        "content": "New Content"
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.put("/api/v1/notes/note_id_to_update", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["title"] == "New Title"
    assert json_data["content"] == "New Content"
    mock_doc_ref.update.assert_called_once_with({"title": "New Title", "content": "New Content"})

def test_update_note_not_found(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("non_existing_id", {}, exists=False)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.put("/api/v1/notes/non_existing_id", json={"content": "new"}, headers=headers)
    
    assert response.status_code == 404
    json_data = response.json()
    assert json_data["detail"]["error_code"] == "NOTE_NOT_FOUND"

# ----------------- TESTY DELETE /api/v1/notes/{note_id} -----------------

def test_delete_note_success(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("note_id_to_delete", {
        "title": "Title",
        "content": "Content",
        "note_type": "strategic"
    }, exists=True)
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.get.return_value = mock_doc
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    headers = {"Authorization": "Bearer valid_token"}
    response = client.delete("/api/v1/notes/note_id_to_delete", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert "pomyślnie usunięta" in json_data["message"]
    mock_doc_ref.update.assert_called_once()

def test_delete_note_not_found(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("non_existing_id", {}, exists=False)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.delete("/api/v1/notes/non_existing_id", headers=headers)
    
    assert response.status_code == 404
    json_data = response.json()
    assert json_data["detail"]["error_code"] == "NOTE_NOT_FOUND"

# ----------------- TESTY POST /api/v1/notes/audio i /video -----------------

@patch("src.routers.notes.process_media_and_cloud_sync_bg")
@patch("src.routers.notes.save_media_file_local")
def test_upload_audio_note_success(mock_save_media, mock_bg_proc, mock_verify_token, mock_firestore):
    mock_save_media.return_value = ("uploads/test_audio.webm", "/uploads/test_audio.webm")
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new_audio_note_id"
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    headers = {"Authorization": "Bearer valid_token"}
    files = {"file": ("audio.webm", b"fake-audio-bytes", "audio/webm")}
    response = client.post("/api/v1/notes/audio", files=files, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "new_audio_note_id"
    assert json_data["title"] == "Nagranie Głosowe"
    assert json_data["media_url"] == "/uploads/test_audio.webm"
    assert json_data["media_type"] == "audio/webm"
    mock_save_media.assert_called_once()
    mock_bg_proc.assert_called_once()

@patch("src.routers.notes.process_media_and_cloud_sync_bg")
@patch("src.routers.notes.save_media_file_local")
def test_upload_video_note_success(mock_save_media, mock_bg_proc, mock_verify_token, mock_firestore):
    mock_save_media.return_value = ("uploads/test_video.webm", "/uploads/test_video.webm")
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new_video_note_id"
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    headers = {"Authorization": "Bearer valid_token"}
    files = {"file": ("video.webm", b"fake-video-bytes", "video/webm")}
    response = client.post("/api/v1/notes/video", files=files, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "new_video_note_id"
    assert json_data["title"] == "Nagranie Wideo"
    assert json_data["media_url"] == "/uploads/test_video.webm"
    assert json_data["media_type"] == "video/webm"
    mock_save_media.assert_called_once()
    mock_bg_proc.assert_called_once()

# ----------------- TEST POST /api/v1/notes/{note_id}/send-email -----------------

@patch("src.routers.notes.send_transcription_email")
def test_send_note_email_success(mock_send_email, mock_verify_token, mock_firestore):
    mock_send_email.return_value = True
    
    doc_data = {
        "title": "Audio Note",
        "content": "Processed content",
        "raw_transcript": "Raw speech text",
        "note_type": "daily_morning",
        "created_at": datetime.now(timezone.utc),
        "user_id": "test_uid_123"
    }
    mock_doc = create_mock_doc("note_email_123", doc_data, exists=True)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    payload = {"email": "recipient@example.com"}
    response = client.post("/api/v1/notes/note_email_123/send-email", json=payload, headers=headers)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["sent_via_smtp"] is True
    mock_send_email.assert_called_once_with(
        recipient_email="recipient@example.com",
        note_title="Audio Note",
        note_content="Processed content",
        raw_transcript="Raw speech text"
    )

# ----------------- TEST POST /api/v1/notes/{note_id}/reanalyze -----------------

def test_reanalyze_note_success(mock_verify_token, mock_firestore):
    doc_data = {
        "title": "Failed Note",
        "content": "Error during processing",
        "raw_transcript": "Sample transcript text for reanalysis",
        "note_type": "daily_morning",
        "processing_status": "error_ai",
        "created_at": datetime.now(timezone.utc),
        "user_id": "test_uid_123"
    }
    mock_doc = create_mock_doc("note_reanalyze_123", doc_data, exists=True)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/notes/note_reanalyze_123/reanalyze", headers=headers)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["processing_status"] == "pending"

def test_reanalyze_note_not_found(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("non_existent_note", {}, exists=False)
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/notes/non_existent_note/reanalyze", headers=headers)

    assert response.status_code == 404



```


## frontend/src/App.tsx <a name="file-frontend-src-App-tsx"></a>

```tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProfilesProvider } from "./contexts/UserProfilesContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Goals } from "./pages/Goals";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Trash } from "./pages/Trash";
import { Settings } from "./pages/Settings";
import { Teams } from "./pages/Teams";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";

function App() {
  return (
    <AuthProvider>
      <UserProfilesProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/teams" element={<Teams />} />
            </Route>
          </Routes>
        </Router>
      </UserProfilesProvider>
    </AuthProvider>
  );
}

export default App;

```


## frontend/src/main.tsx <a name="file-frontend-src-main-tsx"></a>

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```


## frontend/src/contexts/UserProfilesContext.tsx <a name="file-frontend-src-contexts-UserProfilesContext-tsx"></a>

```tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";
import { getAuthHeaders } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "";

interface UserProfile {
  email: string;
  display_name: string;
}

interface UserProfilesContextType {
  profiles: Record<string, UserProfile>;
  fetchProfiles: (uids: string[]) => Promise<void>;
  getProfileName: (uidOrEmail: string) => string;
}

const UserProfilesContext = createContext<UserProfilesContextType>({
  profiles: {},
  fetchProfiles: async () => {},
  getProfileName: (val) => val,
});

export const useUserProfiles = () => useContext(UserProfilesContext);

export const UserProfilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const fetchedUidsRef = useRef<Set<string>>(new Set());

  const fetchProfiles = useCallback(async (uids: string[]) => {
    // Only fetch UIDs we haven't attempted to fetch yet, and that look like UIDs (no @)
    const neededUids = [...new Set(uids)].filter(uid => !fetchedUidsRef.current.has(uid) && !uid.includes('@'));
    if (neededUids.length === 0) return;

    neededUids.forEach(uid => fetchedUidsRef.current.add(uid));

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/v1/users/profiles`, {
        method: "POST",
        headers,
        body: JSON.stringify(neededUids),
      });

      if (response.ok) {
        const newProfiles = await response.json();
        setProfiles(prev => ({ ...prev, ...newProfiles }));
      }
    } catch (e) {
      console.error("Error fetching user profiles:", e);
    }
  }, [profiles]);

  const getProfileName = useCallback((uidOrEmail: string) => {
    if (!uidOrEmail) return "";
    if (uidOrEmail.includes('@')) {
      return uidOrEmail.split('@')[0];
    }
    const profile = profiles[uidOrEmail];
    return profile ? profile.display_name.split('@')[0] : uidOrEmail;
  }, [profiles]);

  return (
    <UserProfilesContext.Provider value={{ profiles, fetchProfiles, getProfileName }}>
      {children}
    </UserProfilesContext.Provider>
  );
};

```


## frontend/src/context/AuthContext.tsx <a name="file-frontend-src-context-AuthContext-tsx"></a>

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, isDemoMode, setDemoCurrentUser } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isDemoMode) {
      const mockUserSession = localStorage.getItem("mock_user_session");
      if (mockUserSession) {
        try {
          const parsed = JSON.parse(mockUserSession);
          parsed.getIdToken = async () => "mock-jwt-token-123";
          setUser(parsed);
          setDemoCurrentUser(parsed);
        } catch (e) {
          localStorage.removeItem("mock_user_session");
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDemoLogin = (providerName: string, emailStr?: string, nameStr?: string) => {
    const mockUser = {
      uid: `mock-user-${Date.now()}`,
      email: emailStr || `demo-${providerName.toLowerCase()}@keepgoals.com`,
      displayName: nameStr || `Użytkownik (${providerName})`,
      getIdToken: async () => "mock-jwt-token-123",
    } as unknown as User;
    localStorage.setItem("mock_user_session", JSON.stringify(mockUser));
    setUser(mockUser);
    setDemoCurrentUser(mockUser);
  };

  const loginWithGoogle = async () => {
    if (isDemoMode) return handleDemoLogin("Google");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithFacebook = async () => {
    if (isDemoMode) return handleDemoLogin("Facebook");
    const provider = new FacebookAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithTwitter = async () => {
    if (isDemoMode) return handleDemoLogin("Twitter");
    const provider = new TwitterAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isDemoMode) return handleDemoLogin("Email", email);
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (isDemoMode) return handleDemoLogin("Email", email, name);
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && userCred.user) {
      await updateProfile(userCred.user, { displayName: name });
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      localStorage.removeItem("mock_user_session");
      setUser(null);
      setDemoCurrentUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithFacebook, loginWithTwitter, loginWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

```


## frontend/src/components/ProjectTimelineDrawer.tsx <a name="file-frontend-src-components-ProjectTimelineDrawer-tsx"></a>

```tsx
import React, { useEffect, useMemo, useState } from "react";
import { X, CalendarDays, Clock, ExternalLink, FolderKanban, FileText } from "lucide-react";
import type { Project, Note, NoteEvent } from "../services/api";

interface ProjectTimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  notes: Note[];
  onSelectNote?: (noteId: string) => void;
}

export interface TimelineItem {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string;
  description?: string;
  noteId: string;
  noteTitle: string;
  type: "event" | "milestone";
}

export const ProjectTimelineDrawer: React.FC<ProjectTimelineDrawerProps> = ({
  isOpen,
  onClose,
  project,
  notes,
  onSelectNote,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setIsMounted(true);
      timer = setTimeout(() => {
        setIsAnimating(true);
      }, 20);
    } else {
      setIsAnimating(false);
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Aggregate and sort timeline items chronologically
  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    notes.forEach((note) => {
      // 1. Structured AI Extracted Events
      if (note.events && note.events.length > 0) {
        note.events.forEach((evt: NoteEvent, idx: number) => {
          items.push({
            id: `${note.id}-evt-${idx}`,
            title: evt.title,
            dateStart: evt.date_start,
            dateEnd: evt.date_end,
            description: evt.description,
            noteId: note.id,
            noteTitle: note.title || "Notatka projektowa",
            type: "event",
          });
        });
      } else {
        // 2. Note Milestones (Fallback for notes with title or content)
        items.push({
          id: `${note.id}-created`,
          title: note.title || "Wpis w projekcie",
          dateStart: note.created_at,
          description: note.content.slice(0, 120) + (note.content.length > 120 ? "..." : ""),
          noteId: note.id,
          noteTitle: note.title || "Notatka projektowa",
          type: "milestone",
        });
      }
    });

    // Sort chronologically ascending
    return items.sort((a, b) => {
      const timeA = new Date(a.dateStart).getTime() || 0;
      const timeB = new Date(b.dateStart).getTime() || 0;
      return timeA - timeB;
    });
  }, [notes]);

  const formatTimeRange = (startStr: string, endStr?: string) => {
    try {
      const start = new Date(startStr);
      if (isNaN(start.getTime())) return startStr;

      const datePart = start.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const startTime = start.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (endStr) {
        const end = new Date(endStr);
        if (!isNaN(end.getTime())) {
          const endTime = end.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${datePart}, ${startTime} - ${endTime}`;
        }
      }

      return `${datePart}, ${startTime}`;
    } catch {
      return startStr;
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with smooth opacity transition */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#202124] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-out ${
            isAnimating ? "translate-x-0" : "translate-x-full"
          }`}
        >
          
          {/* Top Header */}
          <div 
            style={{ borderBottomColor: project.color || "#143109" }}
            className="p-5 sm:p-6 border-b-2 flex items-center justify-between bg-[#EFEFEF]/50 dark:bg-slate-900/50"
          >
            <div>
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5" style={{ color: project.color || "#143109" }} />
                <h2 className="text-lg font-bold text-[#143109] dark:text-white">Oś Czasu Projektu</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {project.name} • {timelineItems.length} {timelineItems.length === 1 ? "wydarzenie" : "wydarzeń"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zamknij (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timeline Content List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative">
            {timelineItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-3">
                <CalendarDays className="w-12 h-12 mx-auto opacity-70 text-[#143109] dark:text-[#AAAE7F]" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Brak zaplanowanych wydarzeń
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Nagrania głosowe i notatki z terminami wygenerują chronologiczną oś czasu dla tego projektu.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6">
                {/* Vertical Continuous Line */}
                <div 
                  style={{ backgroundColor: `${project.color || "#143109"}45` }}
                  className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-0.5"
                />

                {timelineItems.map((item) => {
                  const isEvent = item.type === "event";

                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        style={{
                          backgroundColor: project.color || "#143109",
                          boxShadow: `0 0 0 4px ${project.color || "#143109"}25`,
                        }}
                        className="absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#202124] flex items-center justify-center transition-transform group-hover:scale-125"
                      />

                      {/* Event Card Container */}
                      <div className="bg-[#EFEFEF]/60 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 hover:border-[#AAAE7F] transition-all shadow-sm space-y-2.5">
                        
                        {/* Header Badge & Date */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {isEvent ? (
                              <Clock className="w-3.5 h-3.5 text-[#143109] dark:text-[#AAAE7F]" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="text-[11px]">
                              {formatTimeRange(item.dateStart, item.dateEnd)}
                            </span>
                          </div>

                          {isEvent && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D0D6B3] text-[#143109] border border-[#AAAE7F]/40">
                              Spotkanie
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-[#143109] dark:text-white leading-snug">
                          {item.title}
                        </h4>

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {item.description}
                          </p>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectNote?.(item.noteId);
                              onClose();
                            }}
                            className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[160px]">{item.noteTitle}</span>
                          </button>

                          {isEvent && item.dateStart && (
                            <a
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${item.dateStart.replace(/[-:]/g, "")}/${(item.dateEnd || item.dateStart).replace(/[-:]/g, "")}${item.description ? `&details=${encodeURIComponent(item.description)}` : ""}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#143109] hover:text-[#143109]/80 dark:text-[#AAAE7F] dark:hover:text-[#AAAE7F]/80 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-[#AAAE7F]/50 hover:bg-[#D0D6B3]/30 transition-colors"
                              title="Dodaj do Kalendarza Google"
                            >
                              <span>Google Calendar</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-xs text-slate-400 dark:text-slate-500">
            Automatyczna synteza chronologiczna na podstawie ustaleń w projekcie
          </div>
        </div>
      </div>
    </div>
  );
};

```


## frontend/src/components/ProtectedRoute.tsx <a name="file-frontend-src-components-ProtectedRoute-tsx"></a>

```tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-bg-light dark:bg-slate-900 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          {/* Prosty spinner CSS */}
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-300"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
            Ładowanie profilu...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

```


## frontend/src/components/TimezoneModal.tsx <a name="file-frontend-src-components-TimezoneModal-tsx"></a>

```tsx
import React from "react";
import { Globe, Check, X, Clock } from "lucide-react";

interface TimezoneModalProps {
  isOpen: boolean;
  detectedTimezone: string;
  currentTimezone: string;
  onConfirm: (newTimezone: string) => void;
  onKeepCurrent: () => void;
}

export const TimezoneModal: React.FC<TimezoneModalProps> = ({
  isOpen,
  detectedTimezone,
  currentTimezone,
  onConfirm,
  onKeepCurrent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#EFEFEF] dark:bg-slate-900 border border-[#AAAE7F]/40 rounded-2xl shadow-xl overflow-hidden p-6 text-[#143109] dark:text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onKeepCurrent}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#D0D6B3]/40 text-[#143109] dark:text-slate-400 transition-colors"
          title="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#D0D6B3]/60 dark:bg-slate-800 flex items-center justify-center text-[#143109] dark:text-[#AAAE7F] border border-[#AAAE7F]/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#143109] dark:text-slate-100 leading-tight">
              Wykryto nową strefę czasową
            </h3>
            <p className="text-xs text-[#143109]/70 dark:text-slate-400 font-medium">
              Wykryto zmianę Twojej lokalizacji czasowej
            </p>
          </div>
        </div>

        <div className="my-5 p-4 rounded-xl bg-[#F7F7F7] dark:bg-slate-800/80 border border-[#AAAE7F]/30 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#143109]/70 dark:text-slate-400 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-[#AAAE7F]" />
              Wykryta strefa (urządzenie):
            </span>
            <span className="font-bold text-[#143109] dark:text-slate-200 bg-[#D0D6B3]/40 dark:bg-slate-700 px-2.5 py-0.5 rounded-md border border-[#AAAE7F]/40">
              {detectedTimezone}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#143109]/70 dark:text-slate-400 font-medium">
              Obecnie zapisana strefa:
            </span>
            <span className="font-medium text-[#143109]/80 dark:text-slate-400">
              {currentTimezone}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#143109]/80 dark:text-slate-300 mb-6 leading-relaxed">
          Czy chcesz zaktualizować strefę czasową aplikacji? Pozwoli to AI poprawnie transkrybować godziny oraz wyświetlać terminy wydarzeń w Twoim aktualnym czasie.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => onConfirm(detectedTimezone)}
            className="flex-1 inline-flex items-center justify-center space-x-2 bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95 text-sm"
          >
            <Check className="w-4 h-4" />
            <span>Zaktualizuj ({detectedTimezone})</span>
          </button>
          
          <button
            type="button"
            onClick={onKeepCurrent}
            className="inline-flex items-center justify-center bg-transparent border border-[#AAAE7F] text-[#143109] dark:text-slate-300 font-semibold px-4 py-2.5 rounded-xl hover:bg-[#D0D6B3]/30 transition-all cursor-pointer text-sm"
          >
            <span>Zachowaj obecną</span>
          </button>
        </div>
      </div>
    </div>
  );
};

```


## frontend/src/components/AvatarStack.tsx <a name="file-frontend-src-components-AvatarStack-tsx"></a>

```tsx
import React from "react";
import { User } from "lucide-react";
import { useUserProfiles } from "../contexts/UserProfilesContext";

interface AvatarStackProps {
  assignees?: string[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  onManageClick?: () => void;
}

const BG_COLORS = [
  "bg-[#143109] text-[#F7F7F7] border-[#F7F7F7]",
  "bg-[#AAAE7F] text-[#143109] border-[#F7F7F7]",
  "bg-[#D0D6B3] text-[#143109] border-[#F7F7F7]",
  "bg-slate-700 text-slate-100 border-[#F7F7F7]",
  "bg-amber-800 text-amber-100 border-[#F7F7F7]",
];

export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return "U";
  const clean = nameOrEmail.split("@")[0].trim();
  const parts = clean.split(/[._\s-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  assignees = [],
  maxDisplay = 3,
  size = "sm",
  className = "",
  onManageClick,
}) => {
  const { getProfileName } = useUserProfiles();

  if (!assignees || assignees.length === 0) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={onManageClick}
          className="inline-flex items-center space-x-1 text-xs text-[#143109]/70 dark:text-slate-400 hover:text-[#143109] dark:hover:text-slate-200 bg-[#EFEFEF] dark:bg-slate-800 border border-[#AAAE7F]/40 px-2 py-1 rounded-full transition-colors cursor-pointer"
          title="Przypisz użytkowników"
        >
          <User className="w-3.5 h-3.5" />
          <span>Przypisz</span>
        </button>
      </div>
    );
  }

  const visibleAssignees = assignees.slice(0, maxDisplay);
  const extraCount = assignees.length - maxDisplay;

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  }[size];

  return (
    <div 
      className={`inline-flex items-center -space-x-2 overflow-hidden py-0.5 relative group cursor-pointer ${className}`}
      onClick={(e) => {
        if (onManageClick) {
          e.stopPropagation();
          e.preventDefault();
          onManageClick();
        }
      }}
      title={`Przypisani (${assignees.length})`}
    >
      {visibleAssignees.map((assignee, idx) => {
        const name = getProfileName(assignee) || assignee;
        const initials = getInitials(name);
        const colorClass = BG_COLORS[idx % BG_COLORS.length];
        
        return (
          <div
            key={`${assignee}-${idx}`}
            className={`inline-flex items-center justify-center rounded-full font-bold border-2 ${sizeClasses} ${colorClass} shadow-xs ring-1 ring-black/5 transition-transform hover:scale-110 hover:z-20`}
            title={name}
          >
            {initials}
          </div>
        );
      })}

      {extraCount > 0 && (
        <div className={`inline-flex items-center justify-center rounded-full font-bold border-2 bg-[#EFEFEF] dark:bg-slate-800 text-[#143109] dark:text-[#AAAE7F] border-[#F7F7F7] ${sizeClasses} shadow-xs ring-1 ring-black/5 z-10`}>
          +{extraCount}
        </div>
      )}
    </div>
  );
};

```


## frontend/src/components/EveningReflectionForm.tsx <a name="file-frontend-src-components-EveningReflectionForm-tsx"></a>

```tsx
import React, { useState } from "react";
import { generateEveningReflection } from "../services/api";

interface EveningReflectionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const EveningReflectionForm: React.FC<EveningReflectionFormProps> = ({ onSuccess, onCancel }) => {
  const [completedText, setCompletedText] = useState("");
  const [uncompletedText, setUncompletedText] = useState("");
  const [avoidedText, setAvoidedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseList = (text: string): string[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const isValid = completedText.trim() !== "" || uncompletedText.trim() !== "" || avoidedText.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    const payload = {
      completed_tasks: parseList(completedText),
      uncompleted_tasks: parseList(uncompletedText),
      avoided_habits: parseList(avoidedText),
    };

    try {
      await generateEveningReflection(payload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.message === "NO_STRATEGIC_GOALS") {
        setError("Brak celów strategicznych! Nie można przeanalizować bilansu dnia.");
      } else {
        setError("Nie udało się zapisać wieczornej refleksji. Spróbuj ponownie.");
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Zrealizowane zadania (jedno w linii)
        </label>
        <textarea
          value={completedText}
          onChange={(e) => setCompletedText(e.target.value)}
          placeholder="Np. Poranny trening&#10;Napisałem moduł API"
          rows={3}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Niezrealizowane zadania (jedno w linii)
        </label>
        <textarea
          value={uncompletedText}
          onChange={(e) => setUncompletedText(e.target.value)}
          placeholder="Np. Nauka hiszpańskiego"
          rows={3}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Pozytywne zaniechania (jedno w linii)
        </label>
        <textarea
          value={avoidedText}
          onChange={(e) => setAvoidedText(e.target.value)}
          placeholder="Np. Bez słodyczy&#10;Brak social media przed snem"
          rows={3}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none text-sm"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      )}

      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-sm ${
            isValid && !loading
              ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Analizowanie..." : "Zapisz bilans"}
        </button>
      </div>
    </form>
  );
};

```


## frontend/src/components/NoteAIChatModal.tsx <a name="file-frontend-src-components-NoteAIChatModal-tsx"></a>

```tsx
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { chatAboutNote, updateNote } from "../services/api";
import type { ChatMessage, Note } from "../services/api";

interface NoteAIChatModalProps {
  note: Note;
  onClose: () => void;
  onNoteUpdated: (updatedNote: Note) => void;
}

export const NoteAIChatModal: React.FC<NoteAIChatModalProps> = ({ note, onClose, onNoteUpdated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const { response } = await chatAboutNote(note.id, newMessages);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (err: any) {
      console.error(err);
      setError("Wystąpił błąd komunikacji z AI. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = async (newContent: string) => {
    try {
      setIsLoading(true);
      const updated = await updateNote(note.id, { content: newContent });
      onNoteUpdated(updated);
      onClose(); // Zamknij czat po zastosowaniu zmian
    } catch (err) {
      console.error(err);
      setError("Nie udało się zaktualizować notatki.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper do renderowania wiadomości. Szuka <REWRITTEN_NOTE>
  const renderMessageContent = (content: string, role: string) => {
    if (role === "user") {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // Proste parsowanie tagów <REWRITTEN_NOTE>
    const match = content.match(/<REWRITTEN_NOTE>([\s\S]*?)<\/REWRITTEN_NOTE>/);
    
    if (match) {
      const before = content.substring(0, match.index);
      const newNoteContent = match[1].trim();
      const after = content.substring(match.index! + match[0].length);

      return (
        <div className="flex flex-col space-y-3 w-full">
          {before && <p className="whitespace-pre-wrap">{before}</p>}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group w-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> PROPOZYCJA ZMIAN
            </p>
            <div className="text-sm text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap mb-3 border-l-2 border-slate-200 dark:border-slate-600 pl-2">
              {newNoteContent}
            </div>
            <button
              onClick={() => handleApplyChanges(newNoteContent)}
              disabled={isLoading}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Zastosuj tę wersję do notatki
            </button>
          </div>
          {after && <p className="whitespace-pre-wrap">{after}</p>}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-[#202124] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col h-[70vh] sm:h-[600px] relative overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Supermoc AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Czat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-4 space-y-4">
              <div className="w-16 h-16 bg-[#D0D6B3] dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                <Bot className="w-8 h-8 text-[#143109] dark:text-[#AAAE7F]" />
              </div>
              <p className="text-sm font-medium text-[#143109]">
                Jestem asystentem redakcyjnym dla tej notatki. <br/>
                Powiedz mi, co chcesz w niej zmienić.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button onClick={() => setInputValue("Przepisz tę notatkę bardziej zwięźle.")} className="px-3 py-1.5 text-xs bg-[#EFEFEF] dark:bg-slate-800 border border-[#AAAE7F]/40 rounded-full hover:bg-[#D0D6B3]/40 text-[#143109] transition-colors">
                  Zrób to zwięźlej
                </button>
                <button onClick={() => setInputValue("Sformatuj to jako listę TODO z checkboxami.")} className="px-3 py-1.5 text-xs bg-[#EFEFEF] dark:bg-slate-800 border border-[#AAAE7F]/40 rounded-full hover:bg-[#D0D6B3]/40 text-[#143109] transition-colors">
                  Zrób listę zadań
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 mt-1 ${
                  msg.role === 'user' 
                    ? 'bg-[#D0D6B3] text-[#143109]' 
                    : 'bg-[#143109] text-[#F7F7F7]'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm break-words ${
                  msg.role === 'user'
                    ? 'bg-[#143109] text-[#F7F7F7] rounded-tr-sm font-medium'
                    : 'bg-[#EFEFEF] dark:bg-[#202124] text-[#143109] dark:text-slate-200 border border-[#AAAE7F]/40 rounded-tl-sm shadow-sm'
                }`}>
                  {renderMessageContent(msg.content, msg.role)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex max-w-[90%] flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D0D6B3] text-[#143109] flex items-center justify-center mx-2 mt-1">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="px-4 py-4 bg-[#EFEFEF] dark:bg-[#202124] border border-[#AAAE7F]/40 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#143109] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#143109] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#143109] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center p-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg mx-4">
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[#EFEFEF] dark:bg-slate-900/50 border-t border-[#AAAE7F]/30">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Jak mam pomóc z tą notatką?"
              className="w-full pl-4 pr-12 py-3 bg-[#F7F7F7] dark:bg-slate-800 border border-[#AAAE7F]/40 rounded-full focus:ring-2 focus:ring-[#143109]/40 focus:border-[#143109] text-[#143109] dark:text-slate-100 text-sm transition-all outline-none shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-2 bg-[#143109] hover:bg-[#143109]/90 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-[#F7F7F7] rounded-full transition-colors disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

```


## frontend/src/components/MediaRecorderBase.tsx <a name="file-frontend-src-components-MediaRecorderBase-tsx"></a>

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { uploadAudio, uploadVideo } from '../services/api';

type MediaType = 'audio' | 'video';
type RecordState = 'inactive' | 'recording' | 'paused' | 'uploading';

interface MediaRecorderBaseProps {
  onUploadSuccess?: () => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const MediaRecorderBase: React.FC<MediaRecorderBaseProps> = ({
  onUploadSuccess,
  isOpenExternal,
  onCloseExternal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<MediaType>('audio');
  const [recordState, setRecordState] = useState<RecordState>('inactive');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetMode = file.type.startsWith('video/') ? 'video' : 'audio';
    await performUpload(file, targetMode);
  };

  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) {
        setMode('audio');
      }
    }
  }, [isOpenExternal]);

  useEffect(() => {
    return () => {
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async (targetMode: MediaType) => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Brak dostępu do API mediów. Upewnij się, że używasz połączenia HTTPS lub localhost.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: targetMode === 'video' ? { facingMode: 'environment' } : false,
      });
      streamRef.current = stream;

      if (targetMode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      let mimeType = "";
      if (targetMode === "video") {
        if (MediaRecorder.isTypeSupported("video/webm")) mimeType = "video/webm";
        else if (MediaRecorder.isTypeSupported("video/mp4")) mimeType = "video/mp4";
      } else {
        if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      }
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = mediaRecorderRef.current?.mimeType || (targetMode === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, {
          type: blobType,
        });
        await performUpload(blob, targetMode);
      };

      chunksRef.current = [];
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      setRecordState('recording');
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.name === "NotSupportedError" ? "Format nagrywania nie jest wspierany na Twoim urządzeniu." : "Brak dostępu do mikrofonu/kamery.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
    setRecordState('inactive');
    setIsOpen(false);
    chunksRef.current = [];
    setRecordingTime(0);
    setIsVideoExpanded(false);
    if (onCloseExternal) onCloseExternal();
  };

  const performUpload = async (blob: Blob, uploadMode: MediaType) => {
    setRecordState('uploading');
    try {
      if (uploadMode === 'audio') {
        await uploadAudio(blob);
      } else {
        await uploadVideo(blob);
      }
      setRecordState('inactive');
      setIsOpen(false);
      setRecordingTime(0);
      chunksRef.current = [];
      setIsVideoExpanded(false);
      if (onCloseExternal) onCloseExternal();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Wystąpił błąd podczas wysyłania.');
      setRecordState('inactive');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isOpenExternal !== undefined && !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 flex-col items-end z-50 flex md:hidden">
      {isOpen && (
        <div className={`bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 p-4 mb-4 flex flex-col animate-in slide-in-from-bottom-5 transition-all duration-300 ${isVideoExpanded ? 'fixed inset-0 w-full h-full z-[100] m-0 rounded-none' : 'w-72 rounded-3xl'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {mode === 'audio' ? 'Nagranie Głosowe' : 'Notatka Wideo'}
            </span>
            <button onClick={cancelRecording} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl mb-3">
              {error}
            </div>
          )}

          <div className={`bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center mb-4 relative overflow-hidden transition-all duration-300 ${isVideoExpanded ? 'flex-1 bg-black' : 'min-h-32'}`}>
            {mode === 'video' && (
              <>
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full ${isVideoExpanded ? 'object-contain' : 'object-cover'}`}
                  muted
                  playsInline
                />
                <button 
                  onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                  className={`absolute ${isVideoExpanded ? 'top-6 right-6' : 'top-2 right-2'} z-20 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors`}
                >
                  {isVideoExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  )}
                </button>
              </>
            )}
            
            {mode === 'audio' && recordState === 'recording' && (
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-6 bg-[#143109] rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                <div className="w-1.5 h-10 bg-[#143109] rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                <div className="w-1.5 h-8 bg-[#143109] rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                <div className="w-1.5 h-12 bg-[#143109] rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                <div className="w-1.5 h-6 bg-[#143109] rounded-full animate-[bounce_1s_infinite_100ms]"></div>
              </div>
            )}

            {mode === 'audio' && recordState === 'inactive' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-300 dark:text-slate-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            )}

            {recordState === 'uploading' && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#143109] border-t-transparent"></div>
                <span className="text-xs font-bold mt-2 text-[#143109]">Wysyłanie...</span>
              </div>
            )}

            {(recordState === 'recording' || recordState === 'uploading') && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full font-mono font-bold z-10">
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {recordState === 'inactive' && (
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => { setMode('audio'); startRecording('audio'); }}
                  className="flex-1 py-3 bg-[#D0D6B3] hover:bg-[#D0D6B3]/80 text-[#143109] rounded-xl text-sm font-bold transition-colors"
                >
                  Głos
                </button>
                <button
                  onClick={() => { setMode('video'); startRecording('video'); }}
                  className="flex-1 py-3 bg-[#AAAE7F] hover:bg-[#AAAE7F]/80 text-[#143109] rounded-xl text-sm font-bold transition-colors"
                >
                  Wideo
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-[#EFEFEF] hover:bg-[#D0D6B3]/40 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#143109] dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2 border border-[#AAAE7F]/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 12 4.5M12 3v13.5" />
                </svg>
                <span>Wybierz plik z telefonu</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*,video/*"
                className="hidden"
              />
            </div>
          )}

          {recordState === 'recording' && (
            <button
              onClick={stopRecording}
              className="w-full py-3 bg-[#143109] text-[#F7F7F7] rounded-xl text-sm font-bold flex justify-center items-center space-x-2 shadow-sm hover:bg-[#143109]/90"
            >
              <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
              <span>Zakończ i Wyślij</span>
            </button>
          )}
        </div>
      )}

      {/* Przycisk aktywacji panelu gdy komponent nie jest sterowany z zewnątrz */}
      {!isOpen && isOpenExternal === undefined && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#143109] text-[#F7F7F7] hover:scale-105 transition-transform duration-200 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>
      )}
    </div>
  );
};

```


## frontend/src/components/MobileBottomBar.tsx <a name="file-frontend-src-components-MobileBottomBar-tsx"></a>

```tsx
import React from "react";
import { CheckSquare, Edit3, Mic, Image as ImageIcon } from "lucide-react";

interface MobileBottomBarProps {
  onNewNote: () => void;
  onNewList?: () => void;
  onNewAudio?: () => void;
  onNewImage?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onNewNote,
  onNewList,
  onNewAudio,
  onNewImage,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#EFEFEF] dark:bg-[#202124] border-t border-[#AAAE7F]/40 h-14 flex items-center justify-between px-5 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* Quick Tool Icons */}
      <div className="flex items-center space-x-5 text-[#143109] dark:text-slate-300">
        <button
          type="button"
          onClick={onNewNote}
          className="p-1.5 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          title="Nowa notatka tekstowa"
        >
          <Edit3 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewList || onNewNote}
          className="p-1.5 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          title="Nowa lista zadań"
        >
          <CheckSquare className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewImage || onNewNote}
          className="p-1.5 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          title="Dodaj zdjęcie"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Floating Action Button (FAB) - Microphone Voice/Video Note */}
      <div className="relative">
        <button
          type="button"
          onClick={onNewAudio || onNewNote}
          className="absolute right-0 bottom-[-6px] w-14 h-14 bg-[#143109] text-[#F7F7F7] rounded-full shadow-xl border-2 border-[#F7F7F7] dark:border-slate-800 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="Nagranie głosowe lub wideo"
          title="Nagranie głosowe lub wideo"
        >
          <Mic className="w-6 h-6 text-[#F7F7F7]" />
        </button>
      </div>
    </div>
  );
};

```


## frontend/src/components/MarkdownRenderer.tsx <a name="file-frontend-src-components-MarkdownRenderer-tsx"></a>

```tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  onChange?: (newContent: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onChange }) => {
  const urlTransform = (url: string) => {
    if (url.startsWith("data:")) return url;
    try {
      const scheme = url.split(":")[0].toLowerCase();
      if (["http", "https", "mailto", "tel"].includes(scheme)) {
        return url;
      }
    } catch (e) {
      // ignore parsing errors
    }
    return "";
  };

  const markdownComponents = {
    h1: ({ ...props }: any) => (
      <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2 tracking-tight" {...props} />
    ),
    h2: ({ ...props }: any) => (
      <h2 className="text-base font-medium text-slate-800 dark:text-slate-100 mt-3 mb-2 tracking-tight" {...props} />
    ),
    h3: ({ ...props }: any) => (
      <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-2 mb-1 tracking-tight" {...props} />
    ),
    p: ({ ...props }: any) => (
      <p className="mb-3 text-slate-700 dark:text-slate-300 last:mb-0" {...props} />
    ),
    img: ({ ...props }: any) => (
      <img className="max-w-full h-auto rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 my-3" {...props} />
    ),
    ul: ({ ...props }: any) => (
      <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
    ),
    ol: ({ ...props }: any) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
    ),
    li: ({ ...props }: any) => (
      <li className="text-slate-755 dark:text-slate-300 mb-1" {...props} />
    ),
    input: ({ ...props }: any) => {
      if (props.type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={props.checked}
            disabled
            className="rounded-[6px] border-slate-350 text-slate-900 dark:border-slate-600 h-4.5 w-4.5 mr-2 accent-slate-900 dark:accent-slate-100 align-middle"
            {...props}
          />
        );
      }
      return <input {...props} />;
    },
    strong: ({ ...props }: any) => (
      <strong className="font-semibold text-slate-800 dark:text-slate-100" {...props} />
    ),
  };

  const hasChecklist = /^\s*-\s+\[[ x]\]/mi.test(content);

  if (hasChecklist && onChange) {
    const lines = content.split("\n");
    const activeItems: { text: string; lineIndex: number }[] = [];
    const completedItems: { text: string; lineIndex: number }[] = [];
    const headerLines: string[] = [];
    const footerLines: string[] = [];

    let checklistStarted = false;

    lines.forEach((line, index) => {
      const activeMatch = /^\s*-\s+\[\s*\]\s*(.*)$/.exec(line);
      const completedMatch = /^\s*-\s+\[x\]\s*(.*)$/i.exec(line);

      if (activeMatch) {
        checklistStarted = true;
        activeItems.push({ text: activeMatch[1], lineIndex: index });
      } else if (completedMatch) {
        checklistStarted = true;
        completedItems.push({ text: completedMatch[1], lineIndex: index });
      } else {
        if (!checklistStarted) {
          headerLines.push(line);
        } else {
          footerLines.push(line);
        }
      }
    });

    const toggleItem = (lineIndex: number, currentCompleted: boolean) => {
      const newLines = [...lines];
      const text = currentCompleted 
        ? /^\s*-\s+\[x\]\s*(.*)$/i.exec(lines[lineIndex])?.[1] || ""
        : /^\s*-\s+\[\s*\]\s*(.*)$/.exec(lines[lineIndex])?.[1] || "";
      
      newLines[lineIndex] = currentCompleted ? `- [ ] ${text}` : `- [x] ${text}`;
      onChange(newLines.join("\n"));
    };

    return (
      <div className="space-y-4 font-sans text-sm">
        {headerLines.length > 0 && (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={urlTransform} components={markdownComponents}>
              {headerLines.join("\n")}
            </ReactMarkdown>
          </div>
        )}

        {/* Active items list */}
        {activeItems.length > 0 && (
          <div className="space-y-2">
            {activeItems.map((item) => (
              <div
                key={item.lineIndex}
                className="flex items-start space-x-2.5 group text-slate-700 dark:text-slate-200 transition-colors"
              >
                <label onClick={(e) => e.stopPropagation()} className="cursor-pointer mt-0.5">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleItem(item.lineIndex, false)}
                    className="rounded border-slate-350 dark:border-slate-600 text-slate-900 dark:text-slate-100 h-4.5 w-4.5 accent-slate-900 dark:accent-slate-100 transition-all cursor-pointer"
                  />
                </label>
                <span className="leading-normal cursor-text flex-1">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Divider and completed items */}
        {completedItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Wykreślone elementy ({completedItems.length})
            </div>
            <div className="space-y-2">
              {completedItems.map((item) => (
                <div
                  key={item.lineIndex}
                  className="flex items-start space-x-2.5 group text-slate-400 dark:text-slate-550 transition-colors"
                >
                  <label onClick={(e) => e.stopPropagation()} className="cursor-pointer mt-0.5">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleItem(item.lineIndex, true)}
                      className="rounded border-slate-300 dark:border-slate-700 text-slate-400 h-4.5 w-4.5 accent-slate-300 dark:accent-slate-700 transition-all cursor-pointer"
                    />
                  </label>
                  <span className="line-through leading-normal cursor-text flex-1">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {footerLines.length > 0 && (
          <div className="prose dark:prose-invert max-w-none pt-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={urlTransform} components={markdownComponents}>
              {footerLines.join("\n")}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={urlTransform}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

```


## frontend/src/components/CreateGoalForm.tsx <a name="file-frontend-src-components-CreateGoalForm-tsx"></a>

```tsx
import React, { useState } from "react";
import { createNote } from "../services/api";

interface CreateGoalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateGoalForm: React.FC<CreateGoalFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = title.trim() !== "" && content.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);
    try {
      await createNote({
        title,
        content,
        note_type: "strategic",
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError("Nie udało się zapisać celu. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Tytuł celu
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Np. Przebiec maraton w tym roku"
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Szczegółowy opis
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Opisz jak zamierzasz to osiągnąć..."
          rows={4}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      )}

      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-sm ${
            isValid && !loading
              ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Zapisywanie..." : "Zapisz cel"}
        </button>
      </div>
    </form>
  );
};

```


## frontend/src/components/NoteCard.tsx <a name="file-frontend-src-components-NoteCard-tsx"></a>

```tsx
import React, { useState, useRef, useEffect } from "react";
import { Palette, Bell, Users, Image, Archive, MoreVertical, Pin, Check, Trash2, Type, Tag, GripHorizontal, Play, Headphones, CalendarDays, FolderKanban, X, RotateCw, Loader2, AlertCircle } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { AvatarStack } from "./AvatarStack";
import { updateNote } from "../services/api";
import type { Note, Project } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface NoteCardProps {
  note: Note;
  formatNoteDate?: (dateStr: string) => string;
  handleNoteContentChange: (noteId: string, newContent: string) => Promise<void>;
  onTogglePin?: (noteId: string, currentPinStatus: boolean) => void;
  onDelete?: (noteId: string) => void;
  onUpdateTitle?: (noteId: string, newTitle: string) => void;
  onUpdateLabel?: (noteId: string, newLabel: string) => void;
  onUpdateProject?: (noteId: string, projectId: string | null) => void;
  onUpdateProjects?: (noteId: string, projectIds: string[]) => void;
  onReanalyze?: (noteId: string) => void;
  onUpdateAssignees?: (noteId: string, assigneeIds: string[]) => void;
  projects?: Project[];
  onClick?: (noteId: string) => void;
}

const getDisplayName = (emailOrName: string) => {
  if (emailOrName.includes('@')) {
    const parts = emailOrName.split('@')[0].split(/[._-]/);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }
  return emailOrName;
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  handleNoteContentChange,
  onTogglePin,
  onDelete,
  onUpdateTitle,
  onUpdateLabel,
  onUpdateProject,
  onUpdateProjects,
  onReanalyze,
  onUpdateAssignees,
  projects = [],
  onClick,
}) => {
  const isAudio = note.media_type?.startsWith("audio/");
  const isVideo = note.media_type?.startsWith("video/");
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [dismissedEvents, setDismissedEvents] = useState<number[]>([]);
  const [localAssignees, setLocalAssignees] = useState<string[]>(note.assigned_user_ids || []);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  
  // Extract all assigned projects (from project_ids or legacy project_id)
  const currentProjectIds = note.project_ids && note.project_ids.length > 0 
    ? note.project_ids 
    : (note.project_id ? [note.project_id] : []);

  const assignedProjects = projects.filter((p) => currentProjectIds.includes(p.id));

  const isPending = note.processing_status === "pending";
  const isError = note.processing_status === "error_transcription" || note.processing_status === "error_ai";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(note.id)}
      className={`group relative bg-[#EFEFEF] dark:bg-[#202124] rounded-2xl border ${isDragging ? 'border-[#AAAE7F] shadow-xl opacity-90' : 'border-[#AAAE7F]/30 hover:border-[#AAAE7F] hover:shadow-md'} transition-all duration-200 overflow-hidden p-4 sm:p-5 text-[#143109] dark:text-slate-100 flex flex-col justify-between h-fit w-full break-inside-avoid mb-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity bg-gradient-to-b from-black/5 to-transparent dark:from-white/5"
      >
        <GripHorizontal className="w-4 h-4 text-slate-400" />
      </div>

      {/* Top Left Selection Check */}
      <button 
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#F7F7F7] dark:bg-[#202124] hover:bg-[#D0D6B3]/40 border border-[#AAAE7F]/40 rounded-full shadow-sm text-[#143109] cursor-pointer z-10"
        title="Wybierz"
      >
        <Check className="w-3.5 h-3.5" />
      </button>

      {/* Top Right Pin Icon */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin?.(note.id, !!note.is_pinned);
        }}
        className={`absolute top-2 right-2 transition-all p-1.5 bg-[#F7F7F7]/90 dark:bg-[#202124]/90 hover:bg-[#D0D6B3]/40 border border-[#AAAE7F]/40 rounded-full shadow-sm cursor-pointer z-10 ${
          note.is_pinned
            ? "opacity-100 text-[#143109] fill-[#143109] hover:text-[#143109]/80 dark:text-[#AAAE7F] dark:fill-[#AAAE7F]"
            : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#143109]"
        }`}
        title={note.is_pinned ? "Odpnij notatkę" : "Przypnij notatkę"}
      >
        <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? "fill-current" : ""}`} />
      </button>

      <div className="w-full">
        {/* Status Indicators */}
        {isPending && (
          <div className="mb-2 inline-flex items-center space-x-1.5 text-[11px] font-semibold text-[#143109] bg-[#D0D6B3]/70 px-2.5 py-1 rounded-lg border border-[#AAAE7F]/50">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#143109]" />
            <span>Przetwarzanie AI w tle...</span>
          </div>
        )}

        {isError && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 min-w-0">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Błąd analizy AI</span>
            </div>
            {onReanalyze && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReanalyze(note.id);
                }}
                className="inline-flex items-center space-x-1 text-[11px] font-bold bg-[#143109] text-[#F7F7F7] px-2.5 py-1 rounded-lg hover:bg-[#143109]/90 transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
                title="Ponów analizę AI dla tej notatki"
              >
                <RotateCw className="w-3 h-3" />
                <span>Ponów</span>
              </button>
            )}
          </div>
        )}
        {/* Zaproszenie Banner */}
        {user && note.pending_user_ids?.includes(user.uid) && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between text-xs cursor-default">
            <span className="font-medium text-blue-800">Masz zaproszenie do notatki</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Oczekujące</span>
          </div>
        )}

        {/* Title */}
        {note.title && (
          <h3 className="text-base font-bold mb-2 text-[#143109] dark:text-slate-100 leading-snug">
            {note.title}
          </h3>
        )}

        {/* Project Badges */}
        {assignedProjects.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {assignedProjects.map((p) => (
              <span 
                key={p.id}
                style={{ color: p.color || "#143109", borderColor: `${p.color || "#143109"}50`, backgroundColor: `${p.color || "#143109"}18` }}
                className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
              >
                <FolderKanban className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{p.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* Assignees AvatarStack */}
        {((note.assigned_user_ids && note.assigned_user_ids.length > 0) || (note.pending_user_ids && note.pending_user_ids.length > 0)) && (
          <div className="mb-2">
            <AvatarStack 
              assignees={[...(note.assigned_user_ids || []), ...(note.pending_user_ids || [])]} 
              maxDisplay={3} 
              size="sm" 
            />
          </div>
        )}

        {/* Media Indicator */}
        {note.media_url && (
          <div className="mb-3 flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            {isAudio && (
              <div title="Notatka audio" className="inline-flex items-center">
                <Headphones className="w-5 h-5 text-[#143109] dark:text-[#AAAE7F]" />
              </div>
            )}
            {isVideo && (
              <div title="Notatka wideo" className="inline-flex items-center">
                <Play className="w-5 h-5 fill-current text-[#143109] dark:text-[#AAAE7F]" />
              </div>
            )}
          </div>
        )}

        {/* Content with max-height and fade-out for long notes on grid */}
        <div className="relative prose prose-sm dark:prose-invert max-w-none text-[#143109]/90 dark:text-slate-300 max-h-[360px] overflow-hidden">
          <MarkdownRenderer
            content={note.content}
            onChange={(newContent) => handleNoteContentChange(note.id, newContent)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#EFEFEF] dark:from-[#202124] to-transparent pointer-events-none"></div>
        </div>

        {/* Events */}
        {note.events && note.events.filter((_, i) => !(dismissedEvents || []).includes(i)).length > 0 && (
          <div className="mt-3 space-y-2 relative z-10">
            {note.events.map((event, idx) => {
              if ((dismissedEvents || []).includes(idx)) return null;
              const startStr = (event.date_start || "").replace(/[-:]/g, "");
              const endStr = (event.date_end || event.date_start || "").replace(/[-:]/g, "");
              
              let displayTime = "";
              if (event.date_start) {
                try {
                  displayTime = new Date(event.date_start).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
                  if (event.date_end) {
                    displayTime += ' - ' + new Date(event.date_end).toLocaleString('pl-PL', { timeStyle: 'short' });
                  }
                } catch (e) {
                  displayTime = event.date_start;
                }
              }

              return (
                <div key={idx} className="group/event relative bg-[#D0D6B3]/40 dark:bg-slate-900/40 border border-[#AAAE7F]/40 rounded-xl p-2.5 flex flex-col space-y-1.5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDismissedEvents(prev => [...(prev || []), idx]); }}
                    className="absolute top-1.5 right-1.5 p-0.5 rounded opacity-0 group-hover/event:opacity-100 transition-opacity bg-[#D0D6B3] text-[#143109] hover:bg-[#AAAE7F]"
                    title="Usuń propozycję"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex items-start justify-between pr-5">
                    <div className="flex items-center space-x-1.5 text-[#143109] dark:text-slate-200 font-semibold text-sm min-w-0">
                      <CalendarDays className="w-4 h-4 flex-shrink-0 text-[#143109] dark:text-[#AAAE7F]" />
                      <span className="line-clamp-1">{event.title}</span>
                    </div>
                    <a 
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}${event.description ? `&details=${encodeURIComponent(event.description)}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold bg-[#F7F7F7] dark:bg-slate-800 border border-[#AAAE7F]/50 hover:bg-[#D0D6B3]/40 text-[#143109] dark:text-[#AAAE7F] px-2 py-1 rounded-lg transition-colors whitespace-nowrap ml-2"
                      title="Dodaj do kalendarza Google"
                    >
                      Dodaj
                    </a>
                  </div>
                  {displayTime && (
                    <div className="text-xs text-[#143109]/80 dark:text-[#AAAE7F] pl-5 font-medium">
                      {displayTime}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Assign Strip */}
      {note.suggested_assignees && note.suggested_assignees.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {note.suggested_assignees.map((person) => {
            const isAssigned = localAssignees.includes(person);
            const isLoading = assigningId === person;
            return (
              <button
                key={person}
                type="button"
                disabled={isLoading}
                onClick={async (e) => {
                  e.stopPropagation();
                  setAssigningId(person);
                  const updated = isAssigned
                    ? localAssignees.filter((id) => id !== person)
                    : [...localAssignees, person];
                  try {
                    await updateNote(note.id, { assigned_user_ids: updated });
                    setLocalAssignees(updated);
                    onUpdateAssignees?.(note.id, updated);
                  } catch {}
                  setAssigningId(null);
                }}
                className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-all cursor-pointer ${
                  isAssigned
                    ? "bg-[#143109] text-[#F7F7F7] border-[#143109] shadow-sm"
                    : "bg-[#F7F7F7] text-[#143109] border-[#AAAE7F]/50 hover:bg-[#D0D6B3]/50 hover:border-[#AAAE7F]"
                }`}
                title={isAssigned ? `Odepnij ${person}` : `Przypisz: ${person}`}
              >
                {isLoading ? (
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : isAssigned ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Users className="w-3 h-3" />
                )}
                <span className="truncate max-w-[100px]">
                  {isAssigned ? getDisplayName(person) : `Przypisz: ${getDisplayName(person)}`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Hover Toolbar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50"
      >
        <div className="flex items-center space-x-1">
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Zmień kolor">
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Przypomnij mi">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Współpracownik">
            <Users className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Dodaj obraz">
            <Image className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Archiwizuj">
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" 
            title="Więcej"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsProjectModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors border-b border-slate-100 dark:border-slate-700"
              >
                <FolderKanban className="w-4 h-4 text-blue-500" />
                <span>{currentProjectIds.length > 0 ? "Zarządzaj projektami" : "Dołącz do projektów"}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  const newTitle = window.prompt("Podaj nowy tytuł notatki:", note.title || "");
                  if (newTitle !== null) {
                    onUpdateTitle?.(note.id, newTitle);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors border-b border-slate-100 dark:border-slate-700"
              >
                <Type className="w-4 h-4" />
                <span>Zmień tytuł</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  const currentLabel = note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type;
                  const newLabel = window.prompt("Podaj nową etykietę:", currentLabel);
                  if (newLabel !== null && newLabel.trim() !== "") {
                    onUpdateLabel?.(note.id, newLabel.trim());
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors border-b border-slate-100 dark:border-slate-700"
              >
                <Tag className="w-4 h-4" />
                <span>Zmień etykietę</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onDelete?.(note.id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Usuń notatkę</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal wyboru projektów (Multi-select) */}
      {isProjectModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsProjectModalOpen(false);
          }}
        >
          <div 
            className="bg-white dark:bg-[#202124] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Przypisz do projektów</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onUpdateProjects?.(note.id, []);
                  onUpdateProject?.(note.id, null);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentProjectIds.length === 0 ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span>Brak projektów (odepnij wszystkie)</span>
                {currentProjectIds.length === 0 && <Check className="w-4 h-4 text-blue-500" />}
              </button>

              {projects.map((p) => {
                const isSelected = currentProjectIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      let updated: string[];
                      if (isSelected) {
                        updated = currentProjectIds.filter((id) => id !== p.id);
                      } else {
                        updated = [...currentProjectIds, p.id];
                      }
                      if (onUpdateProjects) {
                        onUpdateProjects(note.id, updated);
                      } else if (onUpdateProject) {
                        onUpdateProject(note.id, updated.length > 0 ? updated[0] : null);
                      }
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || "#3b82f6" }}></span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#202124] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-5 flex flex-col justify-between animate-pulse h-40 w-full">
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-4 pr-6">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        {/* Title Skeleton */}
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
        {/* Content Skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

```


## frontend/src/components/Sidebar.tsx <a name="file-frontend-src-components-Sidebar-tsx"></a>

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, FolderKanban, Users } from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, isCollapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [ignoreHover, setIgnoreHover] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFull = !isCollapsed || isHovered;

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isCollapsed && !ignoreHover) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (isCollapsed) {
      setIsHovered(false);
      setIgnoreHover(false);
    }
  };

  const handleToggle = () => {
    if (onToggleCollapse) onToggleCollapse();
    if (!isCollapsed) {
      setIsHovered(false);
      setIgnoreHover(true);
    } else {
      setIgnoreHover(false);
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = `flex items-center py-3 font-semibold transition-all duration-200 group text-sm ${showFull ? 'px-4 space-x-3 rounded-r-full' : 'justify-center mx-2 rounded-full'}`;
    const activeClass = "bg-[#D0D6B3] text-[#143109] font-bold shadow-sm";
    const inactiveClass = "text-[#143109]/70 hover:bg-[#EFEFEF]";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-full bg-[#F7F7F7] border-r border-[#AAAE7F]/30 flex flex-col py-4 transition-all duration-200 z-40 ${
        isCollapsed 
          ? (isHovered ? 'w-64 absolute shadow-2xl left-0 top-0 bottom-0' : 'w-[72px] relative') 
          : 'w-64 relative'
      }`}
    >
      {/* Header / Logo */}
      <div className={`px-4 pb-6 flex items-center mb-2 ${showFull ? 'space-x-2' : 'justify-center'}`}>
        {onToggleCollapse && (
          <button 
            onClick={handleToggle} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 flex-shrink-0"
            title={isCollapsed ? "Rozwiń menu" : "Zwiń menu"}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        {showFull && (
          <div className="flex items-center overflow-hidden">
            <img src="/logo.png" alt="keepGoals Logo" className="h-7 w-auto object-contain" />
          </div>
        )}
      </div>

      {/* Menu Nawigacyjne */}
      <nav className={`flex-1 ${showFull ? 'pr-4' : ''}`}>
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
              </svg>
              {showFull && <span className="whitespace-nowrap overflow-hidden">keep</span>}
            </NavLink>
          </li>
          <li>
            <div 
              className={`flex items-center py-3 font-semibold transition-all duration-200 text-sm opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-500 ${showFull ? 'px-4 space-x-3 rounded-r-full' : 'justify-center mx-2 rounded-full'}`}
              title="Goals module coming soon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {showFull && (
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="whitespace-nowrap">goals</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded ml-2">Soon</span>
                </div>
              )}
            </div>
          </li>
          <li>
            <NavLink to="/projects" className={navItemClass} onClick={onNavigate}>
              <FolderKanban className="w-5 h-5 flex-shrink-0" />
              {showFull && <span className="whitespace-nowrap overflow-hidden">projects</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/teams" className={navItemClass} onClick={onNavigate}>
              <Users className="w-5 h-5 flex-shrink-0" />
              {showFull && <span className="whitespace-nowrap overflow-hidden">teams</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/trash" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              {showFull && <span className="whitespace-nowrap overflow-hidden">trash</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {showFull && <span className="whitespace-nowrap overflow-hidden">settings</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Dolny pasek uzytkownika */}
      <div className={`px-4 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto flex flex-col ${showFull ? 'items-start' : 'items-center'}`}>
        {showFull ? (
          <>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 truncate w-full px-2" title={user?.email || ""}>
              {user?.email}
            </div>
            <button
              onClick={logout}
              className="w-full py-2 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-xl text-sm font-semibold transition-colors duration-200"
            >
              Wyloguj się
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            title="Wyloguj się"
            className="p-2 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-full transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

```


## frontend/src/components/Modal.tsx <a name="file-frontend-src-components-Modal-tsx"></a>

```tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      {/* Tło zamykające modal po kliknięciu */}
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-800 rounded-[24px] shadow-xl border border-slate-100 dark:border-slate-700 max-w-md w-full p-8 transition-all duration-200 transform scale-100 z-10">
        {/* Nagłówek modala */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Zawartość */}
        <div>{children}</div>
      </div>
    </div>
  );
};

```


## frontend/src/components/MobileTopBar.tsx <a name="file-frontend-src-components-MobileTopBar-tsx"></a>

```tsx
import React from "react";
import { Menu, Search, LayoutGrid, List, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface MobileTopBarProps {
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isGridView: boolean;
  onToggleView: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onOpenMenu,
  searchQuery,
  onSearchChange,
  isGridView,
  onToggleView,
}) => {
  const { user } = useAuth();

  return (
    <div className="w-full px-3 py-2 md:hidden">
      <div className="bg-[#EFEFEF] dark:bg-[#202124] rounded-full border border-[#AAAE7F]/40 shadow-md flex items-center px-3 py-1.5 space-x-2">
        {/* Menu Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="p-1.5 text-[#143109] dark:text-slate-300 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          aria-label="Otwórz menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="flex-1 flex items-center space-x-2">
          <Search className="w-4 h-4 text-[#143109]/60 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Wyszukaj notatki"
            className="w-full bg-transparent border-none text-[#143109] dark:text-slate-100 placeholder-[#143109]/60 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
        </div>

        {/* View Toggle Button */}
        <button
          type="button"
          onClick={onToggleView}
          className="p-1.5 text-[#143109] dark:text-slate-300 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          title={isGridView ? "Widok jednokolumnowy" : "Widok dwukolumnowy"}
        >
          {isGridView ? (
            <List className="w-5 h-5" />
          ) : (
            <LayoutGrid className="w-5 h-5" />
          )}
        </button>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#D0D6B3] text-[#143109] flex items-center justify-center font-bold text-xs border border-[#AAAE7F]">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
};

```


## frontend/src/components/KeepInputBar.tsx <a name="file-frontend-src-components-KeepInputBar-tsx"></a>

```tsx
import React, { useState, useRef, useEffect } from "react";
import { createNote, uploadAudio, uploadVideo } from "../services/api";

interface KeepInputBarProps {
  onSuccess: () => void;
  projectId?: string;
}

type InputMode = "text" | "list" | "drawing" | "image";
type RecordMode = "audio" | "video";
type RecordStatus = "inactive" | "recording" | "uploading";

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
}

export const KeepInputBar: React.FC<KeepInputBarProps> = ({ onSuccess, projectId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // List mode state
  const [listItems, setListItems] = useState<ListItem[]>([
    { id: "1", text: "", completed: false },
  ]);

  // Image mode state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Recording states
  const [recordMode, setRecordMode] = useState<RecordMode>("audio");
  const [recordStatus, setRecordStatus] = useState<RecordStatus>("inactive");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up previews and media on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [imagePreviewUrl]);

  // Handle click outside to auto-save or close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        recordStatus === "inactive"
      ) {
        // Check if there is anything to save
        const hasContent =
          title.trim() ||
          (inputMode === "text" && content.trim()) ||
          (inputMode === "list" && listItems.some((item) => item.text.trim())) ||
          (inputMode === "image" && selectedImage) ||
          inputMode === "drawing"; // always check if canvas has drawing or just let it close/save

        if (hasContent) {
          handleSave();
        } else {
          resetAll();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [title, content, listItems, selectedImage, inputMode, recordStatus]);

  const resetAll = () => {
    setIsExpanded(false);
    setInputMode("text");
    setTitle("");
    setContent("");
    setListItems([{ id: "1", text: "", completed: false }]);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setSelectedImage(null);
    setError(null);
    setIsVideoExpanded(false);
  };

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Convert files or canvas to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalContent = "";

      if (inputMode === "text") {
        finalContent = content.trim();
      } else if (inputMode === "list") {
        // Map list items to GFM Markdown check-list
        finalContent = listItems
          .filter((item) => item.text.trim() !== "")
          .map((item) => `- [${item.completed ? "x" : " "}] ${item.text.trim()}`)
          .join("\n");
      } else if (inputMode === "image" && selectedImage) {
        const base64Image = await fileToBase64(selectedImage);
        finalContent = `![Załączony Obraz](${base64Image})\n\n${content.trim()}`;
      } else if (inputMode === "drawing" && canvasRef.current) {
        // Convert canvas to Data URL base64 image
        const dataUrl = canvasRef.current.toDataURL("image/png");
        finalContent = `![Szkic odręczny](${dataUrl})\n\n${content.trim()}`;
      }

      // If nothing is written or drawn, just close
      if (!title.trim() && !finalContent.trim()) {
        resetAll();
        return;
      }

      await createNote({
        title: title.trim(),
        content: finalContent || "Pusta notatka",
        note_type: "generic",
        project_id: projectId,
      });

      resetAll();
      onSuccess();
    } catch (err: any) {
      setError("Nie udało się zapisać notatki.");
    } finally {
      setLoading(false);
    }
  };

  // List mode handlers
  const handleAddListItem = (index: number) => {
    const newItems = [...listItems];
    newItems.splice(index + 1, 0, {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
      completed: false,
    });
    setListItems(newItems);
    // Focus the new item on the next tick
    setTimeout(() => {
      const element = document.getElementById(`list-input-${index + 1}`);
      if (element) element.focus();
    }, 10);
  };

  const handleRemoveListItem = (index: number) => {
    if (listItems.length === 1) return;
    const newItems = listItems.filter((_, i) => i !== index);
    setListItems(newItems);
  };

  const handleUpdateListItem = (index: number, text: string) => {
    const newItems = [...listItems];
    newItems[index].text = text;
    setListItems(newItems);
  };

  const handleToggleListItem = (index: number) => {
    const newItems = [...listItems];
    newItems[index].completed = !newItems[index].completed;
    setListItems(newItems);
  };

  // Image mode handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setIsExpanded(true);
      setInputMode("image");
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Drawing mode Canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX = 0;
    let clientY = 0;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    lastXRef.current = clientX - rect.left;
    lastYRef.current = clientY - rect.top;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX = 0;
    let clientY = 0;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastXRef.current, lastYRef.current);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#3b82f6"; // beautiful digital ink color (blue-500)
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    lastXRef.current = x;
    lastYRef.current = y;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Recording methods
  const startRecording = async (mode: RecordMode) => {
    setIsExpanded(true);
    setRecordMode(mode);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === "video" ? { facingMode: "environment" } : false,
      });
      streamRef.current = stream;

      if (mode === "video" && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      let mimeType = "";
      if (mode === "video") {
        if (MediaRecorder.isTypeSupported("video/webm")) mimeType = "video/webm";
        else if (MediaRecorder.isTypeSupported("video/mp4")) mimeType = "video/mp4";
      } else {
        if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      }
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = mediaRecorderRef.current?.mimeType || (mode === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, {
          type: blobType,
        });
        setRecordStatus("uploading");
        try {
          if (mode === "audio") {
            await uploadAudio(blob);
          } else {
            await uploadVideo(blob);
          }
          setRecordStatus("inactive");
          setRecordingTime(0);
          chunksRef.current = [];
          resetAll();
          onSuccess();
        } catch (uploadErr: any) {
          setError(uploadErr.message || "Błąd wysyłania nagrania.");
          setRecordStatus("inactive");
        }
      };

      chunksRef.current = [];
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      setRecordStatus("recording");
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(err.name === "NotSupportedError" ? "Format nagrywania nie jest wspierany na Twoim urządzeniu." : "Brak dostępu do kamery/mikrofonu.");
      setRecordStatus("inactive");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    }
    setRecordStatus("inactive");
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      id="keep-input-bar"
      ref={containerRef}
      className="w-full max-w-2xl mx-auto bg-[#EFEFEF] dark:bg-[#202124] rounded-2xl border border-[#AAAE7F]/40 shadow-lg transition-all duration-300 overflow-hidden mb-8"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* COLLAPSED STATE */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="p-4 flex items-center justify-between cursor-text"
        >
          <span className="text-[#143109]/60 dark:text-slate-400 font-medium">Utwórz notatkę...</span>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* New Checklist mode trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                setInputMode("list");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Nowa lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>

            {/* Drawing mode trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                setInputMode("drawing");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Nowy szkic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122A3 3 0 0 0 10.47 18h3.06a3 3 0 0 0 .94-1.878l.254-2.032a3 3 0 0 0-.712-2.195L14 11.182V9.636h-4v1.545l-.012.011a3 3 0 0 0-.712 2.195l.254 2.032Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.909V3m0 2.909a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
              </svg>
            </button>

            {/* Image mode trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Nowa notatka ze zdjęciem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>

            {/* Audio Recorder Button - mobile only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRecording("audio");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors md:hidden"
              title="Nagraj notatkę głosową"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </button>

            {/* Video Recorder Button - mobile only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRecording("video");
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors md:hidden"
              title="Nagraj notatkę wideo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED STATE */}
      {isExpanded && (
        <div className="flex flex-col">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/50 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {recordStatus === "inactive" ? (
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Tytuł"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-lg"
              />

              {/* RENDER MODE: TEXT */}
              {inputMode === "text" && (
                <textarea
                  placeholder="Utwórz notatkę..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm leading-relaxed"
                />
              )}

              {/* RENDER MODE: LIST */}
              {inputMode === "list" && (
                <div className="space-y-2 py-2">
                  {listItems.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleListItem(index)}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <input
                        id={`list-input-${index}`}
                        type="text"
                        placeholder="Element listy"
                        value={item.text}
                        onChange={(e) => handleUpdateListItem(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddListItem(index);
                          } else if (e.key === "Backspace" && item.text === "" && listItems.length > 1) {
                            e.preventDefault();
                            handleRemoveListItem(index);
                            setTimeout(() => {
                              const prevElement = document.getElementById(`list-input-${index - 1 >= 0 ? index - 1 : 0}`);
                              if (prevElement) prevElement.focus();
                            }, 10);
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-350 dark:placeholder-slate-650 text-sm py-0.5"
                      />
                      <button
                        onClick={() => handleRemoveListItem(index)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title="Usuń element"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddListItem(listItems.length - 1)}
                    className="text-xs text-blue-500 hover:text-blue-600 font-bold flex items-center space-x-1 mt-2 pl-6"
                  >
                    <span>+ Dodaj element</span>
                  </button>
                </div>
              )}

              {/* RENDER MODE: IMAGE */}
              {inputMode === "image" && imagePreviewUrl && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60 bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
                    <img
                      src={imagePreviewUrl}
                      alt="Podgląd załącznika"
                      className="max-h-60 object-contain"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreviewUrl(null);
                        setInputMode("text");
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white hover:bg-slate-950 p-1.5 rounded-full shadow-md"
                      title="Usuń zdjęcie"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    placeholder="Dodaj notatkę do zdjęcia..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm leading-relaxed"
                  />
                </div>
              )}

              {/* RENDER MODE: DRAWING */}
              {inputMode === "drawing" && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col items-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-[200px] cursor-crosshair touch-none"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        onClick={clearCanvas}
                        type="button"
                        className="px-2.5 py-1 bg-white/95 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-lg shadow font-semibold hover:bg-white dark:hover:bg-slate-750"
                      >
                        Wyczyść
                      </button>
                    </div>
                  </div>
                  <textarea
                    placeholder="Dodaj opis do szkicu..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm leading-relaxed"
                  />
                </div>
              )}
            </div>
          ) : (
            /* RECORDING DISPLAY */
            <div className={`flex flex-col items-center justify-center relative transition-all duration-300 ${isVideoExpanded ? 'fixed inset-0 z-[100] bg-black' : 'p-6 bg-slate-50 dark:bg-slate-900 min-h-[200px]'}`}>
              {recordMode === "video" && (
                <>
                  <video
                    ref={videoPreviewRef}
                    className={`absolute inset-0 w-full h-full ${isVideoExpanded ? 'object-contain' : 'object-cover'}`}
                    muted
                    playsInline
                  />
                  <button 
                    onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                    className={`absolute ${isVideoExpanded ? 'top-6 right-6' : 'top-4 right-4'} z-20 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors`}
                  >
                    {isVideoExpanded ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    )}
                  </button>
                </>
              )}

              {recordMode === "audio" && recordStatus === "recording" && (
                <div className="flex items-center space-x-1 mb-4">
                  <div className="w-2 h-8 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_100ms]" />
                  <div className="w-2 h-14 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_300ms]" />
                  <div className="w-2 h-10 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_200ms]" />
                  <div className="w-2 h-16 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_400ms]" />
                  <div className="w-2 h-8 bg-pastel-purple-dark rounded-full animate-[bounce_1s_infinite_100ms]" />
                </div>
              )}

              {recordStatus === "uploading" && (
                <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-pastel-purple-dark border-t-transparent" />
                  <span className="text-sm font-bold mt-3 text-pastel-purple-dark dark:text-pastel-purple-light">Przetwarzanie nagrania przez AI...</span>
                </div>
              )}

              {recordStatus === "recording" && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-mono font-bold z-10 flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-2 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-1">
              {recordStatus === "inactive" ? (
                <>
                  {/* Mode selectors */}
                  <button
                    onClick={() => setInputMode("text")}
                    className={`p-2 rounded-full transition-colors ${inputMode === "text" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Tekst"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setInputMode("list")}
                    className={`p-2 rounded-full transition-colors ${inputMode === "list" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Checklista"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setInputMode("drawing")}
                    className={`p-2 rounded-full transition-colors ${inputMode === "drawing" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Rysunek"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122A3 3 0 0 0 10.47 18h3.06a3 3 0 0 0 .94-1.878l.254-2.032a3 3 0 0 0-.712-2.195L14 11.182V9.636h-4v1.545l-.012.011a3 3 0 0 0-.712 2.195l.254 2.032Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.909V3m0 2.909a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full transition-colors ${inputMode === "image" ? "text-blue-500 bg-blue-50 dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    title="Dodaj obraz"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </button>

                  {/* Audio/Video recorders (mobile only shortcut) */}
                  <button
                    onClick={() => startRecording("audio")}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors md:hidden"
                    title="Nagraj audio"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={cancelRecording}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Anuluj
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              {recordStatus === "recording" ? (
                <button
                  onClick={stopRecording}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
                >
                  <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                  <span>Zakończ i analizuj</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={resetAll}
                    className="px-4 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold transition-colors"
                  >
                    Zamknij
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    {loading ? "Zapisywanie..." : "Zapisz"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

```


## frontend/src/components/NoteModal.tsx <a name="file-frontend-src-components-NoteModal-tsx"></a>

```tsx
import React, { useEffect, useState, useRef } from "react";
import { 
  Palette, Bell, Users, Image as ImageIcon, Archive, MoreVertical, Pin, 
  Trash2, Type, Tag, Bold, Italic, Underline, Baseline, Eraser,
  List, ListOrdered, ListTodo, Sparkles, CalendarDays, X,
  Mail, FileText, Copy, Check, Send, ChevronDown, ChevronUp, FolderKanban,
  RotateCw, Loader2, AlertCircle
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { NoteAIChatModal } from "./NoteAIChatModal";
import { AvatarStack } from "./AvatarStack";
import { useAuth } from "../context/AuthContext";
import { sendNoteEmail, updateNote, fetchTeams, acceptNoteInvite, rejectNoteInvite } from "../services/api";
import type { Note, Project, Team } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "";

import { useUserProfiles } from "../contexts/UserProfilesContext";

interface NoteModalProps {
  note: Note;
  onClose: () => void;
  formatNoteDate: (dateStr: string) => string;
  handleNoteContentChange: (noteId: string, newContent: string) => Promise<void>;
  onTogglePin?: (noteId: string, currentPinStatus: boolean) => void;
  onDelete?: (noteId: string) => void;
  onUpdateTitle?: (noteId: string, newTitle: string) => void;
  onUpdateLabel?: (noteId: string, newLabel: string) => void;
  onUpdateProject?: (noteId: string, projectId: string | null) => void;
  onUpdateProjects?: (noteId: string, projectIds: string[]) => void;
  onUpdateAssignees?: (noteId: string, assigneeIds: string[]) => void;
  onReanalyze?: (noteId: string) => void;
  projects?: Project[];
}

const getDisplayName = (emailOrName: string) => {
  if (emailOrName.includes('@')) {
    const parts = emailOrName.split('@')[0].split(/[._-]/);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }
  return emailOrName;
};

export const NoteModal: React.FC<NoteModalProps> = ({
  note,
  onClose,
  formatNoteDate,
  handleNoteContentChange,
  onTogglePin,
  onDelete,
  onUpdateTitle,
  onUpdateLabel,
  onUpdateProject,
  onUpdateProjects,
  onUpdateAssignees,
  onReanalyze,
  projects = [],
}) => {
  const { user } = useAuth();
  const isAudio = note.media_type?.startsWith("audio/");
  const isVideo = note.media_type?.startsWith("video/");

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const currentProjectIds = note.project_ids && note.project_ids.length > 0 
    ? note.project_ids 
    : (note.project_id ? [note.project_id] : []);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFormattingBar, setShowFormattingBar] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [dismissedEvents, setDismissedEvents] = useState<number[]>([]);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState("");
  const [localAssignees, setLocalAssignees] = useState<string[]>(note.assigned_user_ids || []);
  const [localPending, setLocalPending] = useState<string[]>(note.pending_user_ids || []);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  
  const [showTranscript, setShowTranscript] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(user?.email || "");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  const { getProfileName } = useUserProfiles();
  
  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditContent(note.content);
    setLocalAssignees(note.assigned_user_ids || []);
  }, [note.content, note.assigned_user_ids]);

  useEffect(() => {
    if (isAssigneeDropdownOpen && teams.length === 0) {
      fetchTeams().then(setTeams).catch(() => {});
    }
  }, [isAssigneeDropdownOpen]);

  // Close assignee dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
    };
    if (isAssigneeDropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isAssigneeDropdownOpen]);

  const handleToggleAssignee = async (userId: string) => {
    const isCurrentlyAssignedOrPending = localAssignees.includes(userId) || localPending.includes(userId);
    
    let newAssignees = [...localAssignees];
    let newPending = [...localPending];

    if (isCurrentlyAssignedOrPending) {
      newAssignees = newAssignees.filter(id => id !== userId);
      newPending = newPending.filter(id => id !== userId);
    } else {
      newAssignees.push(userId);
    }
    
    setLocalAssignees(newAssignees);
    setLocalPending(newPending);
    
    const combined = [...newAssignees, ...newPending];
    try {
      await updateNote(note.id, { assigned_user_ids: combined });
      onUpdateAssignees?.(note.id, combined);
    } catch {}
  };

  const handleAddAssigneeEmail = async () => {
    const email = assigneeInput.trim();
    if (!email || localAssignees.includes(email) || localPending.includes(email)) return;
    
    const newAssignees = [...localAssignees, email];
    setLocalAssignees(newAssignees);
    setAssigneeInput("");
    
    const combined = [...newAssignees, ...localPending];
    try {
      await updateNote(note.id, { assigned_user_ids: combined });
      onUpdateAssignees?.(note.id, combined);
    } catch {}
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
          setShowFormattingBar(false);
          if (editContent !== note.content) {
            handleNoteContentChange(note.id, editContent);
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isEditing, editContent, note.content, note.id, handleNoteContentChange]);

  // Click outside menu
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, [isMenuOpen]);

  // Click outside editor to exit edit mode
  useEffect(() => {
    const handleClickOutsideEditor = (event: MouseEvent) => {
      if (
        isEditing &&
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setShowFormattingBar(false);
        if (editContent !== note.content) {
          handleNoteContentChange(note.id, editContent);
        }
      }
    };
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutsideEditor);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideEditor);
  }, [isEditing, editContent, note.content, note.id, handleNoteContentChange]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current && editorContainerRef.current) {
      const scrollPos = editorContainerRef.current.scrollTop;
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      editorContainerRef.current.scrollTop = scrollPos;
    }
  }, [editContent, isEditing]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      if (isEditing && editContent !== note.content) {
        handleNoteContentChange(note.id, editContent);
      }
      onClose();
    }
  };

  const applyFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = editContent.substring(start, end);
    const newText = editContent.substring(0, start) + prefix + selectedText + suffix + editContent.substring(end);
    setEditContent(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const toggleHeader = (level: number) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const textBefore = editContent.substring(0, start);
    const textAfter = editContent.substring(end);
    const selectedText = editContent.substring(start, end);

    const lastNewline = textBefore.lastIndexOf("\n");
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const textBeforeLine = editContent.substring(0, lineStart);
    let currentLine = editContent.substring(lineStart, end);
    
    currentLine = currentLine.replace(/^#{1,6}\s/, ""); // remove existing headers
    const newPrefix = level === 0 ? "" : "#".repeat(level) + " ";
    
    const newText = textBeforeLine + newPrefix + currentLine + textAfter;
    setEditContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = lineStart + newPrefix.length + (start - lineStart);
        textareaRef.current.setSelectionRange(newCursor, newCursor + selectedText.length);
      }
    }, 0);
  };

  const clearFormatting = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    let selectedText = editContent.substring(start, end);
    
    // Remove bold, italic, underline, headers
    selectedText = selectedText.replace(/\*\*(.*?)\*\*/g, "$1");
    selectedText = selectedText.replace(/\*(.*?)\*/g, "$1");
    selectedText = selectedText.replace(/<u>(.*?)<\/u>/g, "$1");
    
    const newText = editContent.substring(0, start) + selectedText + editContent.substring(end);
    setEditContent(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + selectedText.length);
      }
    }, 0);
  };

  const toggleList = (type: 'bullet' | 'ordered' | 'todo') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const textBefore = editContent.substring(0, start);
    const textAfter = editContent.substring(end);
    
    const lastNewlineBefore = textBefore.lastIndexOf("\n");
    const lineStart = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;
    
    const firstNewlineAfter = textAfter.indexOf("\n");
    const lineEnd = firstNewlineAfter === -1 ? editContent.length : end + firstNewlineAfter;
    
    const textBeforeLines = editContent.substring(0, lineStart);
    const textAfterLines = editContent.substring(lineEnd);
    const selectedLinesText = editContent.substring(lineStart, lineEnd);
    
    const lines = selectedLinesText.split("\n");
    
    const isBullet = (l: string) => /^\s*[-*]\s(?!\[)/.test(l);
    const isOrdered = (l: string) => /^\s*\d+\.\s/.test(l);
    const isTodo = (l: string) => /^\s*-\s\[[ x]\]\s/i.test(l);
    
    let allHavePrefix = false;
    if (type === 'bullet') allHavePrefix = lines.every(l => l.trim() === '' || isBullet(l));
    if (type === 'ordered') allHavePrefix = lines.every(l => l.trim() === '' || isOrdered(l));
    if (type === 'todo') allHavePrefix = lines.every(l => l.trim() === '' || isTodo(l));
    
    let counter = 1;
    const newLines = lines.map(line => {
      if (line.trim() === '') return line;
      // Strip any existing list prefix first
      let cleanLine = line.replace(/^\s*([-*]\s\[[ x]\]\s|[-*]\s|\d+\.\s)/i, "");
      
      if (allHavePrefix) {
        return cleanLine;
      } else {
        if (type === 'bullet') return `- ${cleanLine}`;
        if (type === 'ordered') return `${counter++}. ${cleanLine}`;
        if (type === 'todo') return `- [ ] ${cleanLine}`;
        return cleanLine;
      }
    });
    
    const newSelectedText = newLines.join("\n");
    const newText = textBeforeLines + newSelectedText + textAfterLines;
    
    setEditContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(lineStart, lineStart + newSelectedText.length);
      }
    }, 0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative bg-[#EFEFEF] dark:bg-[#202124] rounded-2xl shadow-2xl border border-[#AAAE7F]/40 w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Media Player Header */}
        {note.media_url && (
          <div className="w-full bg-black/5 dark:bg-black/20 flex items-center justify-center relative group">
            {isVideo && (
              <video 
                controls 
                autoPlay
                className="w-full max-h-[50vh] object-contain" 
                src={`${API_URL}${note.media_url}`}
              >
                Twoja przeglądarka nie obsługuje odtwarzacza wideo.
              </video>
            )}
            {isAudio && (
              <div className="w-full p-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <audio 
                  controls 
                  className="w-full max-w-md outline-none" 
                  src={`${API_URL}${note.media_url}`}
                >
                  Twoja przeglądarka nie obsługuje odtwarzacza audio.
                </audio>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-800 dark:text-slate-100 relative" ref={editorContainerRef}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-[#D0D6B3] text-[#143109] rounded-md">
                {note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type}
              </span>
              {projects.length > 0 && (
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 bg-[#D0D6B3]/60 text-[#143109] border border-[#AAAE7F]/40 rounded-lg cursor-pointer hover:bg-[#D0D6B3] transition-colors"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>
                      {currentProjectIds.length === 0
                        ? "Dodaj projekty..."
                        : `${currentProjectIds.length} ${currentProjectIds.length === 1 ? "projekt" : "projekty"}`}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-30 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateProjects?.(note.id, []);
                          onUpdateProject?.(note.id, null);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          currentProjectIds.length === 0 ? "bg-slate-100 dark:bg-slate-700 font-bold text-slate-900 dark:text-white" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span>Brak projektów</span>
                        {currentProjectIds.length === 0 && <Check className="w-3.5 h-3.5 text-blue-500" />}
                      </button>

                      {projects.map((p) => {
                        const isSelected = currentProjectIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              let updated: string[];
                              if (isSelected) {
                                updated = currentProjectIds.filter((id) => id !== p.id);
                              } else {
                                updated = [...currentProjectIds, p.id];
                              }
                              if (onUpdateProjects) {
                                onUpdateProjects(note.id, updated);
                              } else if (onUpdateProject) {
                                onUpdateProject(note.id, updated.length > 0 ? updated[0] : null);
                              }
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                              isSelected ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || "#3b82f6" }}></span>
                              <span className="truncate">{p.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {formatNoteDate(note.created_at)}
              </span>
            </div>
            <button 
              type="button"
              onClick={() => onTogglePin?.(note.id, !!note.is_pinned)}
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ${
                note.is_pinned
                  ? "text-amber-500 fill-amber-500 hover:text-amber-600 dark:text-amber-400 dark:fill-amber-400"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
              title={note.is_pinned ? "Odpnij notatkę" : "Przypnij notatkę"}
            >
              <Pin className={`w-5 h-5 ${note.is_pinned ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Processing Status Banner */}
          {/* Invitation Banner */}
          {user && (localPending.includes(user.uid) || (user.email && localPending.includes(user.email))) && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-blue-900 shadow-sm">
              <div className="flex items-center space-x-2 font-medium">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Zostałeś zaproszony do współpracy przy tej notatce.</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={async () => {
                    setIsAccepting(true);
                    try {
                      await acceptNoteInvite(note.id);
                      setLocalPending(prev => prev.filter(id => id !== user.uid && id !== user.email));
                      setLocalAssignees(prev => [...prev, user.uid]);
                      // Optionally trigger a refresh of the notes list here, but local state updates the UI for now.
                    } catch (e) {
                      console.error("Błąd akceptacji", e);
                    } finally {
                      setIsAccepting(false);
                    }
                  }}
                  disabled={isAccepting}
                  className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isAccepting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Akceptuj"}
                </button>
                <button
                  onClick={async () => {
                    setIsAccepting(true);
                    try {
                      await rejectNoteInvite(note.id);
                      setLocalPending(prev => prev.filter(id => id !== user.uid && id !== user.email));
                      onClose();
                    } catch (e) {
                      console.error("Błąd odrzucania", e);
                    } finally {
                      setIsAccepting(false);
                    }
                  }}
                  disabled={isAccepting}
                  className="px-4 py-1.5 bg-white text-blue-600 font-semibold border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  Odrzuć
                </button>
              </div>
            </div>
          )}

          {note.processing_status === "pending" && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#D0D6B3]/50 border border-[#AAAE7F]/40 flex items-center space-x-2 text-xs font-semibold text-[#143109]">
              <Loader2 className="w-4 h-4 animate-spin text-[#143109]" />
              <span>Transkrypcja i synteza AI są w trakcie przetwarzania w tle...</span>
            </div>
          )}

          {(note.processing_status === "error_transcription" || note.processing_status === "error_ai") && (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#143109]">
              <div className="flex items-center space-x-2 font-semibold">
                <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0" />
                <span>Wystąpił błąd podczas analizy AI. Oryginalny plik/transkrypcja są bezpieczne w bazie.</span>
              </div>
              {onReanalyze && (
                <button
                  type="button"
                  onClick={() => onReanalyze(note.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold bg-[#143109] text-[#F7F7F7] px-3 py-1.5 rounded-xl hover:bg-[#143109]/90 transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Ponów analizę AI</span>
                </button>
              )}
            </div>
          )}

          {note.title && (
            <h2 className="text-2xl font-bold mb-4 text-[#143109] dark:text-white">
              {note.title}
            </h2>
          )}

          {/* Quick Assign Strip - AI-detected person suggestions */}
          {note.suggested_assignees && note.suggested_assignees.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#143109]/50">Sugestie AI:</span>
              {note.suggested_assignees.map((person) => {
                const isAssigned = localAssignees.includes(person) || localPending.includes(person);
                const displayName = getProfileName(person);
                return (
                  <button
                    key={person}
                    type="button"
                    onClick={() => handleToggleAssignee(person)}
                    className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      isAssigned
                        ? "bg-[#143109] text-[#F7F7F7] border-[#143109] shadow-sm"
                        : "bg-[#F7F7F7] text-[#143109] border-[#AAAE7F]/50 hover:bg-[#D0D6B3]/50 hover:border-[#AAAE7F]"
                    }`}
                    title={isAssigned ? `Odepnij ${displayName}` : `Przypisz: ${displayName}`}
                  >
                    {isAssigned ? (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="truncate max-w-[160px]">
                      {displayName}
                    </span>
                  </button>
                );
              })}
              {(localAssignees.length > 0 || localPending.length > 0) && (
                <AvatarStack assignees={[...localAssignees, ...localPending]} maxDisplay={4} size="sm" className="ml-1" />
              )}
            </div>
          )}

          <div 
            className="prose prose-slate dark:prose-invert max-w-none min-h-[100px]"
            onClick={() => {
              if (!isEditing) setIsEditing(true);
            }}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.currentTarget;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const value = target.value;
                    
                    const textBefore = value.substring(0, start);
                    const lines = textBefore.split('\n');
                    const currentLine = lines[lines.length - 1];
                    
                    const match = currentLine.match(/^(\s*)([-*]\s\[[ x]\]\s|[-*]\s|\d+\.\s)/i);
                    if (match) {
                      e.preventDefault();
                      const indent = match[1];
                      const prefix = match[2];
                      
                      if (currentLine.trim() === prefix.trim()) {
                        // Empty list item, remove it and exit list
                        const newTextBefore = lines.slice(0, -1).join('\n') + '\n' + indent;
                        setEditContent(newTextBefore + value.substring(end));
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newTextBefore.length;
                          }
                        }, 0);
                      } else {
                        // Add new list item
                        let newPrefix = prefix;
                        if (/^\d+\.\s/.test(prefix)) {
                          const num = parseInt(prefix, 10);
                          newPrefix = `${num + 1}. `;
                        } else if (/\[x\]/i.test(prefix)) {
                          newPrefix = prefix.replace(/x/i, ' '); // New checkbox is unchecked
                        }
                        
                        const insert = `\n${indent}${newPrefix}`;
                        setEditContent(textBefore + insert + value.substring(end));
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + insert.length;
                          }
                        }, 0);
                      }
                    }
                  }
                }}
                autoFocus
                className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 m-0 text-slate-700 dark:text-slate-300 font-sans text-sm leading-relaxed outline-none"
                placeholder="Wpisz treść notatki..."
              />
            ) : (
              <MarkdownRenderer
                content={note.content}
                onChange={(newContent) => handleNoteContentChange(note.id, newContent)}
              />
            )}
          </div>

          {/* Events */}
          {note.events && note.events.filter((_, i) => !(dismissedEvents || []).includes(i)).length > 0 && (
            <div className="mt-6 mb-2 space-y-3 relative z-10 border-t border-[#AAAE7F]/30 pt-4">
              <h3 className="text-sm font-semibold text-[#143109] dark:text-slate-200 mb-3 flex items-center">
                <CalendarDays className="w-4 h-4 mr-2 text-[#143109] dark:text-[#AAAE7F]" />
                Wykryte wydarzenia
              </h3>
              {note.events.map((event, idx) => {
                if ((dismissedEvents || []).includes(idx)) return null;
                const startStr = (event.date_start || "").replace(/[-:]/g, "");
                const endStr = (event.date_end || event.date_start || "").replace(/[-:]/g, "");
                
                let displayTime = "";
                if (event.date_start) {
                  try {
                    displayTime = new Date(event.date_start).toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' });
                    if (event.date_end) {
                      displayTime += ' - ' + new Date(event.date_end).toLocaleString('pl-PL', { timeStyle: 'short' });
                    }
                  } catch (e) {
                    displayTime = event.date_start;
                  }
                }

                return (
                  <div key={idx} className="group/event relative bg-[#D0D6B3]/40 dark:bg-slate-900/40 border border-[#AAAE7F]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setDismissedEvents(prev => [...(prev || []), idx])}
                      className="absolute top-2 right-2 p-0.5 rounded opacity-0 group-hover/event:opacity-100 transition-opacity bg-[#D0D6B3] text-[#143109] hover:bg-[#AAAE7F]"
                      title="Usuń propozycję"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 pr-5">
                      <div className="text-[#143109] dark:text-slate-200 font-bold text-base mb-1">
                        {event.title}
                      </div>
                      {displayTime && (
                        <div className="text-sm text-[#143109]/80 dark:text-[#AAAE7F] mb-2 font-medium">
                          {displayTime}
                        </div>
                      )}
                      {event.description && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {event.description}
                        </div>
                      )}
                    </div>
                    <a 
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}${event.description ? `&details=${encodeURIComponent(event.description)}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center whitespace-nowrap bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] px-4 py-2.5 rounded-lg font-bold transition-colors text-sm shadow-sm flex-shrink-0"
                      title="Dodaj do kalendarza Google"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Dodaj
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* Raw Transcript Section for Audio/Video notes */}
          {(isAudio || isVideo || note.raw_transcript) && (
            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Pełna surowa transkrypcja ({isAudio ? 'Audio' : isVideo ? 'Wideo' : 'Nagranie'})</span>
                  {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const textToCopy = note.raw_transcript || note.content;
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedTranscript(true);
                      setTimeout(() => setCopiedTranscript(false), 2000);
                    }}
                    className="inline-flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors font-medium"
                    title="Kopiuj pełną transkrypcję do schowka"
                  >
                    {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTranscript ? 'Skopiowano' : 'Kopiuj'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!recipientEmail && user?.email) setRecipientEmail(user.email);
                      setShowEmailModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-semibold transition-colors shadow-sm"
                    title="Wyślij transkrypcję na adres e-mail"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Wyślij e-mail</span>
                  </button>
                </div>
              </div>

              {showTranscript && (
                <div className="bg-[#EFEFEF] dark:bg-slate-800/80 border border-[#AAAE7F]/40 rounded-xl p-4 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {note.raw_transcript || note.content}
                </div>
              )}
            </div>
          )}

          {/* Formatting Toolbar */}
          {showFormattingBar && isEditing && (
            <div className="absolute bottom-0 left-6 bg-[#EFEFEF] dark:bg-slate-800 border border-[#AAAE7F]/40 shadow-xl rounded-lg p-1.5 flex items-center space-x-1 animate-in slide-in-from-bottom-2 fade-in duration-200 z-10">
              <button type="button" onClick={() => toggleHeader(1)} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-[#143109] dark:text-slate-300 font-semibold" title="Nagłówek 1">
                H1
              </button>
              <button type="button" onClick={() => toggleHeader(2)} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-[#143109] dark:text-slate-300 font-semibold" title="Nagłówek 2">
                H2
              </button>
              <button type="button" onClick={() => toggleHeader(0)} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-[#143109] dark:text-slate-300 font-semibold flex items-center justify-center h-9 w-9" title="Zwykły tekst">
                Aa
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={() => applyFormatting("**", "**")} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Pogrubienie">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => applyFormatting("*", "*")} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Kursywa">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => applyFormatting("<u>", "</u>")} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Podkreślenie">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={() => toggleList('bullet')} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Lista wypunktowana">
                <List className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => toggleList('ordered')} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Lista numerowana">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => toggleList('todo')} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Lista zadań (Checkbox)">
                <ListTodo className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={clearFormatting} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Usuń formatowanie">
                <Eraser className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="px-6 py-3 border-t border-[#AAAE7F]/30 flex items-center justify-between bg-[#EFEFEF]/50 dark:bg-slate-900/20">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" title="Zmień kolor">
              <Palette className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors hidden sm:block" title="Przypomnij mi">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block" ref={assigneeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsAssigneeDropdownOpen((v) => !v)}
                className={`hover:bg-[#D0D6B3]/40 rounded-full p-2 transition-colors relative ${isAssigneeDropdownOpen ? 'bg-[#D0D6B3] text-[#143109]' : 'text-[#143109] dark:text-slate-400'}`}
                title="Przypisani użytkownicy"
              >
                <Users className="w-5 h-5" />
                {(localAssignees.length > 0 || localPending.length > 0) && (
                  <span className="bg-[#D0D6B3] text-[#143109] text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 absolute -top-1 -right-1 border border-white">
                    {localAssignees.length + localPending.length}
                  </span>
                )}
              </button>

              {isAssigneeDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-[#EFEFEF] border border-[#AAAE7F]/40 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-3.5 pt-3 pb-2 border-b border-[#AAAE7F]/20">
                    <p className="text-xs font-bold text-[#143109] mb-2">Przypisani</p>
                    {(localAssignees.length > 0 || localPending.length > 0) ? (
                      <div className="flex flex-wrap gap-1">
                        {[...localAssignees, ...localPending].map((a) => (
                          <div key={a} className="flex items-center bg-[#D0D6B3]/30 px-2 py-1 rounded-md text-xs">
                            <span className="font-medium text-[#143109] truncate max-w-[100px]">{getProfileName(a)}</span>
                            {localPending.includes(a) && <span className="ml-1 text-[9px] text-blue-600 font-bold uppercase">(Oczekuje)</span>}
                            <button onClick={() => handleToggleAssignee(a)} className="ml-0.5 text-[#143109]/60 hover:text-red-500 cursor-pointer">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#143109]/40 mb-2">Brak przypisanych</p>
                    )}
                    {localAssignees.length > 0 && <AvatarStack assignees={localAssignees} maxDisplay={5} size="sm" />}
                  </div>

                  {/* Team members suggestions */}
                  {teams.length > 0 && (
                    <div className="px-3.5 py-2 border-b border-[#AAAE7F]/20 max-h-36 overflow-y-auto">
                      <p className="text-[10px] font-bold text-[#143109]/50 uppercase tracking-wider mb-1.5">Z zespołów</p>
                      {teams.flatMap((t) => t.member_ids).filter((m, i, arr) => arr.indexOf(m) === i).map((memberId) => {
                        return (
                          <button
                            key={memberId}
                            onClick={() => handleToggleAssignee(memberId)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors ${
                              localAssignees.includes(memberId) || localPending.includes(memberId)
                                ? "bg-[#D0D6B3]/20 text-[#143109] font-medium"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="flex-1 truncate flex items-center">
                              {localAssignees.includes(memberId) ? (
                                <Check className="w-5 h-5 flex-shrink-0 mr-2" />
                              ) : (
                                <span className="w-5 h-5 flex-shrink-0" />
                              )}
                              <span className="truncate">{getProfileName(memberId)}</span>
                            </div>
                            {localPending.includes(memberId) && <span className="text-[9px] text-blue-600 font-bold uppercase">(Oczekuje)</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Email input */}
                  <div className="px-3.5 py-2.5">
                    <p className="text-[10px] font-bold text-[#143109]/50 uppercase tracking-wider mb-1.5">Dodaj e-mailem</p>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={assigneeInput}
                        onChange={(e) => setAssigneeInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddAssigneeEmail(); }}
                        className="flex-1 px-2.5 py-1.5 bg-[#F7F7F7] border border-[#AAAE7F]/30 rounded-lg text-xs text-[#143109] placeholder-[#143109]/30 focus:outline-none focus:border-[#143109] transition-colors"
                      />
                      <button
                        onClick={handleAddAssigneeEmail}
                        disabled={!assigneeInput.trim()}
                        className="bg-[#143109] text-[#F7F7F7] px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-[#143109]/90 transition-colors cursor-pointer"
                      >
                        Dodaj
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" title="Dodaj obraz">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" title="Archiwizuj">
              <Archive className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] transition-colors relative group" 
              title="Supermoc AI"
              onClick={() => setShowAiChat(true)}
            >
              <Sparkles className="w-5 h-5 text-[#143109]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#143109] rounded-full border-2 border-white dark:border-[#202124]"></span>
            </button>
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(true);
                setShowFormattingBar(!showFormattingBar);
              }}
              className={`rounded-full p-2 transition-colors ${
                showFormattingBar 
                  ? 'bg-[#D0D6B3] text-[#143109]' 
                  : 'hover:bg-[#D0D6B3]/40 text-[#143109] dark:text-slate-400'
              }`}
              title="Opcje formatowania"
            >
              <Baseline className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={menuRef}>
              <button 
                type="button" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" 
                title="Więcej"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#EFEFEF] dark:bg-slate-800 rounded-xl shadow-xl border border-[#AAAE7F]/40 overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      const newTitle = window.prompt("Podaj nowy tytuł notatki:", note.title || "");
                      if (newTitle !== null) {
                        onUpdateTitle?.(note.id, newTitle);
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[#143109] dark:text-slate-200 hover:bg-[#D0D6B3]/40 flex items-center space-x-3 border-b border-[#AAAE7F]/30 transition-colors"
                  >
                    <Type className="w-4 h-4" />
                    <span>Zmień tytuł</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      const currentLabel = note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type;
                      const newLabel = window.prompt("Podaj nową etykietę:", currentLabel);
                      if (newLabel !== null && newLabel.trim() !== "") {
                        onUpdateLabel?.(note.id, newLabel.trim());
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[#143109] dark:text-slate-200 hover:bg-[#D0D6B3]/40 flex items-center space-x-3 border-b border-[#AAAE7F]/30 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Zmień etykietę</span>
                  </button>

                  {onReanalyze && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onReanalyze(note.id);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[#143109] dark:text-slate-200 hover:bg-[#D0D6B3]/40 flex items-center space-x-3 border-b border-[#AAAE7F]/30 transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Ponów analizę AI</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (isEditing && editContent !== note.content) {
                        handleNoteContentChange(note.id, editContent);
                      }
                      onClose();
                      onDelete?.(note.id);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center space-x-3 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Usuń notatkę</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (isEditing && editContent !== note.content) {
                handleNoteContentChange(note.id, editContent);
              }
              onClose();
            }}
            className="px-6 py-2 bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>

      {showEmailModal && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#202124] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Wyślij transkrypcję e-mailem
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmailModal(false);
                  setEmailStatusMessage(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Wprowadź adres e-mail, na który ma zostać wysłana notatka wraz z pełną transkrypcją z nagrania.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adres e-mail odbiorcy
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="np. jan.kowalski@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {emailStatusMessage && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                  {emailStatusMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 space-x-2">
                <a
                  href={`mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(`[keepGoals] Pełna Transkrypcja: ${note.title || 'Notatka z nagrania'}`)}&body=${encodeURIComponent(`Cześć!\n\nPrzesyłamy pełną transkrypcję (słowo w słowo z nagrania) z aplikacji keepGoals.\n\n--- PEŁNA TRANSKRYPCJA (SŁOWO W SŁOWO Z NAGRANIA) ---\n${note.raw_transcript || note.content}\n\n${note.raw_transcript ? `--- PODSUMOWANIE I ZADANIA AI ---\n${note.content}` : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                  title="Otwórz domyślny program pocztowy z gotową wiadomością"
                >
                  Program pocztowy
                </a>

                <button
                  type="button"
                  disabled={isSendingEmail || !recipientEmail.trim()}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setIsSendingEmail(true);
                    setEmailStatusMessage(null);
                    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodeURIComponent(`[keepGoals] Pełna Transkrypcja: ${note.title || 'Notatka z nagrania'}`)}&body=${encodeURIComponent(`Cześć!\n\nPrzesyłamy pełną transkrypcję (słowo w słowo z nagrania) z aplikacji keepGoals.\n\n--- PEŁNA TRANSKRYPCJA (SŁOWO W SŁOWO Z NAGRANIA) ---\n${note.raw_transcript || note.content}\n\n${note.raw_transcript ? `--- PODSUMOWANIE I ZADANIA AI ---\n${note.content}` : ''}`)}`;
                    
                    try {
                      const res = await sendNoteEmail(note.id, recipientEmail.trim());
                      setEmailStatusMessage(res.message);
                    } catch (err: any) {
                      const errorMsg = err.message || 'Brak serwera SMTP w .env.';
                      setEmailStatusMessage(`${errorMsg} Otwieram program pocztowy...`);
                      // Auto fallback to client mail app
                      setTimeout(() => {
                        window.location.href = mailtoUrl;
                      }, 500);
                    } finally {
                      setIsSendingEmail(false);
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Wysyłanie...' : 'Wyślij teraz'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAiChat && (
        <NoteAIChatModal
          note={{ ...note, content: editContent }} // przekaż aktualnie edytowaną treść
          onClose={() => setShowAiChat(false)}
          onNoteUpdated={(updatedNote) => {
            setEditContent(updatedNote.content);
            handleNoteContentChange(updatedNote.id, updatedNote.content);
          }}
        />
      )}
    </div>
  );
};

```


## frontend/src/layouts/MainLayout.tsx <a name="file-frontend-src-layouts-MainLayout-tsx"></a>

```tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MobileTopBar } from '../components/MobileTopBar';
import { MobileBottomBar } from '../components/MobileBottomBar';
import { MediaRecorderBase } from '../components/MediaRecorderBase';
import { TimezoneModal } from '../components/TimezoneModal';
import { fetchUserSettings, updateUserSettings } from '../services/api';
import { getBrowserTimezone } from '../utils/dateUtils';
import { X } from 'lucide-react';

export interface MainLayoutContextType {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isGridView: boolean;
  setIsGridView: React.Dispatch<React.SetStateAction<boolean>>;
  isAudioRecorderOpen: boolean;
  setIsAudioRecorderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTrigger: number;
  triggerRefresh: () => void;
  userTimezone: string;
}

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>("Europe/Warsaw");
  const [detectedTimezone, setDetectedTimezone] = useState<string>("");
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const checkTimezone = async () => {
      try {
        const settings = await fetchUserSettings();
        const storedTz = settings.timezone || "Europe/Warsaw";
        setUserTimezone(storedTz);

        const browserTz = getBrowserTimezone();
        if (browserTz && storedTz && browserTz !== storedTz) {
          setDetectedTimezone(browserTz);
          setIsTimezoneModalOpen(true);
        }
      } catch (err) {
        console.error("Błąd podczas sprawdzania strefy czasowej:", err);
      }
    };
    checkTimezone();
  }, []);

  const handleConfirmTimezone = async (newTz: string) => {
    try {
      await updateUserSettings({ timezone: newTz });
      setUserTimezone(newTz);
      setIsTimezoneModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error("Błąd zapisu nowej strefy czasowej:", err);
      setIsTimezoneModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F7] dark:bg-slate-900 font-sans text-[#143109] dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex h-full flex-shrink-0 transition-all duration-200 relative ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-[#F7F7F7] dark:bg-slate-800 z-10 shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Zamknij menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F7F7F7] dark:bg-slate-800 relative">
        {/* Mobile Top Navigation Bar */}
        <MobileTopBar
          onOpenMenu={() => setMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isGridView={isGridView}
          onToggleView={() => setIsGridView((prev) => !prev)}
        />

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet context={{
            searchQuery,
            setSearchQuery,
            isGridView,
            setIsGridView,
            isAudioRecorderOpen,
            setIsAudioRecorderOpen,
            refreshTrigger,
            triggerRefresh,
            userTimezone,
          } satisfies MainLayoutContextType} />
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomBar
          onNewNote={() => {
            const inputEl = document.getElementById("keep-input-bar");
            if (inputEl) {
              inputEl.scrollIntoView({ behavior: "smooth" });
              inputEl.focus();
            }
          }}
          onNewAudio={() => setIsAudioRecorderOpen(true)}
        />

        {/* MediaRecorderBase modal integration for mobile voice notes */}
        <MediaRecorderBase
          isOpenExternal={isAudioRecorderOpen}
          onCloseExternal={() => setIsAudioRecorderOpen(false)}
          onUploadSuccess={() => {
            setIsAudioRecorderOpen(false);
            triggerRefresh();
          }}
        />

        {/* Timezone detection modal */}
        <TimezoneModal
          isOpen={isTimezoneModalOpen}
          detectedTimezone={detectedTimezone}
          currentTimezone={userTimezone}
          onConfirm={handleConfirmTimezone}
          onKeepCurrent={() => setIsTimezoneModalOpen(false)}
        />
      </div>
    </div>
  );
};


```


## frontend/src/pages/Settings.tsx <a name="file-frontend-src-pages-Settings-tsx"></a>

```tsx
import React, { useState, useEffect } from 'react';
import { fetchUserSettings, updateUserSettings } from '../services/api';

export const Settings: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [timezone, setTimezone] = useState<string>("Europe/Warsaw");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await fetchUserSettings();
      setRetentionDays(settings.trash_retention_days);
      if (settings.timezone) {
        setTimezone(settings.timezone);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
      setMessage('Błąd wczytywania ustawień.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateUserSettings({ trash_retention_days: retentionDays, timezone });
      setMessage('Ustawienia zapisane pomyślnie.');
    } catch (error) {
      console.error('Failed to save settings', error);
      setMessage('Błąd zapisywania ustawień.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center space-x-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-800 dark:text-slate-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Ustawienia
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
            Opcje kosza (Trash)
          </h2>
          
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Zdecyduj, po jakim czasie notatki usunięte do kosza będą trwale usuwane (bez możliwości przywrócenia).
            </p>

            <div className="flex flex-col space-y-3 mt-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="retention"
                  value={7}
                  checked={retentionDays === 7}
                  onChange={() => setRetentionDays(7)}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 dark:focus:ring-white dark:border-slate-600 dark:checked:bg-white"
                />
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Po 7 dniach
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="retention"
                  value={30}
                  checked={retentionDays === 30}
                  onChange={() => setRetentionDays(30)}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 dark:focus:ring-white dark:border-slate-600 dark:checked:bg-white"
                />
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Po 30 dniach (domyślnie)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="retention"
                  value={0}
                  checked={retentionDays === 0}
                  onChange={() => setRetentionDays(0)}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 dark:focus:ring-white dark:border-slate-600 dark:checked:bg-white"
                />
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Nigdy (wymaga ręcznego czyszczenia kosza)
                </span>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
              Strefa czasowa (Timezone)
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Wybierz strefę czasową do przeliczania terminów z transkrypcji AI oraz kalendarza.
            </p>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full max-w-md p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-[#143109] outline-none"
            >
              <option value="Europe/Warsaw">Europe/Warsaw (UTC+1/UTC+2)</option>
              <option value="Europe/London">Europe/London (UTC+0/UTC+1)</option>
              <option value="Europe/Berlin">Europe/Berlin (UTC+1/UTC+2)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Chicago">America/Chicago (CST/CDT)</option>
              <option value="America/Denver">America/Denver (MST/MDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
            </select>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className={`text-sm ${message.includes('Błąd') ? 'text-rose-500' : 'text-emerald-500'}`}>
              {message}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

```


## frontend/src/pages/Projects.tsx <a name="file-frontend-src-pages-Projects-tsx"></a>

```tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, Trash2, Layers, Check, X, AlertCircle } from "lucide-react";
import { fetchProjects, createProject, deleteProject } from "../services/api";
import type { Project } from "../services/api";

const PRESET_COLORS = [
  { name: "Black Forest", hex: "#143109" },
  { name: "Dry Sage", hex: "#AAAE7F" },
  { name: "Beige", hex: "#D0D6B3" },
  { name: "Bright Snow", hex: "#F7F7F7" },
  { name: "Platinum", hex: "#EFEFEF" },
];

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#143109");
  const [isCreating, setIsCreating] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Błąd pobierania listy projektów");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsCreating(true);
      await createProject({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        status: "active",
      });
      setName("");
      setDescription("");
      setSelectedColor("#143109");
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      alert(err.message || "Nie udało się utworzyć projektu.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Czy na pewno chcesz usunąć projekt "${projectName}"? Notatki nie zostaną usunięte.`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      loadProjects();
    } catch (err: any) {
      alert(err.message || "Błąd podczas usuwania projektu.");
    }
  };

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#AAAE7F]/30 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-7 h-7 text-[#143109] dark:text-[#AAAE7F]" />
            <h1 className="text-2xl font-extrabold text-[#143109] dark:text-[#F7F7F7]">Projekty</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Organizuj powiązane notatki, transkrypcje i zadania w dedykowanych obszarach projektowych.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nowy Projekt</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-[#EFEFEF] dark:bg-[#143109]/40 rounded-2xl p-5 border border-[#AAAE7F]/30 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-1">Błąd połączenia</p>
          <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#EFEFEF] dark:bg-[#202124] rounded-3xl p-12 border border-[#AAAE7F]/30 text-center text-slate-400 dark:text-slate-500 shadow-sm max-w-xl mx-auto my-12">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-70 text-[#143109] dark:text-[#AAAE7F]" />
          <h3 className="text-lg font-bold text-[#143109] dark:text-[#F7F7F7] mb-1">Brak aktywnych projektów</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
            Utwórz swój pierwszy projekt, aby pogrupować notatki i ustalenia w jednym miejscu.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Utwórz Projekt</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ borderTopColor: project.color || "#143109" }}
              className="group relative bg-[#EFEFEF] dark:bg-[#202124] rounded-2xl border border-slate-200/80 dark:border-slate-800 border-t-4 p-5 hover:shadow-xl hover:border-[#AAAE7F] transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-[#143109] dark:text-white leading-snug line-clamp-1 group-hover:text-[#AAAE7F] transition-colors">
                    {project.name}
                  </h3>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-all cursor-pointer flex-shrink-0"
                    title="Usuń projekt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{project.notes_count || 0} notatek</span>
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D0D6B3] text-[#143109] border border-[#AAAE7F]/40">
                  Aktywny
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Nowy Projekt */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#202124] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-[#143109] dark:text-[#AAAE7F]" />
                <h3 className="text-lg font-bold text-[#143109] dark:text-white">Nowy Projekt</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nazwa projektu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Nowa Kolekcja Jesienna 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#AAAE7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Opis (opcjonalny)
                </label>
                <textarea
                  rows={3}
                  placeholder="Krótki opis celów i zakresu projektu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#AAAE7F] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Kolor akcentu
                </label>
                <div className="flex items-center space-x-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer border border-slate-300 dark:border-slate-600 ${
                        selectedColor === c.hex ? "ring-2 ring-offset-2 ring-[#143109] scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      title={c.name}
                    >
                      {selectedColor === c.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Anuluj
                </button>

                <button
                  type="submit"
                  disabled={isCreating || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-[#143109] hover:bg-[#143109]/90 disabled:opacity-50 text-[#F7F7F7] font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {isCreating ? "Tworzenie..." : "Stwórz projekt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

```


## frontend/src/pages/Goals.tsx <a name="file-frontend-src-pages-Goals-tsx"></a>

```tsx
import React from "react";
import { Link } from "react-router-dom";
import { Target, Lock, ArrowLeft } from "lucide-react";

export const Goals: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Target className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-800">
          <Lock className="w-4 h-4" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
        Moduł "Goals" jest wkrótce dostępny
      </h1>
      
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
        Obecnie pracujemy nad optymalizacją modułu zarządzania celami strategicznymi oraz integracją z AI. Ta funkcja zostanie udostępniona w nadchodzącej aktualizacji.
      </p>

      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-sm transition-colors duration-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Wróć do Notatek (keep)</span>
      </Link>
    </div>
  );
};

```


## frontend/src/pages/Login.tsx <a name="file-frontend-src-pages-Login-tsx"></a>

```tsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isDemoMode } from "../config/firebase";

export const Login: React.FC = () => {
  const { user, loginWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSocialLogin = async (providerName: string, loginFn: () => Promise<void>) => {
    try {
      setError(null);
      await loginFn();
      navigate("/");
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/configuration-not-found') {
        setError("Usługa Firebase Authentication nie jest jeszcze włączona. Aktywuj ją w konsoli Firebase (Build -> Authentication -> Rozpocznij).");
      } else {
        setError(`Logowanie przez ${providerName} nie powiodło się. Wypróbuj e-mail lub zaloguj się ponownie.`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Podaj adres e-mail oraz hasło.");
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        setError("Hasło powinno składać się z co najmniej 6 znaków.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Hasła nie są identyczne.");
        return;
      }
    }
    
    setIsLoading(true);
    try {
      if (isRegistering) {
        await signUpWithEmail(email, password, displayName.trim() || undefined);
      } else {
        await loginWithEmail(email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      const code = err.code || "";
      if (code === 'auth/configuration-not-found') {
        setError("Usługa Firebase Authentication nie jest włączona w Twoim projekcie Firebase. Wejdź na console.firebase.google.com -> sekcja 'Authentication' -> kliknij 'Rozpocznij' i włącz metodę Email/Hasło.");
      } else if (code === 'auth/weak-password') {
        setError("Hasło jest zbyt słabe (wymagane minimum 6 znaków).");
      } else if (code === 'auth/invalid-email') {
        setError("Niepoprawny format adresu e-mail.");
      } else if (code === 'auth/email-already-in-use') {
        setError("Konto z tym adresem e-mail już istnieje. Przełącz na zakładkę 'Zaloguj się'.");
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError("Nieprawidłowy adres e-mail lub hasło.");
      } else {
        setError(err.message || "Wystąpił błąd autoryzacji. Spróbuj ponownie.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-bg-light dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[24px] shadow-sm p-6 sm:p-8 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
        
        <div className="h-14 w-14 bg-pastel-blue-light text-pastel-blue-dark rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          keepGoals
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
          Aplikacja do zarządzania celami i notatkami z AI
        </p>

        {/* Tab Selection */}
        <div className="flex w-full bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isRegistering
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Zaloguj się
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isRegistering
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Załóż konto
          </button>
        </div>

        {/* Formularz Email/Hasło */}
        <form onSubmit={handleSubmit} className="w-full mb-6">
          <div className="space-y-3 text-left">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Twoje Imię</label>
                <input
                  type="text"
                  placeholder="np. Jan Kowalski"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Adres E-mail</label>
              <input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Hasło</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                required
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Powtórz Hasło</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-5 bg-pastel-blue-dark hover:bg-blue-600 active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? "Przetwarzanie..." : isRegistering ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </form>

        <div className="w-full flex items-center mb-6">
          <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
          <span className="px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">LUB</span>
          <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
        </div>

        {/* Przyciski Social */}
        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("Google", loginWithGoogle)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-6 rounded-xl font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center space-x-3 cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Zaloguj przez Google</span>
          </button>
        </div>

        {error && (
          <div className="text-xs text-rose-600 dark:text-rose-400 mt-5 font-medium bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 py-2.5 px-4 rounded-xl w-full text-left">
            ⚠️ {error}
          </div>
        )}

        {isDemoMode && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-left">
            <span className="font-bold">Tryb podglądu (Demo):</span> Wpisz dowolny e-mail i hasło lub wybierz Google. Aby aktywować produktywne Firebase Auth na żywo, uzupełnij klucze w `frontend/.env`.
          </div>
        )}
      </div>
    </div>
  );
};

```


## frontend/src/pages/Dashboard.tsx <a name="file-frontend-src-pages-Dashboard-tsx"></a>

```tsx
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchNotes, fetchProjects, updateNote, deleteNote, reorderNotes, reanalyzeNote } from "../services/api";
import type { Note, Project } from "../services/api";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KeepInputBar } from "../components/KeepInputBar";
import { NoteCard, NoteCardSkeleton } from "../components/NoteCard";
import { NoteModal } from "../components/NoteModal";
import type { MainLayoutContextType } from "../layouts/MainLayout";
import { useUserProfiles } from "../contexts/UserProfilesContext";

export const Dashboard: React.FC = () => {
  const context = useOutletContext<MainLayoutContextType | null>();
  const { fetchProfiles } = useUserProfiles();
  const searchQuery = context?.searchQuery || "";
  const isGridView = context?.isGridView ?? true;
  const refreshTrigger = context?.refreshTrigger || 0;

  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  const loadNotes = () => {
    setLoading(true);
    fetchProjects().then(setProjects).catch(console.error);
    fetchNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nie udało się pobrać notatek. Upewnij się, że backend jest połączony.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  useEffect(() => {
    const uids = new Set<string>();
    notes.forEach((note) => {
      if (note.user_id) uids.add(note.user_id);
      note.assigned_user_ids?.forEach((uid) => uids.add(uid));
      note.pending_user_ids?.forEach((uid) => uids.add(uid));
    });
    fetchProfiles(Array.from(uids));
  }, [notes, fetchProfiles]);

  const handleNoteContentChange = async (noteId: string, newContent: string) => {
    // Optimistic UI update
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, content: newContent } : n))
    );
    try {
      await updateNote(noteId, { content: newContent });
    } catch (e) {
      console.error("Failed to update note content:", e);
      loadNotes(); // rollback
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, is_pinned: newPinned } : n))
    );
    try {
      await updateNote(noteId, { is_pinned: newPinned });
    } catch (e) {
      console.error("Failed to toggle pin status:", e);
      loadNotes(); // rollback
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę notatkę?")) return;
    
    // Optimistic UI update
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    
    try {
      await deleteNote(noteId);
    } catch (e) {
      console.error("Failed to delete note:", e);
      loadNotes(); // rollback
      alert("Nie udało się usunąć notatki.");
    }
  };

  const handleUpdateTitle = async (noteId: string, newTitle: string) => {
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n)));
    try {
      await updateNote(noteId, { title: newTitle });
    } catch (e) {
      console.error("Failed to update title:", e);
      loadNotes();
    }
  };

  const handleUpdateLabel = async (noteId: string, newLabel: string) => {
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === noteId ? { ...n, note_type: newLabel } : n)));
    try {
      await updateNote(noteId, { note_type: newLabel });
    } catch (e) {
      console.error("Failed to update label:", e);
      loadNotes();
    }
  };

  const handleUpdateProject = async (noteId: string, projectId: string | null) => {
    const pids = projectId ? [projectId] : [];
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, project_ids: pids, project_id: projectId || undefined } : n))
    );
    try {
      await updateNote(noteId, { project_id: projectId, project_ids: pids });
      fetchProjects().then(setProjects).catch(console.error);
    } catch (e) {
      console.error("Failed to update note project:", e);
      loadNotes();
    }
  };

  const handleUpdateProjects = async (noteId: string, projectIds: string[]) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, project_ids: projectIds, project_id: projectIds[0] || undefined } : n))
    );
    try {
      await updateNote(noteId, { project_ids: projectIds, project_id: projectIds[0] || null });
      fetchProjects().then(setProjects).catch(console.error);
    } catch (e) {
      console.error("Failed to update note projects:", e);
      loadNotes();
    }
  };

  const handleReanalyzeNote = async (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, processing_status: "pending" } : n))
    );
    try {
      await reanalyzeNote(noteId);
      setTimeout(() => loadNotes(), 2500);
    } catch (e) {
      console.error("Failed to reanalyze note:", e);
      loadNotes();
    }
  };

  const formatNoteDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Notes are already sorted by the backend (by order, then created_at)
  const sortedNotes = notes;

  // Quick notes: exclude strategic goals and AI-generated morning/evening plans/reflections
  const quickNotes = sortedNotes.filter((n) => {
    const isStrategic = n.note_type === "strategic";
    const isAiPlan = n.note_type === "daily_morning" && n.title === "Plan Poranny";
    const isAiReflection = n.note_type === "daily_evening" && n.title === "Refleksja Wieczorna";
    return !isStrategic && !isAiPlan && !isAiReflection;
  });

  // Apply search query filtering
  const filteredNotes = quickNotes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = n.title ? n.title.toLowerCase().includes(q) : false;
    const contentMatch = n.content.toLowerCase().includes(q);
    return titleMatch || contentMatch;
  });

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const otherNotes = filteredNotes.filter((n) => !n.is_pinned);

  // Użycie układowi typu Masonry (columns-1 ... columns-6), aby notatki ułożyły się naturalnie
  // i wypełniały całą przestrzeń bez tworzenia sztucznych poziomych rzędów o równej wysokości.
  const gridClass = isGridView
    ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4"
    : "flex flex-col max-w-2xl mx-auto gap-4";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setNotes((prevNotes) => {
      const oldIndex = prevNotes.findIndex((n) => n.id === active.id);
      const newIndex = prevNotes.findIndex((n) => n.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevNotes;

      const newNotes = [...prevNotes];
      const [movedNote] = newNotes.splice(oldIndex, 1);
      newNotes.splice(newIndex, 0, movedNote);

      // Re-assign order based on new array indices
      const updates = newNotes.map((n, idx) => ({ id: n.id, order: idx }));
      
      // Update state optimistically
      const updatedNotesState = newNotes.map((n, idx) => ({ ...n, order: idx }));
      
      // Send API request in background
      reorderNotes(updates).catch((err) => {
        console.error("Failed to reorder notes on server:", err);
        loadNotes(); // Revert on failure
      });

      return updatedNotesState;
    });
  };

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8">
      {/* Keep input bar mounted at the top center */}
      <KeepInputBar onSuccess={loadNotes} />

      {loading ? (
        <div className={gridClass + " mt-8"}>
          {[...Array(6)].map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8">
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">Błąd pobierania danych</p>
          <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-[#EFEFEF] dark:bg-slate-800 rounded-[24px] p-12 border border-[#AAAE7F]/30 text-center text-[#143109]/70 shadow-sm mt-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-lg font-semibold text-[#143109]">
            {searchQuery ? "Brak notatek pasujących do wyszukiwania." : "Brak notatek. Wpisz coś powyżej, aby utworzyć szybką notatkę."}
          </p>
        </div>
      ) : (
        <section className="space-y-6 mt-8">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#143109]/70 dark:text-slate-400 px-1">
                  PRZYPIĘTE
                </h3>
                <div className={gridClass}>
                  <SortableContext items={pinnedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        projects={projects}
                        formatNoteDate={formatNoteDate}
                        handleNoteContentChange={handleNoteContentChange}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDeleteNote}
                        onUpdateTitle={handleUpdateTitle}
                        onUpdateLabel={handleUpdateLabel}
                        onUpdateProject={handleUpdateProject}
                        onUpdateProjects={handleUpdateProjects}
                        onReanalyze={handleReanalyzeNote}
                        onClick={(id) => setSelectedNoteId(id)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}

            {/* Unpinned / Other Notes Section */}
            {otherNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 pt-2">
                    INNE
                  </h3>
                )}
                <div className={gridClass}>
                  <SortableContext items={otherNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
                    {otherNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        projects={projects}
                        formatNoteDate={formatNoteDate}
                        handleNoteContentChange={handleNoteContentChange}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDeleteNote}
                        onUpdateTitle={handleUpdateTitle}
                        onUpdateLabel={handleUpdateLabel}
                        onUpdateProject={handleUpdateProject}
                        onUpdateProjects={handleUpdateProjects}
                        onReanalyze={handleReanalyzeNote}
                        onClick={(id) => setSelectedNoteId(id)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}
          </DndContext>
        </section>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          projects={projects}
          onClose={() => setSelectedNoteId(null)}
          formatNoteDate={formatNoteDate}
          handleNoteContentChange={handleNoteContentChange}
          onTogglePin={handleTogglePin}
          onDelete={handleDeleteNote}
          onUpdateTitle={handleUpdateTitle}
          onUpdateLabel={handleUpdateLabel}
          onUpdateProject={handleUpdateProject}
          onUpdateProjects={handleUpdateProjects}
          onReanalyze={handleReanalyzeNote}
        />
      )}
    </main>
  );
};

```


## frontend/src/pages/ProjectDetail.tsx <a name="file-frontend-src-pages-ProjectDetail-tsx"></a>

```tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderKanban, Layers, AlertCircle, CalendarDays } from "lucide-react";
import { fetchProjectDetails, fetchProjects, updateNote, deleteNote, reanalyzeNote } from "../services/api";
import type { Project, Note } from "../services/api";
import { KeepInputBar } from "../components/KeepInputBar";
import { NoteCard } from "../components/NoteCard";
import { NoteModal } from "../components/NoteModal";
import { ProjectTimelineDrawer } from "../components/ProjectTimelineDrawer";

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Selected note for detail modal
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      fetchProjects().then(setAllProjects).catch(console.error);
      const data = await fetchProjectDetails(id);
      setProject(data);
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message || "Błąd pobierania danych projektu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleReanalyzeNote = async (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, processing_status: "pending" } : n))
    );
    try {
      await reanalyzeNote(noteId);
      setTimeout(() => loadProjectData(), 2500);
    } catch (e) {
      console.error("Failed to reanalyze note:", e);
      loadProjectData();
    }
  };

  const formatNoteDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleNoteContentChange = async (noteId: string, newContent: string) => {
    try {
      await updateNote(noteId, { content: newContent });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, content: newContent } : n))
      );
    } catch (e) {
      console.error("Failed to update note content:", e);
      loadProjectData();
    }
  };

  const handleTogglePin = async (noteId: string, currentPinStatus: boolean) => {
    try {
      await updateNote(noteId, { is_pinned: !currentPinStatus });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, is_pinned: !currentPinStatus } : n))
      );
    } catch (e) {
      console.error("Failed to toggle pin:", e);
      loadProjectData();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNoteId === noteId) setSelectedNoteId(null);
    } catch (e) {
      console.error("Failed to delete note:", e);
      loadProjectData();
    }
  };

  const handleUpdateTitle = async (noteId: string, newTitle: string) => {
    try {
      await updateNote(noteId, { title: newTitle });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n))
      );
    } catch (e) {
      console.error("Failed to update title:", e);
      loadProjectData();
    }
  };

  const handleUpdateLabel = async (noteId: string, newLabel: string) => {
    try {
      await updateNote(noteId, { note_type: newLabel });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, note_type: newLabel } : n))
      );
    } catch (e) {
      console.error("Failed to update label:", e);
      loadProjectData();
    }
  };

  const handleUpdateProject = async (noteId: string, projectId: string | null) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId || projectId === id));
    try {
      await updateNote(noteId, { project_id: projectId });
      await loadProjectData();
    } catch (e) {
      console.error("Failed to update project:", e);
      loadProjectData();
    }
  };

  const handleUpdateProjects = async (noteId: string, projectIds: string[]) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId || (id && projectIds.includes(id))));
    try {
      await updateNote(noteId, { project_ids: projectIds, project_id: projectIds[0] || null });
      await loadProjectData();
    } catch (e) {
      console.error("Failed to update projects:", e);
      loadProjectData();
    }
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);

  const masonryClass = "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4";
  const displayProjects = allProjects.length > 0 ? allProjects : (project ? [project] : []);

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Back & Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót do projektów</span>
        </button>

        {loading ? (
          <div className="h-20 bg-white dark:bg-[#202124] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse"></div>
        ) : error || !project ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-700 dark:text-rose-300 font-semibold mb-1">Błąd ładownia projektu</p>
            <p className="text-xs text-rose-500 dark:text-rose-400">{error || "Projekt nie istnieje"}</p>
          </div>
        ) : (
          <div 
            style={{ borderLeftColor: project.color || "#3b82f6" }}
            className="bg-white dark:bg-[#202124] rounded-2xl border border-slate-200/80 dark:border-slate-800 border-l-4 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center space-x-2.5 mb-1.5">
                <FolderKanban className="w-6 h-6" style={{ color: project.color || "#3b82f6" }} />
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{project.name}</h1>
              </div>
              {project.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto flex-wrap gap-y-2">
              <button
                type="button"
                onClick={() => setIsTimelineOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#143109] dark:text-[#AAAE7F] bg-[#D0D6B3]/40 hover:bg-[#D0D6B3]/70 border border-[#AAAE7F]/40 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Otwórz oś czasu wydarzeń projektu"
              >
                <CalendarDays className="w-4 h-4 text-[#143109] dark:text-[#AAAE7F]" />
                <span>Oś czasu</span>
              </button>

              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-[#EFEFEF] dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>{notes.length} notatek</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#D0D6B3] text-[#143109] border border-[#AAAE7F]/40">
                Aktywny
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar pre-configured for this project */}
      {project && (
        <KeepInputBar onSuccess={loadProjectData} projectId={project.id} />
      )}

      {/* Notes Grid */}
      {!loading && project && (
        notes.length === 0 ? (
          <div className="bg-white dark:bg-[#202124] rounded-3xl p-12 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 shadow-sm max-w-lg mx-auto my-8">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brak notatek w tym projekcie
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Wpisz wiadomość lub utwórz nagranie w powyższym formularzu, aby dodać pierwszą notatkę do projektu.
            </p>
          </div>
        ) : (
          <section className="space-y-6 mt-6">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  PRZYPIĘTE
                </h3>
                <div className={masonryClass}>
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      projects={displayProjects}
                      formatNoteDate={formatNoteDate}
                      handleNoteContentChange={handleNoteContentChange}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDeleteNote}
                      onUpdateTitle={handleUpdateTitle}
                      onUpdateLabel={handleUpdateLabel}
                      onUpdateProject={handleUpdateProject}
                      onUpdateProjects={handleUpdateProjects}
                      onReanalyze={handleReanalyzeNote}
                      onClick={(id) => setSelectedNoteId(id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unpinned Notes */}
            {unpinnedNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 pt-2">
                    INNE NOTATKI PROJEKTOWE
                  </h3>
                )}
                <div className={masonryClass}>
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      projects={displayProjects}
                      formatNoteDate={formatNoteDate}
                      handleNoteContentChange={handleNoteContentChange}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDeleteNote}
                      onUpdateTitle={handleUpdateTitle}
                      onUpdateLabel={handleUpdateLabel}
                      onUpdateProject={handleUpdateProject}
                      onUpdateProjects={handleUpdateProjects}
                      onReanalyze={handleReanalyzeNote}
                      onClick={(id) => setSelectedNoteId(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          projects={displayProjects}
          onClose={() => setSelectedNoteId(null)}
          formatNoteDate={formatNoteDate}
          handleNoteContentChange={handleNoteContentChange}
          onTogglePin={handleTogglePin}
          onDelete={(id) => {
            handleDeleteNote(id);
            setSelectedNoteId(null);
          }}
          onUpdateTitle={handleUpdateTitle}
          onUpdateLabel={handleUpdateLabel}
          onUpdateProject={handleUpdateProject}
          onUpdateProjects={handleUpdateProjects}
          onReanalyze={handleReanalyzeNote}
        />
      )}

      {/* Project Timeline Drawer */}
      {project && (
        <ProjectTimelineDrawer
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          project={project}
          notes={notes}
          onSelectNote={(noteId) => setSelectedNoteId(noteId)}
        />
      )}
    </main>
  );
};

```


## frontend/src/pages/Teams.tsx <a name="file-frontend-src-pages-Teams-tsx"></a>

```tsx
import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, UserPlus, UserMinus, Loader2, X, Crown, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchTeams, createTeam, deleteTeam, addTeamMember, removeTeamMember } from "../services/api";
import type { Team } from "../services/api";
import { AvatarStack, getInitials } from "../components/AvatarStack";

export const Teams: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create team form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Add member
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTeams();
      setTeams(data);
    } catch (e) {
      setError("Nie udało się załadować zespołów.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    try {
      const team = await createTeam({ name: newTeamName.trim(), description: newTeamDesc.trim() || undefined });
      setTeams((prev) => [team, ...prev]);
      setNewTeamName("");
      setNewTeamDesc("");
      setShowCreateForm(false);
    } catch {
      setError("Nie udało się utworzyć zespołu.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten zespół?")) return;
    try {
      await deleteTeam(teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch {
      setError("Nie udało się usunąć zespołu.");
    }
  };

  const handleAddMember = async (teamId: string) => {
    if (!addMemberEmail.trim()) return;
    setIsAddingMember(true);
    setAddMemberError(null);
    try {
      const updated = await addTeamMember(teamId, addMemberEmail.trim());
      setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
      setAddMemberEmail("");
      setAddMemberTeamId(null);
    } catch {
      setAddMemberError("Nie udało się dodać członka. Sprawdź adres e-mail.");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    try {
      const updated = await removeTeamMember(teamId, memberId);
      setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
    } catch {
      setError("Nie udało się usunąć członka.");
    }
  };

  const BG_COLORS = [
    "bg-[#143109] text-[#F7F7F7]",
    "bg-[#AAAE7F] text-[#143109]",
    "bg-[#D0D6B3] text-[#143109]",
    "bg-slate-700 text-slate-100",
    "bg-amber-800 text-amber-100",
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#143109] rounded-2xl shadow-md">
              <Users className="w-6 h-6 text-[#F7F7F7]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#143109]">Zespoły</h1>
              <p className="text-sm text-[#143109]/60 mt-0.5">Zarządzaj współpracownikami i przypisaniami</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center space-x-2 bg-[#143109] text-[#F7F7F7] px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#143109]/90 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nowy zespół</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Create Team Form */}
        {showCreateForm && (
          <div className="mb-6 bg-[#EFEFEF] rounded-2xl border border-[#AAAE7F]/40 p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#143109] mb-4 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Utwórz nowy zespół</span>
            </h2>
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <input
                type="text"
                placeholder="Nazwa zespołu *"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#F7F7F7] border border-[#AAAE7F]/40 rounded-xl text-sm text-[#143109] placeholder-[#143109]/40 focus:outline-none focus:border-[#143109] transition-colors"
              />
              <input
                type="text"
                placeholder="Opis (opcjonalny)"
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F7F7F7] border border-[#AAAE7F]/40 rounded-xl text-sm text-[#143109] placeholder-[#143109]/40 focus:outline-none focus:border-[#143109] transition-colors"
              />
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center space-x-2 bg-[#143109] text-[#F7F7F7] px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#143109]/90 disabled:opacity-60 transition-all cursor-pointer active:scale-95"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Utwórz</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setNewTeamName(""); setNewTeamDesc(""); }}
                  className="px-4 py-2 text-sm font-semibold text-[#143109]/70 hover:text-[#143109] rounded-xl hover:bg-[#D0D6B3]/40 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#143109]/40" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && teams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-[#D0D6B3]/40 rounded-3xl mb-4">
              <Users className="w-10 h-10 text-[#143109]/40" />
            </div>
            <h3 className="text-lg font-bold text-[#143109]/60 mb-1">Brak zespołów</h3>
            <p className="text-sm text-[#143109]/40 max-w-xs">
              Utwórz swój pierwszy zespół, aby zacząć przypisywać notatki do współpracowników.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-5 inline-flex items-center space-x-2 bg-[#143109] text-[#F7F7F7] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#143109]/90 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Utwórz pierwszy zespół</span>
            </button>
          </div>
        )}

        {/* Teams List */}
        {!isLoading && teams.length > 0 && (
          <div className="space-y-4">
            {teams.map((team) => {
              const isOwner = team.owner_id === user?.uid;
              return (
                <div
                  key={team.id}
                  className="bg-[#EFEFEF] rounded-2xl border border-[#AAAE7F]/30 hover:border-[#AAAE7F] p-5 transition-all shadow-sm"
                >
                  {/* Team Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 bg-[#143109] rounded-xl flex-shrink-0">
                        <Users className="w-4 h-4 text-[#F7F7F7]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-[#143109] text-base truncate">{team.name}</h3>
                          {isOwner && (
                            <span title="Właściciel"><Crown className="w-3.5 h-3.5 text-[#AAAE7F] flex-shrink-0" /></span>
                          )}
                        </div>
                        {team.description && (
                          <p className="text-xs text-[#143109]/60 mt-0.5 truncate">{team.description}</p>
                        )}
                        <p className="text-[11px] text-[#143109]/40 mt-1">
                          {team.member_ids.length} {team.member_ids.length === 1 ? "członek" : "członków"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setAddMemberTeamId(team.id === addMemberTeamId ? null : team.id);
                          setAddMemberEmail("");
                          setAddMemberError(null);
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-[#F7F7F7] border border-[#AAAE7F]/40 hover:bg-[#D0D6B3]/40 text-[#143109] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Dodaj członka"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dodaj</span>
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Usuń zespół"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add Member Input */}
                  {addMemberTeamId === team.id && (
                    <div className="mb-4 p-3 bg-[#F7F7F7] rounded-xl border border-[#AAAE7F]/30">
                      <div className="flex items-center space-x-2">
                        <input
                          type="email"
                          placeholder="E-mail nowego członka"
                          value={addMemberEmail}
                          onChange={(e) => setAddMemberEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddMember(team.id); }}
                          className="flex-1 px-3 py-2 bg-[#EFEFEF] border border-[#AAAE7F]/30 rounded-lg text-sm text-[#143109] placeholder-[#143109]/40 focus:outline-none focus:border-[#143109] transition-colors"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddMember(team.id)}
                          disabled={isAddingMember || !addMemberEmail.trim()}
                          className="inline-flex items-center space-x-1 bg-[#143109] text-[#F7F7F7] px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-[#143109]/90 transition-colors cursor-pointer"
                        >
                          {isAddingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                          <span>Dodaj</span>
                        </button>
                        <button
                          onClick={() => { setAddMemberTeamId(null); setAddMemberError(null); }}
                          className="p-2 text-slate-400 hover:text-[#143109] rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {addMemberError && (
                        <p className="text-xs text-red-600 mt-1.5 flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{addMemberError}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Members */}
                  {team.member_ids.length === 0 ? (
                    <p className="text-xs text-[#143109]/40 italic py-2">Brak członków – dodaj pierwszego powyżej.</p>
                  ) : (
                    <div className="space-y-2">
                      {team.member_ids.map((memberId, idx) => {
                        const colorClass = BG_COLORS[idx % BG_COLORS.length];
                        const initials = getInitials(memberId);
                        return (
                          <div key={memberId} className="flex items-center justify-between group/member">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${colorClass}`}>
                                {initials}
                              </div>
                              <span className="text-sm text-[#143109] truncate max-w-[240px]">{memberId}</span>
                              {memberId === team.owner_id && (
                                <Crown className="w-3 h-3 text-[#AAAE7F] flex-shrink-0" />
                              )}
                            </div>
                            {isOwner && memberId !== user?.uid && (
                              <button
                                onClick={() => handleRemoveMember(team.id, memberId)}
                                className="opacity-0 group-hover/member:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                title="Usuń z zespołu"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Avatar Preview */}
                  {team.member_ids.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#AAAE7F]/20 flex items-center space-x-2">
                      <span className="text-[11px] text-[#143109]/40 font-medium">Podgląd:</span>
                      <AvatarStack assignees={team.member_ids} maxDisplay={5} size="md" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

```


## frontend/src/pages/Trash.tsx <a name="file-frontend-src-pages-Trash-tsx"></a>

```tsx
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchTrashNotes, restoreNote, hardDeleteNote } from "../services/api";
import type { Note } from "../services/api";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import type { MainLayoutContextType } from "../layouts/MainLayout";
import { RefreshCcw, Trash2 } from "lucide-react";

const TrashNoteCard: React.FC<{
  note: Note;
  formatNoteDate: (dateStr: string) => string;
  onRestore: (noteId: string) => void;
  onHardDelete: (noteId: string) => void;
}> = ({ note, formatNoteDate, onRestore, onHardDelete }) => {
  return (
    <div className="group relative bg-white dark:bg-[#202124] rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 text-slate-800 dark:text-slate-100 flex flex-col justify-between h-fit w-full">
      <div className="w-full opacity-70">
        <div className="flex justify-between items-start mb-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            Usunięto: {note.deleted_at ? formatNoteDate(note.deleted_at) : "Brak danych"}
          </span>
        </div>

        {note.title && (
          <h3 className="text-base font-medium mb-2 text-slate-800 dark:text-slate-100 leading-snug line-through">
            {note.title}
          </h3>
        )}

        <div className="relative prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 max-h-[360px] overflow-hidden line-through">
          <MarkdownRenderer
            content={note.content}
            onChange={() => Promise.resolve()} // read only
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-[#202124] to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 space-x-2">
        <button
          onClick={() => onRestore(note.id)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Przywróć</span>
        </button>
        <button
          onClick={() => {
            if (window.confirm("Czy na pewno chcesz trwale usunąć tę notatkę? Tej operacji nie można cofnąć.")) {
              onHardDelete(note.id);
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          <span>Usuń trwale</span>
        </button>
      </div>
    </div>
  );
};

export const Trash: React.FC = () => {
  const context = useOutletContext<MainLayoutContextType | null>();
  const isGridView = context?.isGridView ?? true;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = () => {
    setLoading(true);
    fetchTrashNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nie udało się pobrać notatek z kosza.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleRestore = async (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    try {
      await restoreNote(noteId);
    } catch (e) {
      console.error("Failed to restore note:", e);
      loadNotes(); 
    }
  };

  const handleHardDelete = async (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    try {
      await hardDeleteNote(noteId);
    } catch (e) {
      console.error("Failed to permanently delete note:", e);
      loadNotes(); 
    }
  };

  const formatNoteDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const gridClass = isGridView
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 items-start"
    : "flex flex-col max-w-2xl mx-auto gap-4";

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Trash2 className="w-8 h-8 text-slate-800 dark:text-slate-200" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Kosz
        </h1>
      </div>
      
      <p className="text-slate-500 mb-8 italic">
        Notatki w koszu są usuwane automatycznie zgodnie z konfiguracją w Ustawieniach.
      </p>

      {loading ? (
        <div className="flex justify-center mt-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8">
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">Błąd pobierania danych</p>
          <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-12 border border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 shadow-sm mt-8 max-w-2xl mx-auto">
          <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Kosz jest pusty.</p>
        </div>
      ) : (
        <div className={gridClass}>
          {notes.map((note) => (
            <TrashNoteCard
              key={note.id}
              note={note}
              formatNoteDate={formatNoteDate}
              onRestore={handleRestore}
              onHardDelete={handleHardDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
};

```


## frontend/src/config/firebase.ts <a name="file-frontend-src-config-firebase-ts"></a>

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY;

let appInstance: any = null;
let authInstance: any = null;

if (!isDemoMode) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
} else {
  console.warn("Uruchomiono w trybie DEMO (brak kluczy Firebase).");
  authInstance = {
    currentUser: null,
  };
}

export const auth = authInstance;

export function setDemoCurrentUser(user: any) {
  if (isDemoMode) {
    auth.currentUser = user;
  }
}


```


## frontend/src/utils/dateUtils.ts <a name="file-frontend-src-utils-dateUtils-ts"></a>

```ts
export function formatInTimezone(
  dateInput: string | Date | number,
  timeZone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    const tz = timeZone || getBrowserTimezone();
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Intl.DateTimeFormat("pl-PL", {
      ...defaultOptions,
      timeZone: tz,
    }).format(date);
  } catch (e) {
    return String(dateInput);
  }
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw";
  } catch (e) {
    return "Europe/Warsaw";
  }
}

```


## frontend/src/services/api.ts <a name="file-frontend-src-services-api-ts"></a>

```ts
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface NoteEvent {
  title: string;
  date_start: string;
  date_end: string;
  description?: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  note_type: 'strategic' | 'daily_morning' | 'daily_evening' | string;
  project_id?: string;
  project_ids?: string[];
  assigned_to?: string;
  assigned_user_ids?: string[];
  pending_user_ids?: string[];
  suggested_assignees?: string[];
  is_pinned?: boolean;
  user_id: string;
  created_at: string;
  media_url?: string;
  media_type?: string;
  raw_transcript?: string;
  processing_status?: 'completed' | 'pending' | 'error_transcription' | 'error_ai' | string;
  order?: number;
  is_deleted?: boolean;
  deleted_at?: string;
  events?: NoteEvent[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'archived' | 'completed';
  user_id: string;
  created_at: string;
  notes_count?: number;
  notes?: Note[];
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  color?: string;
  status?: 'active' | 'archived' | 'completed';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  member_ids: string[];
  created_at: string;
}

export interface TeamCreateData {
  name: string;
  description?: string;
  member_emails?: string[];
}

export interface UserSettings {
  trash_retention_days: number;
  timezone?: string;
}

export async function getAuthHeaders(isMultipart = false): Promise<HeadersInit> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function fetchNotes(projectId?: string): Promise<Note[]> {
  const headers = await getAuthHeaders();
  const url = projectId 
    ? `${API_URL}/api/v1/notes?project_id=${projectId}`
    : `${API_URL}/api/v1/notes`;
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Błąd pobierania notatek: ${response.status}`);
  }
  
  return response.json();
}

export async function createNote(noteData: { title?: string; content: string; note_type: string; is_pinned?: boolean; project_id?: string; project_ids?: string[] }): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error(`Błąd tworzenia notatki: ${response.status}`);
  }

  return response.json();
}

export async function updateNote(noteId: string, noteData: { title?: string; content?: string; note_type?: string; is_pinned?: boolean; project_id?: string | null; project_ids?: string[]; assigned_user_ids?: string[] }): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error(`Błąd aktualizacji notatki: ${response.status}`);
  }

  return response.json();
}

export async function generateMorningPlan(): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/plans/morning`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_code || `Błąd generowania planu: ${response.status}`);
  }

  return response.json();
}

export async function generateEveningReflection(reflectionData: {
  completed_tasks: string[];
  uncompleted_tasks: string[];
  avoided_habits: string[];
}): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/plans/evening`, {
    method: "POST",
    headers,
    body: JSON.stringify(reflectionData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_code || `Błąd generowania refleksji: ${response.status}`);
  }

  return response.json();
}

export async function uploadAudio(file: Blob | File): Promise<Note> {
  const headers = await getAuthHeaders(true);
  const formData = new FormData();
  const ext = (file.type.includes('mp4') || file.type.includes('m4a')) ? 'm4a' : 'webm';
  const fileName = (file as File).name || `recording.${ext}`;
  formData.append("file", file, fileName);

  const response = await fetch(`${API_URL}/api/v1/notes/audio`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Błąd wysyłania notatki audio: ${response.status}`);
  }

  return response.json();
}

export async function uploadVideo(file: Blob | File): Promise<Note> {
  const headers = await getAuthHeaders(true);
  const formData = new FormData();
  const ext = file.type.includes('mp4') ? 'mp4' : file.type.includes('quicktime') ? 'mov' : 'webm';
  const fileName = (file as File).name || `video.${ext}`;
  formData.append("file", file, fileName);

  const response = await fetch(`${API_URL}/api/v1/notes/video`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Błąd wysyłania notatki wideo: ${response.status}`);
  }

  return response.json();
}

export async function deleteNote(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania notatki: ${response.status}`);
  }
}

export async function fetchTrashNotes(): Promise<Note[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/trash`, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Błąd pobierania kosza: ${response.status}`);
  }
  
  return response.json();
}

export async function restoreNote(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/restore`, {
    method: "PUT",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd przywracania notatki: ${response.status}`);
  }
}

export async function hardDeleteNote(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/hard`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd trwałego usuwania notatki: ${response.status}`);
  }
}

export async function fetchUserSettings(): Promise<UserSettings> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/users/settings`, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Błąd pobierania ustawień: ${response.status}`);
  }
  
  return response.json();
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/users/settings`, {
    method: "PUT",
    headers,
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`Błąd zapisu ustawień: ${response.status}`);
  }

  return response.json();
}

export async function reorderNotes(updates: { id: string; order: number }[]): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/reorder`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ updates }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || "Błąd zmiany kolejności notatek");
  }

  return response.json();
}

export interface ChatMessage {
  role: 'user' | 'assistant' | string;
  content: string;
}

export async function chatAboutNote(noteId: string, messages: ChatMessage[]): Promise<{ response: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/ai-chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Błąd czatu AI: ${response.status}`);
  }

  return response.json();
}

export async function sendNoteEmail(noteId: string, email: string): Promise<{ success: boolean; sent_via_smtp: boolean; message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/send-email`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || `Błąd wysyłania e-maila: ${response.status}`);
  }

  return response.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania projektów: ${response.status}`);
  }

  return response.json();
}

export async function createProject(projectData: ProjectCreateData): Promise<Project> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error(`Błąd tworzenia projektu: ${response.status}`);
  }

  return response.json();
}

export async function fetchProjectDetails(projectId: string): Promise<Project> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania szczegółów projektu: ${response.status}`);
  }

  return response.json();
}

export async function deleteProject(projectId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania projektu: ${response.status}`);
  }
}

export async function reanalyzeNote(noteId: string): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/reanalyze`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd ponownego uruchamiania analizy AI: ${response.status}`);
  }

  return response.json();
}

export async function fetchTeams(): Promise<Team[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania zespołów: ${response.status}`);
  }

  return response.json();
}

export async function createTeam(teamData: TeamCreateData): Promise<Team> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams`, {
    method: "POST",
    headers,
    body: JSON.stringify(teamData),
  });

  if (!response.ok) {
    throw new Error(`Błąd tworzenia zespołu: ${response.status}`);
  }

  return response.json();
}

export async function deleteTeam(teamId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams/${teamId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania zespołu: ${response.status}`);
  }
}

export async function addTeamMember(teamId: string, emailOrUid: string): Promise<Team> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams/${teamId}/members`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email_or_uid: emailOrUid }),
  });

  if (!response.ok) {
    throw new Error(`Błąd dodawania członka do zespołu: ${response.status}`);
  }

  return response.json();
}

export async function removeTeamMember(teamId: string, memberId: string): Promise<Team> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams/${teamId}/members/${encodeURIComponent(memberId)}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania członka zespołu: ${response.status}`);
  }

  return response.json();
}

export async function acceptNoteInvite(noteId: string): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/accept_invite`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd podczas akceptacji zaproszenia: ${response.status}`);
  }

  return response.json();
}

export async function rejectNoteInvite(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/reject_invite`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd podczas odrzucania zaproszenia: ${response.status}`);
  }
}

```


## frontend/src/App.css <a name="file-frontend-src-App-css"></a>

```css
/* App.css is intentionally left empty. Tailwind is used for styling. */

```


## frontend/src/index.css <a name="file-frontend-src-index-css"></a>

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body, #root {
    background-color: #F7F7F7;
    color: #143109;
    min-height: 100vh;
  }
}

```
