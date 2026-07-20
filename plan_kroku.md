# Plan Kroku 7: Inicjalizacja Frontendu (React, Vite, Tailwind CSS, Docker)

**Cel:** Utworzenie struktury projektu frontendowego opartego o React, Vite oraz Tailwind CSS w katalogu `./frontend`, zintegrowanie go ze środowiskiem deweloperskim Docker Compose (z mapowaniem portów i wolumenów dla Hot-Reload), oraz stworzenie bazowego widoku łączącego się z backendowym endpointem `/health` jako Proof of Concept braku błędów CORS.

## Pliki do utworzenia i modyfikacji

### [NEW] `frontend/Dockerfile`
Produkcyjny i deweloperski obraz kontenera dla aplikacji frontendowej:
*   Obraz bazowy: `node:20-alpine` (lekki, oficjalny).
*   Instalacja zależności (`package.json`) i kopiowanie kodu źródłowego.
*   Domyślna komenda startowa: `CMD ["npm", "run", "dev", "--", "--host"]` do poprawnego trasowania portu w sieci kontenera.

### [NEW] `frontend/tailwind.config.js`
Konfiguracja Tailwind CSS:
*   Wymuszenie czystego, nowoczesnego kroju bezszeryfowego (`font-sans` mapowany m.in. na Inter).
*   Ustanowienie pastelowej palety barw (`pastel-blue`, `pastel-green`, `pastel-rose`, etc.) do zachowania estetyki systemu.
*   Zdefiniowanie klasy ciemnego trybu (`darkMode: 'class'`).

### [NEW] `frontend/postcss.config.js`
Konfiguracja procesora CSS Tailwind.

### [MODIFY] `docker-compose.yml`
*   Dodanie usługi `frontend` budowanej z kontekstu `./frontend`.
*   Mapowanie portu `5173:5173` na zewnątrz.
*   Podmontowanie wolumenu `./frontend:/app` dla natychmiastowego odzwierciedlania zmian w kodzie (Hot-Reload) z jednoczesnym wykluczeniem nadpisywania `node_modules` z kontenera.
*   Przekazanie zmiennej środowiskowej `VITE_API_URL=http://localhost:8080` wskazującej na deweloperski serwer backendu.

### [MODIFY] `frontend/package.json`
*   Dodanie zależności Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`).

### [MODIFY] `frontend/src/App.tsx`
*   Usunięcie boilerplate i zastąpienie go wyśrodkowanym, nowoczesnym panelem bazowym (pastelowe tła, zaokrąglenia, cienie).
*   Logika z `useEffect` wykonująca zapytanie `GET` do endpointu `/health` (zmienna `VITE_API_URL` lub fallback).
*   Dynamiczne wyświetlenie statusu API (kolor zielony przy sukcesie, czerwony przy błędzie połączenia/CORS).

---

## Strategia Weryfikacji i Certyfikacja Testami

Strategia opiera się na weryfikacji manualnej w przeglądarce po uruchomieniu kontenerów:

1.  **Uruchomienie kontenerów**:
    ```bash
    docker-compose up --build
    ```
2.  **Test działania serwera Vite**: Wejście na stronę `http://localhost:5173` – strona powinna załadować się poprawnie.
3.  **Weryfikacja Tailwind CSS**: Elementy powinny być poprawnie ułożone, zaokrąglone i ostylowane z użyciem czcionki bezszeryfowej i pastelowych kolorów z konfiguracji.
4.  **Test połączenia z API (CORS Proof of Concept)**: 
    *   Wizyta na stronie i weryfikacja pola "Status API". Powinno wyświetlać się `"KeepGoals API is running"` w kolorze zielonym.
    *   Otwarcie konsoli deweloperskiej w przeglądarce (F12 -> zakładka Console) i sprawdzenie braku jakichkolwiek błędów typu `Cross-Origin Request Blocked` lub błędów sieciowych.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
