from fastapi.testclient import TestClient
from unittest.mock import patch

# Mockujemy Firebase przed importem aplikacji
with patch("firebase_admin.initialize_app"), patch("firebase_admin.firestore.client"):
    from src.main import app

client = TestClient(app)

def test_cors_headers_allowed():
    # Żądanie OPTIONS (Preflight) z dozwolonego źródła (Origin)
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-methods") is not None

def test_cors_headers_https_allowed():
    # Żądanie OPTIONS z HTTPS (Origin z HTTPS dla localhost/mobile)
    headers = {
        "Origin": "https://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization,Content-Type",
    }
    response = client.options("/api/v1/notes", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://localhost:5173"

def test_cors_headers_invalid_origin():
    # Żądanie OPTIONS z niedozwolonego źródła (Origin)
    headers = {
        "Origin": "http://unauthorized-domain.com",
        "Access-Control-Request-Method": "POST",
    }
    response = client.options("/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") is None
