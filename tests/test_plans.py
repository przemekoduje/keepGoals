import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.auth import verify_token
from src.database import get_db

# Mockujemy Firebase przed importem app
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app

client = TestClient(app)

@pytest.fixture
def mock_firestore():
    return MagicMock()

@pytest.fixture(autouse=True)
def override_dependencies(mock_firestore):
    app.dependency_overrides[verify_token] = lambda: {
        "uid": "test_uid_123",
        "email": "test@example.com"
    }
    app.dependency_overrides[get_db] = lambda: mock_firestore
    yield
    app.dependency_overrides.clear()

@patch("src.routers.plans.generate_morning_plan")
@patch("src.routers.plans.get_notes")
@patch("src.routers.plans.create_note")
def test_generate_morning_plan_success(mock_create_note, mock_get_notes, mock_gen_plan, mock_firestore):
    # Mockowanie pobierania notatek (zwracamy jedną notatkę strategiczną)
    mock_get_notes.return_value = [
        {
            "id": "goal_1",
            "title": "Cel 1",
            "content": "Improve coding skills",
            "note_type": "strategic",
            "user_id": "test_uid_123",
            "created_at": "2026-07-20T18:00:00"
        }
    ]
    
    # Mockowanie odpowiedzi z serwisu AI
    mock_gen_plan.return_value = "- [ ] Read a book\n- [ ] Write 100 lines of code"
    
    # Mockowanie tworzenia nowej notatki w bazie
    mock_create_note.return_value = {
        "id": "plan_id_123",
        "title": "Plan Poranny",
        "content": "- [ ] Read a book\n- [ ] Write 100 lines of code",
        "note_type": "daily_morning",
        "user_id": "test_uid_123",
        "created_at": "2026-07-20T19:00:00"
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/morning", headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "plan_id_123"
    assert json_data["note_type"] == "daily_morning"
    assert json_data["title"] == "Plan Poranny"
    
    mock_get_notes.assert_called_once_with(mock_firestore, "test_uid_123")
    mock_gen_plan.assert_called_once_with(["Improve coding skills"])
    mock_create_note.assert_called_once()

@patch("src.routers.plans.get_notes")
def test_generate_morning_plan_no_strategic_goals(mock_get_notes, mock_firestore):
    # Mockowanie pobierania notatek (zwracamy brak celów strategicznych)
    mock_get_notes.return_value = [
        {
            "id": "note_1",
            "title": "Note 1",
            "content": "Just a normal note",
            "note_type": "daily_evening",
            "user_id": "test_uid_123",
            "created_at": "2026-07-20T18:00:00"
        }
    ]
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/morning", headers=headers)
    
    assert response.status_code == 400
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "NO_STRATEGIC_GOALS"
    assert "trace_id" in json_data["detail"]

@patch("src.routers.plans.generate_evening_reflection")
@patch("src.routers.plans.get_notes")
@patch("src.routers.plans.create_note")
def test_generate_evening_reflection_success(mock_create_note, mock_get_notes, mock_gen_reflection, mock_firestore):
    mock_get_notes.return_value = [
        {
            "id": "goal_1",
            "title": "Cel 1",
            "content": "Improve coding skills",
            "note_type": "strategic",
            "user_id": "test_uid_123",
            "created_at": "2026-07-20T18:00:00"
        }
    ]
    
    mock_gen_reflection.return_value = "Świetna robota mentor: skup się bardziej na kodowaniu jutro."
    
    mock_create_note.return_value = {
        "id": "reflection_id_123",
        "title": "Refleksja Wieczorna",
        "content": "Świetna robota mentor: skup się bardziej na kodowaniu jutro.",
        "note_type": "daily_evening",
        "user_id": "test_uid_123",
        "created_at": "2026-07-20T21:00:00"
    }
    
    payload = {
        "completed_tasks": ["Read 10 pages", "Write tests"],
        "uncompleted_tasks": ["Go for a run"],
        "avoided_habits": ["No sugar"]
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/evening", json=payload, headers=headers)
    
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == "reflection_id_123"
    assert json_data["note_type"] == "daily_evening"
    assert json_data["title"] == "Refleksja Wieczorna"
    
    mock_get_notes.assert_called_once_with(mock_firestore, "test_uid_123")
    mock_gen_reflection.assert_called_once_with(payload, ["Improve coding skills"])
    mock_create_note.assert_called_once()

@patch("src.routers.plans.get_notes")
def test_generate_evening_reflection_no_strategic_goals(mock_get_notes, mock_firestore):
    mock_get_notes.return_value = []
    
    payload = {
        "completed_tasks": ["Read 10 pages"],
        "uncompleted_tasks": [],
        "avoided_habits": []
    }
    
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/api/v1/plans/evening", json=payload, headers=headers)
    
    assert response.status_code == 400
    json_data = response.json()
    assert "detail" in json_data
    assert json_data["detail"]["error_code"] == "NO_STRATEGIC_GOALS"
    assert "trace_id" in json_data["detail"]

