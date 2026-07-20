# Plan Kroku 3: Implementacja Modeli Pydantic, Warstwy CRUD oraz Endpointów Zarządzania Notatkami w Firestore

**Cel:** Wdrożenie pełnego cyklu zarządzania notatkami (CRUD: Create, Read, Update, Delete) w architekturze FastAPI + Firestore z autoryzacją Firebase. Plan zakłada pełną izolację danych użytkownika poprzez zapis w subkolekcji `users/{uid}/notes` (Security by Default), walidację danych przy użyciu Pydantic oraz certyfikację testami jednostkowymi z mockowaniem bazy i autoryzacji.

## Pliki do utworzenia i modyfikacji

### [NEW] `src/schemas.py`
Definicja modeli Pydantic do walidacji danych wejściowych i wyjściowych (DTO):
*   `NoteBase`: Wspólne pola dla notatki:
    *   `title`: `Optional[str]` (domyślnie `None`)
    *   `content`: `str` (wymagane)
    *   `note_type`: `str` (np. `'strategic'`, `'daily_morning'`, `'daily_evening'`)
*   `NoteCreate`: Dziedziczy po `NoteBase`. Reprezentuje dane przesyłane przy tworzeniu notatki.
*   `NoteUpdate`: Wszystkie pola z `NoteBase` oznaczone jako opcjonalne (`Optional`), co umożliwia częściową aktualizację (PATCH/PUT).
*   `NoteResponse`: Dziedziczy po `NoteBase`. Reprezentuje pełną notatkę zwracaną z API, rozszerzoną o:
    *   `id`: `str` (identyfikator dokumentu z Firestore)
    *   `user_id`: `str` (identyfikator właściciela notatki `uid`)
    *   `created_at`: `datetime` (czas utworzenia)

### [NEW] `src/crud.py`
Funkcje pomocnicze do bezpośredniej komunikacji z Firestore, realizujące izolację danych użytkownika w subkolekcji `users/{uid}/notes`:
*   `create_note(db, uid: str, note_in: NoteCreate) -> dict`: Zapisuje nową notatkę z automatycznym przypisaniem `user_id` oraz `created_at` (zapisywanym jako standardowy timestamp/datetime). Zwraca zapisany słownik z wygenerowanym ID dokumentu.
*   `get_notes(db, uid: str) -> list[dict]`: Pobiera wszystkie notatki użytkownika (strumieniowanie z subkolekcji).
*   `get_note(db, uid: str, note_id: str) -> Optional[dict]`: Pobiera pojedynczą notatkę na podstawie ID dokumentu. Zwraca `None`, jeśli dokument nie istnieje.
*   `update_note(db, uid: str, note_id: str, note_in: NoteUpdate) -> Optional[dict]`: Aktualizuje pola notatki. Jeśli notatka nie istnieje, zwraca `None`. W przeciwnym razie pobiera zaktualizowany dokument i zwraca jego strukturę.
*   `delete_note(db, uid: str, note_id: str) -> bool`: Usuwa dokument notatki. Zwraca `True` przy sukcesie, a `False`, gdy notatka nie istnieje.

### [NEW] `src/routers/notes.py`
Modularny router FastAPI obsługujący operacje na notatkach:
*   `POST /api/v1/notes` -> status 201 (Created), zwraca `NoteResponse`.
*   `GET /api/v1/notes` -> status 200, zwraca listę `List[NoteResponse]`.
*   `GET /api/v1/notes/{note_id}` -> status 200, zwraca `NoteResponse`. Jeśli nie istnieje, rzuca HTTP 404.
*   `PUT /api/v1/notes/{note_id}` -> status 200, zwraca `NoteResponse`. Jeśli nie istnieje, rzuca HTTP 404.
*   `DELETE /api/v1/notes/{note_id}` -> status 200, zwraca wiadomość o usunięciu. Jeśli nie istnieje, rzuca HTTP 404.
*   *Obsługa błędów*: Zgłoszenie 404 zwraca spójną strukturę błędu (`error_code: "NOTE_NOT_FOUND"`, `message` oraz dynamicznie generowany `trace_id`), analogiczną do obsługi błędów uwierzytelniania.

### [MODIFY] `src/main.py`
*   Dołączenie routera `notes_router` do głównej aplikacji FastAPI (`app.include_router(notes_router)`).
*   Usunięcie tymczasowego, testowego endpointu `GET /api/v1/notes` z Kroku 2, ponieważ zostanie on zastąpiony pełnym routerem w `src/routers/notes.py`.

### [NEW] `tests/test_notes.py`
Testy jednostkowe weryfikujące poprawność operacji oraz obsługę błędów:
*   Mockowanie Firebase Auth (zwracanie poprawnego tokena/testowego UID w `verify_id_token`).
*   Mockowanie klienta Firestore (metody `collection`, `document`, `get`, `set`, `update`, `delete`, `stream`) przy użyciu `unittest.mock.MagicMock`, aby testy były całkowicie offline.
*   Testy dla wszystkich endpointów (sukces oraz obsługa błędów 404 ze strukturą Trace ID).

---

## Strategia Weryfikacji i Certyfikacja Testami

Wszystkie testy zostaną uruchomione wewnątrz izolowanego kontenera backendu, aby zagwarantować spójność środowiska:
```bash
docker-compose run --rm backend bash -c "pytest tests/"
```

Scenariusze testowe w `tests/test_notes.py`:
1.  **Dodawanie notatki (POST)**: Weryfikacja kodu 201 i zgodności struktury odpowiedzi z `NoteResponse`.
2.  **Pobieranie listy notatek (GET /api/v1/notes)**: Sprawdzenie, czy zwracane dane są poprawnie mapowane na listę modeli.
3.  **Pobieranie pojedynczej notatki (GET /api/v1/notes/{note_id})**:
    *   Wariant sukces (200) z poprawnym mockiem.
    *   Wariant błąd (404) z weryfikacją obecności `trace_id` i `error_code: "NOTE_NOT_FOUND"`.
4.  **Aktualizacja notatki (PUT)**:
    *   Wariant sukces (200) z przekazaniem nowych wartości pól.
    *   Wariant błąd (404) dla nieistniejącego ID.
5.  **Usuwanie notatki (DELETE)**:
    *   Wariant sukces (200).
    *   Wariant błąd (404) dla nieistniejącego ID.

## Koszty
Operacje na bazie danych Firestore są w pełni mockowane, co eliminuje ryzyko naliczenia opłat w chmurze Google Cloud. Koszt testów: 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu ze strony Architekta. Po zatwierdzeniu planu proszę o komendę **"Dalej"**, aby przejść do implementacji.
