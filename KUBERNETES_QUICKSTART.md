# ⚡ Kubernetes & Helm Quick Start

Quick reference guide for deploying MoodMeal to Kubernetes with Helm.

## 🎯 Prerequisites Checklist

- [ ] GCP project created
- [ ] GKE cluster running
- [ ] `kubectl` configured
- [ ] `helm` installed
- [ ] `gcloud` CLI installed
- [ ] Docker installed
- [ ] Jenkins running (for CI/CD)

## 🚀 5-Minute Quick Deploy

### Step 1: Build and Push Image

```bash
export PROJECT_ID="your-gcp-project-id"
gcloud auth configure-docker
docker build -t gcr.io/${PROJECT_ID}/moodmeal:latest .
docker push gcr.io/${PROJECT_ID}/moodmeal:latest
```

### Step 2: Create Secrets

```bash
# Create namespace
kubectl create namespace moodmeal-dev

# Create database secret
kubectl create secret generic moodmeal-db-secret \
    --from-literal=database-url='YOUR_SUPABASE_CONNECTION_STRING' \
    -n moodmeal-dev

# Create session secret
kubectl create secret generic moodmeal-secrets \
    --from-literal=session-secret='YOUR_SESSION_SECRET' \
    -n moodmeal-dev
```

### Step 3: Update Values File

Edit `helm/moodmeal/values-dev.yaml`:

```yaml
image:
  repository: gcr.io/YOUR_PROJECT_ID/moodmeal
  tag: "latest"
```

### Step 4: Deploy with Helm

```bash
helm upgrade --install moodmeal-dev helm/moodmeal \
    --namespace moodmeal-dev \
    --create-namespace \
    --values helm/moodmeal/values-dev.yaml
```

### Step 5: Verify

```bash
# Check pods
kubectl get pods -n moodmeal-dev

# Check service
kubectl get svc -n moodmeal-dev

# Port forward to test
kubectl port-forward svc/moodmeal-dev-moodmeal 3000:80 -n moodmeal-dev
```

Visit: http://localhost:3000

## 📋 Common Commands

### Helm Commands

```bash
# Install/Upgrade
helm upgrade --install moodmeal-dev helm/moodmeal \
    --namespace moodmeal-dev \
    --values helm/moodmeal/values-dev.yaml

# List releases
helm list -n moodmeal-dev

# Get values
helm get values moodmeal-dev -n moodmeal-dev

# Rollback
helm rollback moodmeal-dev -n moodmeal-dev

# Uninstall
helm uninstall moodmeal-dev -n moodmeal-dev
```

### Kubernetes Commands

```bash
# Get all resources
kubectl get all -n moodmeal-dev

# View logs
kubectl logs -f deployment/moodmeal-dev-moodmeal -n moodmeal-dev

# Describe pod
kubectl describe pod <pod-name> -n moodmeal-dev

# Execute command in pod
kubectl exec -it <pod-name> -n moodmeal-dev -- sh

# Scale deployment
kubectl scale deployment moodmeal-dev-moodmeal --replicas=3 -n moodmeal-dev
```

### Debugging

```bash
# Check pod status
kubectl get pods -n moodmeal-dev

# Check events
kubectl get events -n moodmeal-dev --sort-by='.lastTimestamp'

# Check HPA
kubectl get hpa -n moodmeal-dev

# Check resource usage
kubectl top pods -n moodmeal-dev
```

## 🔄 Deploy to All Environments

```bash
# Development
helm upgrade --install moodmeal-dev helm/moodmeal \
    --namespace moodmeal-dev \
    --values helm/moodmeal/values-dev.yaml

# Staging
helm upgrade --install moodmeal-staging helm/moodmeal \
    --namespace moodmeal-staging \
    --values helm/moodmeal/values-staging.yaml

# Production
helm upgrade --install moodmeal-prod helm/moodmeal \
    --namespace moodmeal-prod \
    --values helm/moodmeal/values-prod.yaml
```

## 🎯 Next Steps

1. **Read Full Guides:**

   - [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) - Complete GCP setup
   - [MULTI_ENV_SETUP.md](./MULTI_ENV_SETUP.md) - Multi-environment guide

2. **Set Up CI/CD:**

   - Configure Jenkins with credentials
   - Connect to your Git repository
   - Run the pipeline

3. **Configure Ingress:**
   - Install NGINX Ingress Controller
   - Set up DNS
   - Configure SSL certificates

---

**Need help?** Check the full documentation in `GCP_DEPLOYMENT.md` and `MULTI_ENV_SETUP.md` 🚀
