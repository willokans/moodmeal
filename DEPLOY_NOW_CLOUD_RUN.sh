#!/bin/bash
# Quick deploy script for Cloud Run

echo "🚀 Deploying MoodMeal to Cloud Run..."
echo ""

# Deploy to Cloud Run
gcloud run deploy moodmeal \
  --image gcr.io/moodmeal-478012/moodmeal:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars \
    DATABASE_URL="postgresql://postgres.jdirselycxxhduiohpvc:WQ%24mephw%25L62VtN@aws-1-eu-north-1.pooler.supabase.com:5432/postgres",\
    SESSION_SECRET="p+iAptpbAqsw8xJxX6gp1ozS7J866HmqqTv2FrOUJGg=",\
    NODE_ENV="production",\
    SESSION_MAX_AGE="86400000",\
    BCRYPT_ROUNDS="10" \
  --project=moodmeal-478012 \
  --port=3000

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app URL will be shown above"
echo "   Format: https://moodmeal-XXXXX-uc.a.run.app"
echo ""

