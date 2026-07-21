import os
import uuid
import firebase_admin
from firebase_admin import credentials, firestore
from src.config import settings

class MockDocumentSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self):
        return self._data.copy() if self._data else {}

class MockDocumentReference:
    def __init__(self, collection_ref, doc_id=None):
        self.collection_ref = collection_ref
        self.id = doc_id or str(uuid.uuid4())
        self.db = collection_ref.db

    def collection(self, name):
        path = f"{self.collection_ref.path}/{self.id}/{name}"
        if path not in self.db.collections:
            self.db.collections[path] = MockCollectionReference(self.db, path)
        return self.db.collections[path]

    def set(self, data):
        self.collection_ref.data[self.id] = data

    def get(self):
        data = self.collection_ref.data.get(self.id)
        return MockDocumentSnapshot(self.id, data)

    def update(self, data):
        if self.id in self.collection_ref.data:
            self.collection_ref.data[self.id].update(data)

    def delete(self):
        self.collection_ref.data.pop(self.id, None)

class MockCollectionReference:
    def __init__(self, db, path):
        self.db = db
        self.path = path
        self.data = {}

    def document(self, doc_id=None):
        return MockDocumentReference(self, doc_id)

    def stream(self):
        return [MockDocumentSnapshot(doc_id, data) for doc_id, data in self.data.items()]

class MockFirestoreClient:
    def __init__(self):
        self.collections = {}

    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollectionReference(self, name)
        return self.collections[name]

_mock_db_instance = MockFirestoreClient()

def init_firebase():
    if not firebase_admin._apps:
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            try:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"Ostrzeżenie: Nie udało się zainicjalizować Firebase z certyfikatu: {e}")
        else:
            try:
                firebase_admin.initialize_app()
            except Exception as e:
                print(f"Ostrzeżenie: Brak domyślnych credentials Firebase: {e}")

init_firebase()

def get_db():
    if not settings.FIREBASE_CREDENTIALS_PATH or not os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        return _mock_db_instance
    try:
        return firestore.client()
    except Exception as e:
        print(f"Błąd pobierania Firestore client: {e}. Używanie Mock DB.")
        return _mock_db_instance

