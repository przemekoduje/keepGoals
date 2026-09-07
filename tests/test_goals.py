import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth import verify_token
from src.database import get_db, _mock_db_instance

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[verify_token] = lambda: {"uid": "test_goals_user_1", "email": "user1@example.com"}
    app.dependency_overrides[get_db] = lambda: _mock_db_instance
    yield
    app.dependency_overrides.clear()

def test_create_and_get_goals():
    # 1. Create strategic goal
    payload = {
        "title": "Ekspansja na rynki DACH",
        "description": "Wejście ze sprzedażą na rynek niemiecki i austriacki",
        "horizon": "long_term",
        "key_results": [
            {"title": "Liczba przetłumaczonych ofert", "current_value": 2, "target_value": 10, "unit": "szt"},
            {"title": "Przychód z regionu DACH", "current_value": 15000, "target_value": 100000, "unit": "EUR"}
        ],
        "color": "#fef3c7"
    }
    res = client.post("/api/v1/goals", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Ekspansja na rynki DACH"
    assert data["horizon"] == "long_term"
    assert len(data["key_results"]) == 2
    assert data["is_completed"] is False
    assert "id" in data
    goal_id = data["id"]

    # 2. Get details
    detail_res = client.get(f"/api/v1/goals/{goal_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == goal_id

    # 3. List goals
    list_res = client.get("/api/v1/goals")
    assert list_res.status_code == 200
    all_goals = list_res.json()
    assert any(g["id"] == goal_id for g in all_goals)

def test_filter_goals_by_horizon_and_completion():
    # Create quarterly goal
    q_payload = {
        "title": "Uruchomienie krojowni",
        "horizon": "quarterly",
        "is_completed": False
    }
    q_res = client.post("/api/v1/goals", json=q_payload)
    assert q_res.status_code == 201
    q_id = q_res.json()["id"]

    # Create completed monthly goal
    m_payload = {
        "title": "Audyt materiałów",
        "horizon": "monthly",
        "is_completed": True
    }
    m_res = client.post("/api/v1/goals", json=m_payload)
    assert m_res.status_code == 201
    m_id = m_res.json()["id"]

    # Filter by horizon=quarterly
    filtered_q = client.get("/api/v1/goals?horizon=quarterly").json()
    assert any(g["id"] == q_id for g in filtered_q)
    assert all(g["horizon"] == "quarterly" for g in filtered_q)

    # Filter by is_completed=true
    filtered_completed = client.get("/api/v1/goals?is_completed=true").json()
    assert any(g["id"] == m_id for g in filtered_completed)
    assert all(g["is_completed"] is True for g in filtered_completed)

def test_update_goal_and_key_results():
    # Create goal
    payload = {
        "title": "Przygotowanie prototypu",
        "horizon": "monthly",
        "key_results": [
            {"title": "Testy wytrzymałościowe", "current_value": 0, "target_value": 5, "unit": "testów"}
        ]
    }
    res = client.post("/api/v1/goals", json=payload)
    goal_id = res.json()["id"]

    # Update progress and title
    update_payload = {
        "title": "Przygotowanie prototypu v2",
        "key_results": [
            {"title": "Testy wytrzymałościowe", "current_value": 5, "target_value": 5, "unit": "testów"}
        ],
        "is_completed": True
    }
    update_res = client.patch(f"/api/v1/goals/{goal_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["title"] == "Przygotowanie prototypu v2"
    assert updated_data["key_results"][0]["current_value"] == 5
    assert updated_data["is_completed"] is True
    assert updated_data["completed_at"] is not None

def test_delete_goal():
    # Create goal
    res = client.post("/api/v1/goals", json={"title": "Cel do usunięcia", "horizon": "monthly"})
    goal_id = res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/v1/goals/{goal_id}")
    assert del_res.status_code == 204

    # Verify not found
    get_res = client.get(f"/api/v1/goals/{goal_id}")
    assert get_res.status_code == 404

def test_goal_user_isolation():
    # User 1 creates a goal
    app.dependency_overrides[verify_token] = lambda: {"uid": "user_alpha", "email": "alpha@example.com"}
    res = client.post("/api/v1/goals", json={"title": "Prywatny cel Alpha", "horizon": "long_term"})
    alpha_goal_id = res.json()["id"]

    # User 2 tries to read User 1's goal
    app.dependency_overrides[verify_token] = lambda: {"uid": "user_beta", "email": "beta@example.com"}
    res_forbidden = client.get(f"/api/v1/goals/{alpha_goal_id}")
    assert res_forbidden.status_code == 404

    # User 2 list should not contain User 1's goal
    beta_list = client.get("/api/v1/goals").json()
    assert not any(g["id"] == alpha_goal_id for g in beta_list)

def test_axis_tiles_persistence():
    # 1. Fetch initially empty
    app.dependency_overrides[verify_token] = lambda: {"uid": "user_axis_1", "email": "axis1@example.com"}
    init_res = client.get("/api/v1/goals/axis-tiles")
    assert init_res.status_code == 200
    assert init_res.json() == []

    # 2. Save tiles
    tiles = [
        {"id": "t1", "title": "Social media", "x": 15.5, "y": 80.0},
        {"id": "t2", "title": "Projekt strategiczny", "x": 85.0, "y": 70.0}
    ]
    put_res = client.put("/api/v1/goals/axis-tiles", json={"tiles": tiles})
    assert put_res.status_code == 200
    saved_data = put_res.json()
    assert len(saved_data) == 2
    assert saved_data[0]["title"] == "Social media"
    assert saved_data[1]["x"] == 85.0

    # 3. Read back
    get_res = client.get("/api/v1/goals/axis-tiles")
    assert get_res.status_code == 200
    data = get_res.json()
    assert len(data) == 2
    assert data[0]["id"] == "t1"
    assert data[1]["id"] == "t2"

def test_axis_tiles_user_isolation():
    # User A saves tiles
    app.dependency_overrides[verify_token] = lambda: {"uid": "user_a", "email": "a@example.com"}
    tiles_a = [{"id": "ta", "title": "Kafelki A", "x": 30.0, "y": 40.0}]
    client.put("/api/v1/goals/axis-tiles", json={"tiles": tiles_a})

    # User B should see empty tiles
    app.dependency_overrides[verify_token] = lambda: {"uid": "user_b", "email": "b@example.com"}
    res_b = client.get("/api/v1/goals/axis-tiles")
    assert res_b.status_code == 200
    assert res_b.json() == []

def test_goal_ai_chat():
    app.dependency_overrides[verify_token] = lambda: {"uid": "user_chat_1", "email": "chat1@example.com"}
    payload = {
        "messages": [
            {"role": "user", "content": "Jaki powinien być mój kolejny kafelek na osi?"}
        ],
        "current_tiles": [
            {"id": "t1", "title": "Social media & TV", "x": 15.0, "y": 78.0},
            {"id": "t2", "title": "Wdrożenie projektu", "x": 88.0, "y": 82.0}
        ]
    }
    res = client.post("/api/v1/goals/ai-chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 0
