# 🚀 MoodMeal - Production Deployment Guide

This guide will help you deploy MoodMeal to production safely and securely.

## Pre-Deployment Checklist

Before deploying to production, complete these essential steps:

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_MAX_AGE=86400000

# Database Configuration
DATABASE_PATH=./recipes.db

# Security
BCRYPT_ROUNDS=10
```

**⚠️ CRITICAL**: Change the `SESSION_SECRET` to a strong, random string.

### 2. Update server.js

Replace hardcoded values with environment variables:

```javascript
// Load environment variables
require('dotenv').config();

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "CHANGE-THIS-SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000,
      sameSite: 'strict'
    },
  })
);

// Port configuration
const PORT = process.env.PORT || 3000;
```

### 3. Install Production Dependencies

```bash
npm install dotenv --save
```

### 4. Security Enhancements

#### Add Rate Limiting

```bash
npm install express-rate-limit --save
```

Add to server.js:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // limit login attempts
});

app.use('/api/', limiter);
app.use('/api/login', authLimiter);
```

#### Add Helmet for Security Headers

```bash
npm install helmet --save
```

Add to server.js:

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: false, // Adjust based on your needs
}));
```

#### Configure CORS Properly

Update CORS configuration:

```javascript
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
```

## Deployment Options

### Option 1: Deploying to VPS (DigitalOcean, AWS EC2, Linode)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Application Setup

```bash
# Clone your repository
git clone <your-repo-url>
cd moodmeal

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add your production environment variables

# Create production recipes database
# The app will auto-initialize on first run
```

#### Step 3: Start with PM2

```bash
# Start application
pm2 start server.js --name moodmeal

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 4: Configure Nginx as Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/moodmeal
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/moodmeal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Option 2: Deploying to Heroku

#### Step 1: Prepare Application

Create `Procfile`:

```
web: node server.js
```

Update `package.json`:

```json
{
  "engines": {
    "node": "18.x"
  }
}
```

#### Step 2: Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set SESSION_SECRET=your-super-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

### Option 3: Deploying to Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway will auto-detect and deploy your Node.js app

### Option 4: Deploying to Render

1. Connect your GitHub repository to Render
2. Select "Web Service"
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables
6. Deploy

## Database Considerations

### PostgreSQL (Supabase) for Production

This app uses **PostgreSQL with Supabase** - a cloud-hosted, production-ready database solution.

**Benefits:**
- ✅ Zero infrastructure management
- ✅ Automatic backups and point-in-time recovery
- ✅ High availability and reliability
- ✅ Excellent concurrency and ACID compliance
- ✅ Built-in monitoring and logging
- ✅ Easy scaling (vertical and horizontal)
- ✅ Multi-environment support

**Setup:**

1. **Set up environment variables:**
```bash
# In your .env file or deployment environment
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
NODE_ENV=production
SESSION_SECRET=your-strong-secret-key
```

2. **Connection pooling** is already configured in the app

3. **Backups** are automatic via Supabase (point-in-time recovery available)

### Multiple Environments

Create separate Supabase projects for:
- **Development**: dev.supabase.co
- **Staging**: staging.supabase.co  
- **Production**: prod.supabase.co

Use different `DATABASE_URL` values for each environment.

## Monitoring and Logging

### Setup PM2 Monitoring

```bash
# View logs
pm2 logs moodmeal

# Monitor resources
pm2 monit

# View process info
pm2 info moodmeal
```

### Log to File

Add to server.js:

```javascript
const fs = require('fs');
const morgan = require('morgan');

// Install morgan: npm install morgan --save

// Create a write stream
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// Setup logger
app.use(morgan('combined', { stream: accessLogStream }));
```

## Post-Deployment

### 1. Test All Functionality

- [ ] Login with test accounts
- [ ] Create new user (admin)
- [ ] Add new recipe
- [ ] Toggle recipe active/inactive
- [ ] Request recipe by mood
- [ ] Logout

### 2. Performance Optimization

```bash
# Enable gzip compression
npm install compression --save
```

Add to server.js:
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Setup Monitoring

Consider services like:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Performance**: New Relic, DataDog

### 4. Backup Strategy

**Automated Backups:**

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/moodmeal"
APP_DIR="/path/to/moodmeal"

# Backup database
cp $APP_DIR/recipes.db $BACKUP_DIR/recipes_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "recipes_*.db" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/recipes_$DATE.db s3://your-bucket/backups/
```

Set up cron job:
```bash
0 3 * * * /path/to/backup.sh
```

## Scaling Considerations

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer**: Nginx, HAProxy, or cloud load balancers
2. **Multiple App Instances**: Run multiple Node.js instances
3. **Session Store**: Move to Redis for shared sessions

```bash
npm install connect-redis redis --save
```

### Caching

Add Redis for caching:

```bash
npm install redis --save
```

## Security Checklist

- [ ] Changed default session secret
- [ ] Enabled HTTPS/SSL
- [ ] Rate limiting configured
- [ ] Helmet middleware added
- [ ] CORS properly configured
- [ ] Environment variables used for secrets
- [ ] Database backed up regularly
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies updated (`npm audit fix`)
- [ ] Firewall configured (only ports 80, 443, 22)
- [ ] SSH key authentication (disable password auth)

## Troubleshooting

### App Won't Start

```bash
# Check PM2 logs
pm2 logs moodmeal

# Check Node.js version
node --version

# Verify dependencies
npm install
```

### Database Errors

```bash
# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check if app can connect
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT NOW()').then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e.message)).finally(() => pool.end());"
```

**Common database issues:**
- Connection timeout: Check internet and Supabase status
- Authentication failed: Verify password in `DATABASE_URL`
- Too many connections: Use connection pooling (already configured)

### Session Issues

- Verify `SESSION_SECRET` is set
- Check cookie settings (secure flag with HTTPS)
- Verify session store is accessible

## Support and Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Review logs for errors
- Check disk space
- Monitor response times

**Monthly:**
- Update dependencies: `npm update`
- Review and optimize database
- Test backups and recovery

**Quarterly:**
- Security audit: `npm audit`
- Performance review
- Review and update documentation

## Getting Help

For issues or questions:
1. Check logs: `pm2 logs moodmeal`
2. Review this guide
3. Check the main README.md
4. Review test suite for expected behavior

---

**🎉 Congratulations!** Your MoodMeal app is now production-ready!

