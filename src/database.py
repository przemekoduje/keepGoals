import os
import firebase_admin
from firebase_admin import credentials, firestore
from src.config import settings

def init_firebase():
    if not firebase_admin._apps:
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        else:
            # Rezerwa testowa lub uwierzytelnianie Application Default Credentials (ADC)
            try:
                firebase_admin.initialize_app()
            except ValueError:
                pass # Aplikacja już zainicjalizowana

init_firebase()

def get_db():
    return firestore.client()
