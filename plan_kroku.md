# Plan Kroku 10: Formularz i Modal Dodawania Celów (React + Vite)

**Cel:** Rozbudowa klienta HTTP o metodę `POST` pozwalającą na tworzenie notatek celów, utworzenie uniwersalnego komponentu modalnego z efektem rozmycia tła (`backdrop-blur`), implementacja formularza tworzenia celi strategicznych o zredukowanych ramkach pól wejściowych, oraz spięcie logiki odświeżania danych na Dashboardzie bez pełnego przeładowania strony (Single Page Application UX).

## Pliki do utworzenia i modyfikacji

### [NEW] `frontend/src/components/Modal.tsx`
Generyczny, reużywalny kontener modalny:
*   Tło przesłaniające o pełnym wymiarze z lekkim przyciemnieniem i rozmyciem: `fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm`.
*   Pudełko zawartości z zaokrąglonymi narożnikami `rounded-[24px]` dostosowane do trybu ciemnego/jasnego.
*   Zamknięcie modala po kliknięciu w tło (Backdrop) lub ikonę krzyżyka.

### [NEW] `frontend/src/components/CreateGoalForm.tsx`
Formularz dodawania celu strategicznego:
*   Pola wejściowe `title` (tytuł celu) oraz `content` (opis).
*   Estetyka: brak grubych obramowań inputów, ujednolicone tło `bg-slate-50 dark:bg-slate-800` ulegające przyciemnieniu na focus (`focus:bg-slate-100/80`).
*   Brak widocznego ringu (`focus:ring-0 focus:outline-none`).
*   Blokowanie przycisku "Zapisz cel", gdy pola są puste (zmiana koloru na szary, wygaszony).

### [MODIFY] `frontend/src/services/api.ts`
*   Dodanie asynchronicznej funkcji `createNote(noteData: { title: string, content: string, note_type: string })` wysyłającej zapytanie `POST` z nagłówkiem `Authorization: Bearer <TOKEN>` i typem danych JSON.

### [MODIFY] `frontend/src/pages/Dashboard.tsx`
*   Zarządzanie stanem otwarcia modala (`isModalOpen: boolean`).
*   Dodanie minimalistycznego okrągłego/kwadratowego przycisku z ikoną plusa obok nagłówka "Cele Strategiczne".
*   Implementacja callbacku `handleCreateSuccess()`, który zamyka modal i ponownie wywołuje `fetchNotes()`, wymuszając reaktywne odświeżenie samej tablicy (SPA UX).

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie z zasadą Standaryzacji Środowiska, wszystkie działania uruchomieniowe i weryfikacyjne są przeprowadzane wyłącznie wewnątrz kontenerów Docker Compose:

1.  **Przebudowa i uruchomienie**:
    ```bash
    docker-compose up --build -d
    ```
2.  **Test zachowania UI (Modal i Formularz)**:
    *   Kliknięcie ikony "+" w sekcji celów otwiera modal.
    *   Kliknięcie poza modalem lub na przycisk "Anuluj" zamyka okno.
    *   Próba zapisu przy pustych polach jest niemożliwa (przycisk wygaszony).
3.  **Weryfikacja CORS i zapisu (E2E Manual / Logs)**:
    *   Wpisanie przykładowych wartości i kliknięcie "Zapisz cel".
    *   Sprawdzenie w konsoli sieciowej przeglądarki, czy poszło zapytanie `POST /api/v1/notes` ze statusem `201 Created` lub `200 OK`.
    *   Sprawdzenie, czy nowa notatka natychmiast pojawia się na ekranie bez przeładowywania strony.
4.  **Testy regresji backendowej**:
    ```bash
    docker-compose run --rm backend bash -c "pytest tests/"
    ```

## Koszty
Brak dodatkowych kosztów. Koszt testów offline: 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
