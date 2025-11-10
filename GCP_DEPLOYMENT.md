# 🚀 GCP Deployment Guide - MoodMeal with Kubernetes & Jenkins

Complete guide to deploy MoodMeal to Google Cloud Platform with multiple environments (Dev, Staging, Prod) using Kubernetes (GKE) and Jenkins CI/CD.

## 📋 Prerequisites

- Google Cloud Platform account
- GCP project created
- Jenkins instance running on GCP
- Basic knowledge of Kubernetes and Docker
- kubectl and gcloud CLI installed locally

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Jenkins (CI/CD)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Build → Test → Build Image → Deploy to K8s       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Google Kubernetes Engine (GKE)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Dev    │  │ Staging  │  │   Prod   │             │
│  │ Namespace│  │Namespace │  │Namespace │             │
│  │  (1 pod) │  │ (2 pods) │  │ (3+ pods)│             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL (Cloud)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Dev    │  │ Staging  │  │   Prod   │             │
│  │ Database │  │ Database │  │ Database │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Step 1: GCP Project Setup

### 1.1 Create GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"

# Create project (or use existing)
gcloud projects create $PROJECT_ID --name="MoodMeal"

# Set as default project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
    container.googleapis.com \
    containerregistry.googleapis.com \
    compute.googleapis.com \
    cloudbuild.googleapis.com
```

### 1.2 Create Service Account for Jenkins

```bash
# Create service account
gcloud iam service-accounts create jenkins-sa \
    --display-name="Jenkins Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:jenkins-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/container.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:jenkins-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create jenkins-sa-key.json \
    --iam-account=jenkins-sa@${PROJECT_ID}.iam.gserviceaccount.com
```

## ☸️ Step 2: Create GKE Clusters

### 2.1 Create GKE Cluster

```bash
# Set cluster variables
export CLUSTER_NAME="moodmeal-cluster"
export ZONE="us-central1-a"  # Change to your preferred zone
export NODE_COUNT=3
export MACHINE_TYPE="e2-medium"

# Create cluster
gcloud container clusters create $CLUSTER_NAME \
    --zone=$ZONE \
    --num-nodes=$NODE_COUNT \
    --machine-type=$MACHINE_TYPE \
    --enable-autoscaling \
    --min-nodes=2 \
    --max-nodes=10 \
    --enable-autorepair \
    --enable-autoupgrade \
    --addons=HorizontalPodAutoscaling,HttpLoadBalancing

# Get credentials
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE
```

### 2.2 Create Namespaces for Environments

```bash
kubectl create namespace moodmeal-dev
kubectl create namespace moodmeal-staging
kubectl create namespace moodmeal-prod

# Label namespaces
kubectl label namespace moodmeal-dev environment=dev
kubectl label namespace moodmeal-staging environment=staging
kubectl label namespace moodmeal-prod environment=prod
```

## 🗄️ Step 3: Setup Supabase Databases

### 3.1 Create Separate Supabase Projects

1. **Development Database:**
   - Go to https://supabase.com/dashboard
   - Create new project: `moodmeal-dev`
   - Get connection string (Session Pooler)
   - Save as: `DB_URL_DEV`

2. **Staging Database:**
   - Create new project: `moodmeal-staging`
   - Get connection string (Session Pooler)
   - Save as: `DB_URL_STAGING`

3. **Production Database:**
   - Create new project: `moodmeal-prod`
   - Get connection string (Session Pooler)
   - Save as: `DB_URL_PROD`

### 3.2 Generate Session Secrets

```bash
# Generate secrets for each environment
openssl rand -base64 32  # Dev secret
openssl rand -base64 32  # Staging secret
openssl rand -base64 32  # Prod secret
```

## 🔐 Step 4: Create Kubernetes Secrets

### 4.1 Create Secrets for Each Environment

```bash
# Development
kubectl create secret generic moodmeal-db-secret \
    --from-literal=database-url='YOUR_DEV_DB_URL' \
    -n moodmeal-dev

kubectl create secret generic moodmeal-secrets \
    --from-literal=session-secret='YOUR_DEV_SESSION_SECRET' \
    -n moodmeal-dev

# Staging
kubectl create secret generic moodmeal-db-secret \
    --from-literal=database-url='YOUR_STAGING_DB_URL' \
    -n moodmeal-staging

kubectl create secret generic moodmeal-secrets \
    --from-literal=session-secret='YOUR_STAGING_SESSION_SECRET' \
    -n moodmeal-staging

# Production
kubectl create secret generic moodmeal-db-secret \
    --from-literal=database-url='YOUR_PROD_DB_URL' \
    -n moodmeal-prod

kubectl create secret generic moodmeal-secrets \
    --from-literal=session-secret='YOUR_PROD_SESSION_SECRET' \
    -n moodmeal-prod
```

## 🐳 Step 5: Build and Push Docker Image

### 5.1 Configure Docker for GCR

```bash
# Authenticate Docker
gcloud auth configure-docker

# Build image
docker build -t gcr.io/${PROJECT_ID}/moodmeal:latest .

# Push to Google Container Registry
docker push gcr.io/${PROJECT_ID}/moodmeal:latest
```

## 🔧 Step 6: Configure Jenkins

### 6.1 Install Required Jenkins Plugins

In Jenkins dashboard, go to **Manage Jenkins** → **Manage Plugins** and install:

- Kubernetes CLI Plugin
- Docker Pipeline Plugin
- Google Container Registry Auth Plugin
- Credentials Binding Plugin

### 6.2 Add Credentials in Jenkins

Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials** and add:

1. **GCP Project ID** (Secret text)
   - ID: `gcp-project-id`
   - Secret: Your GCP project ID

2. **GCP Service Account Key** (Secret file)
   - ID: `gcp-service-account-key`
   - File: Upload `jenkins-sa-key.json`

3. **Kubernetes Contexts** (Secret text)
   - ID: `k8s-dev-context`
   - Secret: `gke_PROJECT_ID_ZONE_CLUSTER_NAME`
   - ID: `k8s-staging-context`
   - ID: `k8s-prod-context`

4. **Database URLs** (Secret text)
   - ID: `supabase-db-url-dev`
   - ID: `supabase-db-url-staging`
   - ID: `supabase-db-url-prod`

5. **Session Secrets** (Secret text)
   - ID: `session-secret-dev`
   - ID: `session-secret-staging`
   - ID: `session-secret-prod`

### 6.3 Create Jenkins Pipeline Job

1. **New Item** → **Pipeline**
2. Name: `moodmeal-pipeline`
3. **Pipeline Definition**: Pipeline script from SCM
4. **SCM**: Git
5. **Repository URL**: Your Git repository URL
6. **Script Path**: `Jenkinsfile`
7. **Save**

## 📦 Step 7: Deploy with Helm

### 7.1 Install Helm

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Add Helm repo (if needed)
helm repo add stable https://charts.helm.sh/stable
helm repo update
```

### 7.2 Update Values Files

Edit `helm/moodmeal/values-dev.yaml`, `values-staging.yaml`, and `values-prod.yaml`:

```yaml
# Replace PROJECT_ID with your actual GCP project ID
image:
  repository: gcr.io/YOUR_PROJECT_ID/moodmeal
```

### 7.3 Deploy to Development

```bash
helm upgrade --install moodmeal-dev helm/moodmeal \
    --namespace moodmeal-dev \
    --create-namespace \
    --values helm/moodmeal/values-dev.yaml \
    --set image.tag=dev-latest
```

### 7.4 Verify Deployment

```bash
# Check pods
kubectl get pods -n moodmeal-dev

# Check services
kubectl get svc -n moodmeal-dev

# Check logs
kubectl logs -f deployment/moodmeal-dev-moodmeal -n moodmeal-dev
```

## 🌐 Step 8: Setup Ingress (Optional)

### 8.1 Install NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace
```

### 8.2 Get External IP

```bash
kubectl get service ingress-nginx-controller -n ingress-nginx
```

Update your DNS to point to this IP.

## 🔄 Step 9: CI/CD Pipeline Workflow

### Branch Strategy

- **`develop`** → Auto-deploys to **Dev**
- **`staging`** → Auto-deploys to **Staging**
- **`main`** → Auto-deploys to **Dev**, **Staging**, and prompts for **Prod**

### Manual Deployment

```bash
# Deploy to dev
helm upgrade --install moodmeal-dev helm/moodmeal \
    --namespace moodmeal-dev \
    --values helm/moodmeal/values-dev.yaml

# Deploy to staging
helm upgrade --install moodmeal-staging helm/moodmeal \
    --namespace moodmeal-staging \
    --values helm/moodmeal/values-staging.yaml

# Deploy to production
helm upgrade --install moodmeal-prod helm/moodmeal \
    --namespace moodmeal-prod \
    --values helm/moodmeal/values-prod.yaml
```

## 📊 Monitoring & Scaling

### Check HPA Status

```bash
kubectl get hpa -n moodmeal-prod
```

### Scale Manually

```bash
kubectl scale deployment moodmeal-prod-moodmeal --replicas=5 -n moodmeal-prod
```

### View Metrics

```bash
kubectl top pods -n moodmeal-prod
kubectl top nodes
```

## 🛠️ Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n moodmeal-dev

# Check logs
kubectl logs <pod-name> -n moodmeal-dev
```

### Database Connection Issues

```bash
# Verify secrets
kubectl get secret moodmeal-db-secret -n moodmeal-dev -o yaml

# Test connection from pod
kubectl exec -it <pod-name> -n moodmeal-dev -- node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Image Pull Errors

```bash
# Verify image exists
gcloud container images list --repository=gcr.io/${PROJECT_ID}

# Check permissions
gcloud projects get-iam-policy ${PROJECT_ID}
```

## 💰 Cost Optimization

- Use **preemptible nodes** for dev/staging
- Set **resource limits** appropriately
- Use **node autoscaling** to scale down during off-hours
- Consider **Cloud SQL** instead of Supabase for production (if needed)

## 📚 Next Steps

1. ✅ Set up monitoring with Prometheus/Grafana
2. ✅ Configure log aggregation (Stackdriver/ELK)
3. ✅ Set up backup strategy for databases
4. ✅ Configure SSL certificates (cert-manager)
5. ✅ Set up alerting

---

**🎉 Congratulations!** Your MoodMeal app is now deployed on GCP with full CI/CD! 🚀

