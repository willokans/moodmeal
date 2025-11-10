# 📚 Deployment Documentation Index

Complete guide to deploying MoodMeal with Kubernetes, Helm, Jenkins, and GCP.

## 🎯 Quick Navigation

### For Beginners (Start Here!)

1. **[KUBERNETES_QUICKSTART.md](./KUBERNETES_QUICKSTART.md)** ⚡
   - 5-minute quick start guide
   - Essential commands
   - Fast deployment

### Complete Setup Guides

2. **[GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md)** 🚀
   - Complete GCP setup
   - GKE cluster creation
   - Jenkins configuration
   - Step-by-step instructions

3. **[MULTI_ENV_SETUP.md](./MULTI_ENV_SETUP.md)** 🌍
   - Multi-environment configuration
   - Dev, Staging, Prod setup
   - Environment promotion workflow
   - Best practices

### Application Setup

4. **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** 🗄️
   - PostgreSQL/Supabase setup
   - Database configuration
   - Connection troubleshooting

5. **[QUICK_START.md](./QUICK_START.md)** 🏃
   - Local development setup
   - Running the app locally
   - Basic configuration

6. **[DEPLOYMENT.md](./DEPLOYMENT.md)** 📦
   - General deployment options
   - Platform-specific guides
   - Production considerations

## 📁 Project Structure

```
moodmeal/
├── Dockerfile                    # Container image definition
├── Jenkinsfile                   # CI/CD pipeline configuration
├── helm/                         # Helm charts
│   └── moodmeal/
│       ├── Chart.yaml           # Chart metadata
│       ├── values.yaml          # Default values
│       ├── values-dev.yaml      # Development config
│       ├── values-staging.yaml  # Staging config
│       ├── values-prod.yaml    # Production config
│       └── templates/           # Kubernetes manifests
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── ingress.yaml
│           ├── hpa.yaml
│           ├── secret.yaml
│           ├── serviceaccount.yaml
│           └── _helpers.tpl
├── GCP_DEPLOYMENT.md            # GCP setup guide
├── MULTI_ENV_SETUP.md           # Multi-env guide
├── KUBERNETES_QUICKSTART.md     # Quick reference
└── ... (other files)
```

## 🎓 Learning Path

### If You're New to Kubernetes/Helm:

1. **Start with**: [KUBERNETES_QUICKSTART.md](./KUBERNETES_QUICKSTART.md)
2. **Then read**: [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) (sections 1-3)
3. **Practice**: Deploy to dev environment
4. **Learn more**: [MULTI_ENV_SETUP.md](./MULTI_ENV_SETUP.md)

### If You Have Kubernetes Experience:

1. **Quick setup**: [KUBERNETES_QUICKSTART.md](./KUBERNETES_QUICKSTART.md)
2. **Customize**: Edit Helm values files
3. **Deploy**: Follow [MULTI_ENV_SETUP.md](./MULTI_ENV_SETUP.md)

### If You're Setting Up CI/CD:

1. **Read**: [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) (sections 6-7)
2. **Configure**: Jenkinsfile and credentials
3. **Test**: Run pipeline for dev environment

## 🔧 Key Components

### Helm Charts

- **Location**: `helm/moodmeal/`
- **Purpose**: Kubernetes deployment templates
- **Environments**: Dev, Staging, Prod
- **Features**: Auto-scaling, health checks, ingress

### Jenkins Pipeline

- **File**: `Jenkinsfile`
- **Purpose**: Automated CI/CD
- **Stages**: Build → Test → Deploy
- **Environments**: Auto-deploys based on branch

### Docker Image

- **File**: `Dockerfile`
- **Base**: Node.js 18 Alpine
- **Registry**: Google Container Registry (GCR)
- **Security**: Non-root user, health checks

## 🚀 Deployment Workflow

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Jenkins   │
│  Pipeline   │
└──────┬──────┘
       │
       ├──► Build Docker Image
       ├──► Run Tests
       └──► Deploy to K8s
              │
              ├──► Dev (develop branch)
              ├──► Staging (staging branch)
              └──► Prod (main branch, with approval)
```

## 📋 Checklist for Production

- [ ] GCP project created
- [ ] GKE cluster running
- [ ] Supabase databases created (dev, staging, prod)
- [ ] Kubernetes secrets created
- [ ] Helm charts configured
- [ ] Docker image built and pushed
- [ ] Jenkins configured with credentials
- [ ] Ingress controller installed
- [ ] DNS configured
- [ ] SSL certificates configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Documentation reviewed

## 🆘 Getting Help

### Common Issues

1. **Connection Issues**: See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
2. **Deployment Issues**: See [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) troubleshooting
3. **Environment Issues**: See [MULTI_ENV_SETUP.md](./MULTI_ENV_SETUP.md)

### Quick Commands

```bash
# Check deployment status
kubectl get all -n moodmeal-dev

# View logs
kubectl logs -f deployment/moodmeal-dev-moodmeal -n moodmeal-dev

# Check Helm release
helm list -n moodmeal-dev
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [GCP Documentation](https://cloud.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Ready to deploy?** Start with [KUBERNETES_QUICKSTART.md](./KUBERNETES_QUICKSTART.md) 🚀

