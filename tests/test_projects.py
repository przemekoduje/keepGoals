import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth import verify_token
from src.database import get_db, _mock_db_instance

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[verify_token] = lambda: {"uid": "test_projects_user_123", "email": "test@example.com"}
    app.dependency_overrides[get_db] = lambda: _mock_db_instance
    yield
    app.dependency_overrides.clear()

def test_create_and_get_projects():
    # 1. Create a new project
    project_payload = {
        "name": "Projekt Jesień 2026",
        "description": "Kolekcja jesienno-zimowa i rynki zagraniczne",
        "color": "#ec4899",
        "status": "active"
    }
    create_res = client.post("/api/v1/projects", json=project_payload)
    assert create_res.status_code == 201
    proj_data = create_res.json()
    assert proj_data["name"] == "Projekt Jesień 2026"
    assert proj_data["color"] == "#ec4899"
    assert "id" in proj_data
    
    project_id = proj_data["id"]

    # 2. Get list of projects
    list_res = client.get("/api/v1/projects")
    assert list_res.status_code == 200
    projects_list = list_res.json()
    assert any(p["id"] == project_id for p in projects_list)

    # 3. Create a note associated with this project
    note_payload = {
        "title": "Notatka projektowa",
        "content": "Ustalenia budżetowe dla kolekcji jesiennej",
        "note_type": "generic",
        "project_id": project_id
    }
    note_res = client.post("/api/v1/notes", json=note_payload)
    assert note_res.status_code == 201

    # 4. Fetch project details and verify notes list & notes_count
    detail_res = client.get(f"/api/v1/projects/{project_id}")
    assert detail_res.status_code == 200
    details = detail_res.json()
    assert details["id"] == project_id
    assert details["notes_count"] >= 1
    assert len(details["notes"]) >= 1
    assert details["notes"][0]["title"] == "Notatka projektowa"

    # 5. Delete project
    delete_res = client.delete(f"/api/v1/projects/{project_id}")
    assert delete_res.status_code == 204

    # 6. Verify project is deleted
    get_after_delete = client.get(f"/api/v1/projects/{project_id}")
    assert get_after_delete.status_code == 404

def test_update_note_project_assignment_and_unassignment():
    # 1. Create project
    proj_res = client.post("/api/v1/projects", json={"name": "Projekt Testowy A", "color": "#3b82f6"})
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # 2. Create note without project
    note_res = client.post("/api/v1/notes", json={"title": "Notatka Wolna", "content": "Bez projektu", "note_type": "generic"})
    assert note_res.status_code == 201
    note_id = note_res.json()["id"]

    # Verify project has 0 notes
    detail_res = client.get(f"/api/v1/projects/{proj_id}")
    assert detail_res.json()["notes_count"] == 0

    # 3. Attach note to project
    update_res = client.put(f"/api/v1/notes/{note_id}", json={"project_id": proj_id})
    assert update_res.status_code == 200
    assert update_res.json()["project_id"] == proj_id

    # Verify project detail has 1 note
    detail_res2 = client.get(f"/api/v1/projects/{proj_id}")
    assert detail_res2.json()["notes_count"] == 1
    assert detail_res2.json()["notes"][0]["id"] == note_id

    # 4. Unassign note from project (send null)
    unassign_res = client.put(f"/api/v1/notes/{note_id}", json={"project_id": None})
    assert unassign_res.status_code == 200
    assert unassign_res.json().get("project_id") is None

    # Verify project detail is now 0 notes again
    detail_res3 = client.get(f"/api/v1/projects/{proj_id}")
    assert detail_res3.json()["notes_count"] == 0
    assert len(detail_res3.json()["notes"]) == 0

def test_multi_project_assignment():
    p1 = client.post("/api/v1/projects", json={"name": "Projekt Alpha", "color": "#3b82f6"}).json()["id"]
    p2 = client.post("/api/v1/projects", json={"name": "Projekt Beta", "color": "#ec4899"}).json()["id"]

    # Create note assigned to both p1 and p2
    note_res = client.post("/api/v1/notes", json={
        "title": "Wspólna notatka",
        "content": "Strategia dla obu projektów",
        "note_type": "strategic",
        "project_ids": [p1, p2]
    })
    assert note_res.status_code == 201
    note_data = note_res.json()
    assert set(note_data["project_ids"]) == {p1, p2}

    # Verify both projects include this note
    d1 = client.get(f"/api/v1/projects/{p1}").json()
    d2 = client.get(f"/api/v1/projects/{p2}").json()
    assert any(n["id"] == note_data["id"] for n in d1["notes"])
    assert any(n["id"] == note_data["id"] for n in d2["notes"])

    # Update note to belong only to p2
    update_res = client.put(f"/api/v1/notes/{note_data['id']}", json={"project_ids": [p2]})
    assert update_res.status_code == 200
    assert update_res.json()["project_ids"] == [p2]

    # Verify p1 no longer has the note, but p2 still does
    d1_after = client.get(f"/api/v1/projects/{p1}").json()
    d2_after = client.get(f"/api/v1/projects/{p2}").json()
    assert not any(n["id"] == note_data["id"] for n in d1_after["notes"])
    assert any(n["id"] == note_data["id"] for n in d2_after["notes"])
