# Plan Kroku 16: Rozwój Zakładki Celów Strategicznych (/goals) — Etap 1: Fundamenty OKR i Nowoczesny UI

## Cel operacyjny
Transformacja zakładki `/goals` z obecnego zablokowanego placeholdera w pełnoprawny, interaktywny pulpit celów strategicznych oparty na wytycznych z bazy wiedzy NotebookLM, filozofii „Personal-First” oraz estetyce Google Keep.

## Architektura Rozwiązania (Etap 1)

### [MODIFY] `src/schemas.py`
Wprowadzenie dedykowanych struktur Pydantic dla celów strategicznych:
- `GoalHorizon`: Enum (`long_term`, `quarterly`, `monthly`)
- `KeyResult`: `title`, `current_value`, `target_value`, `unit`
- `GoalBase`, `GoalCreate`, `GoalUpdate`, `GoalResponse`

### [MODIFY] `src/crud.py`
Dodanie operacji bazodanowych dla Firestore w kolekcji `goals` z izolacją UID:
- `create_goal`, `get_user_goals`, `get_goal`, `update_goal`, `delete_goal`

### [NEW] `src/routers/goals.py`
Kontroler FastAPI z pełnym zestawem endpointów pod `/api/v1/goals`.

### [MODIFY] `src/main.py`
Rejestracja routera celów strategicznych.

### [NEW] `tests/test_goals.py`
Testy jednostkowe i integracyjne API celów.

### [MODIFY] `frontend/src/services/api.ts`
Typy TypeScript i wywołania API dla celów strategicznych.

### [NEW] `frontend/src/components/GoalCard.tsx`
Pastelowa karta celu z suwakami/paskami Key Results, etykietą projektu i odznaką horyzontu.

### [NEW] `frontend/src/components/GoalModal.tsx`
Modal dodawania i edycji celu z dynamicznymi wskaźnikami Key Results.

### [MODIFY] `frontend/src/pages/Goals.tsx`
Przebudowa widoku z filtrami horyzontów, siatką celów i zwijanym Archiwum Sukcesów.

---
**TWARDY STOP (Halt)**
Architektura Etapu 1 została zaplanowana. Zgodnie z Manifestem oczekuję na komendę **„Dalej”** lub uwagi od Architekta, aby przystąpić do modyfikacji kodu.
