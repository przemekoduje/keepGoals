# Plan Kroku 6: Konfiguracja Produkcyjna (CORS, Docker, CI/CD Cloud Build, Testy)

**Cel:** Dostosowanie aplikacji keepGoals do standardów chmurowych (Google Cloud Run), zabezpieczenie dostępu za pomocą polityki CORS, optymalizacja Dockerfile pod kątem produkcji z jednoczesnym zachowaniem Hot-Reload dla środowiska deweloperskiego, oraz wdrożenie potoku CI/CD przy użyciu Google Cloud Build.

## Pliki do utworzenia i modyfikacji

### [NEW] `cloudbuild.yaml`
Konfiguracja procesu CI/CD dla Google Cloud Build:
*   Krok 1: Budowanie produkcyjnego obrazu Docker na bazie aktualnego kodu z tagiem zawierającym `$COMMIT_SHA`.
*   Krok 2: Wypchnięcie (`docker push`) obrazu do repozytorium w Google Artifact Registry (`europe-central2-docker.pkg.dev`).
*   Krok 3: Wdrożenie na Google Cloud Run z flagami:
    *   `--region europe-central2`
    *   `--allow-unauthenticated` (dostęp publiczny dla API)
    *   `--set-secrets` pobierające wrażliwe dane (`GEMINI_API_KEY` oraz plik certyfikatu Firebase `FIREBASE_CREDENTIALS_PATH`) bezpośrednio z Google Secret Manager.

### [NEW] `tests/test_cors.py`
Testy jednostkowe weryfikujące poprawność nagłówków CORS:
*   `test_cors_headers`: Sprawdzenie, czy żądanie z dozwolonego Origin (`http://localhost:3000`) otrzymuje w nagłówku odpowiedzi `access-control-allow-origin`.
*   `test_cors_headers_invalid_origin`: Weryfikacja, czy żądanie z niedozwolonego Origin nie otrzymuje nagłówków CORS.

### [MODIFY] `src/config.py`
*   Dodanie zmiennej `ALLOWED_ORIGINS` pobieranej z zmiennej środowiskowej o tej samej nazwie (z wartością domyślną `"http://localhost:3000"` rozdzielaną przecinkami) do konfiguracji dozwolonych źródeł CORS.

### [MODIFY] `src/main.py`
*   Import i wstrzyknięcie `CORSMiddleware` z FastAPI.
*   Konfiguracja middleware na podstawie źródeł z `config.py`.
*   Restrykcyjne określenie dozwolonych metod (`["GET", "POST", "PUT", "DELETE", "OPTIONS"]`) i zezwolenie na przesyłanie credentials (`allow_credentials=True`).

### [MODIFY] `Dockerfile`
*   Zmiana portu startowego z `8000` na `8080` (standard Google Cloud Run).
*   Usunięcie flagi deweloperskiej `--reload` z komendy startowej CMD w celu optymalizacji i rygoru produkcyjnego.
*   Docelowa komenda: `CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]`.

### [MODIFY] `docker-compose.yml`
*   Zmiana mapowania portów na `8080:8080`.
*   Dodanie wolumenu dla folderu `tests`, aby umożliwić uruchamianie testów wewnątrz kontenera: `- ./tests:/app/tests`.
*   Nadpisanie komendy produkcyjnej z Dockerfile wersją deweloperską z włączoną flagą `--reload` przy użyciu dyrektywy `command`.

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie ze Standaryzacją Środowiska, wszystkie testy zostaną uruchomione wewnątrz izolowanego kontenera backendu:
```bash
docker-compose run --rm backend bash -c "pytest tests/"
```

Weryfikacji podlegać będzie:
1.  Poprawność nagłówków CORS przy zapytaniach OPTIONS (Preflight) i GET.
2.  Czy testy weryfikujące autoryzację, notatki oraz plany nadal działają bezbłędnie na nowym porcie 8080.

## Koszty
Definicje CI/CD i konfiguracja CORS nie generują opłat. Narzędzie Cloud Build posiada darmowy limit 120 minut budowania miesięcznie. Uruchomienie kontenera w Cloud Run rozliczane jest za rzeczywiste milisekundy użycia procesora i pamięci RAM (bardzo niski koszt w fazie dev/test). Koszt testów offline: 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
