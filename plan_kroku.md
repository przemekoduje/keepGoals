# Plan Kroku 11: Integracja Silnika AI na Interfejsie (React + Vite)

**Cel:** Rozbudowa klienta API o nowe metody obsługujące generowanie planów porannych i refleksji wieczornych przez AI, wdrożenie odpowiednich elementów interfejsu (dyskusyjne przyciski w sekcji Pętli Dziennej), utworzenie nowego formularza wieczornego bilansu wewnątrz okna modalnego z konwersją wielowierszowego tekstu do struktur DTO (listy stringów), oraz obsługa błędów autoryzacji/braku celów strategicznych (`NO_STRATEGIC_GOALS`).

## Pliki do utworzenia i modyfikacji

### [NEW] `frontend/src/components/EveningReflectionForm.tsx`
Formularz wieczornej refleksji użytkownika:
*   Trzy pola tekstowe (`textarea`) do wprowadzania: zrealizowanych zadań, niezrealizowanych zadań oraz zaniechanych nawyków.
*   Estetyka: brak grubych obramowań inputów, ujednolicone tło `bg-slate-50 dark:bg-slate-800` ulegające przyciemnieniu na focus (`focus:bg-slate-100/80`), wygaszanie przycisku zapisu gdy formularz jest w całości pusty.
*   Logika: rozbijanie tekstu z pól tekstowych po znakach nowej linii (`\n`), oczyszczanie linii z białych znaków (`trim()`) i odrzucanie pustych linii w celu utworzenia tablicy stringów (zgodnie z DTO backendu).
*   Wywołanie API metody `generateEveningReflection(payload)` i powiadomienie Dashboardu o sukcesie (`onSuccess`).

### [MODIFY] `frontend/src/services/api.ts`
*   Dodanie funkcji `generateMorningPlan()`: wysyła pusty POST na `/api/v1/plans/morning` z nagłówkiem autoryzacji Bearer.
*   Dodanie funkcji `generateEveningReflection(reflectionData)`: wysyła POST na `/api/v1/plans/evening` z obiektem JSON i nagłówkiem autoryzacji.
*   Obsługa błędów: wyciąganie błędu z pola `error_code` w przypadku odpowiedzi innej niż 2xx (np. `NO_STRATEGIC_GOALS`).

### [MODIFY] `frontend/src/pages/Dashboard.tsx`
*   Stany: `isMorningLoading: boolean`, `morningError: string | null`, `isEveningModalOpen: boolean`.
*   Dodanie przycisków w sekcji nagłówka "Pętla Dzienna (Plany i Refleksje)":
    *   **Plan Poranny** (pastelowy zielony z ikoną słońca/odświeżania): wyzwala asynchroniczne zapytanie generujące i pokazuje spinner wewnątrz przycisku w czasie oczekiwania.
    *   **Bilans** (pastelowy fioletowy z ikoną księżyca): otwiera modal wieczornej refleksji.
*   Wyświetlanie dyskretnego baneru ostrzeżenia w przypadku błędu `NO_STRATEGIC_GOALS` (brak celów strategicznych blokujący generowanie z użyciem AI).
*   Integracja nowego modala wieczornej refleksji z formularzem `EveningReflectionForm`.

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie z zasadą Standaryzacji Środowiska, wszystkie działania uruchomieniowe i weryfikacyjne są przeprowadzane wyłącznie wewnątrz kontenerów Docker Compose:

1.  **Przebudowa i uruchomienie**:
    ```bash
    docker-compose up --build -d
    ```
2.  **Test błędu braku celów strategicznych**:
    *   Zalogowanie na nowego użytkownika (który nie ma jeszcze żadnych celów).
    *   Kliknięcie "Plan Poranny" lub wysłanie formularza "Bilans".
    *   Weryfikacja pojawienia się w interfejsie jasnego, czytelnego komunikatu informującego o konieczności wcześniejszego dodania celów strategicznych (sprawdzenie przechwycenia błędu `NO_STRATEGIC_GOALS`).
3.  **Test udanego generowania AI**:
    *   Dodanie celu strategicznego.
    *   Kliknięcie "Plan Poranny" -> weryfikacja pojawienia się nowego planu w sekcji pętli dziennej.
    *   Wysłanie wieczornego bilansu -> weryfikacja pojawienia się wygenerowanej refleksji mentora.
4.  **Testy regresji backendowej**:
    ```bash
    docker-compose run --rm backend bash -c "pytest tests/"
    ```

## Koszty
Integracja z API Gemini wiąże się z opłatami za tokeny wejściowe i wyjściowe w modelu pay-as-you-go, jednak w fazie deweloperskiej model `gemini-2.5-flash` posiada bezpłatny pakiet próbny (free tier). Koszt testów offline: 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
