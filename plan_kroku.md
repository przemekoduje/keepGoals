# Plan Kroku 4: Integracja SDK Gemini (AI Service) i Generowanie Planów Porannych

**Cel:** Wdrożenie integracji z modelami Gemini za pomocą nowej biblioteki `google-genai` oraz stworzenie punktu końcowego `POST /api/v1/plans/morning`. Endpoint ten pobierze cele strategiczne zalogowanego użytkownika, wygeneruje dla nich spersonalizowaną listę zadań przy użyciu AI, a następnie asynchronicznie zapisze wynik jako nową notatkę o typie `daily_morning` w Firestore.

## Pliki do utworzenia i modyfikacji

### [NEW] `src/services/ai_service.py`
Serwis odpowiedzialny za komunikację z modelami Gemini:
*   Inicjalizacja `client = genai.Client(api_key=settings.GEMINI_API_KEY)` z modułu `google-genai`.
*   Funkcja `generate_morning_plan(strategic_goals: list[str]) -> str`:
    *   Wstrzykuje listę celów użytkownika w predefiniowany prompt systemowy.
    *   System prompt instruuje model Gemini (np. `gemini-2.5-flash`), aby działał jako asystent produktywności i zwrócił listę zadań (checklistę z `- [ ]`) w formacie czystego Markdown, bez dodatkowych komentarzy.

### [NEW] `src/routers/plans.py`
Router FastAPI obsługujący orkiestrację planów dnia:
*   `POST /api/v1/plans/morning` -> status 201 (Created), zwraca `NoteResponse`.
*   **Logika endpointu:**
    1.  Autoryzacja za pomocą `Depends(verify_token)`.
    2.  Pobranie wszystkich notatek użytkownika z Firestore (`crud.get_notes`).
    3.  Filtrowanie i wyekstrahowanie treści notatek o typie `strategic`.
    4.  *Walidacja (Security/Logic)*: Jeśli lista celów strategicznych jest pusta, operacja zostaje przerwana z kodem błędu HTTP 400 (`NO_STRATEGIC_GOALS`), czytelnym komunikatem i unikalnym `trace_id`.
    5.  Wywołanie `generate_morning_plan` z celami strategicznymi jako argumentem.
    6.  Utworzenie nowej notatki z wygenerowanym tekstem, przypisaniem tytułu `"Plan Poranny"` i typu `"daily_morning"`.
    7.  Zapisanie nowej notatki za pomocą `crud.create_note` i zwrócenie struktury `NoteResponse`.

### [MODIFY] `src/main.py`
*   Podłączenie nowego routera plans: `app.include_router(plans_router)`.

### [NEW] `tests/test_plans.py`
Testy jednostkowe weryfikujące logikę orkiestracji planów w izolacji:
*   Mockowanie uwierzytelniania FastAPI i bazy danych `get_db`.
*   Mockowanie komunikacji z API Gemini (`generate_morning_plan` w `src.routers.plans`) oraz komunikacji z Firestore (`get_notes`, `create_note` w `src.routers.plans`), zapewniające wykonanie testów w trybie całkowicie offline.
*   **Scenariusz 1 (Sukces)**: Zwrócenie 201, poprawne mapowanie wygenerowanego planu na typ `daily_morning` o tytule "Plan Poranny".
*   **Scenariusz 2 (Błąd)**: Brak celów strategicznych w bazie powoduje HTTP 400 z unikalnym `trace_id` i kodem `NO_STRATEGIC_GOALS`.

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie ze Standaryzacją Środowiska, wszystkie testy zostaną uruchomione wewnątrz izolowanego kontenera backendu:
```bash
docker-compose run --rm backend bash -c "pytest tests/"
```

Wszystkie testy muszą zakończyć się sukcesem bez wykonywania jakichkolwiek zapytań sieciowych do API Google GenAI ani do chmury Google Cloud Firestore.

## Koszty
Integracja z API Gemini na poziomie produkcyjnym wykorzystuje model `gemini-2.5-flash`, który posiada darmowy limit zapytań lub bardzo niski koszt eksploatacyjny. Na etapie testów (dzięki mockom) generowane koszty wynoszą dokładnie 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
