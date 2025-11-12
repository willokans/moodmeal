# 🔧 App Engine Troubleshooting - "Page not found" Error

## Problem

You're seeing "Error: Page not found" when accessing `https://moodmeal-478012.nw.r.appspot.com/`

## Common Causes & Solutions

### 1. Check Application Logs

First, check what's happening in your app:

```bash
# View recent logs
gcloud app logs read --limit=50 --project=moodmeal-478012

# Follow logs in real-time
gcloud app logs tail --project=moodmeal-478012
```

**Look for:**

- Database connection errors
- Application startup errors
- Route not found errors

### 2. Verify Environment Variables Are Set

App Engine needs your database connection:

```bash
# Check current environment variables
gcloud app describe --project=moodmeal-478012

# Set environment variables if missing
gcloud app deploy --set-env-vars \
  DATABASE_URL="postgresql://postgres.jdirselycxxhduiohpvc:WQ%24mephw%25L62VtN@aws-1-eu-north-1.pooler.supabase.com:5432/postgres",\
  SESSION_SECRET="your-session-secret-here",\
  NODE_ENV="production",\
  PORT="8080"
```

**Or via Console:**

1. Go to App Engine → Settings
2. Click "Environment Variables"
3. Add:
   - `DATABASE_URL` = Your Supabase connection string
   - `SESSION_SECRET` = Random secret (use: `openssl rand -base64 32`)
   - `NODE_ENV` = `production`

### 3. Test the Health Endpoint

```bash
# Test if the app is responding
curl https://moodmeal-478012.nw.r.appspot.com/api/auth/status

# Should return: {"authenticated":false}
```

If this works but `/` doesn't, it's a routing issue.

### 4. Check Database Connection

The app might be failing to start due to database connection issues:

```bash
# Check logs for database errors
gcloud app logs read --limit=100 --project=moodmeal-478012 | grep -i "database\|postgres\|error"
```

**Common database issues:**

- `DATABASE_URL` not set
- Wrong connection string format
- Network/firewall blocking connection
- Database credentials incorrect

### 5. Verify Deployment Status

```bash
# List all versions
gcloud app versions list --project=moodmeal-478012

# Check which version is serving traffic
gcloud app services describe default --project=moodmeal-478012
```

Make sure a version is serving 100% traffic.

### 6. Test Routes Directly

Try these URLs:

1. **Health check**: `https://moodmeal-478012.nw.r.appspot.com/api/auth/status`
2. **Login page**: `https://moodmeal-478012.nw.r.appspot.com/login`
3. **Root**: `https://moodmeal-478012.nw.r.appspot.com/`

### 7. Redeploy with Debugging

```bash
# Deploy with verbose logging
gcloud app deploy app.yaml --verbosity=debug --project=moodmeal-478012

# Or deploy and immediately check logs
gcloud app deploy app.yaml --project=moodmeal-478012 && \
gcloud app logs tail --project=moodmeal-478012
```

## Quick Fix Checklist

- [ ] Check logs for errors: `gcloud app logs read --limit=50`
- [ ] Verify `DATABASE_URL` is set in environment variables
- [ ] Verify `SESSION_SECRET` is set
- [ ] Test `/api/auth/status` endpoint
- [ ] Test `/login` endpoint
- [ ] Check if version is serving traffic
- [ ] Redeploy if needed

## Common Error Messages

### "Cannot connect to database"

**Solution**: Set `DATABASE_URL` environment variable

### "Session secret not set"

**Solution**: Set `SESSION_SECRET` environment variable

### "Application failed to start"

**Solution**: Check logs for specific error, usually database connection

### "404 - Route not found"

**Solution**:

- Check that routes are defined in server.js
- Verify static files are in `public/` directory
- Check that app is listening on correct port

## Testing Locally Before Deploying

```bash
# Set environment variables locally
export DATABASE_URL="your-connection-string"
export SESSION_SECRET="your-secret"
export PORT=8080
export NODE_ENV=production

# Run locally
npm start

# Test
curl http://localhost:8080/api/auth/status
curl http://localhost:8080/login
```

If it works locally but not on App Engine, it's an environment variable issue.

## Force Redeploy

If nothing works, try a fresh deployment:

```bash
# Delete old version (optional)
gcloud app versions delete VERSION_ID --project=moodmeal-478012

# Deploy fresh
gcloud app deploy app.yaml \
  --set-env-vars DATABASE_URL="...",SESSION_SECRET="...",NODE_ENV="production" \
  --project=moodmeal-478012
```

## Next Steps

1. **Check logs first** - This will tell you exactly what's wrong
2. **Verify environment variables** - Most common issue
3. **Test individual endpoints** - See which routes work
4. **Check database connection** - Make sure Supabase is accessible

---

**Most likely issue**: Missing `DATABASE_URL` environment variable causing the app to fail on startup! 🔍
