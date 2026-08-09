import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth import verify_token
from src.database import get_db, _mock_db_instance

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[verify_token] = lambda: {"uid": "test_uid", "email": "test@example.com"}
    app.dependency_overrides[get_db] = lambda: _mock_db_instance
    yield
    app.dependency_overrides.clear()

def test_teams_endpoint_removed():
    """Teams endpoints were removed as part of the Personal-First rollback."""
    response = client.post(
        "/api/v1/teams",
        json={"name": "Zespół Zadań", "description": "Opis", "member_emails": []}
    )
    assert response.status_code == 404, "Teams endpoint should no longer exist"

def test_note_multi_assignees():
    # Create note with assigned_user_ids (external people only, not uid)
    response = client.post(
        "/api/v1/notes",
        json={
            "content": "Notatka z przypisanymi osobami",
            "note_type": "daily_morning",
            "assigned_user_ids": ["Anna Nowak", "Jan Kowalski"]
        }
    )
    assert response.status_code == 201
    note = response.json()
    # uid should NOT be auto-added to assigned_user_ids in Personal-First model
    assert note["assigned_user_ids"] == ["Anna Nowak", "Jan Kowalski"]
    assert note["assigned_to"] == "Anna Nowak"

    # Update assigned_user_ids
    note_id = note["id"]
    res_upd = client.put(
        f"/api/v1/notes/{note_id}",
        json={"assigned_user_ids": ["Marek Nowak", "Piotr Wiśniewski"]}
    )
    assert res_upd.status_code == 200
    updated_note = res_upd.json()
    assert updated_note["assigned_user_ids"] == ["Marek Nowak", "Piotr Wiśniewski"]
    assert updated_note["assigned_to"] == "Marek Nowak"
