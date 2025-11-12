# 🚀 Deploy to Cloud Run Instead (Recommended)

App Engine Flexible is having persistent issues. **Cloud Run is simpler, faster, and more reliable** for containerized apps.

## Why Cloud Run?

- ✅ **Simpler deployment** - No complex configuration
- ✅ **Faster deployments** - Usually deploys in 1-2 minutes
- ✅ **More reliable** - Better error handling
- ✅ **Auto-scaling** - Scales to zero when not in use
- ✅ **Pay per use** - Only pay when requests are served
- ✅ **Same Docker image** - Use the image you already built!

## Quick Deploy to Cloud Run

### Option 1: Deploy via Console (Easiest)

1. Go to: https://console.cloud.google.com/run?project=moodmeal-478012
2. Click **"Create Service"**
3. Select **"Deploy one revision from an existing container image"**
4. Container image URL: `gcr.io/moodmeal-478012/moodmeal:latest`
5. Service name: `moodmeal`
6. Region: Choose `us-central1` or `europe-west1`
7. **Authentication**: Select **"Allow unauthenticated invocations"**
8. Click **"Container"** tab:
   - Add environment variables:
     - `DATABASE_URL` = `postgresql://postgres.jdirselycxxhduiohpvc:WQ%24mephw%25L62VtN@aws-1-eu-north-1.pooler.supabase.com:5432/postgres`
     - `SESSION_SECRET` = `p+iAptpbAqsw8xJxX6gp1ozS7J866HmqqTv2FrOUJGg=`
     - `NODE_ENV` = `production`
     - `SESSION_MAX_AGE` = `86400000`
     - `BCRYPT_ROUNDS` = `10`
9. Click **"Create"**

### Option 2: Deploy via gcloud CLI

```bash
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
  --project=moodmeal-478012
```

## Update Cloud Build for Cloud Run

I can update your `cloudbuild.yaml` to deploy to Cloud Run instead of App Engine. Would you like me to do that?

## Your App URL

After deployment, Cloud Run will give you a URL like:
```
https://moodmeal-XXXXX-uc.a.run.app
```

## Benefits Over App Engine

- **Faster**: Deploys in 1-2 minutes vs 5-10 minutes
- **More reliable**: Better error messages and handling
- **Simpler**: Less configuration needed
- **Cost-effective**: Only pay for actual usage
- **Better logs**: Easier to debug

---

**Try Cloud Run - it's much more reliable for containerized apps!** 🚀

