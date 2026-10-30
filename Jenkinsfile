pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    // Set these in Jenkins job configuration or replace with Jenkins credentials.
    IMAGE_NAME = 'dockerhubjaysoorya/devops-capstone-nodejs'
    APP_HOST = 'EC2_PUBLIC_IP_OR_DNS'
    APP_USER = 'ubuntu'
    SSH_CREDENTIALS_ID = 'ec2-ssh-key'
    DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install and Test') {
      steps {
        sh 'node --version'
        sh 'npm install'
        sh 'npm test'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER -t $IMAGE_NAME:latest .'
      }
    }

    stage('Push Image') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: "${DOCKERHUB_CREDENTIALS_ID}",
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            set +x
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push "$IMAGE_NAME:$BUILD_NUMBER"
            docker push "$IMAGE_NAME:latest"
            docker logout
          '''
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(credentials: ["${SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu
            case "$APP_HOST" in
              EC2_PUBLIC_IP_OR_DNS) echo "Set APP_HOST in Jenkins before deploying"; exit 1 ;;
            esac
            ssh -o StrictHostKeyChecking=accept-new "$APP_USER@$APP_HOST" \
              "docker pull '$IMAGE_NAME:$BUILD_NUMBER' && \
               docker rm -f devops-capstone-app >/dev/null 2>&1 || true"
            ssh -o StrictHostKeyChecking=accept-new "$APP_USER@$APP_HOST" \
              "docker run -d --restart unless-stopped --name devops-capstone-app \
               -p 3000:3000 '$IMAGE_NAME:$BUILD_NUMBER'"
            ssh -o StrictHostKeyChecking=accept-new "$APP_USER@$APP_HOST" \
              "docker image prune -f"
          '''
        }
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''
          set -eu
          case "$APP_HOST" in
            EC2_PUBLIC_IP_OR_DNS) echo "Set APP_HOST in Jenkins before testing"; exit 1 ;;
          esac
          curl --fail --retry 5 --retry-delay 3 "http://$APP_HOST:3000/health"
        '''
      }
    }
  }

  post {
    always { echo "Pipeline finished: ${currentBuild.currentResult}" }
  }
}
