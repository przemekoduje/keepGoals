#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Skrypt wdrożenia KeepGoals do Google Cloud Run i przemokoduje.com/keepgoals
# Projekt Cloud Run (aktywny billing): ai-english-buddy-150e5
# Projekt Bazy/Auth Firebase: ai-buddy-app-471817
# Projekt Hostingu Portalu (przemokoduje.com): speakling-live-temp
# ==============================================================================

PROJECT_ID="ai-english-buddy-150e5"
FIREBASE_DB_PROJECT="ai-buddy-app-471817"
HOSTING_PROJECT="speakling-live-temp"
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
import os, base64
env_dict = {}
with open(".env") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            v = v.split("#")[0].strip()
            env_dict[k.strip()] = v.strip("\x27").strip("\"")
env_dict["FIREBASE_CREDENTIALS_PATH"] = "firebase-adminsdk.json"
if os.path.exists("firebase-adminsdk.json"):
    with open("firebase-adminsdk.json", "rb") as cf:
        env_dict["FIREBASE_CREDENTIALS_B64"] = base64.b64encode(cf.read()).decode("utf-8")
env_dict["FIREBASE_STORAGE_BUCKET"] = "ai-buddy-app-471817.firebasestorage.app"
env_dict["ALLOWED_ORIGINS"] = "https://keepgoals.przemokoduje.com,http://keepgoals.przemokoduje.com,https://przemokoduje.com,https://www.przemokoduje.com,https://speakling-live-temp.web.app,https://speakling-live-temp.firebaseapp.com,https://ai-buddy-app-471817.web.app,https://ai-buddy-app-471817.firebaseapp.com"
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
        --min-instances 0 \
        --timeout 300s \
        ${ENV_FLAG} \
        --quiet

    BACKEND_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format="value(status.url)")
    echo "✅ Backend wdrożony pomyślnie!"
    echo "   Adres Cloud Run: $BACKEND_URL"

    echo "🧹 Czyszczenie starych obrazów Docker w Artifact Registry (gwarancja limitu 0 zł)..."
    python3 -c "
import subprocess, json
try:
    svc_info = subprocess.check_output(['gcloud', 'run', 'services', 'describe', '$SERVICE_NAME', '--region=$REGION', '--project=$PROJECT_ID', '--format=json'])
    active_img = json.loads(svc_info)['spec']['template']['spec']['containers'][0]['image']
    active_digest = active_img.split('@')[-1] if '@' in active_img else ''
    
    repo = 'europe-west1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy'
    out = subprocess.check_output(['gcloud', 'artifacts', 'docker', 'images', 'list', repo, '--project=$PROJECT_ID', '--format=json'])
    images = json.loads(out)
    for img in images:
        pkg = img.get('package', '')
        ver = img.get('version', '')
        if '$SERVICE_NAME' in pkg and active_digest and active_digest not in ver:
            subprocess.call(['gcloud', 'artifacts', 'docker', 'images', 'delete', f'{pkg}@{ver}', '--project=$PROJECT_ID', '--delete-tags', '--quiet'])
except Exception:
    pass
" || true

    if [ -n "$BACKEND_URL" ] && [ -f "frontend/.env.production" ]; then
        python3 -c "
with open('frontend/.env.production', 'r') as f:
    lines = f.readlines()
with open('frontend/.env.production', 'w') as f:
    for line in lines:
        if line.startswith('VITE_API_URL='):
            f.write('VITE_API_URL=${BACKEND_URL}\n')
        else:
            f.write(line)
"
        echo "   Zaktualizowano VITE_API_URL w frontend/.env.production -> $BACKEND_URL"
    fi
}

deploy_frontend() {
    echo ""
    echo "🌐 [2/2] Budowanie i wdrażanie Frontendu na przemokoduje.com/keepgoals..."
    
    echo "🔨 Budowanie aplikacji React (Vite) z prefiksem /keepgoals/..."
    (cd frontend && npm run build)

    echo "🚀 Publikacja przekierowania na Firebase Hosting (Projekt: $FIREBASE_DB_PROJECT)..."
    mkdir -p redirect_public && touch redirect_public/404.html
    firebase deploy --only hosting --project "$FIREBASE_DB_PROJECT" || true

    # Synchronizacja ze stroną główną przemokoduje.com (/keepgoals) z ochroną integralności Speakling
    SPEAKLING_DIR=""
    if [ -d "../AI-English-Buddy" ]; then
        SPEAKLING_DIR="../AI-English-Buddy"
    elif [ -d "../AI-english_buddy" ]; then
        SPEAKLING_DIR="../AI-english_buddy"
    fi

    if [ -n "$SPEAKLING_DIR" ]; then
        echo "🌐 Synchronizacja repozytorium Speakling ($SPEAKLING_DIR) z GitHub..."
        (cd "$SPEAKLING_DIR" && git fetch origin main && git pull --ff-only origin main || true)

        KG_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "")
        if [ -n "$KG_HEAD" ] && [ -d "frontend/dist" ]; then
            echo "$KG_HEAD" > frontend/dist/.keepgoals-commit
        fi

        SP_HEAD=$(cd "$SPEAKLING_DIR" && git rev-parse HEAD 2>/dev/null || echo "")
        SP_BUILT=""
        if [ -f "$SPEAKLING_DIR/frontend/build/.speakling-commit" ]; then
            SP_BUILT=$(cat "$SPEAKLING_DIR/frontend/build/.speakling-commit")
        fi

        if [ ! -f "$SPEAKLING_DIR/frontend/build/speakling.html" ] || [ "$SP_HEAD" != "$SP_BUILT" ]; then
            echo "🔨 Wykryto nowszą wersję Speakling w Git ($SP_HEAD vs $SP_BUILT) — pełna przebudowa i synchronizacja..."
            (cd "$SPEAKLING_DIR" && ./deploy.sh)
        else
            echo "🌐 Aktualizacja podkatalogu /keepgoals i weryfikacja integralności..."
            if [ -f "portal/index.html" ]; then
                cp portal/index.html "$SPEAKLING_DIR/portal/index.html"
                cp portal/index.html "$SPEAKLING_DIR/frontend/build/index.html"
            fi
            (cd "$SPEAKLING_DIR" && python3 scripts/sync-and-verify-bundle.py && npx firebase-tools deploy --only hosting --project "$HOSTING_PROJECT" && npx firebase-tools deploy --only hosting --project przemokoduje-online)
        fi
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
