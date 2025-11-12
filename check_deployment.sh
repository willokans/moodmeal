#!/bin/bash
# Diagnostic script for App Engine deployment

echo "=== App Engine Deployment Diagnostics ==="
echo ""

echo "1. Checking deployed versions..."
gcloud app versions list --project=moodmeal-478012 --limit=5
echo ""

echo "2. Checking which version is serving traffic..."
gcloud app services describe default --project=moodmeal-478012
echo ""

echo "3. Checking recent logs (last 50 lines)..."
gcloud app logs read --limit=50 --project=moodmeal-478012 2>&1 | tail -50
echo ""

echo "4. Testing endpoints..."
echo "Testing /api/auth/status:"
curl -s https://moodmeal-478012.nw.r.appspot.com/api/auth/status | head -5
echo ""
echo "Testing /login:"
curl -s -I https://moodmeal-478012.nw.r.appspot.com/login | head -3
echo ""

echo "5. Checking if app.yaml exists and has env vars..."
if [ -f "app.yaml" ]; then
    echo "✅ app.yaml exists"
    if grep -q "DATABASE_URL" app.yaml; then
        echo "✅ DATABASE_URL found in app.yaml"
    else
        echo "❌ DATABASE_URL NOT found in app.yaml"
    fi
else
    echo "❌ app.yaml NOT found in current directory"
fi
echo ""

echo "=== Next Steps ==="
echo "If DATABASE_URL is missing from app.yaml, update it and redeploy:"
echo "  gcloud app deploy app.yaml --project=moodmeal-478012"
echo ""

