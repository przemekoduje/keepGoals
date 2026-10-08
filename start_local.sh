#!/usr/bin/env bash
# ==============================================================================
# start_local.sh - Uruchamia całe środowisko przemokoduje.com lokalnie
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🚀 Uruchamianie lokalnego środowiska przemokoduje.com"
echo "=========================================================="

# 1. Backend (FastAPI + Uvicorn)
echo "🐍 [1/2] Startowanie backendu FastAPI (port 8000)..."
if [ ! -d ".venv" ]; then
    echo "Tworzenie wirtualnego środowiska python..."
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
fi

.venv/bin/uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 2. Speakling Backend (opcjonalnie, jeśli istnieje repozytorium AI-english_buddy)
SPEAKLING_DIR="$DIR/../AI-english_buddy/backend"
SPEAKLING_PID=""
if [ -d "$SPEAKLING_DIR" ] && [ -f "$SPEAKLING_DIR/app.py" ]; then
    echo "🗣️  [2/3] Startowanie backendu Speakling Flask (port 5001)..."
    (
        cd "$SPEAKLING_DIR"
        if [ -d "venv" ]; then
            PORT=5001 venv/bin/python app.py &
        else
            PORT=5001 python3 app.py &
        fi
    )
    SPEAKLING_PID=$!
fi

# 3. Frontend (Vite z obsługą Portalu, KeepGoals i Speakling)
echo "⚛️  [3/3] Startowanie serwera Vite (port 5173)..."
cd "$DIR/frontend"

# Uruchamiamy na 0.0.0.0 (dostęp w sieci lokalnej z telefonu/tabletu)
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "🛑 Zatrzymywanie usług lokalnych..."
    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true
    if [ -n "$SPEAKLING_PID" ]; then
        kill "$SPEAKLING_PID" 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo ""
echo "=========================================================="
echo "✨ Całe środowisko przemokoduje.com jest aktywne lokalnie!"
echo "=========================================================="
echo "👉 Strona główna portalu: https://localhost:5173/"
echo "👉 Aplikacja KeepGoals:   https://localhost:5173/keepgoals/"
echo "👉 Aplikacja Speakling:   https://localhost:5173/speakling"
echo "👉 Dokumentacja API:      http://localhost:8000/docs"
echo ""
echo "💡 Wszelkie zmiany w kodzie frontendu i backendu odświeżają się na żywo (Hot-Reload)!"
echo "Naciśnij Ctrl+C, aby zatrzymać wszystkie serwery."
echo "=========================================================="

# Opcjonalnie otwórz przeglądarkę
sleep 2
if command -v open >/dev/null 2>&1; then
    open "https://localhost:5173/"
fi

wait
