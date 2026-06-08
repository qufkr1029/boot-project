pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application using Docker Compose...'
                    sh 'docker compose down || true'
                    sh 'docker compose up -d --build'
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
