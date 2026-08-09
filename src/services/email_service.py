import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.config import settings

def send_transcription_email(recipient_email: str, note_title: str, note_content: str, raw_transcript: str = None) -> bool:
    """
    Wysyła e-mail z pełną transkrypcją oraz przetworzoną treścią notatki do podanego odbiorcy.
    Zwraca True jeśli e-mail został wysłany przez SMTP, lub False jeśli brak danych logowania SMTP (symulacja/mailto fallback).
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"Brak konfiguracji SMTP w .env (SMTP_USER/SMTP_PASSWORD). E-mail do {recipient_email} obsłużony przez mailto / symulację.")
        return False

    try:
        title = note_title or "Notatka z nagrania"
        subject = f"[keepGoals] Pełna Transkrypcja (Słowo w słowo): {title}"

        transcript_to_send = raw_transcript if raw_transcript else note_content

        body = f"Cześć!\n\nPrzesyłamy pełną transkrypcję (słowo w słowo z nagrania) z aplikacji keepGoals.\n\n"
        body += f"========================================\n"
        body += f"TYTUŁ: {title}\n"
        body += f"========================================\n\n"
        body += f"--- PEŁNA TRANSKRYPCJA (SŁOWO W SŁOWO Z NAGRANIA) ---\n"
        body += f"{transcript_to_send}\n\n"

        if raw_transcript and note_content and note_content != raw_transcript:
            body += f"--- PODSUMOWANIE I ZADANIA AI ---\n"
            body += f"{note_content}\n\n"

        body += f"----------------------------------------\n"
        body += f"Wiadomość wygenerowana automatycznie przez keepGoals.\n"

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"E-mail z transkrypcją pomyślnie wysłany na adres: {recipient_email}")
        return True
    except Exception as e:
        print(f"Błąd podczas wysyłania e-maila: {e}")
        raise e

def send_delegation_email(recipient_email: str, delegate_name: str, note_title: str, ai_summary: str, share_token: str) -> bool:
    """
    Wysyła e-mail do odbiorcy z informacją o wydelegowanym zadaniu i Magic Linkiem.
    Zwraca True jeśli e-mail został wysłany przez SMTP, lub False jeśli brak danych logowania SMTP.
    """
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    magic_link = f"{frontend_url}/shared/{share_token}"
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"Brak konfiguracji SMTP w .env (SMTP_USER/SMTP_PASSWORD). E-mail do {recipient_email} (Magic Link: {magic_link}) obsłużony przez symulację.")
        return False

    try:
        title = note_title or "Zadanie z keepGoals"
        subject = f"[keepGoals] Nowe zadanie zostało wydelegowane dla Ciebie: {title}"

        body = f"Cześć {delegate_name}!\n\n"
        body += f"Użytkownik aplikacji keepGoals wydelegował dla Ciebie nowe zadanie.\n\n"
        body += f"========================================\n"
        body += f"TYTUŁ NOTATKI: {title}\n"
        body += f"========================================\n\n"
        
        if ai_summary:
            body += f"--- ZADANIA DO WYKONANIA (PODSUMOWANIE AI) ---\n"
            body += f"{ai_summary}\n\n"

        body += f"Aby zobaczyć szczegóły zadania i oznaczyć je jako wykonane, kliknij w poniższy Magic Link:\n"
        body += f"{magic_link}\n\n"
        body += f"----------------------------------------\n"
        body += f"Wiadomość wygenerowana automatycznie przez keepGoals.\n"

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"E-mail z delegacją pomyślnie wysłany na adres: {recipient_email}")
        return True
    except Exception as e:
        print(f"Błąd podczas wysyłania e-maila delegacji: {e}")
        raise e
