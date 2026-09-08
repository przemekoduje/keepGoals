import os
import json
import tempfile
import subprocess
import base64
import urllib.request
from openai import OpenAI
from src.config import settings

_client = None
_groq_client = None

def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = settings.OPENAI_API_KEY or None
        _client = OpenAI(api_key=api_key)
    return _client

def get_groq_client() -> OpenAI:
    global _groq_client
    if _groq_client is None:
        api_key = settings.GROQ_API_KEY or None
        _groq_client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key
        )
    return _groq_client

def get_ai_client_and_model(task_type: str = "llm") -> tuple[OpenAI, str]:
    """
    Zwraca odpowiedniego klienta (Groq lub OpenAI) oraz nazwę modelu w zależności od konfiguracji.
    task_type: "llm" lub "whisper"
    """
    if task_type == "whisper":
        if settings.GROQ_API_KEY:
            return get_groq_client(), "whisper-large-v3"
        elif settings.OPENAI_API_KEY:
            return get_openai_client(), "whisper-1"
        else:
            return get_openai_client(), "whisper-1"
    else:
        # Do zadań językowych (strukturyzacja notatki, plan, mentor) używamy gpt-4o-mini lub modeli Gemini / Groq
        if settings.OPENAI_API_KEY:
            return get_openai_client(), "gpt-4o-mini"
        elif settings.GEMINI_API_KEY:
            return OpenAI(
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                api_key=settings.GEMINI_API_KEY
            ), "gemini-2.5-flash"
        elif settings.GROQ_API_KEY:
            return get_groq_client(), "openai/gpt-oss-120b"
        else:
            return get_openai_client(), "gpt-4o-mini"

def generate_morning_plan(strategic_goals: list[str]) -> str:
    """
    Generuje plan poranny w oparciu o listę celów strategicznych użytkownika.
    Zwraca checklistę w formacie Markdown.
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return """# Twój Plan Poranny (Demo AI)

Oto zoptymalizowany plan dnia wspierający Twoje cele strategiczne:

- [ ] **Praca Głęboka**: Przeznacz 45 minut rano na główny blok zadań.
- [ ] **Aktywność fizyczna**: Wykonaj krótki trening lub rozciąganie.
- [ ] **Refaktoryzacja**: Uporządkuj pliki i zidentyfikuj wąskie gardła w projekcie.
- [ ] **Odpoczynek**: Odłącz się od ekranów na 30 minut przed snem.
"""

    try:
        client, model = get_ai_client_and_model("llm")
        goals_formatted = "\n".join([f"- {goal}" for goal in strategic_goals])
        
        prompt = f"""Jesteś osobistym asystentem produktywności.
Twoim zadaniem jest stworzenie planu na bieżący dzień w formacie czystej checklisty Markdown (z polami do odznaczenia typu `- [ ]`).
Plan musi bezpośrednio wspierać realizację poniższych celów strategicznych użytkownika:
{goals_formatted}

Zwróć wyłącznie plan dnia jako listę zadań do wykonania w formacie Markdown, bez żadnych wstępów, podsumowań czy komentarzy."""

        response = client.chat.completions.create(
            model=model,
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
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
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
        client, model = get_ai_client_and_model("llm")
        
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
            model=model,
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


audio_system_prompt = """Jesteś wybitnym asystentem redakcyjnym. Twoim zadaniem jest przetworzenie transkrypcji nagrania głosowego na ustrukturyzowaną notatkę z inteligentnym streszczeniem.

KRYTYCZNA ZASADA: Pole `content` NIE MOŻE zawierać pełnej, dosłownej transkrypcji nagrania słowo w słowo. Zamiast tego powinno zawierać profesjonalne, zwięzłe i przejrzyste STRESZCZENIE poddane obróbce AI.

Zasady przetwarzania:
1. Treść notatki w `content`: Zredaguj eleganckie podsumowanie w języku polskim. Wyłów z nagrania kluczowe wątki i ustrukturyzuj je w sekcje, wyraźnie zaznaczając:
   - **Główny temat** (krótkie streszczenie o co chodzi)
   - **Kluczowe ustalenia / fakty**
   - **Osoby** (kto występuje lub kogo wymieniono)
   - **Miejsca i Projekty** (jeśli występują)
   - **Wydarzenia lub terminy**
2. Sekcja zadań (po streszczeniu): Po streszczeniu dodaj sekcję „### Zadania i Ustalenia" z listą konkretnych zadań do zrobienia wyekstrahowanych z nagrania, sformatowaną za pomocą checkboxów `- [ ]` w standardzie GFM Markdown.
3. Tytuł: Utwórz trafny, krótki tytuł notatki (max 5-6 słów).
4. Daty i terminy: Wykryj w treści wszelkie propozycje dat, terminów, spotkań. Załóż bieżący rok kalendarzowy jeśli nie podano inaczej.
5. Wykrywanie osób do delegacji: Wykryj wszystkie imiona, nazwiska lub adresy e-mail osób wymienionych w nagraniu. Zwróć je w polu `suggested_assignees`. Jeśli w nagraniu sugerowane jest zlecenie komuś zadania (np. "Krzysiek musi to zrobić"), koniecznie dodaj tę osobę do `suggested_assignees`, aby aplikacja mogła zasugerować przekazanie notatki. Jeśli brak – zwróć [].

Zwróć odpowiedź WYŁĄCZNIE jako czysty obiekt JSON (bez znaczników formatowania bloku kodu, takich jako ```json):
{
    "title": "Trafny, krótki tytuł notatki (max 5-6 słów)",
    "content": "# Streszczenie i Kluczowe Wątki\\n\\n[Tutaj Twoje zredagowane podsumowanie z podziałem na sekcje i wyłowieniem kluczowych elementów: daty, osoby, plany, miejsca]\\n\\n### Zadania i Ustalenia\\n- [ ] Pierwsze zadanie do zrobienia\\n- [ ] Drugie zadanie do zrobienia",
    "suggested_assignees": ["Imię Osoby 1", "email@example.com"],
    "events": [
        {
            "title": "Krótki tytuł wydarzenia",
            "date_start": "Data i czas rozpoczęcia (standardowy format ISO-8601, np. 2024-01-01T12:00:00Z)",
            "date_end": "Data i czas zakończenia (standardowy format ISO-8601, np. 2024-01-01T13:00:00Z)",
            "description": "Krótki opis kontekstowy"
        }
    ]
}
"""

VIDEO_SYSTEM_PROMPT = """Jesteś wybitnym asystentem produktywności. Przeanalizuj transkrypcję załączonego nagrania wideo i przygotuj ustrukturyzowaną notatkę z inteligentnym streszczeniem.

KRYTYCZNA ZASADA: Pole `content` NIE MOŻE zawierać pełnej, dosłownej transkrypcji nagrania słowo w słowo. Zamiast tego powinno zawierać profesjonalne, zwięzłe i przejrzyste STRESZCZENIE poddane obróbce AI.

Zasady przetwarzania:
1. Treść notatki w `content`: Zredaguj eleganckie podsumowanie w języku polskim. Wyłów z nagrania kluczowe wątki i ustrukturyzuj je w sekcje, wyraźnie zaznaczając:
   - **Główny temat** (krótkie streszczenie o co chodzi)
   - **Kluczowe ustalenia / fakty**
   - **Osoby** (kto występuje lub kogo wymieniono)
   - **Miejsca i Projekty** (jeśli występują)
   - **Wydarzenia lub terminy**
2. Sekcja zadań (po streszczeniu): Po streszczeniu dodaj sekcję „### Zadania i Ustalenia" z listą konkretnych zadań do zrobienia wyekstrahowanych z nagrania, sformatowaną za pomocą checkboxów `- [ ]` w standardzie GFM Markdown.
3. Tytuł: Utwórz krótki, chwytliwy tytuł podsumowujący główny wątek (max 5-6 słów).
4. Wykrywanie osób do delegacji: Wykryj wszystkie imiona, nazwiska lub adresy e-mail osób wymienionych w nagraniu. Zwróć je w polu `suggested_assignees`. Jeśli w nagraniu sugerowane jest zlecenie komuś zadania, koniecznie dodaj tę osobę do `suggested_assignees`, aby aplikacja mogła zasugerować przekazanie notatki. Jeśli brak – zwróć [].
5. Daty i terminy: Wykryj daty, terminy i spotkania. Użyj formatu ISO-8601.

Zwróć odpowiedź WYŁĄCZNIE jako czysty obiekt JSON, bez żadnych dodatkowych komentarzy ani formatowania blokowego (typu ```json).

Wymagany schemat JSON:
{
    "title": "Krótki, chwytliwy tytuł (max 5-6 słów).",
    "content": "# Streszczenie i Kluczowe Wątki\\n\\n[Tutaj Twoje zredagowane podsumowanie z podziałem na sekcje i wyłowieniem kluczowych elementów: daty, osoby, plany, miejsca]\\n\\n### Zadania i Ustalenia\\n- [ ] Pierwsze zadanie do zrobienia\\n- [ ] Drugie zadanie do zrobienia",
    "suggested_assignees": ["Imię Osoby", "email@example.com"],
    "events": [
        {
            "title": "Tytuł spotkania / wydarzenia",
            "date_start": "Data i czas rozpoczęcia (standardowy format ISO-8601, np. 2024-01-01T12:00:00Z)",
            "date_end": "Data i czas zakończenia (standardowy format ISO-8601, np. 2024-01-01T13:00:00Z)",
            "description": "Krótki opis zdarzenia"
        }
    ]
}"""

def extract_audio_for_whisper(input_bytes: bytes, mime_type: str) -> str:
    """
    Ekstrahuje i kompresuje ścieżkę dźwiękową z nagrania wideo/audio za pomocą ffmpeg (do formatu MP3 64k).
    Dzięki temu nawet 50 MB wideo zamienia się w plik mp3 ~500 KB, co eliminuje błąd 413 (limit 25MB w OpenAI Whisper).
    """
    clean_mime = mime_type.split(';')[0].strip()
    ext = clean_mime.split('/')[-1] if '/' in clean_mime else 'webm'
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as in_file:
        in_file.write(input_bytes)
        in_path = in_file.name

    out_path = in_path + ".mp3"
    
    try:
        cmd = ['ffmpeg', '-y', '-i', in_path, '-vn', '-acodec', 'libmp3lame', '-ab', '64k', out_path]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        if os.path.exists(in_path):
            os.remove(in_path)
        return out_path
    except Exception as e:
        print(f"Ostrzeżenie: Kompresja ffmpeg pominięta ({e}). Używanie oryginalnego pliku.")
        if os.path.exists(out_path):
            os.remove(out_path)
        return in_path

def _analyze_media(file_bytes: bytes, mime_type: str, prompt: str) -> dict:
    # Fallback jeśli API key nie jest skonfigurowane
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return {
            "title": "Transkrypcja (Demo)",
            "content": "To jest przykładowa transkrypcja wygenerowana ponieważ brakuje kluczy API w pliku .env.\n\n- [ ] Przeanalizuj to zadanie\n- [ ] Zaplanuj kolejne kroki"
        }

    try:
        # Ekstrakcja audio z nagrania wideo/audio dla OpenAI Whisper (drastyczna redukcja rozmiaru pliku)
        temp_path = extract_audio_for_whisper(file_bytes, mime_type)

        try:
            # Transkrypcja pliku za pomocą modelu Whisper (z automatycznym fallbackiem)
            transcribed_text = ""
            try:
                whisper_client, whisper_model = get_ai_client_and_model("whisper")
                with open(temp_path, "rb") as audio_file:
                    transcript = whisper_client.audio.transcriptions.create(
                        model=whisper_model,
                        file=audio_file,
                        language="pl",
                        prompt="Polska narada, cele, zadania, notatki, planowanie."
                    )
                transcribed_text = transcript.text
            except Exception as whisper_err:
                print(f"[Whisper Primary Failed: {whisper_err}]. Próba OpenAI whisper-1...")
                if settings.OPENAI_API_KEY:
                    with open(temp_path, "rb") as audio_file:
                        transcript = get_openai_client().audio.transcriptions.create(
                            model="whisper-1",
                            file=audio_file,
                            language="pl"
                        )
                    transcribed_text = transcript.text
                else:
                    raise whisper_err
            
            # Opcjonalne zabezpieczenie przed pustą transkrypcją
            if not transcribed_text.strip():
                return {
                    "title": "Puste nagranie",
                    "content": "Nie udało się rozpoznać mowy w nagraniu."
                }

            # Pobierz odpowiedniego klienta i model dla analizy tekstu
            llm_client, llm_model = get_ai_client_and_model("llm")

            # Analiza i strukturyzacja przetranskrybowanego tekstu
            response = llm_client.chat.completions.create(
                model=llm_model,
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
                
            result = json.loads(response_text.strip())
            result["raw_transcript"] = transcribed_text
            return result
            
        finally:
            # Czyszczenie zasobów lokalnych
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        print(f"Błąd analizy mediów AI: {e}. Fallback do danych zastępczych.")
        return {
            "title": "Notatka z nagrania (Offline)",
            "content": f"Nagranie zostało zapisane. Transkrypcja i analiza przez AI są chwilowo niedostępne z powodu błędu: {e}"
        }

def analyze_audio_note(file_bytes: bytes, mime_type: str, user_timezone: str = "Europe/Warsaw", team_members: list = None) -> dict:
    from datetime import datetime
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    context = f"\nBieżący czas (punkt odniesienia): {now_str} (Strefa czasowa: {user_timezone})\n"
    if team_members:
        context += f"Oto lista aktualnych członków zespołu użytkownika (adresy email lub identyfikatory): {', '.join(team_members)}.\n"
        context += "Jeśli w nagraniu padają imiona (np. Ola, Marek) współpracowników, postaraj się dopasować je do tej listy i w 'suggested_assignees' zwróć ich dokładny adres z powyższej listy zamiast samego imienia. Jeśli kogoś nie ma na liście, zwróć jego imię.\n"
    return _analyze_media(file_bytes, mime_type, audio_system_prompt + context)

def analyze_video_note(file_bytes: bytes, mime_type: str, user_timezone: str = "Europe/Warsaw", team_members: list = None) -> dict:
    from datetime import datetime
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    context = f"\nBieżący czas (punkt odniesienia): {now_str} (Strefa czasowa: {user_timezone})\n"
    if team_members:
        context += f"Oto lista aktualnych członków zespołu użytkownika (adresy email lub identyfikatory): {', '.join(team_members)}.\n"
        context += "Jeśli w nagraniu padają imiona (np. Ola, Marek) współpracowników, postaraj się dopasować je do tej listy i w 'suggested_assignees' zwróć ich dokładny adres z powyższej listy zamiast samego imienia. Jeśli kogoś nie ma na liście, zwróć jego imię.\n"
    return _analyze_media(file_bytes, mime_type, VIDEO_SYSTEM_PROMPT + context)


CHAT_SYSTEM_PROMPT = """Jesteś inteligentnym asystentem redakcyjnym notatki.
Twoim zadaniem jest pomoc użytkownikowi w analizie, ulepszeniu lub modyfikacji obecnej treści notatki.
Rozmawiasz z użytkownikiem o tej notatce. 
Jeśli dojdziesz do wniosku, że należy zmodyfikować treść notatki lub użytkownik Cię o to poprosi, WYGENERUJ NOWĄ TREŚĆ NOTATKI obejmując ją bezwzględnie w znaczniki:
<REWRITTEN_NOTE>
Tutaj nowa treść notatki (w formacie Markdown)
</REWRITTEN_NOTE>
Jeśli nie modyfikujesz notatki, po prostu odpisz w czacie. Odpowiadaj zwięźle i profesjonalnie.
"""

def extract_video_frames(video_path: str, num_frames: int = 6) -> list[str]:
    import cv2
    import base64
    frames_b64 = []
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print("Nie można otworzyć wideo przez cv2.")
            return []
        
        # Przebieg 1: Zlicz klatki, ponieważ cap.get() i cap.set() nie działają poprawnie z plikami WebM.
        total_frames = 0
        while cap.grab():
            total_frames += 1
            
        if total_frames == 0:
            cap.release()
            return []
            
        step = max(1, total_frames // num_frames)
        
        # Przebieg 2: Wyciągnij wybrane klatki sekwencyjnie.
        cap.release()
        cap = cv2.VideoCapture(video_path)
        
        current_frame = 0
        target_frame = 0
        frames_extracted = 0
        
        while cap.isOpened() and frames_extracted < num_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            if current_frame == target_frame:
                success, buffer = cv2.imencode('.jpg', frame)
                if success:
                    b64 = base64.b64encode(buffer).decode('utf-8')
                    frames_b64.append(b64)
                    frames_extracted += 1
                target_frame += step
                
            current_frame += 1
                
        cap.release()
    except Exception as e:
        print(f"Błąd ekstrakcji klatek wideo (cv2): {e}")
    return frames_b64

def chat_with_ai_about_note(note_content: str, chat_history: list, media_url: str = None, media_type: str = None, events: list = None, raw_transcript: str = None) -> str:
    """
    Prowadzi konwersację z AI na temat podanej notatki.
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY:
        return "To jest wersja demo czatu z AI, ponieważ brak klucza API. Wyobraź sobie, że odpowiadam na Twoje pytanie!\n\n<REWRITTEN_NOTE>\nTo jest przykładowa (zmieniona) treść notatki.\n</REWRITTEN_NOTE>"

    try:
        client, model = get_ai_client_and_model("llm")
        # Przytnij historię do ostatnich 10 wiadomości, aby ograniczyć koszty tokenów
        trimmed_history = chat_history[-10:]
        
        system_prompt = f"{CHAT_SYSTEM_PROMPT}\n\n[OBECNA TREŚĆ NOTATKI]:\n{note_content}"
        
        if events:
            events_str = json.dumps(events, ensure_ascii=False, indent=2)
            system_prompt += f"\n\n[WYKRYTE WYDARZENIA W NOTATCE]:\n{events_str}"
            
        if raw_transcript:
            system_prompt += f"\n\n[SUROWA TRANSKRYPCJA Z NAGRANIA (DLA PEŁNEGO KONTEKSTU)]:\n{raw_transcript}"
            
        if media_url and media_type:
            if media_type.startswith("audio"):
                system_prompt += "\n\n[KONTEKST AUDIO]: Ta notatka została automatycznie wygenerowana na podstawie nagrania głosowego (audio). Powyższa treść i wydarzenia pochodzą bezpośrednio z tego nagrania."
            elif media_type.startswith("video"):
                system_prompt += "\n\n[KONTEKST WIDEO]: Ta notatka została automatycznie wygenerowana na podstawie nagrania wideo. Wraz z najnowszą wiadomością użytkownika otrzymałeś kilka klatek (zdjęć) wyciętych z tego filmu. Przeanalizuj je dokładnie, aby zrozumieć wizualny kontekst nagrania i móc na nim bazować w odpowiedziach. Powyższa treść i wydarzenia pochodzą bezpośrednio z tego nagrania."
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in trimmed_history:
            messages.append({"role": msg.role, "content": msg.content})

        # Klatki wideo tylko dla OpenAI (modele Groq są wyłącznie tekstowe)
        if media_url and media_type and media_type.startswith("video") and not settings.GROQ_API_KEY:
            frames_b64 = []
            if media_url.startswith("data:"):
                try:
                    header, b64_data = media_url.split(",", 1)
                    video_bytes = base64.b64decode(b64_data)
                    tmp_path = tempfile.mktemp(suffix=".webm")
                    with open(tmp_path, "wb") as f:
                        f.write(video_bytes)
                    frames_b64 = extract_video_frames(tmp_path)
                    os.remove(tmp_path)
                except Exception as e:
                    print(f"Błąd dekodowania wideo z base64: {e}")
            elif media_url.startswith("/uploads/"):
                local_path = "." + media_url
                if os.path.exists(local_path):
                    frames_b64 = extract_video_frames(local_path)
            elif media_url.startswith("http"):
                try:
                    tmp_path = tempfile.mktemp(suffix=".webm")
                    urllib.request.urlretrieve(media_url, tmp_path)
                    frames_b64 = extract_video_frames(tmp_path)
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)
                except Exception as e:
                    print(f"Błąd pobierania wideo do analizy: {e}")

            if frames_b64:
                last_user_idx = None
                for i in reversed(range(len(messages))):
                    if messages[i]["role"] == "user":
                        last_user_idx = i
                        break
                if last_user_idx is not None:
                    orig_text = messages[last_user_idx]["content"]
                    content_list = [{"type": "text", "text": orig_text}]
                    for b64 in frames_b64:
                        content_list.append({
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
                        })
                    messages[last_user_idx]["content"] = content_list

        response = client.chat.completions.create(
            model=model,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd OpenAI API w czacie notatki: {e}")
        return "Przepraszam, wystąpił problem z serwerami AI. Spróbuj ponownie później."

def generate_handoff_summary(note_content: str, delegate_name: str) -> str:
    """
    Analizuje treść notatki i generuje zwięzłe podsumowanie zadań przeznaczonych dla konkretnego delegata.
    """
    try:
        client, model = get_ai_client_and_model("llm")
        prompt = (
            f"Przeanalizuj poniższą notatkę i przygotuj zwięzłe, uporządkowane podsumowanie zadań oraz wątków, "
            f"które dotyczą wyłącznie osoby o imieniu/nazwie '{delegate_name}'. "
            f"Stwórz jasną listę punktów do zrealizowania dla tej osoby. "
            f"Nie dodawaj wstępów ani zbędnych wyjaśnień, sformatuj tekst czytelnie w Markdown."
        )
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": note_content}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd OpenAI/Groq API w generowaniu handoff summary: {e}")
        return f"Zadanie przekazane do {delegate_name}. Brak dodatkowego podsumowania."

GOALS_CHAT_SYSTEM_PROMPT = """
Jesteś strategicznym doradcą i partnerem w realizacji celów (AI Goal & Focus Coach) w aplikacji keepGoals.
Twoją misją jest pomóc użytkownikowi w planowaniu, priorytetyzacji oraz realizacji jego celów w oparciu o wizualną przestrzeń 2D.

Zrozumienie przestrzeni 2D w keepGoals:
1. Oś pozioma X (0% - 100%):
   - Lewa strona (X < 40%): Rozproszenia, pożeracze czasu, nieproduktywne nawyki („Brak realizacji”).
   - Prawa strona (X > 60%): Kluczowe cele, priorytety o wysokiej dźwigni („Cel”).
   - Środek (X 40% - 60%): Bieżące sprawy, zadania operacyjne.
2. Oś pionowa Y (14% - 84%): Waga / wpływ kafelka:
   - Im wyżej (Y blisko 84%), tym większy kafelek i większy wpływ na życie/karierę.
   - Im niżej (Y blisko 14%), tym mniejsza waga.

Gdy użytkownik pyta o kolejny kafelek lub gdy sugerujesz dodanie nowego kafelka (celu bądź rozproszenia):
Zaproponuj konkretną nazwę oraz pozycję (X i Y).
ZAKOŃCZ swoją wypowiedź znacznikiem:
<SUGGESTED_TILE title="Nazwa kafelka" x="liczba" y="liczba">Krótkie uzasadnienie</SUGGESTED_TILE>
Przykład:
<SUGGESTED_TILE title="Walidacja z klientami" x="82" y="70">Kluczowy krok zwiększający szansę powodzenia projektu.</SUGGESTED_TILE>

Styl wypowiedzi:
- Zwięzły, konkretny, inspirujący, zorientowany na rezultaty (jak Gemini / ChatGPT).
- Formatuj wypowiedzi czytelnie w Markdown (krótkie akapity, punktor).
- Jeśli brak podanych kafelków, zaproponuj pierwszy kluczowy cel lub zbadaj nawyki użytkownika.
"""

def chat_with_ai_about_goals(messages: list, current_tiles: list = None, strategic_goals: list = None) -> str:
    """
    Prowadzi konwersację z AI na temat kafelków, osi 2D oraz celów strategicznych użytkownika.
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY and not settings.GEMINI_API_KEY:
        return (
            "Świetnie, że nad tym pracujesz! W oparciu o Twoje obecne kafelki, kluczowym kolejnym krokiem "
            "powinno być skupienie się na walidacji i egzekucji.\n\n"
            "Sugeruję dodanie kafelka o wysokim wpływie:\n"
            "<SUGGESTED_TILE title=\"Walidacja z użytkownikami\" x=\"80\" y=\"72\">Kluczowy krok do przyspieszenia realizacji celów.</SUGGESTED_TILE>"
        )

    try:
        client, model = get_ai_client_and_model("llm")
        trimmed_history = messages[-10:]

        system_content = GOALS_CHAT_SYSTEM_PROMPT

        if current_tiles:
            tiles_desc = []
            for t in current_tiles:
                title = t.get("title", "")
                x = t.get("x", 50)
                y = t.get("y", 50)
                zone = "Rozproszenie / brak realizacji" if x < 40 else ("Cel strategiczny" if x > 60 else "Zadanie bieżące")
                weight = "Wysoka" if y > 60 else ("Niska" if y < 35 else "Średnia")
                tiles_desc.append(f"- \"{title}\": pozycja X={x}% ({zone}), waga Y={y}% ({weight})")
            system_content += "\n\n[OBECNY UKŁAD KAFELKÓW NA OSI 2D]:\n" + "\n".join(tiles_desc)
        else:
            system_content += "\n\n[OBECNY UKŁAD KAFELKÓW NA OSI]: Brak kafelków na osi."

        if strategic_goals:
            system_content += "\n\n[ZAREJESTROWANE CELE STRATEGICZNE]:\n- " + "\n- ".join(strategic_goals)

        chat_msgs = [{"role": "system", "content": system_content}]
        for msg in trimmed_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            chat_msgs.append({"role": role, "content": content})

        response = client.chat.completions.create(
            model=model,
            messages=chat_msgs,
            temperature=0.7,
            max_tokens=600
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Błąd AI API w czacie celów: {e}")
        return "Przepraszam, wystąpił problem z połączeniem z serwerem AI. Spróbuj ponownie za chwilę."

def suggest_tiles_for_goal(title: str, description: str) -> list[str]:
    """
    Generuje sugestie kafelków do osi 2D na podstawie tytułu i opisu celu.
    Zwraca listę stringów (nazw kafelków).
    """
    if not settings.OPENAI_API_KEY and not settings.GROQ_API_KEY and not settings.GEMINI_API_KEY:
        return [
            "Walidacja rynkowa",
            "Prototyp (MVP)",
            "Badanie nawyków",
            "Eliminacja rozpraszaczy",
            "Bloki pracy głębokiej"
        ]

    try:
        client, model = get_ai_client_and_model("llm")
        prompt = f"""Jesteś doradcą ds. celów i produktywności.
Użytkownik utworzył nowy cel strategiczny:
Tytuł: {title}
Opis: {description}

Zaproponuj 5 do 7 konkretnych, zwięzłych kafelków (krótkie nazwy, max 3-4 słowa), które użytkownik mógłby umieścić na swojej wizualnej tablicy priorytetów. 
Kafelki powinny stanowić mieszankę:
- kluczowych zadań lub kamieni milowych wspierających cel
- potencjalnych rozpraszaczy, których należy unikać (tzw. antywzorce dla tego celu)
- kluczowych nawyków do zbudowania

Odpowiedz WYŁĄCZNIE jako czysta tablica JSON w formacie:
["Nazwa 1", "Nazwa 2", "Nazwa 3"]
Nie dodawaj żadnych innych tekstów ani tagów markdown."""

        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )
        
        response_text = response.choices[0].message.content.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        import json
        result = json.loads(response_text.strip())
        if isinstance(result, list):
            return result
        return []
    except Exception as e:
        print(f"Błąd AI API w suggest_tiles_for_goal: {e}")
        return [
            "Pierwszy kamień milowy",
            "Kluczowy nawyk",
            "Eliminacja dystrakcji",
            "Analiza postępów"
        ]
