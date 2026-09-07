# Raport z wykonania zadania: Okno Czatu AI (Gemini Goal Coach) pod Osią Celów (/goals)

## Cel operacyjny
Wdrożenie okna konwersacyjnego AI w stylu Gemini / ChatGPT umieszczonego bezpośrednio pod poziomą osią celów 2D. Użytkownik może rozmawiać z asystentem o swoich celach, prosić o propozycje kolejnych kafelków oraz jednym kliknięciem dodawać sugerowane przez AI kafelki na oś.

## Zmienione i Utworzone Pliki

### Backend (FastAPI + AI Service)
- **[MODIFY] `src/schemas.py`**:
  - Dodano `GoalChatMessage` (`role`, `content`).
  - Dodano `GoalChatRequest` (`messages`, `current_tiles`).
  - Dodano `GoalChatResponse` (`response`).
- **[MODIFY] `src/services/ai_service.py`**:
  - Zaimplementowano funkcję `chat_with_ai_about_goals()` z systemowym promptem trenera celów (AI Goal & Focus Coach).
  - Wzbogacono obsługę kluczy API o `GEMINI_API_KEY` (poprzez endpoint kompatybilności OpenAI z modelem `gemini-2.5-flash`), `OPENAI_API_KEY` (`gpt-4o-mini`) oraz `GROQ_API_KEY`.
  - Wprowadzono znacznik `<SUGGESTED_TILE title="..." x="..." y="...">` do strukturyzowanych propozycji kafelków.
- **[MODIFY] `src/routers/goals.py`**:
  - Dodano endpoint `POST /api/v1/goals/ai-chat`.
- **[MODIFY] `tests/test_goals.py`**:
  - Dodano test integracyjny `test_goal_ai_chat()`.

### Frontend (React + TypeScript)
- **[NEW] `frontend/src/components/GoalAIChat.tsx`**:
  - Pływające okno czatu pod osią ze stylistyką Gemini/ChatGPT.
  - Szybkie pigułki z pytaniami (np. „✨ Zaproponuj kolejny kafelek”, „⚖️ Jak zrównoważyć rozproszenia?”, „🚀 Następny krok w celach”).
  - Rozwijana lista wiadomości z autoscrollem i wskaźnikiem generowania odpowiedzi.
  - Parser i interaktywna karta sugerowanego kafelka z przyciskiem „+ Dodaj na oś”.
  - Persystencja historii czatu w `localStorage`.
- **[MODIFY] `frontend/src/services/api.ts`**:
  - Dodano funkcję `chatAboutGoals(messages, currentTiles)`.
- **[MODIFY] `frontend/src/pages/Goals.tsx`**:
  - Zintegrowano komponent `GoalAIChat` bezpośrednio pod osią poziomą.
  - Podłączono callback `handleAddTileDirect` do natychmiastowego umieszczania sugerowanych przez AI kafelków na osi 2D oraz synchronizacji z bazą danych i pamięcią lokalną.

## Wyniki Testów i Kompilacji

### 1. Testy Automatyczne Backend (Pytest)
```text
tests/test_auth.py ...                                                   [  7%]
tests/test_cors.py ...                                                   [ 15%]
tests/test_goals.py ........                                             [ 35%]
tests/test_notes.py ................                                     [ 76%]
tests/test_plans.py ....                                                 [ 87%]
tests/test_projects.py ...                                               [ 94%]
tests/test_teams.py ..                                                   [100%]

======================== 39 passed, 4 warnings in 7.07s ========================
```

### 2. Kompilacja Frontendu (TypeScript + Vite)
```text
> frontend@0.0.0 build
> tsc -b && vite build

✓ built in 678ms
```
