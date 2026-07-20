# Plan Kroku 8: Autoryzacja Firebase, Globalny Stan AuthContext oraz Chronione Trasy (React + Vite)

**Cel:** Wdrożenie bibliotek nawigacyjnych (`react-router-dom`) i autoryzacyjnych (`firebase`), konfiguracja klienta Firebase na frontendzie, wprowadzenie globalnego stanu uwierzytelniania `AuthContext` z automatyczną subskrypcją stanu sesji (`onAuthStateChanged`) oraz zaimplementowanie chronionych tras (Protected Routes) zabezpieczających wejście do aplikacji.

## Pliki do utworzenia i modyfikacji

### [NEW] `frontend/src/config/firebase.ts`
Konfiguracja i inicjalizacja instancji Firebase:
*   Wczytywanie zmiennych środowiskowych `VITE_FIREBASE_*` wstrzykiwanych przez klienta Vite.
*   Inicjalizacja aplikacji Firebase SDK (`initializeApp`) i uwierzytelniania: `export const auth = getAuth(app)`.

### [NEW] `frontend/src/context/AuthContext.tsx`
Dostawca globalnego stanu autoryzacji (`AuthProvider`):
*   Zarządzanie stanem `user` (`User | null`) oraz flagą `loading` (`boolean`).
*   Subskrypcja stanu sesji w `useEffect` przez `onAuthStateChanged(auth, ...)`.
*   Eksport metod asynchronicznych: `loginWithGoogle` (metoda Google Auth Popup) oraz `logout` (wywołanie `signOut(auth)`).
*   Udostępnienie niestandardowego hooka `useAuth()`.

### [NEW] `frontend/src/components/ProtectedRoute.tsx`
Komponent wyższego rzędu do ochrony zasobów:
*   Jeśli `loading` jest równy `true` – wyświetlenie minimalistycznego, kręcącego się loadera.
*   Jeśli `user` nie jest zalogowany (`null`) – wymuszenie przekierowania do strony `/login` przy użyciu `<Navigate to="/login" replace />`.
*   Jeśli użytkownik jest zalogowany – wyrenderowanie chronionej zawartości (`children`).

### [NEW] `frontend/src/pages/Login.tsx`
Minimalistyczny, nowoczesny widok logowania:
*   Zaokrąglona karta (`rounded-[24px]`) z miękkim cieniem (`shadow-sm`) i pastelowym tłem.
*   Przycisk "Kontynuuj z Google" wyzwalający logowanie popupowe Firebase i przekierowujący do strony głównej `/` po udanym procesie.

### [MODIFY] `frontend/package.json`
*   Dodanie zależności `firebase` (SDK Firebase) oraz `react-router-dom` (zarządzanie trasowaniem).

### [MODIFY] `frontend/src/App.tsx`
*   Usunięcie kodu PoC.
*   Inicjalizacja routera `<BrowserRouter>` i struktury tras:
    *   `/login` -> publiczny ekran logowania.
    *   `/` -> chroniony ekran główny (tymczasowy placeholder Dashboard z przyciskiem wylogowania) owinięty w `<ProtectedRoute>`.
*   Otoczenie całego drzewa aplikacji w dostawcę `<AuthProvider>`.

---

## Strategia Weryfikacji i Certyfikacja Testami

Zgodnie z zasadą Standaryzacji Środowiska, wszystkie działania uruchomieniowe i weryfikacyjne są przeprowadzane wyłącznie wewnątrz kontenerów Docker Compose:

1.  **Uruchomienie i przebudowa środowiska**:
    ```bash
    docker-compose up --build -d
    ```
2.  **Test przekierowania chronionego**: Wejście na `http://localhost:5173/` bez zalogowania. Powinno natychmiast nastąpić przekierowanie do `http://localhost:5173/login`.
3.  **Test widoku logowania**: Weryfikacja stylizacji ekranu logowania i pomyślnego załadowania przycisku Google.
4.  **Test logowania/wylogowania**: Kliknięcie przycisku logowania (po skonfigurowaniu kluczy Firebase w pliku `.env`) i sprawdzenie, czy następuje pomyślne wejście na Dashboard, a następnie powrót do logowania po kliknięciu "Wyloguj się".

## Koszty
Integracja Firebase Authentication w trybie standardowym (Google Auth) jest darmowa i nie generuje żadnych opłat na platformie Google Cloud Platform. Koszt testów: 0 PLN.

---
**TWARDY STOP (Halt)**
Oczekuję na weryfikację planu przez Architekta. Zatrzymanie modyfikacji kodu jest bezwzględne. Po pomyślnej walidacji i otrzymaniu autoryzacji proszę o komendę **"Dalej"**.
