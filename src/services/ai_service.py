import os
import re
import json
import tempfile
import subprocess
import base64
import urllib.request
import urllib.error
from openai import OpenAI
from src.config import settings

_verified_gemini_key = None

def get_candidate_gemini_keys() -> list[str]:
    """
    Zwraca listę kandydatów kluczy Google Gemini (główny klucz z .env oraz zapasowy z Cloud Run).
    """
    keys = []
    if getattr(settings, "GEMINI_API_KEY", ""):
        keys.append(settings.GEMINI_API_KEY.strip().strip('"').strip("'"))
    if getattr(settings, "GEMINI_FALLBACK_API_KEY", ""):
        fb = settings.GEMINI_FALLBACK_API_KEY.strip().strip('"').strip("'")
        if fb and fb not in keys:
            keys.append(fb)
    return [k for k in keys if k]

def get_active_gemini_key() -> str:
    """
    Zwraca zweryfikowany, działający klucz Google Gemini API.
    """
    global _verified_gemini_key
    candidates = get_candidate_gemini_keys()
    if not candidates:
        return ""
    if _verified_gemini_key and _verified_gemini_key in candidates:
        return _verified_gemini_key
    return candidates[0]

def get_gemini_client(api_key: str = None) -> OpenAI:
    key = api_key or get_active_gemini_key()
    return OpenAI(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=key or "missing-gemini-key"
    )

def get_ai_client_and_model(task_type: str = "llm") -> tuple[OpenAI, str]:
    """
    Zwraca klienta Google Gemini oraz model (wyłączny silnik AI w projekcie KeepGoals).
    """
    return get_gemini_client(), "gemini-flash-lite-latest"

def _call_gemini_chat(messages: list, temperature: float = 0.4, max_tokens: int = 2048) -> str:
    """
    Wywołuje model Google Gemini z automatycznym przełączeniem na klucz zapasowy w razie błędu 401/403
    oraz fallbackiem między gemini-flash-lite-latest a gemini-flash-latest.
    """
    global _verified_gemini_key
    candidates = get_candidate_gemini_keys()
    if _verified_gemini_key and _verified_gemini_key in candidates:
        candidates = [_verified_gemini_key] + [k for k in candidates if k != _verified_gemini_key]

    last_err = None
    for key in candidates:
        client = get_gemini_client(key)
        for model in ["gemini-flash-lite-latest", "gemini-flash-latest"]:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                content = response.choices[0].message.content
                if content:
                    _verified_gemini_key = key
                    return content
            except Exception as e:
                last_err = e
                err_str = str(e)
                if any(tok in err_str for tok in ["400", "401", "403", "UNAUTHENTICATED", "API key not valid", "ACCESS_TOKEN_TYPE_UNSUPPORTED"]):
                    break
                continue
    if last_err:
        raise last_err
    raise RuntimeError("Brak skonfigurowanego klucza GEMINI_API_KEY.")

def transcribe_audio_with_gemini(audio_path: str, mime_type: str = "audio/mp3") -> str:
    """
    Transkrybuje plik audio bezpośrednio za pomocą natywnego API Google Gemini (inline_data).
    """
    global _verified_gemini_key
    with open(audio_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    clean_mime = (mime_type or "audio/mp3").split(";")[0].strip().lower()
    if not clean_mime or "/" not in clean_mime:
        clean_mime = "audio/mp3"

    candidates = get_candidate_gemini_keys()
    if _verified_gemini_key and _verified_gemini_key in candidates:
        candidates = [_verified_gemini_key] + [k for k in candidates if k != _verified_gemini_key]

    transcribe_prompt = (
        "Przetranskrybuj dokładnie wypowiedź z tego nagrania w oryginalnym języku (polskim). "
        "Zwróć wyłącznie czysty tekst transkrypcji, bez żadnych komentarzy i bez formatowania. "
        "Jeśli w nagraniu nie ma żadnej mowy (cisza lub szum), zwróć pusty ciąg znaków."
    )

    last_err = None
    for key in candidates:
        for g_model in ["gemini-flash-lite-latest", "gemini-flash-latest"]:
            try:
                parts = [
                    {"inline_data": {"mime_type": clean_mime, "data": audio_b64}},
                    {"text": transcribe_prompt}
                ]
                payload = {
                    "contents": [{"parts": parts}],
                    "generationConfig": {"temperature": 0.0}
                }

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{g_model}:generateContent?key={key}"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=60) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                text_chunks = []
                for cand in data.get("candidates", [])[:1]:
                    for part in (cand.get("content") or {}).get("parts", []):
                        chunk = part.get("text") or (part.get("audioTranscription") or {}).get("text") or ""
                        if chunk:
                            text_chunks.append(chunk)
                _verified_gemini_key = key
                return " ".join(text_chunks).strip()
            except urllib.error.HTTPError as e:
                err_body = ""
                try:
                    err_body = e.read().decode("utf-8", errors="ignore")
                except Exception:
                    pass
                last_err = RuntimeError(f"Gemini HTTP {e.code}: {err_body or e.reason}")
                if e.code in (401, 403) or any(tok in err_body for tok in ["API key not valid", "API_KEY_INVALID", "ACCESS_TOKEN_TYPE_UNSUPPORTED", "UNAUTHENTICATED"]):
                    break
                continue
            except Exception as e:
                last_err = e
                continue
    if last_err:
        raise last_err
    return ""

def generate_morning_plan(strategic_goals: list[str]) -> str:
    """
    Generuje plan poranny w oparciu o listę celów strategicznych użytkownika.
    Zwraca checklistę w formacie Markdown.
    """
    if not get_candidate_gemini_keys():
        return """# Twój Plan Poranny (Demo AI)

Oto zoptymalizowany plan dnia wspierający Twoje cele strategiczne:

- [ ] **Praca Głęboka**: Przeznacz 45 minut rano na główny blok zadań.
- [ ] **Aktywność fizyczna**: Wykonaj krótki trening lub rozciąganie.
- [ ] **Refaktoryzacja**: Uporządkuj pliki i zidentyfikuj wąskie gardła w projekcie.
- [ ] **Odpoczynek**: Odłącz się od ekranów na 30 minut przed snem.
"""

    try:
        goals_formatted = "\n".join([f"- {goal}" for goal in strategic_goals])
        
        prompt = f"""Jesteś osobistym asystentem produktywności.
Twoim zadaniem jest stworzenie planu na bieżący dzień w formacie czystej checklisty Markdown (z polami do odznaczenia typu `- [ ]`).
Plan musi bezpośrednio wspierać realizację poniższych celów strategicznych użytkownika:
{goals_formatted}

Zwróć wyłącznie plan dnia jako listę zadań do wykonania w formacie Markdown, bez żadnych wstępów, podsumowań czy komentarzy."""

        return _call_gemini_chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1500
        )
    except Exception as e:
        print(f"Błąd Gemini API: {e}. Fallback do demo planu.")
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
    if not get_candidate_gemini_keys():
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

        return _call_gemini_chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=1500
        )
    except Exception as e:
        print(f"Błąd Gemini API: {e}. Fallback do demo refleksji.")
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
    # Fallback jeśli żaden klucz Gemini API nie jest skonfigurowany
    if not get_candidate_gemini_keys():
        return {
            "title": "Transkrypcja (Demo)",
            "content": "To jest przykładowa transkrypcja wygenerowana ponieważ brakuje klucza GEMINI_API_KEY w pliku .env.\n\n- [ ] Przeanalizuj to zadanie\n- [ ] Zaplanuj kolejne kroki"
        }

    try:
        # Ekstrakcja audio z nagrania wideo/audio (redukcja rozmiaru pliku do MP3 64k)
        temp_path = extract_audio_for_whisper(file_bytes, mime_type)
        audio_mime = "audio/mp3" if temp_path.endswith(".mp3") else (mime_type.split(";")[0].strip() or "audio/webm")

        try:
            transcribed_text = ""
            try:
                transcribed_text = transcribe_audio_with_gemini(temp_path, mime_type=audio_mime)
            except Exception as trans_err:
                if not (mime_type or "").startswith("video"):
                    raise trans_err
                print(f"Ostrzeżenie: Transkrypcja audio z wideo nie powiodła się ({trans_err}), próba analizy wizualnej klatek.")

            # Dla wideo bez rozpoznanej mowy spróbuj analizy wizualnej klatek
            if not transcribed_text.strip() and (mime_type or "").startswith("video"):
                with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as vf:
                    vf.write(file_bytes)
                    v_path = vf.name
                try:
                    frames_b64 = extract_video_frames(v_path, num_frames=4)
                finally:
                    if os.path.exists(v_path):
                        os.remove(v_path)
                if frames_b64:
                    user_parts = [{"type": "text", "text": "Nagranie wideo nie zawiera rozpoznawalnej ścieżki mowy. Przeanalizuj załączone klatki obrazu i utwórz ustrukturyzowaną notatkę zgodnie z instrukcją systemową."}]
                    for b64 in frames_b64:
                        user_parts.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})
                    response_text = _call_gemini_chat(
                        messages=[
                            {"role": "system", "content": prompt},
                            {"role": "user", "content": user_parts}
                        ],
                        temperature=0.3,
                        max_tokens=2048
                    ).strip()
                    start_idx = response_text.find("{")
                    end_idx = response_text.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        response_text = response_text[start_idx:end_idx + 1]
                    result = json.loads(response_text.strip())
                    result["raw_transcript"] = "[Analiza wizualna nagrania wideo]"
                    return result

            # Opcjonalne zabezpieczenie przed pustą transkrypcją
            if not transcribed_text.strip():
                return {
                    "title": "Puste nagranie",
                    "content": "Nie udało się rozpoznać mowy w nagraniu."
                }

            # Analiza i strukturyzacja przetranskrybowanego tekstu przez Google Gemini
            response_text = _call_gemini_chat(
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": f"Oto transkrypcja nagrania do przeanalizowania i sformatowania:\n\n{transcribed_text}"}
                ],
                temperature=0.3,
                max_tokens=2048
            ).strip()
            
            start_idx = response_text.find("{")
            end_idx = response_text.rfind("}")
            if start_idx != -1 and end_idx != -1:
                response_text = response_text[start_idx:end_idx + 1]
                
            result = json.loads(response_text.strip())
            result["raw_transcript"] = transcribed_text
            return result
            
        finally:
            # Czyszczenie zasobów lokalnych
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        print(f"Błąd analizy mediów Gemini AI: {e}. Fallback do danych zastępczych.")
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
    Prowadzi konwersację z AI (Google Gemini) na temat podanej notatki.
    """
    if not get_candidate_gemini_keys():
        return "To jest wersja demo czatu z AI, ponieważ brak klucza GEMINI_API_KEY. Wyobraź sobie, że odpowiadam na Twoje pytanie!\n\n<REWRITTEN_NOTE>\nTo jest przykładowa (zmieniona) treść notatki.\n</REWRITTEN_NOTE>"

    try:
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

        # Ekstrakcja klatek wideo dla multimodalnego modelu Gemini
        if media_url and media_type and media_type.startswith("video"):
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

        return _call_gemini_chat(messages=messages, temperature=0.5, max_tokens=2048)
    except Exception as e:
        print(f"Błąd Gemini API w czacie notatki: {e}")
        return "Przepraszam, wystąpił problem z serwerami AI. Spróbuj ponownie później."

def generate_handoff_summary(note_content: str, delegate_name: str) -> str:
    """
    Analizuje treść notatki i generuje zwięzłe podsumowanie zadań przeznaczonych dla konkretnego delegata.
    """
    try:
        prompt = (
            f"Przeanalizuj poniższą notatkę i przygotuj zwięzłe, uporządkowane podsumowanie zadań oraz wątków, "
            f"które dotyczą wyłącznie osoby o imieniu/nazwie '{delegate_name}'. "
            f"Stwórz jasną listę punktów do zrealizowania dla tej osoby. "
            f"Nie dodawaj wstępów ani zbędnych wyjaśnień, sformatuj tekst czytelnie w Markdown."
        )
        return _call_gemini_chat(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": note_content}
            ],
            temperature=0.3,
            max_tokens=1500
        )
    except Exception as e:
        print(f"Błąd Gemini API w generowaniu handoff summary: {e}")
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
    Prowadzi konwersację z AI (Google Gemini) na temat kafelków, osi 2D oraz celów strategicznych użytkownika.
    """
    if not get_candidate_gemini_keys():
        return (
            "Świetnie, że nad tym pracujesz! W oparciu o Twoje obecne kafelki, kluczowym kolejnym krokiem "
            "powinno być skupienie się na walidacji i egzekucji.\n\n"
            "Sugeruję dodanie kafelka o wysokim wpływie:\n"
            "<SUGGESTED_TILE title=\"Walidacja z użytkownikami\" x=\"80\" y=\"72\">Kluczowy krok do przyspieszenia realizacji celów.</SUGGESTED_TILE>"
        )

    try:
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

        return _call_gemini_chat(
            messages=chat_msgs,
            temperature=0.7,
            max_tokens=1500
        )
    except Exception as e:
        print(f"Błąd Gemini API w czacie celów: {e}")
        return "Przepraszam, wystąpił problem z połączeniem z serwerem AI. Spróbuj ponownie za chwilę."

def suggest_tiles_for_goal(title: str, description: str) -> list[str]:
    """
    Generuje sugestie kafelków do osi 2D na podstawie tytułu i opisu celu.
    Zwraca listę stringów (nazw kafelków).
    """
    if not get_candidate_gemini_keys():
        return [
            "Walidacja rynkowa",
            "Prototyp (MVP)",
            "Badanie nawyków",
            "Eliminacja rozpraszaczy",
            "Bloki pracy głębokiej"
        ]

    try:
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

        response_text = _call_gemini_chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        ).strip()

        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        result = json.loads(response_text.strip())
        if isinstance(result, list):
            return result
        return []
    except Exception as e:
        print(f"Błąd Gemini API w suggest_tiles_for_goal: {e}")
        return [
            "Pierwszy kamień milowy",
            "Kluczowy nawyk",
            "Eliminacja dystrakcji",
            "Analiza postępów"
        ]

def analyze_live_inspection(frame_base64: str = None, user_text: str = None, history: list = None, inspection_type: str = "Nieruchomość") -> dict:
    """
    Analizuje klatkę wideo na żywo z kamery inspektora oraz jego wypowiedź głosową.
    Zwraca odpowiedź rzeczoznawcy AI Gemini w czasie rzeczywistym.
    """
    if not get_candidate_gemini_keys():
        return {
            "ai_response": "Tryb podglądu inspekcji (Demo). Wymagany klucz GEMINI_API_KEY.",
            "has_issue": False,
            "issue_title": None,
            "issue_description": None,
            "recommended_action": None
        }

    try:
        system_prompt = """Jesteś asystentem i ekspertem rzeczoznawcą budowlanym podczas inspekcji technicznej na żywo.

TRYBY PRACY I ZASADY KOMUNIKACJI GŁOSOWEJ:

1. ZWYKŁE NASŁUCHIWANIE I REJESTRACJA DYKTOWANIA (SEKRETARZ INSPEKCJI):
   - Gdy użytkownik po prostu opowiada/dyktuje swoje obserwacje i NIE zadaje konkretnego pytania, NIE oceniaj kadru bez poproszenia i NIE wygłaszaj zbędnych opinii.
   - Zamiast tego potwierdź krótko głosem zanotowanie faktów (np. "Zanotowałem.", "Zapisano.", "Przyjęto.").

2. EKSPERTYZA NA ŻĄDANIE / ODPOWIEDŹ NA PYTANIE (INŻYNIER RZECZOZNAWCA):
   - Gdy użytkownik wyraźnie prosi o ekspertyzę (np. naciska przycisk "Ekspertyza AI") LUB zadaje bezpośrednie pytanie słowne (np. "Co o tym myślisz?", "Czy to pęknięcie jest groźne?", "Sprawdź ten kadr", "Oceń montaż"):
     - NATYCHMIAST przeprowadź fachową, inżynieryjną analizę techniczną widocznego elementu.
     - Posługuj się ścisłym słownictwem normatywnym (liniowe mostki cieplne, ugięcia konstrukcyjne, spękania skurczowe, odparzenia tynku, kapilarne podciąganie wilgoci, brak obróbki blacharskiej).
     - Wypowiadaj się zwięźle (1-2 zdania) i konkretnie.

3. BRAK ZBĘDNEJ GADKI:
   - BEZWZGLĘDNY ZAKAZ zwrotów wstępnych i potwierdzeń technicznych typu: "Widok z kamery działa", "Dzień dobry", "Jestem gotowy", "Rozpoczynam analizę". Przechodź od razu do faktów.

Zwróć wynik WYŁĄCZNIE jako czysty obiekt JSON:
{
  "ai_response": "Krótkie potwierdzenie ('Zanotowałem.') LUB pełna 1-2 zdaniowa ekspertyza fachowa do odczytania głosem",
  "has_issue": true/false,
  "issue_title": "Nazwa usterki / nieprawidłowości (jeśli wykryto w trybie ekspertyzy) lub null",
  "issue_description": "Dokładny opis techniczny lub null",
  "recommended_action": "Zalecenie ekspertyzy / naprawy lub null"
}"""

        content_parts = []
        user_query = user_text.strip() if user_text else ""
        prompt_text = f"{system_prompt}\n\nWypowiedź/Pytanie Inspektora: {user_query if user_query else '[Brak pytania słownego - przeanalizuj sam kadr pod kątem anomalii i wad]'}"
        content_parts.append({"type": "text", "text": prompt_text})

        if frame_base64:
            clean_b64 = frame_base64
            if "," in clean_b64:
                clean_b64 = clean_b64.split(",")[1]
            content_parts.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{clean_b64}"
                }
            })

        response_text = _call_gemini_chat(
            messages=[{"role": "user", "content": content_parts}],
            temperature=0.2,
            max_tokens=1500
        ).strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        try:
            parsed = json.loads(response_text, strict=False)
            return parsed
        except Exception as json_err:
            print(f"JSON parsing warning ({json_err}), attempting regex extraction from: {response_text}")
            ai_resp_match = re.search(r'"ai_response"\s*:\s*"(.*?)"(?=,\s*"|\s*})', response_text, re.DOTALL)
            if not ai_resp_match:
                ai_resp_match = re.search(r'"ai_response"\s*:\s*"([^"]*)', response_text, re.DOTALL)
            ai_resp = ai_resp_match.group(1).strip() if ai_resp_match else ""
            
            title_match = re.search(r'"issue_title"\s*:\s*"(.*?)"(?=,\s*"|\s*})', response_text, re.DOTALL)
            if not title_match:
                title_match = re.search(r'"issue_title"\s*:\s*"([^"]*)', response_text, re.DOTALL)
            issue_title = title_match.group(1).strip() if title_match and title_match.group(1) != 'null' else None
            
            has_issue = "true" in response_text.lower() or bool(issue_title)

            return {
                "ai_response": ai_resp,
                "has_issue": has_issue,
                "issue_title": issue_title,
                "issue_description": None,
                "recommended_action": None
            }
    except Exception as e:
        print(f"Błąd Gemini Live Inspection: {e}")
        return {
            "ai_response": "",
            "has_issue": False,
            "issue_title": None,
            "issue_description": None,
            "recommended_action": None
        }
