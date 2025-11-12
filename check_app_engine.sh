#!/bin/bash
echo "=== Checking App Engine Status ==="
echo ""
echo "1. Checking logs (last 20 lines)..."
gcloud app logs read --limit=20 --project=moodmeal-478012 2>&1 | head -30
echo ""
echo "2. Checking versions..."
gcloud app versions list --project=moodmeal-478012 2>&1 | head -10
echo ""
echo "3. Testing endpoints..."
echo "Testing /api/auth/status:"
curl -s https://moodmeal-478012.nw.r.appspot.com/api/auth/status || echo "Failed"
echo ""
echo "Testing /login:"
curl -s -I https://moodmeal-478012.nw.r.appspot.com/login | head -1 || echo "Failed"
