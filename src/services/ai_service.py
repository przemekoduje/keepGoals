from openai import OpenAI
from src.config import settings

_client = None

def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = settings.OPENAI_API_KEY or None
        _client = OpenAI(api_key=api_key)
    return _client

def generate_morning_plan(strategic_goals: list[str]) -> str:
    """
    Generuje plan poranny w oparciu o listę celów strategicznych użytkownika.
    Zwraca checklistę w formacie Markdown.
    """
    if not settings.OPENAI_API_KEY:
        return """# Twój Plan Poranny (Demo AI)

Oto zoptymalizowany plan dnia wspierający Twoje cele strategiczne:

- [ ] **Praca Głęboka**: Przeznacz 45 minut rano na główny blok zadań.
- [ ] **Aktywność fizyczna**: Wykonaj krótki trening lub rozciąganie.
- [ ] **Refaktoryzacja**: Uporządkuj pliki i zidentyfikuj wąskie gardła w projekcie.
- [ ] **Odpoczynek**: Odłącz się od ekranów na 30 minut przed snem.
"""

    try:
        client = get_openai_client()
        goals_formatted = "\n".join([f"- {goal}" for goal in strategic_goals])
        
        prompt = f"""Jesteś osobistym asystentem produktywności.
Twoim zadaniem jest stworzenie planu na bieżący dzień w formacie czystej checklisty Markdown (z polami do odznaczenia typu `- [ ]`).
Plan musi bezpośrednio wspierać realizację poniższych celów strategicznych użytkownika:
{goals_formatted}

Zwróć wyłącznie plan dnia jako listę zadań do wykonania w formacie Markdown, bez żadnych wstępów, podsumowań czy komentarzy."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd OpenAI API: {e}. Fallback do demo planu.")
        return """# Twój Plan Poranny (Demo AI - Błąd Połączenia)

Oto zoptymalizowany plan dnia wspierający Twoje cele strategiczne:

- [ ] **Praca Głęboka**: Przeznacz 45 minut rano na główny blok zadań.
- [ ] **Aktywność fizyczna**: Wykonaj krótki trening lub rozciąganie.
- [ ] **Refaktoryzacja**: Uporządkuj pliki i zidentyfikuj wąskie gardła w projekcie.
- [ ] **Odpoczynek**: Odłącz się od ekranów na 30 minut przed snem.
"""

def generate_evening_reflection(reflection_data: dict, strategic_goals: list[str]) -> str:
    """
    Generuje wieczorną refleksję (mentor) analizując sukcesy i porażki dnia w odniesieniu do celów strategicznych.
    """
    if not settings.OPENAI_API_KEY:
        return """# Analiza Mentora (Demo AI)

Przeanalizowałem Twój dzisiejszy dzień w odniesieniu do celów strategicznych. Oto moje spostrzeżenia:

## Wyciągnięte wnioski
* **Świetna robota** z realizacją dzisiejszych zadań! Konsekwencja buduje nawyki.
* Niezrealizowane zadania to wartościowa lekcja – spróbuj jutro zaplanować je na porę dnia, gdy masz najwięcej energii.
* **Super**, że udało się uniknąć niepożądanych nawyków! Samodyscyplina jest kluczem do sukcesu.

## Rekomendacja na jutro
Zacznij dzień od najważniejszego zadania jako pierwszego (zasada *Eat That Frog*). Trzymam kciuki!
"""

    try:
        client = get_openai_client()
        
        goals_formatted = "\n".join([f"- {goal}" for goal in strategic_goals])
        completed_formatted = "\n".join([f"- {task}" for task in reflection_data.get("completed_tasks", [])])
        uncompleted_formatted = "\n".join([f"- {task}" for task in reflection_data.get("uncompleted_tasks", [])])
        avoided_formatted = "\n".join([f"- {habit}" for habit in reflection_data.get("avoided_habits", [])])
        
        prompt = f"""Jesteś osobistym mentorem rozwoju osobistego i produktywności.
Twoim zadaniem jest przeanalizowanie dzisiejszych sukcesów i porażek użytkownika w kontekście jego celów strategicznych.

Cele strategiczne użytkownika:
{goals_formatted}

Dzisiejsza wieczorna refleksja:
- Zadania zrealizowane dzisiaj:
{completed_formatted or '- (brak)'}
- Zadania niezrealizowane dzisiaj:
{uncompleted_formatted or '- (brak)'}
- Uniknięte niechciane nawyki (pozytywne zaniechania):
{avoided_formatted or '- (brak)'}

Wygeneruj zwięzłe podsumowanie z konstruktywnymi wnioskami optymalizacyjnymi na jutro w formacie Markdown. Twoja odpowiedź powinna być wspierająca, obiektywna i skupiona na konkretnych krokach poprawy."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd OpenAI API: {e}. Fallback do demo refleksji.")
        return """# Analiza Mentora (Demo AI - Błąd Połączenia)

Przeanalizowałem Twój dzisiejszy dzień w odniesieniu do celów strategicznych. Oto moje spostrzeżenia:

## Wyciągnięte wnioski
* **Świetna robota** z realizacją dzisiejszych zadań! Konsekwencja buduje nawyki.
* Niezrealizowane zadania to wartościowa lekcja – spróbuj jutro zaplanować je na porę dnia, gdy masz najwięcej energii.
* **Super**, że udało się uniknąć niepożądanych nawyków! Samodyscyplina jest kluczem do sukcesu.

## Rekomendacja na jutro
Zacznij dzień od najważniejszego zadania jako pierwszego (zasada *Eat That Frog*). Trzymam kciuki!
"""


import tempfile
import os
import json

audio_system_prompt = """Jesteś wybitnym asystentem redakcyjnym. Twoim zadaniem jest przetworzenie załączonego nagrania głosowego na wysoce ustrukturyzowaną notatkę tekstową.

Zasady przetwarzania:
1. Korekta: Popraw błędy gramatyczne, składniowe i stylistyczne. Zmień luźny język mówiony na klarowny, profesjonalny i formalny tekst pisany.
2. Strukturyzacja (Krytyczne): Jeśli z kontekstu nagrania wynika wyliczanie elementów (np. lista zadań, zakupy, instrukcje krok po kroku, słowa "po pierwsze", "kolejna rzecz"), bezwzględnie sformatuj je jako interaktywną listę w standardzie GFM Markdown, używając znaczników `- [ ]`.
3. Zwięzłość: Odrzuć zająknięcia, powtórzenia słów, dygresje i szum myślowy. Skup się na esencji przekazu.

Zwróć odpowiedź WYŁĄCZNIE jako czysty obiekt JSON (bez znaczników formatowania bloku kodu, takich jak ```json):
{
    "title": "Trafny, krótki tytuł notatki (max 5 słów)",
    "content": "Sformatowana treść notatki w standardzie Markdown (z rygorystycznym użyciem - [ ] dla wszelkich list i zadań)"
}
"""

VIDEO_SYSTEM_PROMPT = """Jesteś wybitnym asystentem produktywności. Przeanalizuj załączone nagranie wideo.
Twoim celem jest wyciągnięcie kluczowych informacji i przekształcenie ich w zwięzłą, czytelną notatkę.

Zwróć odpowiedź WYŁĄCZNIE jako czysty obiekt JSON, bez żadnych dodatkowych komentarzy ani formatowania blokowego (typu ```json).

Wymagany schemat JSON:
{
    "title": "Krótki, chwytliwy tytuł podsumowujący główny wątek (max 5-6 słów).",
    "content": "Kluczowe informacje w formacie Markdown. Użyj list punktowanych dla lepszej czytelności. Jeżeli z nagrania wynikają konkretne akcje do podjęcia (To-Do), wylistuj je z użyciem checkboxów `- [ ]`. Odrzuć szum i poboczne wątki, bądź maksymalnie konkretny."
}"""

def _analyze_media(file_bytes: bytes, mime_type: str, prompt: str) -> dict:
    try:
        client = get_openai_client()
    except Exception as e:
        print(f"Błąd inicjalizacji OpenAI klienta: {e}")
        return {
            "title": "Notatka awaryjna",
            "content": "API niedostępne. Wygenerowano dane zastępcze."
        }
    
    # Utworzenie tymczasowego pliku
    clean_mime = mime_type.split(';')[0].strip()
    extension = clean_mime.split('/')[-1] if '/' in clean_mime else 'webm'
    
    # Fallback jeśli API key nie jest skonfigurowane
    if not settings.OPENAI_API_KEY:
        return {
            "title": "Transkrypcja (Demo)",
            "content": "To jest przykładowa transkrypcja wygenerowana ponieważ brakuje klucza API.\n\n- [ ] Przeanalizuj to zadanie\n- [ ] Zaplanuj kolejne kroki"
        }

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{extension}") as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        try:
            # Transkrypcja pliku za pomocą modelu Whisper z OpenAI
            with open(temp_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                
            transcribed_text = transcript.text
            
            # Opcjonalne zabezpieczenie przed pustą transkrypcją
            if not transcribed_text.strip():
                return {
                    "title": "Puste nagranie",
                    "content": "Nie udało się rozpoznać mowy w nagraniu."
                }

            # Analiza i strukturyzacja przetranskrybowanego tekstu przez GPT-4o-mini
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": f"Oto transkrypcja nagrania do przeanalizowania i sformatowania:\n\n{transcribed_text}"}
                ]
            )
            
            response_text = response.choices[0].message.content.strip()
            
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
                
            return json.loads(response_text.strip())
            
        finally:
            # Czyszczenie zasobów lokalnych
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        print(f"Błąd analizy mediów AI: {e}. Fallback do danych zastępczych.")
        return {
            "title": "Notatka z nagrania (Offline)",
            "content": "Nagranie zostało zapisane. Transkrypcja i analiza przez AI są chwilowo niedostępne z powodu problemów z połączeniem."
        }

def analyze_audio_note(file_bytes: bytes, mime_type: str) -> dict:
    return _analyze_media(file_bytes, mime_type, audio_system_prompt)

def analyze_video_note(file_bytes: bytes, mime_type: str) -> dict:
    return _analyze_media(file_bytes, mime_type, VIDEO_SYSTEM_PROMPT)


