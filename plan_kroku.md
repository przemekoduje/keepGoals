# Plan Kroku 12: Renderowanie Markdown (react-markdown, remark-gfm) oraz Szlif Wizualny (React + Vite)

**Cel:** Wdrożenie biblioteki renderującej Markdown (`react-markdown` wraz z rozszerzeniem `remark-gfm` dla list zadań) na frontendzie, stworzenie dedykowanego komponentu do stylizacji planów porannych i wieczornych, zastąpienie surowego tekstu sformatowaną treścią wewnątrz kafelków, oraz uproszczenie wyświetlania dat na bardziej naturalne i czytelne (np. "20 lipca, 22:43").

## Pliki do utworzenia i modyfikacji

### [NEW] `frontend/src/components/MarkdownRenderer.tsx`
Dedykowany komponent renderujący i stylizujący Markdown:
*   Import `react-markdown` oraz wtyczki `remark-gfm`.
*   Nadpisanie domyślnych stylów HTML za pomocą Tailwind CSS:
    *   Nagłówki (`h1`, `h2`, `h3`): `font-bold tracking-tight mt-4 mb-2` z ciemnym/jasnym kontrastem.
    *   Tekst pogrubiony (`strong`): podwyższenie wagi do `font-extrabold` dla szybkiej czytelności.
    *   Listy zadań (`input[type="checkbox"]`): ukrycie domyślnego systemowego stylu na rzecz niestandardowego, zaokrąglonego checkboxa (`rounded-[6px]`), pasującego do stylizacji pastelowych kafelków.

### [MODIFY] `frontend/package.json`
*   Dodanie zależności `react-markdown` oraz `remark-gfm` do `dependencies`.

### [MODIFY] `frontend/src/pages/Dashboard.tsx`
*   Zastąpienie surowego pola tekstowego `{note.content}` wywołaniem `<MarkdownRenderer content={note.content} />` w kafelkach.
*   Dodanie funkcji pomocniczej `formatNoteDate(dateStr: string): string` konwertującej daty ISO (np. `2026-07-20T22:43:00Z`) na naturalny język polski (np. `20 lipca, 22:43`), co eliminuje techniczny szum.
*   Weryfikacja wewnętrznych marginesów kafelków `rounded-[24px]` w celu zapewnienia odpowiedniej przestrzeni oddechowej dla sformatowanego tekstu Markdown.

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie z zasadą Standaryzacji Środowiska, wszystkie działania uruchomieniowe i weryfikacyjne są przeprowadzane wyłącznie wewnątrz kontenerów Docker Compose:

1.  **Przebudowa i uruchomienie**:
    ```bash
    docker-compose up --build -d
    ```
2.  **Test renderowania Markdown**:
    *   Weryfikacja, czy plany poranne (check-listy z `- [ ]`) są renderowane jako ładne, interaktywne lub zablokowane checkboxy z zaokrąglonymi rogami, a nie surowy tekst `- [ ]`.
    *   Sprawdzenie, czy nagłówki i pogrubienia są czytelne i prawidłowo ostylowane.
3.  **Wizualny test dat**: Sprawdzenie, czy daty notatek wyświetlają się w przyjaznym formacie.
4.  **Testy regresji backendowej**:
    ```bash
    docker-compose run --rm backend bash -c "pytest tests/"
    ```

## Koszty
Brak dodatkowych kosztów integracji. Koszt testów offline: 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
