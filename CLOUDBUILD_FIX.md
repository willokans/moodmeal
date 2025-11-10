# 🔧 Cloud Build Error Fix

## Problem

You're getting this error:
```
if 'build.service_account' is specified, the build must either (a) specify 'build.logs_bucket', 
(b) use the REGIONAL_USER_OWNED_BUCKET build.options.default_logs_bucket_behavior option, 
or (c) use either CLOUD_LOGGING_ONLY / NONE logging options
```

## Solution

I've created `cloudbuild.yaml` files with the proper logging configuration. The fix is to add:

```yaml
options:
  logging: CLOUD_LOGGING_ONLY
```

## Quick Fix Options

### Option 1: Use the cloudbuild.yaml file (Recommended)

1. **In GCP Console:**
   - Go to **Cloud Build** → **Triggers**
   - Edit your trigger (`mood-food-app`)
   - In **Configuration**, select **Cloud Build configuration file (yaml or json)**
   - Set **Location** to: `cloudbuild.yaml`
   - **Save**

2. **Or via gcloud CLI:**
   ```bash
   gcloud builds triggers update mood-food-app \
       --build-config=cloudbuild.yaml
   ```

### Option 2: Fix in GCP Console

1. Go to **Cloud Build** → **Triggers**
2. Click on your trigger (`mood-food-app`)
3. Click **Edit**
4. Scroll to **Advanced** section
5. Under **Build options**, add:
   - **Logging**: Select `Cloud Logging only`
6. **Save**

### Option 3: Use a Logs Bucket

If you prefer to use a bucket for logs:

```bash
# Create a logs bucket
gsutil mb -p YOUR_PROJECT_ID gs://YOUR_PROJECT_ID-cloudbuild-logs

# Update cloudbuild.yaml
options:
  defaultLogsBucketBehavior: REGIONAL_USER_OWNED_BUCKET
  logsBucket: 'gs://YOUR_PROJECT_ID-cloudbuild-logs'
```

## Files Created

- ✅ `cloudbuild.yaml` - Main build config (with fix)
- ✅ `cloudbuild-dev.yaml` - Development builds
- ✅ `cloudbuild-prod.yaml` - Production builds

## Verify the Fix

After updating your trigger:

1. **Test the build:**
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

2. **Or trigger via Git:**
   - Push a commit to your `main` branch
   - The build should now work!

## What Changed?

The `cloudbuild.yaml` file now includes:

```yaml
options:
  logging: CLOUD_LOGGING_ONLY
```

This tells Cloud Build to use Cloud Logging instead of requiring a logs bucket when using a service account.

## Alternative: Remove Service Account

If you don't need a custom service account, you can remove it from the trigger settings:

1. Go to **Cloud Build** → **Triggers**
2. Edit your trigger
3. Under **Service account**, select **Default compute service account**
4. Save

This will also fix the error, but using `CLOUD_LOGGING_ONLY` is the better solution if you need the service account.

---

**After applying the fix, your builds should work!** 🎉

