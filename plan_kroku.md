# Plan Kroku 5: Implementacja Wieczornej Refleksji (AI Service, Router plans, Testy)

**Cel:** Rozszerzenie systemu o funkcjonalność wieczornej refleksji (POST `/api/v1/plans/evening`). Endpoint przyjmie zrealizowane/niezrealizowane zadania oraz pozytywne nawyki użytkownika, prześle je wraz z celami strategicznymi do modelu Gemini w celu wygenerowania mentorskiemu podsumowania z wnioskami na kolejny dzień, a następnie zapisze wynik w Firestore jako notatkę o typie `daily_evening`.

## Pliki do utworzenia i modyfikacji

### [MODIFY] `src/schemas.py`
*   Dodanie modelu `EveningReflectionIn(BaseModel)` z polami:
    *   `completed_tasks`: `list[str]` (lista zrealizowanych zadań)
    *   `uncompleted_tasks`: `list[str]` (lista niezrealizowanych zadań)
    *   `avoided_habits`: `list[str]` (lista pozytywnych zaniechań / nawyków do uniknięcia)

### [MODIFY] `src/services/ai_service.py`
*   Dodanie funkcji `generate_evening_reflection(reflection_data: dict, strategic_goals: list[str]) -> str`:
    *   Formatowanie promptu dla Gemini, przekazującego cele strategiczne oraz listy zadań/nawyków z refleksji wieczornej.
    *   Prompt systemowy instruuje model, aby działał jak mentor rozwoju osobistego i wygenerował zwięzłe podsumowanie z konstruktywnymi wnioskami optymalizacyjnymi na jutro w formacie Markdown.

### [MODIFY] `src/routers/plans.py`
*   Dodanie punktu końcowego `POST /api/v1/plans/evening` -> status 201 (Created), zwraca `NoteResponse`.
*   **Logika endpointu:**
    1.  Autoryzacja za pomocą `Depends(verify_token)`.
    2.  Przyjęcie body `reflection_in: EveningReflectionIn`.
    3.  Pobranie celów strategicznych użytkownika z bazy (`crud.get_notes`).
    4.  *Walidacja*: Jeśli brak celów strategicznych, przerwij działanie i zwróć HTTP 400 z kodem błędu `NO_STRATEGIC_GOALS` i unikalnym `trace_id`.
    5.  Wywołanie `generate_evening_reflection` z przekazaniem danych z refleksji (`reflection_in.model_dump()`) oraz celów strategicznych.
    6.  Utworzenie nowej notatki z tytułem `"Refleksja Wieczorna"` oraz typem `"daily_evening"`.
    7.  Zapisanie w bazie przy użyciu `crud.create_note` i zwrócenie struktury `NoteResponse`.

### [MODIFY] `tests/test_plans.py`
*   Dodanie testów jednostkowych weryfikujących endpoint wieczornej refleksji:
    *   `test_generate_evening_reflection_success`: Sukces zapisu podsumowania wieczornego z walidacją zwracanych danych i typu `daily_evening`.
    *   `test_generate_evening_reflection_no_strategic_goals`: Test błędu walidacji HTTP 400 przy braku celów strategicznych w bazie z weryfikacją obecności `trace_id`.

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie ze Standaryzacją Środowiska, wszystkie testy zostaną uruchomione wewnątrz izolowanego kontenera backendu:
```bash
docker-compose run --rm backend bash -c "pytest tests/"
```

Testy muszą zakończyć się sukcesem bez wywoływania rzeczywistego API Gemini (mockowanie `generate_evening_reflection`) ani produkcyjnej bazy danych Firestore.

## Koszty
Podsumowanie wieczorne również mockuje komunikację z API Google GenAI, gwarantując brak opłat na etapie testów (koszt: 0 PLN).

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
