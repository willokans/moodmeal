# 🌍 Multi-Environment Setup Guide

Complete guide for managing Dev, Staging, and Production environments for MoodMeal.

## 📋 Overview

This guide explains how to:

- Set up separate environments (Dev, Staging, Prod)
- Manage environment-specific configurations
- Deploy to different environments
- Maintain separate databases per environment

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Source Code Repository                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ develop  │  │ staging  │  │   main   │                │
│  │  branch  │  │  branch  │  │  branch  │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Development │  │   Staging   │  │ Production  │
│ Environment │  │ Environment │  │ Environment │
└─────────────┘  └─────────────┘  └─────────────┘
```

## 🔧 Environment Configuration

### Development Environment

**Purpose**: Local development and testing

**Configuration:**

- **Replicas**: 1 pod
- **Resources**: Minimal (100m CPU, 128Mi memory)
- **Auto-scaling**: Disabled
- **Database**: Dev Supabase project
- **URL**: `moodmeal-dev.example.com`

**Values File**: `helm/moodmeal/values-dev.yaml`

```yaml
replicaCount: 1
env:
  NODE_ENV: development
autoscaling:
  enabled: false
```

### Staging Environment

**Purpose**: Pre-production testing and QA

**Configuration:**

- **Replicas**: 2 pods
- **Resources**: Medium (250m CPU, 256Mi memory)
- **Auto-scaling**: Enabled (2-5 pods)
- **Database**: Staging Supabase project
- **URL**: `moodmeal-staging.example.com`

**Values File**: `helm/moodmeal/values-staging.yaml`

```yaml
replicaCount: 2
env:
  NODE_ENV: staging
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
```

### Production Environment

**Purpose**: Live production environment

**Configuration:**

- **Replicas**: 3+ pods
- **Resources**: High (500m CPU, 512Mi memory)
- **Auto-scaling**: Enabled (3-10 pods)
- **Database**: Production Supabase project
- **URL**: `moodmeal.example.com`
- **SSL**: Required (cert-manager)

**Values File**: `helm/moodmeal/values-prod.yaml`

```yaml
replicaCount: 3
env:
  NODE_ENV: production
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
```

## 🗄️ Database Setup Per Environment

### Step 1: Create Supabase Projects

1. **Development Database**

   ```
   Project Name: moodmeal-dev
   Region: Choose closest to your dev cluster
   Database Password: [Generate strong password]
   ```

2. **Staging Database**

   ```
   Project Name: moodmeal-staging
   Region: Choose closest to your staging cluster
   Database Password: [Generate strong password]
   ```

3. **Production Database**
   ```
   Project Name: moodmeal-prod
   Region: Choose closest to your prod cluster
   Database Password: [Generate very strong password]
   ```

### Step 2: Get Connection Strings

For each environment:

1. Go to Supabase Dashboard → Your Project
2. Settings → Database
3. Connection String → Session Pooler
4. Copy the connection string

**Format:**

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres
```

### Step 3: Create Kubernetes Secrets

```bash
# Development
kubectl create secret generic moodmeal-db-secret \
    --from-literal=database-url='YOUR_DEV_CONNECTION_STRING' \
    -n moodmeal-dev

# Staging
kubectl create secret generic moodmeal-db-secret \
    --from-literal=database-url='YOUR_STAGING_CONNECTION_STRING' \
    -n moodmeal-staging

# Production
kubectl create secret generic moodmeal-db-secret \
    --from-literal=database-url='YOUR_PROD_CONNECTION_STRING' \
    -n moodmeal-prod
```

## 🔐 Secrets Management

### Session Secrets

Generate unique session secrets for each environment:

```bash
# Generate secrets
openssl rand -base64 32  # Dev
openssl rand -base64 32  # Staging
openssl rand -base64 32  # Prod
```

Create secrets:

```bash
# Development
kubectl create secret generic moodmeal-secrets \
    --from-literal=session-secret='DEV_SESSION_SECRET' \
    -n moodmeal-dev

# Staging
kubectl create secret generic moodmeal-secrets \
    --from-literal=session-secret='STAGING_SESSION_SECRET' \
    -n moodmeal-staging

# Production
kubectl create secret generic moodmeal-secrets \
    --from-literal=session-secret='PROD_SESSION_SECRET' \
    -n moodmeal-prod
```

## 🚀 Deployment Workflow

### Manual Deployment

#### Deploy to Development

```bash
helm upgrade --install moodmeal-dev helm/moodmeal \
    --namespace moodmeal-dev \
    --create-namespace \
    --values helm/moodmeal/values-dev.yaml \
    --set image.tag=dev-latest
```

#### Deploy to Staging

```bash
helm upgrade --install moodmeal-staging helm/moodmeal \
    --namespace moodmeal-staging \
    --create-namespace \
    --values helm/moodmeal/values-staging.yaml \
    --set image.tag=staging-latest
```

#### Deploy to Production

```bash
helm upgrade --install moodmeal-prod helm/moodmeal \
    --namespace moodmeal-prod \
    --create-namespace \
    --values helm/moodmeal/values-prod.yaml \
    --set image.tag=latest
```

### CI/CD Deployment (Jenkins)

The Jenkins pipeline automatically deploys based on branch:

- **`develop` branch** → Deploys to Dev
- **`staging` branch** → Deploys to Staging
- **`main` branch** → Deploys to Dev, Staging, and prompts for Prod

## 🔄 Environment Promotion

### Promoting from Dev → Staging

```bash
# 1. Merge develop to staging branch
git checkout staging
git merge develop
git push origin staging

# 2. Jenkins will auto-deploy to staging
# Or manually:
helm upgrade --install moodmeal-staging helm/moodmeal \
    --namespace moodmeal-staging \
    --values helm/moodmeal/values-staging.yaml \
    --set image.tag=staging-$(git rev-parse --short HEAD)
```

### Promoting from Staging → Production

```bash
# 1. Merge staging to main branch
git checkout main
git merge staging
git push origin main

# 2. Jenkins will prompt for production deployment
# Or manually (with approval):
helm upgrade --install moodmeal-prod helm/moodmeal \
    --namespace moodmeal-prod \
    --values helm/moodmeal/values-prod.yaml \
    --set image.tag=$(git rev-parse --short HEAD)
```

## 📊 Monitoring Each Environment

### Check Pod Status

```bash
# Development
kubectl get pods -n moodmeal-dev

# Staging
kubectl get pods -n moodmeal-staging

# Production
kubectl get pods -n moodmeal-prod
```

### View Logs

```bash
# Development
kubectl logs -f deployment/moodmeal-dev-moodmeal -n moodmeal-dev

# Staging
kubectl logs -f deployment/moodmeal-staging-moodmeal -n moodmeal-staging

# Production
kubectl logs -f deployment/moodmeal-prod-moodmeal -n moodmeal-prod
```

### Check Resource Usage

```bash
# All environments
kubectl top pods -n moodmeal-dev
kubectl top pods -n moodmeal-staging
kubectl top pods -n moodmeal-prod
```

## 🔍 Environment-Specific Testing

### Development Testing

```bash
# Port forward to access locally
kubectl port-forward svc/moodmeal-dev-moodmeal 3000:80 -n moodmeal-dev

# Access at http://localhost:3000
```

### Staging Testing

```bash
# Access via staging URL
curl https://moodmeal-staging.example.com/api/auth/status
```

### Production Monitoring

```bash
# Check HPA status
kubectl get hpa -n moodmeal-prod

# Check deployment status
kubectl get deployment moodmeal-prod-moodmeal -n moodmeal-prod
```

## 🛠️ Troubleshooting

### Environment-Specific Issues

#### Dev Environment

```bash
# Check if pod is running
kubectl get pods -n moodmeal-dev

# Check logs
kubectl logs -n moodmeal-dev -l app.kubernetes.io/name=moodmeal

# Restart deployment
kubectl rollout restart deployment/moodmeal-dev-moodmeal -n moodmeal-dev
```

#### Staging Environment

```bash
# Verify secrets
kubectl get secret moodmeal-db-secret -n moodmeal-staging -o yaml

# Check service
kubectl get svc -n moodmeal-staging

# Test connectivity
kubectl exec -it <pod-name> -n moodmeal-staging -- curl http://localhost:3000/api/auth/status
```

#### Production Environment

```bash
# Check all resources
kubectl get all -n moodmeal-prod

# Describe deployment
kubectl describe deployment moodmeal-prod-moodmeal -n moodmeal-prod

# Check events
kubectl get events -n moodmeal-prod --sort-by='.lastTimestamp'
```

## 📝 Best Practices

### 1. Environment Isolation

- ✅ Use separate Kubernetes namespaces
- ✅ Use separate Supabase projects
- ✅ Use different session secrets
- ✅ Use different resource limits

### 2. Configuration Management

- ✅ Store secrets in Kubernetes Secrets (not in code)
- ✅ Use Helm values files for environment configs
- ✅ Never commit `.env` files
- ✅ Use different image tags per environment

### 3. Deployment Strategy

- ✅ Always test in Dev first
- ✅ Promote to Staging for QA
- ✅ Require approval for Production
- ✅ Use blue-green or rolling updates
- ✅ Monitor deployments closely

### 4. Database Management

- ✅ Separate databases per environment
- ✅ Regular backups (automated by Supabase)
- ✅ Test migrations in Dev first
- ✅ Document schema changes

## 🎯 Quick Reference

### Environment URLs

- **Dev**: `http://moodmeal-dev.example.com`
- **Staging**: `https://moodmeal-staging.example.com`
- **Production**: `https://moodmeal.example.com`

### Namespace Commands

```bash
# Switch context
kubectl config use-context <cluster-context>

# List all resources in namespace
kubectl get all -n moodmeal-dev

# Delete everything in namespace (careful!)
kubectl delete all --all -n moodmeal-dev
```

### Helm Commands

```bash
# List releases
helm list -n moodmeal-dev

# Get values
helm get values moodmeal-dev -n moodmeal-dev

# Rollback
helm rollback moodmeal-dev -n moodmeal-dev

# Uninstall
helm uninstall moodmeal-dev -n moodmeal-dev
```

---

**🎉 You now have a complete multi-environment setup!** 🚀
