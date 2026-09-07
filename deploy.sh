#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Skrypt wdrożenia KeepGoals do Google Cloud Run i przemokoduje.com/keepgoals
# Projekt GCP/Firebase: ai-buddy-app-471817 (Backend + Hosting Redirect)
# Projekt Portalu: ai-english-buddy-150e5 (przemokoduje.com/keepgoals)
# ==============================================================================

PROJECT_ID="ai-buddy-app-471817"
REGION="europe-west1"
SERVICE_NAME="keepgoals-backend"

MODE="${1:-all}"

echo "=========================================================="
echo "🚀 Rozpoczynanie wdrożenia KeepGoals (Tryb: $MODE)"
echo "   Projekt: $PROJECT_ID | Region: $REGION"
echo "   Docelowy adres: https://przemokoduje.com/keepgoals"
echo "=========================================================="

deploy_backend() {
    echo ""
    echo "📦 [1/2] Wdrażanie Backendu na Google Cloud Run..."
    
    # Upewnij się, że wymagane API są włączone
    echo "⚙️ Sprawdzanie i włączanie usług GCP (Cloud Run, Cloud Build)..."
    gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$PROJECT_ID" --quiet

    echo "⚙️ Przygotowywanie zmiennych środowiskowych..."
    ENV_FLAG=""
    if [ -f ".env" ]; then
        python3 -c '
import os
env_dict = {}
with open(".env") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            v = v.split("#")[0].strip()
            env_dict[k.strip()] = v.strip("\x27").strip("\"")
env_dict["FIREBASE_STORAGE_BUCKET"] = "ai-buddy-app-471817.firebasestorage.app"
env_dict["ALLOWED_ORIGINS"] = "https://keepgoals.przemokoduje.com,http://keepgoals.przemokoduje.com,https://przemokoduje.com,https://www.przemokoduje.com,https://ai-buddy-app-471817.web.app,https://ai-buddy-app-471817.firebaseapp.com"
with open(".env.yaml", "w") as f:
    for k, v in env_dict.items():
        escaped_v = v.replace("\"", "\\\"")
        f.write(f"{k}: \"{escaped_v}\"\n")
'
        if [ -f ".env.yaml" ]; then
            ENV_FLAG="--env-vars-file=.env.yaml"
        fi
    fi

    echo "🔨 Budowanie obrazu w chmurze i wdrożenie kontenera..."
    gcloud run deploy "$SERVICE_NAME" \
        --source . \
        --region "$REGION" \
        --project "$PROJECT_ID" \
        --platform managed \
        --allow-unauthenticated \
        --memory 1Gi \
        --min-instances 1 \
        --timeout 300s \
        ${ENV_FLAG} \
        --quiet

    BACKEND_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format="value(status.url)")
    echo "✅ Backend wdrożony pomyślnie!"
    echo "   Adres Cloud Run: $BACKEND_URL"
}

deploy_frontend() {
    echo ""
    echo "🌐 [2/2] Budowanie i wdrażanie Frontendu na przemokoduje.com/keepgoals..."
    
    echo "🔨 Budowanie aplikacji React (Vite) z prefiksem /keepgoals/..."
    (cd frontend && npm run build)

    echo "🚀 Publikacja przekierowania na Firebase Hosting (Projekt: $PROJECT_ID)..."
    mkdir -p redirect_public && touch redirect_public/404.html
    firebase deploy --only hosting --project "$PROJECT_ID"

    # Synchronizacja ze stroną główną przemokoduje.com (/keepgoals)
    if [ -d "../AI-english_buddy/frontend/build" ]; then
        echo "🌐 Aktualizacja podkatalogu /keepgoals na przemokoduje.com..."
        mkdir -p ../AI-english_buddy/frontend/build/keepgoals
        cp -r frontend/dist/. ../AI-english_buddy/frontend/build/keepgoals/
        if [ -f "portal/index.html" ]; then
            cp portal/index.html ../AI-english_buddy/portal/index.html
            cp portal/index.html ../AI-english_buddy/frontend/build/index.html
        fi
        (cd ../AI-english_buddy && firebase deploy --only hosting --project ai-english-buddy-150e5)
    fi

    echo "✅ Frontend wdrożony pomyślnie na https://przemokoduje.com/keepgoals !"
}

case "$MODE" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "❌ Nieznany tryb: $MODE. Dostępne: all, backend, frontend"
        exit 1
        ;;
esac

echo ""
echo "=========================================================="
echo "🎉 Wdrożenie zakończone sukcesem!"
echo "=========================================================="
echo "📌 Główny adres aplikacji KeepGoals:"
echo "   👉 https://przemokoduje.com/keepgoals"
echo ""
echo "📌 Strona główna portalu (hub produktów):"
echo "   👉 https://przemokoduje.com"
echo ""
echo "📌 Automatyczne przekierowanie (301) do https://przemokoduje.com/keepgoals:"
echo "   - https://$PROJECT_ID.web.app"
echo "   - https://keepgoals.przemokoduje.com (jeśli skonfigurowano CNAME)"
echo "=========================================================="
