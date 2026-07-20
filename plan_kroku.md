# Plan Kroku 2: Implementacja Autoryzacji Firebase i Inicjalizacja Firestore

**Cel:** Wdrożenie bezpiecznej warstwy autoryzacyjnej komunikującej się z Firebase Authentication (weryfikacja tokenów JWT) oraz stabilnej inicjalizacji Google Cloud Firestore dla przyszłego zapisu notatek. Całość objęta Certyfikacją Testami przy użyciu zamockowanych żądań, bez modyfikowania lub zanieczyszczania zewnętrznych środowisk chmurowych.

## Pliki

### [NEW] `src/config.py`
- **Logika:** Wdrożenie wbudowanego modułu `os` do bezpiecznego odczytu zmiennych środowiskowych. Powstanie klasa/zmienna odpowiadająca za ładowanie `FIREBASE_CREDENTIALS_PATH`.

### [NEW] `src/database.py`
- **Logika:** Implementacja inicjalizacji SDK Firebase (`firebase_admin.initialize_app`) na podstawie uwierzytelnienia z pliku konfiguracyjnego. Implementacja eksportu klienta chmurowego `firebase_admin.firestore.client()`. Zastosowanie wbudowanego w firebase-admin zabezpieczenia przed ponowną inicjalizacją przy Hot-Reloadingu (sprawdzanie `if not firebase_admin._apps`).

### [NEW] `src/auth.py`
- **Logika:** Zdefiniowanie warstwy wstrzykiwania zależności (Dependency Injection) FastAPI `HTTPBearer`. Walidacja przechodzącego tokena za pomocą `firebase_admin.auth.verify_id_token`. W przypadku sukcesu: przekazywanie wyekstrahowanych danych usera (`uid`, `email`). Przy niepowodzeniu: zgłaszanie wyjątku 401 ze sformatowanym, jednolitym komunikatem bezpieczeństwa zwierającym Trace ID.

### [MODIFY] `src/main.py`
- **Logika:** Rejestracja chronionego routera / endpointu `GET /api/v1/notes`. Będzie to Proof of Concept udowadniający, że dostęp mają tylko zautoryzowani użytkownicy (lub zamockowani w testach).

### [MODIFY] `requirements.txt`
- **Logika:** Dodanie pakietów: `pytest`, `httpx` (konieczne dla frameworku testowego FastAPI).

### [NEW] `tests/test_auth.py`
- **Logika:** Założenie środowiska testowego z dwoma scenariuszami. Do zablokowania rzeczywistej walidacji po stronie serwerów Google posłuży `unittest.mock.patch`.
  - **Scenariusz 1:** Brak tokenu w zapytaniu do `/api/v1/notes` - oczekiwany zwrot i poprawna obsługa błędu 401.
  - **Scenariusz 2:** Zmockowany poprawny token JWT - oczekiwany zwrot 200 wraz ze słownikiem reprezentującym dane zaufanego użytkownika.

## Strategia Weryfikacji

Aby zweryfikować kod zgodnie ze Standaryzacją Środowiska (bez uruchamiania tego na maszynie dewelopera fizycznie, lecz w izolowanym kontenerze backendu), testy zostaną uruchomione poleceniem:
```bash
docker-compose run --rm backend bash -c "pip install -r requirements.txt && pytest tests/"
```
*Uwaga: Właściwym rozwiązaniem w przyszłości będzie rozdzielenie zależności na dev/prod, jednak na ten moment zainstalujemy pakiety z zaktualizowanego `requirements.txt`.*

## Koszty
Rozwój modułu Firebase Authentication w pakiecie bazowym oraz operacje mockowane nie generują żadnych bezpośrednich kosztów użycia chmury obliczeniowej GCP/Firebase. Koszt uruchomienia na etapie dev: 0 PLN.

---
**TWARDY STOP (Halt)** 
Oczekuję na weryfikację ze strony Architekta. W przypadku pomyślnej walidacji i braku uwag w zakresie wzorców/bezpieczeństwa, proszę o komendę **"Dalej"**.
