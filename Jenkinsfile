pipeline {
    agent any
    
    environment {
        // GCP Configuration
        GCP_PROJECT_ID = credentials('gcp-project-id')
        GCP_SA_KEY = credentials('gcp-service-account-key')
        GCR_REGISTRY = "gcr.io/${GCP_PROJECT_ID}"
        IMAGE_NAME = "moodmeal"
        
        // Kubernetes Configuration
        K8S_DEV_CONTEXT = credentials('k8s-dev-context')
        K8S_STAGING_CONTEXT = credentials('k8s-staging-context')
        K8S_PROD_CONTEXT = credentials('k8s-prod-context')
        
        // Supabase Database URLs (from credentials)
        DB_URL_DEV = credentials('supabase-db-url-dev')
        DB_URL_STAGING = credentials('supabase-db-url-staging')
        DB_URL_PROD = credentials('supabase-db-url-prod')
        
        // Session Secrets
        SESSION_SECRET_DEV = credentials('session-secret-dev')
        SESSION_SECRET_STAGING = credentials('session-secret-staging')
        SESSION_SECRET_PROD = credentials('session-secret-prod')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git rev-parse --short HEAD > .git/commit-id'
                script {
                    env.GIT_COMMIT_SHORT = readFile('.git/commit-id').trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                    publishCoverage adapters: [coberturaAdapter('coverage/cobertura-coverage.xml')]
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Authenticate with GCP
                    sh '''
                        echo "${GCP_SA_KEY}" | base64 -d > /tmp/gcp-key.json
                        gcloud auth activate-service-account --key-file=/tmp/gcp-key.json
                        gcloud config set project ${GCP_PROJECT_ID}
                        gcloud auth configure-docker
                    '''
                    
                    // Build and tag image
                    def imageTag = "${GCR_REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}-${GIT_COMMIT_SHORT}"
                    def imageTagLatest = "${GCR_REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}-latest"
                    
                    sh """
                        docker build -t ${imageTag} -t ${imageTagLatest} .
                        docker push ${imageTag}
                        docker push ${imageTagLatest}
                    """
                    
                    env.IMAGE_TAG = imageTag
                }
            }
        }
        
        stage('Deploy to Dev') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'dev'
                    branch 'main'
                }
            }
            steps {
                script {
                    sh """
                        # Configure kubectl for dev
                        kubectl config use-context ${K8S_DEV_CONTEXT}
                        
                        # Create/update secrets
                        kubectl create secret generic moodmeal-db-secret \\
                            --from-literal=database-url='${DB_URL_DEV}' \\
                            --dry-run=client -o yaml | kubectl apply -f -
                        
                        kubectl create secret generic moodmeal-secrets \\
                            --from-literal=session-secret='${SESSION_SECRET_DEV}' \\
                            --dry-run=client -o yaml | kubectl apply -f -
                        
                        # Update image tag in values
                        sed -i 's|tag:.*|tag: "${env.BRANCH_NAME}-${GIT_COMMIT_SHORT}"|' helm/moodmeal/values-dev.yaml
                        
                        # Deploy with Helm
                        helm upgrade --install moodmeal-dev helm/moodmeal \\
                            --namespace moodmeal-dev \\
                            --create-namespace \\
                            --values helm/moodmeal/values-dev.yaml \\
                            --set image.tag="${env.BRANCH_NAME}-${GIT_COMMIT_SHORT}"
                        
                        # Wait for rollout
                        kubectl rollout status deployment/moodmeal-dev-moodmeal -n moodmeal-dev
                    """
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'staging'
                    branch 'main'
                }
            }
            steps {
                script {
                    sh """
                        # Configure kubectl for staging
                        kubectl config use-context ${K8S_STAGING_CONTEXT}
                        
                        # Create/update secrets
                        kubectl create secret generic moodmeal-db-secret \\
                            --from-literal=database-url='${DB_URL_STAGING}' \\
                            --dry-run=client -o yaml | kubectl apply -f -
                        
                        kubectl create secret generic moodmeal-secrets \\
                            --from-literal=session-secret='${SESSION_SECRET_STAGING}' \\
                            --dry-run=client -o yaml | kubectl apply -f -
                        
                        # Deploy with Helm
                        helm upgrade --install moodmeal-staging helm/moodmeal \\
                            --namespace moodmeal-staging \\
                            --create-namespace \\
                            --values helm/moodmeal/values-staging.yaml \\
                            --set image.tag="${env.BRANCH_NAME}-${GIT_COMMIT_SHORT}"
                        
                        # Wait for rollout
                        kubectl rollout status deployment/moodmeal-staging-moodmeal -n moodmeal-staging
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    
                    sh """
                        # Configure kubectl for production
                        kubectl config use-context ${K8S_PROD_CONTEXT}
                        
                        # Create/update secrets
                        kubectl create secret generic moodmeal-db-secret \\
                            --from-literal=database-url='${DB_URL_PROD}' \\
                            --dry-run=client -o yaml | kubectl apply -f -
                        
                        kubectl create secret generic moodmeal-secrets \\
                            --from-literal=session-secret='${SESSION_SECRET_PROD}' \\
                            --dry-run=client -o yaml | kubectl apply -f -
                        
                        # Deploy with Helm
                        helm upgrade --install moodmeal-prod helm/moodmeal \\
                            --namespace moodmeal-prod \\
                            --create-namespace \\
                            --values helm/moodmeal/values-prod.yaml \\
                            --set image.tag="${env.BRANCH_NAME}-${GIT_COMMIT_SHORT}"
                        
                        # Wait for rollout
                        kubectl rollout status deployment/moodmeal-prod-moodmeal -n moodmeal-prod
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            sh 'rm -f /tmp/gcp-key.json'
            cleanWs()
        }
    }
}

