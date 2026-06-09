pipeline {
    agent any

    environment {
        DEPLOY_DIR = '/home/ubuntu/docker/projects/boot'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Image') {
            steps {
                script {
                    echo 'Building Docker Image...'
                    sh 'docker build -t boot-was:latest .'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application using Docker Compose...'
                    // docker-compose.yml 복사
                    sh "cp docker-compose.yml ${DEPLOY_DIR}/"
                    
                    // 지정 배포 디렉토리로 이동하여 컨테이너 제어
                    sh """
                        cd ${DEPLOY_DIR}
                        docker compose down || true
                        docker compose up -d
                    """
                }
            }
        }

        stage('Clean Up') {
            steps {
                script {
                    echo 'Cleaning up unused Docker images...'
                    sh 'docker image prune -f'
                }
            }
        }
    }
}
