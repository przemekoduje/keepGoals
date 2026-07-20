import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

# Mockujemy inicjalizację bazy danych Firebase aby testy nie zgłaszały błędów braku certyfikatu
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app

client = TestClient(app)

def test_access_notes_without_token():
    response = client.get("/api/v1/notes")
    assert response.status_code == 401
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "MISSING_TOKEN"
    assert "trace_id" in json_data["detail"]

@patch("src.auth.auth.verify_id_token")
def test_access_notes_with_valid_token(mock_verify_token):
    # Mocking successful token verification
    mock_verify_token.return_value = {
        "uid": "test_uid_123",
        "email": "test@example.com"
    }
    
    headers = {"Authorization": "Bearer mocked_valid_token"}
    response = client.get("/api/v1/notes", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["user"]["uid"] == "test_uid_123"
    assert json_data["user"]["email"] == "test@example.com"

@patch("src.auth.auth.verify_id_token")
def test_access_notes_with_invalid_token(mock_verify_token):
    # Mocking failed token verification
    mock_verify_token.side_effect = Exception("Invalid token mock")
    
    headers = {"Authorization": "Bearer invalid_token_xyz"}
    response = client.get("/api/v1/notes", headers=headers)
    
    assert response.status_code == 401
    json_data = response.json()
    assert json_data["detail"]["error_code"] == "INVALID_TOKEN"
    assert "trace_id" in json_data["detail"]
