# 🔍 Finding Your App Engine URL

## Quick Answer

Your App Engine URL should be:

**`https://moodmeal-478012.appspot.com`**

Or if you specified a region:

**`https://moodmeal-478012.REGION.r.appspot.com`**

## How to Find Your URL

### Method 1: GCP Console

1. Go to [App Engine Dashboard](https://console.cloud.google.com/appengine)
2. Select your project: `moodmeal-478012`
3. Click on **Services** in the left menu
4. You'll see your service URL listed there
5. Click on the service name to see the URL

### Method 2: Via gcloud CLI

```bash
# Get the default service URL
gcloud app browse

# Or list all services
gcloud app services list

# Get detailed info
gcloud app describe
```

### Method 3: Check Versions Page

1. Go to: https://console.cloud.google.com/appengine/versions?project=moodmeal-478012
2. Look for the **Traffic** column - it shows which version is serving
3. The URL is displayed at the top of the page or in the service details

## Common App Engine URL Formats

- **Standard (default)**: `https://PROJECT_ID.appspot.com`
- **With region**: `https://PROJECT_ID.REGION.r.appspot.com`
- **Custom domain**: `https://yourdomain.com` (if configured)

## Testing Your App

Once you have the URL, test it:

```bash
# Test the health endpoint
curl https://moodmeal-478012.appspot.com/api/auth/status

# Or open in browser
open https://moodmeal-478012.appspot.com
```

## Troubleshooting

### If the URL doesn't work:

1. **Check deployment status:**
   ```bash
   gcloud app versions list
   ```

2. **Check if version is serving traffic:**
   - Go to App Engine → Versions
   - Make sure a version has 100% traffic

3. **Check logs:**
   ```bash
   gcloud app logs tail -s default
   ```

4. **Verify environment variables:**
   - App Engine → Settings → Environment Variables
   - Make sure `DATABASE_URL` and `SESSION_SECRET` are set

### If you see "Error 502" or "Service Unavailable":

1. Check that your app is listening on the correct port:
   - App Engine expects port `8080` (or `PORT` env variable)
   - Your `server.js` should use: `process.env.PORT || 3000`

2. Verify health checks:
   - `/api/auth/status` should return `{"authenticated":false}`

3. Check application logs:
   ```bash
   gcloud app logs read --limit=50
   ```

## Setting Environment Variables

If you need to set environment variables:

```bash
# Set via gcloud
gcloud app deploy --set-env-vars \
  DATABASE_URL="your-database-url",\
  SESSION_SECRET="your-session-secret",\
  NODE_ENV="production"

# Or in Console:
# App Engine → Settings → Environment Variables → Add
```

## Quick Access

**Try these URLs directly:**

1. `https://moodmeal-478012.appspot.com`
2. `https://moodmeal-478012.us-central1.r.appspot.com`
3. `https://moodmeal-478012.europe-west1.r.appspot.com`

The exact URL depends on which region you deployed to.

---

**Your app URL should be visible in the App Engine Console!** 🚀

