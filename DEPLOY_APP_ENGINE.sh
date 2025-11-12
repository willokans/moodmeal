#!/bin/bash
# Deployment script for App Engine

echo "🚀 Deploying MoodMeal to App Engine..."
echo ""

# Check if app.yaml exists
if [ ! -f "app.yaml" ]; then
    echo "❌ Error: app.yaml not found!"
    exit 1
fi

# Deploy to App Engine
echo "📦 Deploying application..."
gcloud app deploy app.yaml --project=moodmeal-478012

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Checking deployment status..."
gcloud app versions list --project=moodmeal-478012 --limit=1

echo ""
echo "📊 Viewing logs..."
echo "Run: gcloud app logs tail --project=moodmeal-478012"
echo ""
echo "🌐 Your app URL: https://moodmeal-478012.nw.r.appspot.com"
echo ""

