# Plan Kroku 9: Autoryzowane Zapytania HTTP z JWT Bearer oraz Widok Dashboard (React + Vite)

**Cel:** Stworzenie scentralizowanego klienta HTTP (wstrzykującego token JWT z Firebase Auth w nagłówku `Authorization: Bearer <TOKEN>`), implementacja głównego widoku użytkownika po zalogowaniu (`Dashboard.tsx`) z podziałem na kolumny: "Cele Strategiczne" oraz "Pętla Dzienna", oraz pełna integracja routingu.

## Pliki do utworzenia i modyfikacji

### [NEW] `frontend/src/services/api.ts`
Scentralizowana warstwa zapytań API:
*   Wczytanie adresu URL backendu ze zmiennej `VITE_API_URL` (lub domyślnie `http://localhost:8080`).
*   Funkcja pomocnicza `getAuthHeaders()` pobierająca asynchronicznie aktualny token sesyjny użytkownika za pomocą `auth.currentUser?.getIdToken()`.
*   Implementacja funkcji `fetchNotes()`, która uderza do chronionego endpointu `/api/v1/notes` z nagłówkiem `Authorization: Bearer <TOKEN>`.

### [NEW] `frontend/src/pages/Dashboard.tsx`
Główny widok tablicy użytkownika:
*   Pobieranie listy notatek na etapie montowania komponentu.
*   Architektura minimalistyczna: podział ekranu na dwie kolumny (Cele Strategiczne oraz Pętla Dzienna) przy użyciu siatki CSS (CSS Grid) z dużymi odstępami (`gap-8`).
*   Komponent notatki: Kafelki z zaokrąglonymi rogami (`rounded-[24px]`), miękkim cieniem i stonowanym pastelowym tłem, dedykowanym dla danego typu (`note_type`):
    *   strategic -> pastelowy niebieski
    *   daily_morning -> pastelowy zielony
    *   daily_evening -> pastelowy fioletowy
*   Przycisk wylogowania powiązany z `AuthContext`.

### [MODIFY] `frontend/src/App.tsx`
*   Podmiana tymczasowego placeholdera Dashboardu na pełny komponent `Dashboard.tsx` wewnątrz chronionej ścieżki `/`.

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie z zasadą Standaryzacji Środowiska, wszystkie działania uruchomieniowe i weryfikacyjne są przeprowadzane wyłącznie wewnątrz kontenerów Docker Compose:

1.  **Przebudowa i uruchomienie**:
    ```bash
    docker-compose up --build -d
    ```
2.  **Test pobierania danych z autoryzacją**: 
    *   Logowanie użytkownika za pomocą Google na stronie `/login`.
    *   Wejście na chroniony Dashboard `/`.
    *   Otwarcie narzędzi deweloperskich (zakładka Network) i zweryfikowanie, czy zapytanie do `http://localhost:8080/api/v1/notes` posiada nagłówek `Authorization: Bearer <TOKEN>` oraz czy odpowiedź zwraca status `200 OK`.
3.  **Wizualny test kafelków**: Sprawdzenie, czy kafelki notatek poprawnie aplikują style pastelowych tła i zaokrąglonych rogów `rounded-[24px]`.
4.  **Testy regresji backendowej**:
    ```bash
    docker-compose run --rm backend bash -c "pytest tests/"
    ```

## Koszty
Nie występują dodatkowe koszty integracyjne. Koszt testów offline: 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
