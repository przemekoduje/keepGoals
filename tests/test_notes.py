import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime, timezone

# Mockujemy inicjalizację bazy danych Firebase aby testy nie zgłaszały błędów braku certyfikatu
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app

client = TestClient(app)

def create_mock_doc(doc_id, data_dict, exists=True):
    mock_doc = MagicMock()
    mock_doc.id = doc_id
    mock_doc.exists = exists
    mock_doc.to_dict.return_value = data_dict
    return mock_doc

from src.auth import verify_token
from src.database import get_db

@pytest.fixture
def mock_verify_token():
    return None

@pytest.fixture
def mock_firestore():
    mock_db = MagicMock()
    return mock_db

@pytest.fixture(autouse=True)
def override_dependencies(mock_firestore):
    app.dependency_overrides[verify_token] = lambda: {
        "uid": "test_uid_123",
        "email": "test@example.com"
    }
    app.dependency_overrides[get_db] = lambda: mock_firestore
    yield
    app.dependency_overrides.clear()

# ----------------- TESTY POST /api/v1/notes -----------------

def test_create_note_success(mock_verify_token, mock_firestore):
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new_note_id"
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    note_payload = {
        "title": "My Strategic Goal",
        "content": "Learn FastAPI and Firestore.",
        "note_type": "strategic"
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/notes", json=note_payload, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "new_note_id"
    assert json_data["title"] == "My Strategic Goal"
    assert json_data["content"] == "Learn FastAPI and Firestore."
    assert json_data["note_type"] == "strategic"
    assert json_data["user_id"] == "test_uid_123"
    assert "created_at" in json_data

# ----------------- TESTY GET /api/v1/notes -----------------

def test_get_notes_success(mock_verify_token, mock_firestore):
    mock_doc1 = create_mock_doc("note_1", {
        "title": "Title 1",
        "content": "Content 1",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": "2026-01-02T10:00:00Z"
    })
    mock_doc2 = create_mock_doc("note_2", {
        "title": "Title 2",
        "content": "Content 2",
        "note_type": "daily_morning",
        "user_id": "test_uid_123",
        "created_at": "2026-01-01T10:00:00Z"
    })
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .stream.return_value = [mock_doc1, mock_doc2]

    headers = {"Authorization": "Bearer valid_token"}
    response = client.get("/api/v1/notes", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) == 2
    assert json_data[0]["id"] == "note_1"
    assert json_data[1]["id"] == "note_2"

# ----------------- TESTY GET /api/v1/notes/{note_id} -----------------

def test_get_note_success(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("existing_note_id", {
        "title": "Existing Title",
        "content": "Existing Content",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": datetime.now(timezone.utc).isoformat()
    }, exists=True)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.get("/api/v1/notes/existing_note_id", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["id"] == "existing_note_id"
    assert json_data["title"] == "Existing Title"

def test_get_note_not_found(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("non_existing_id", {}, exists=False)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.get("/api/v1/notes/non_existing_id", headers=headers)
    
    assert response.status_code == 404
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "NOTE_NOT_FOUND"
    assert "trace_id" in json_data["detail"]

# ----------------- TESTY PUT /api/v1/notes/{note_id} -----------------

def test_update_note_success(mock_verify_token, mock_firestore):
    mock_doc_before = create_mock_doc("note_id_to_update", {
        "title": "Old Title",
        "content": "Old Content",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": datetime.now(timezone.utc).isoformat()
    }, exists=True)
    
    mock_doc_after = create_mock_doc("note_id_to_update", {
        "title": "New Title",
        "content": "New Content",
        "note_type": "strategic",
        "user_id": "test_uid_123",
        "created_at": datetime.now(timezone.utc).isoformat()
    }, exists=True)
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.get.side_effect = [mock_doc_before, mock_doc_after]
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    update_payload = {
        "title": "New Title",
        "content": "New Content"
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.put("/api/v1/notes/note_id_to_update", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["title"] == "New Title"
    assert json_data["content"] == "New Content"
    mock_doc_ref.update.assert_called_once_with({"title": "New Title", "content": "New Content"})

def test_update_note_not_found(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("non_existing_id", {}, exists=False)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.put("/api/v1/notes/non_existing_id", json={"content": "new"}, headers=headers)
    
    assert response.status_code == 404
    json_data = response.json()
    assert json_data["detail"]["error_code"] == "NOTE_NOT_FOUND"

# ----------------- TESTY DELETE /api/v1/notes/{note_id} -----------------

def test_delete_note_success(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("note_id_to_delete", {
        "title": "Title",
        "content": "Content",
        "note_type": "strategic"
    }, exists=True)
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.get.return_value = mock_doc
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    headers = {"Authorization": "Bearer valid_token"}
    response = client.delete("/api/v1/notes/note_id_to_delete", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert "pomyślnie usunięta" in json_data["message"]
    mock_doc_ref.delete.assert_called_once()

def test_delete_note_not_found(mock_verify_token, mock_firestore):
    mock_doc = create_mock_doc("non_existing_id", {}, exists=False)
    
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value \
                  .get.return_value = mock_doc

    headers = {"Authorization": "Bearer valid_token"}
    response = client.delete("/api/v1/notes/non_existing_id", headers=headers)
    
    assert response.status_code == 404
    json_data = response.json()
    assert json_data["detail"]["error_code"] == "NOTE_NOT_FOUND"

# ----------------- TESTY POST /api/v1/notes/audio i /video -----------------

@patch("src.routers.notes.process_media_and_cloud_sync_bg")
@patch("src.routers.notes.save_media_file_local")
def test_upload_audio_note_success(mock_save_media, mock_bg_proc, mock_verify_token, mock_firestore):
    mock_save_media.return_value = ("uploads/test_audio.webm", "/uploads/test_audio.webm")
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new_audio_note_id"
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    headers = {"Authorization": "Bearer valid_token"}
    files = {"file": ("audio.webm", b"fake-audio-bytes", "audio/webm")}
    response = client.post("/api/v1/notes/audio", files=files, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "new_audio_note_id"
    assert json_data["title"] == "Nagranie Głosowe"
    assert json_data["media_url"] == "/uploads/test_audio.webm"
    assert json_data["media_type"] == "audio/webm"
    mock_save_media.assert_called_once()
    mock_bg_proc.assert_called_once()

@patch("src.routers.notes.process_media_and_cloud_sync_bg")
@patch("src.routers.notes.save_media_file_local")
def test_upload_video_note_success(mock_save_media, mock_bg_proc, mock_verify_token, mock_firestore):
    mock_save_media.return_value = ("uploads/test_video.webm", "/uploads/test_video.webm")
    
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new_video_note_id"
    mock_firestore.collection.return_value \
                  .document.return_value \
                  .collection.return_value \
                  .document.return_value = mock_doc_ref

    headers = {"Authorization": "Bearer valid_token"}
    files = {"file": ("video.webm", b"fake-video-bytes", "video/webm")}
    response = client.post("/api/v1/notes/video", files=files, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "new_video_note_id"
    assert json_data["title"] == "Nagranie Wideo"
    assert json_data["media_url"] == "/uploads/test_video.webm"
    assert json_data["media_type"] == "video/webm"
    mock_save_media.assert_called_once()
    mock_bg_proc.assert_called_once()
