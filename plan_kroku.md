# Plan Kroku 15: Multimodalny Backend (FastAPI + Gemini)

## Cel operacyjny
Rozbudowa warstwy backendowej o przyjmowanie plików binarnych (audio/wideo) z frontendu, przekazanie surowych strumieni do agenta AI (Gemini) w celu wygenerowania ustrukturyzowanej notatki (tytuł, szczegółowe podsumowanie, tagi) oraz zapis danych w bazie.

## Architektura Rozwiązania

### [MODIFY] `src/services/ai_service.py`
Rozszerzenie serwisu integracji AI o analitykę multimediów z wykorzystaniem modeli Gemini (np. `gemini-1.5-pro` lub `gemini-1.5-flash`), które natywnie wspierają konsumpcję audio i wideo.
- **Nowe metody**:
  - `analyze_audio_note(file_bytes: bytes, mime_type: str) -> dict`
  - `analyze_video_note(file_bytes: bytes, mime_type: str) -> dict`
- **Logika**:
  - Przekazanie bajtów (jako inline data base64) oraz przypisanego typu MIME do API Gemini.
  - Sformułowanie precyzyjnego promptu systemowego nakazującego wyciągnięcie kluczowych informacji, wygenerowanie odpowiedniego, chwytliwego tytułu oraz sformatowanej transkrypcji/opisu w formacie Markdown.
  - Zwrócenie ustrukturyzowanego wyniku (JSON) zgodnego ze schematami naszej aplikacji (tytuł, treść, typ notatki).

### [MODIFY] `src/routers/notes.py`
Dodanie nowych kontrolerów nasłuchujących na przesył plików z frontendu.
- **Endpointy**:
  - `POST /api/v1/notes/audio`
  - `POST /api/v1/notes/video`
- **Logika kontrolerów**:
  - Wymaganie autoryzacji (zależność `get_current_user` odczytująca token JWT).
  - Wstrzyknięcie pliku z użyciem klasy `UploadFile` (FastAPI: `file: UploadFile = File(...)`).
  - Załadowanie binarnej zawartości do pamięci serwera (`await file.read()`).
  - Przekazanie surowych bajtów do odpowiedniej funkcji analitycznej z `ai_service.py`.
  - Powołanie do życia nowej struktury bazodanowej (`schemas.NoteCreate`) przy wykorzystaniu rezultatu analizy.
  - Wywołanie `crud.create_note(...)` z zapisem do bazy.
  - Zwrócenie nowo wygenerowanej notatki do klienta (odświeżenie interfejsu).

### [MODIFY] `tests/test_notes.py`
Opracowanie rygorystycznych testów jednostkowych zapobiegających regresji.
- **Strategia testowania**:
  - Zaślepienie (`mocking`) wywołań w `ai_service.py`, aby testy nie konsumowały limitów zewnętrznego API LLM, zapewniały izolację i determinizm.
  - Zasymulowanie przesyłania plików z użyciem metody `.post()` w `TestClient`, wstrzykując fikcyjne pliki audio i wideo:
    `client.post(..., files={"file": ("test.webm", b"dummy_data", "video/webm")})`
  - Weryfikacja odpowiedniej struktury obiektu zwracanego (status `200 OK` i potwierdzenie mapowania wygenerowanej przez mock treści na model `Note`).

---
**TWARDY STOP (Halt)**
Infrastruktura pod obsługę `UploadFile` oraz multimodalne prompty Gemini zostały zaplanowane. Pliki oczekują na fizyczną modyfikację kodu. Proszę o zaakceptowanie zaprojektowanej architektury, aby przystąpić do zmian.
