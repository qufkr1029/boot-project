pipeline {
    agent any

    triggers {
        GenericTrigger(
            genericVariables: [
                // GitHub 웹훅 Payload에서 브랜치 정보(ref) 추출
                [key: 'ref', value: '$.ref']
            ],
            // Jenkins Credential ID를 참조하여 보안 토큰 매칭
            tokenCredentialId: 'boot-webhook-token',

            causeString: 'Triggered by GitHub push to $ref',

            // 필터 설정: main 브랜치에 푸시되었을 때만 빌드 실행
            regexpFilterText: '$ref',
            regexpFilterExpression: 'refs/heads/main',

            printContributedVariables: true,
            printPostContent: true
        )
    }

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
                    sh 'docker build -t boot .'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application using Docker Compose...'
                    // 1. 배포 디렉토리 생성
                    sh "mkdir -p ${DEPLOY_DIR}"
                    
                    // 2. 기존에 존재하던 설정 파일로 컨테이너를 먼저 종료
                    sh """
                        cd ${DEPLOY_DIR}
                        docker compose down || true
                    """
                    
                    // 3. 새 설정 파일 복사 (덮어쓰기)
                    sh "cp docker-compose.yml ${DEPLOY_DIR}/"
                    
                    // 4. 새 설정 파일 기준으로 컨테이너 실행
                    sh """
                        cd ${DEPLOY_DIR}
                        docker compose up -d
                    """
                }
            }
        }

        stage('Clean Up') {
            steps {
                script {
                    echo 'Cleaning up unused Docker images (older than 7 days)...'
                    // 7일 이상 지난 dangling 이미지만 삭제 → 최근 빌드 캐시는 유지
                    sh 'docker image prune -f --filter "until=168h"'
                }
            }
        }
    }
}
