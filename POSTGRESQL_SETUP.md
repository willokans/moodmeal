# PostgreSQL (Supabase) Setup Guide

Your MoodMeal app has been successfully migrated to use PostgreSQL with Supabase! 🎉

## Quick Setup (3 Steps)

### Step 1: Create the `.env` File

Create a file named `.env` in the root directory of your project:

```bash
# In your project root
touch .env
```

Add the following content to `.env`:

```env
# Environment Configuration
NODE_ENV=development
PORT=3000

# Session Configuration
SESSION_SECRET=mood-recipe-secret-key-2024-change-in-production
SESSION_MAX_AGE=86400000

# PostgreSQL Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.jdirselycxxhduiohpvc.supabase.co:5432/postgres

# Security
BCRYPT_ROUNDS=10
```

**IMPORTANT**: Replace `YOUR_ACTUAL_PASSWORD` with your actual Supabase database password!

### Step 2: Start the Server

```bash
npm start
```

The server will:
- ✅ Connect to your Supabase PostgreSQL database
- ✅ Create the necessary tables (recipes, users)
- ✅ Create default test users if they don't exist
- ✅ Populate with 26 recipes if the database is empty

## Database Features

### PostgreSQL (Supabase) Benefits

| Feature | Description |
|---------|-------------|
| **Database** | Cloud-hosted (Supabase) |
| **Scaling** | Horizontal scaling ready |
| **Concurrency** | High concurrency support |
| **Backup** | Automated by Supabase |
| **Multi-environment** | Easy setup for dev/staging/prod |

### Technical Stack

- ✅ Uses `pg` (PostgreSQL client) with connection pooling
- ✅ Parameterized queries ($1, $2, etc.) for security
- ✅ `SERIAL` for auto-incrementing primary keys
- ✅ PostgreSQL `RANDOM()` for random recipe selection
- ✅ Environment variables for secure configuration

## Connection Details

Your Supabase PostgreSQL connection string:

```
postgresql://postgres:[YOUR_PASSWORD]@db.jdirselycxxhduiohpvc.supabase.co:5432/postgres
```

- **Host**: `db.jdirselycxxhduiohpvc.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: Your Supabase password
- **SSL**: Required (automatically configured)

## Testing the Connection

After starting the server, you should see:

```
Connected to PostgreSQL database (Supabase)
Recipes table ready
Users table ready
Test user created: test@user.com / test
Admin user created: admin@user.com / admin
Server is running on http://localhost:3000
```

## Default Test Accounts

### Regular User
- **Email**: test@user.com
- **Password**: test

### Admin User
- **Email**: admin@user.com
- **Password**: admin

## Troubleshooting

### Error: "password authentication failed"
- Check that you replaced `[YOUR_PASSWORD]` in the `.env` file with your actual password
- Make sure there are no extra spaces or quotes around the password

### Error: "no pg_hba.conf entry"
- SSL connection is required. The code already handles this with `rejectUnauthorized: false`

### Error: "connection timeout"
- Check your internet connection
- Verify the Supabase database URL is correct
- Make sure the Supabase project is active

### Error: "ENOENT: no such file or directory, open '.env'"
- Make sure you created the `.env` file in the project root
- The `.env` file should be at the same level as `server.js` and `package.json`

## Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `SESSION_SECRET` | Secret key for sessions | Change in production! |
| `SESSION_MAX_AGE` | Session duration (ms) | `86400000` (24 hours) |
| `DATABASE_URL` | PostgreSQL connection string | Your Supabase URL |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |

## Next Steps

### For Development:
1. ✅ You're all set! Start developing with `npm start`
2. Access the app at http://localhost:3000
3. Use the admin panel at http://localhost:3000/admin.html

### For Multiple Environments:

Create separate `.env` files:

```bash
.env.development    # Local development
.env.staging       # Staging environment
.env.production    # Production environment
```

Load the appropriate one based on your environment:

```bash
# Development
npm start

# Staging
NODE_ENV=staging node server.js

# Production
NODE_ENV=production node server.js
```

### For Kubernetes/Docker Deployment:

You can now easily containerize your app since PostgreSQL is external:

1. Create a `Dockerfile`
2. Set `DATABASE_URL` as an environment variable in your K8s deployment
3. Deploy to GKE, EKS, or any Kubernetes cluster

## Database Management

### Accessing Supabase Dashboard

1. Go to https://supabase.com
2. Sign in to your account
3. Select your project
4. Use the SQL Editor or Table Editor to manage data

### Running SQL Queries

You can run SQL queries directly from the Supabase dashboard:

```sql
-- View all recipes
SELECT * FROM recipes ORDER BY mood, name;

-- Count recipes by mood
SELECT mood, COUNT(*) as count FROM recipes GROUP BY mood;

-- View all users
SELECT id, email, is_admin, created_at FROM users;

-- Check active recipes
SELECT COUNT(*) FROM recipes WHERE active = 1;
```

### Backup and Restore

Supabase automatically backs up your database. You can also:

1. **Manual backup**: Use the Supabase dashboard to export data
2. **Programmatic backup**: Use `pg_dump` with your connection string

```bash
# Backup (requires pg_dump installed)
pg_dump "postgresql://postgres:[PASSWORD]@db.jdirselycxxhduiohpvc.supabase.co:5432/postgres" > backup.sql
```

## Security Best Practices

### For Production:

1. **Change SESSION_SECRET**: Use a strong, random string
   ```bash
   # Generate a random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use environment variables**: Never commit `.env` to git
   
3. **Enable secure cookies**: Set `NODE_ENV=production`

4. **Use connection pooling**: Already configured with `pg.Pool`

5. **Rotate passwords**: Change database passwords regularly

6. **Set up monitoring**: Use Supabase's built-in monitoring

## Project Files

- ✅ `server.js` - PostgreSQL-enabled Express server
- ✅ `package.json` - Includes `pg` and `dotenv` dependencies
- ✅ `.env` - Environment configuration (not in git)
- ✅ `.gitignore` - Excludes `.env` for security

---

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the Supabase logs in your dashboard
3. Check server logs with `npm start`
4. Verify your `.env` file is correctly configured

**Happy cooking with MoodMeal! 🍽️✨**

