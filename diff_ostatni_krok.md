# Raport z wykonania zadania: Krok 3 (CRUD Notatek w Firestore)

Zgodnie z zatwierdzonym planem dla zadania #003 oraz po otrzymaniu zgody ("Dalej"), wdrożyłem modele danych oraz punkty końcowe (endpointy) pozwalające na zarządzanie notatkami przez autoryzowanych użytkowników.

## Zmienione i Utworzone Pliki

- **[NEW] `src/schemas.py`**: Modele Pydantic definiujące strukturę walidacji i wymiany danych (DTO) dla notatek: `NoteBase`, `NoteCreate`, `NoteUpdate` oraz `NoteResponse` (z konfiguracją Pydantic v2 kompatybilną z `from_attributes`).
- **[NEW] `src/crud.py`**: Warstwa izolująca komunikację z bazą Firestore. Notatki użytkownika są zapisywane w subkolekcji `users/{uid}/notes` gwarantując Security by Default. Implementacja funkcji: `create_note`, `get_notes`, `get_note`, `update_note`, `delete_note`.
- **[NEW] `src/routers/notes.py`**: Modularny router trasowania notatek FastAPI dla punktów końcowych POST, GET (lista i pojedynczy wpis), PUT oraz DELETE. Każdy endpoint wymaga autoryzacji tokenem Firebase (`verify_token`). W przypadku braku zasobu rzucany jest sformatowany błąd 404 wraz ze standardowym komunikatem i unikalnym Trace ID.
- **[MODIFY] `src/main.py`**: Dołączenie nowego routera `notes.py` oraz usunięcie tymczasowego, testowego endpointu z Kroku 2.
- **[NEW] `tests/test_notes.py`**: Kompletny zestaw testów jednostkowych (8 testów) z mockowaniem Firestore za pomocą MagicMock oraz mockowaniem FastAPI `dependency_overrides`.
- **[MODIFY] `tests/test_auth.py`**: Aktualizacja asercji na nowym endpoincie `/api/v1/notes` zwracającym listę oraz dodanie mocka bazy danych w celu uniknięcia wyjątków o braku domyślnej aplikacji Firebase.

## Wyniki testów (Certyfikacja Testami)
Testy zostały wykonane w środowisku lokalnym (rezultat oryginalny):

```text
============================= test session starts ==============================
platform darwin -- Python 3.9.6, pytest-8.4.2, pluggy-1.6.0
rootdir: /Users/przemyslawrakotny/Documents/przemokoduje/keepGoals
plugins: anyio-4.12.1
collected 11 items

tests/test_auth.py ...                                                   [ 27%]
tests/test_notes.py ........                                             [100%]

======================== 11 passed, 4 warnings in 0.52s ========================
```
**Ocena:** 11/11 testów przeszło pomyślnie. Nowy kod jest w pełni przetestowany offline.

## Decyzja Architekta
Przekazuję wdrożenie do weryfikacji Code Review. Jeżeli jako Architekt uznasz, że wdrożony kod (i wynik testów) pasuje do założonego manifestu, poproszę o hasło **"Zatwierdzam"**. Następnie wykonam precyzyjnie opisany commit atomowy dla zmian i zgłoszę pełną gotowość.
