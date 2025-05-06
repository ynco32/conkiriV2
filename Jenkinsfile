pipeline {  // 파이프라인 정의 시작
    agent any  // Jenkins 에이전트에서 어떤 노드에서든 실행 가능
    
    environment {  // 파이프라인에서 사용할 환경 변수 정의
        DOCKER_COMPOSE = 'docker compose'  // docker-compose 명령어를 환경 변수로 설정
        BRANCH_NAME = 'master'
    }
    
    stages {  // 파이프라인의 주요 단계들 정의
        stage('Debug') {  // 현재 브랜치 디버깅용 스테이지
            steps {
                script {
                    echo "Current Branch: ${env.BRANCH_NAME}"
                }
            }
        }
        
        stage('Checkout') {  // 첫 번째 단계: 코드 체크아웃
            steps {
                checkout scm  // 소스 코드 관리(SCM)에서 현재 브랜치의 코드 체크아웃
                script {
                    echo "Checked out Branch: ${env.BRANCH_NAME}"
                }
            }
        }
        
        stage('Build') {  // 두 번째 단계: 빌드
            failFast true  // 하나라도 실패하면 전체 중단
            parallel {  // 병렬로 Backend와 Frontend 작업 수행
                stage('Backend') {  // Backend 처리 단계
                    when {  // 조건 설정
                        anyOf {  // 아래 브랜치에서만 실행
                            expression { env.BRANCH_NAME == 'dev' }
                            expression { env.BRANCH_NAME == 'master' }
                        }
                    }
                    steps {  // Backend 빌드 및 테스트 수행
                        dir('backend') {  // backend 디렉토리로 이동
                            sh 'chmod +x gradlew'  // 실행 권한 부여
                            sh './gradlew clean build -x test'  // Gradle로 클린 빌드
                        }
                    }
                }

                stage('Frontend') {  // Frontend 처리 단계
                    when {  // 조건 설정
                        anyOf {  // 아래 브랜치에서만 실행
                            expression { env.BRANCH_NAME == 'dev' }
                            expression { env.BRANCH_NAME == 'master' }
                        }
                    }
                    steps {  // Frontend 빌드 및 테스트 수행
                        agent {
                            docker {
                                image 'node:18'       // Node 20.x 공식 이미지 (npm 내장)
                                args  '-u root'          // 필요하다면 root 권한으로
                            }
                        }
                        dir('frontend') {  // frontend 디렉토리로 이동
                            sh 'npm install'  // 필요한 패키지 설치
                            sh 'npm run build'  // 빌드 실행
                        }
                    }
                }
            }
        }

        stage('Docker Build and Deploy') {  // Docker 빌드 및 배포 단계
            when {  // 조건 설정
                anyOf {  // 아래 브랜치에서만 실행
                    expression { env.BRANCH_NAME == 'dev' }
                    expression { env.BRANCH_NAME == 'master' }
                }
            }
            steps {
                script {
                    sh '''
                        mkdir -p certbot/conf
                        mkdir -p certbot/www
                    '''
                    withCredentials([
                        string(credentialsId: 'DB_URL', variable: 'DB_URL'),
                        string(credentialsId: 'DB_USERNAME', variable: 'DB_USERNAME'),
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'KAKAO_CLIENT_ID', variable: 'KAKAO_CLIENT_ID'),
                        string(credentialsId: 'KAKAO_CLIENT_SECRET', variable: 'KAKAO_CLIENT_SECRET'),
                        string(credentialsId: 'KAKAO_REDIRECT_URL', variable: 'KAKAO_REDIRECT_URL'),
                        string(credentialsId: 'JWT_SECRET_KEY', variable: 'JWT_SECRET_KEY'),
                        string(credentialsId: 'MYSQL_USER', variable: 'MYSQL_USER'),
                        string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASSWORD'),
                        string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASSWORD'),
                        string(credentialsId: 'SERVER_DOMAIN', variable: 'SERVER_DOMAIN'),
                        string(credentialsId: 'FRONTEND_URL', variable: 'FRONTEND_URL'),
                        string(credentialsId: 'NEXT_PUBLIC_KAKAO_MAP_API_KEY', variable: 'NEXT_PUBLIC_KAKAO_MAP_API_KEY'),
                        string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY'),
                        string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_KEY'),
                        string(credentialsId: 'AWS_REGION', variable: 'AWS_REGION'),
                        string(credentialsId: 'S3_BUCKET', variable: 'S3_BUCKET'),
                        string(credentialsId: 'REDIS_HOST', variable: 'REDIS_HOST'),
                        string(credentialsId: 'NEXT_PUBLIC_SKT_API_KEY', variable: 'NEXT_PUBLIC_SKT_API_KEY'),
                        string(credentialsId: 'NEXT_PUBLIC_SKT_API_URL', variable: 'NEXT_PUBLIC_SKT_API_URL')
                    ]) {
                        sh '''
                            docker compose -f docker-compose-legacy.yml down
                            docker compose -f docker-compose-legacy.yml build \
                                --build-arg KAKAO_CLIENT_ID=$KAKAO_CLIENT_ID \
                                --build-arg KAKAO_CLIENT_SECRET=$KAKAO_CLIENT_SECRET \
                                --build-arg JWT_SECRET_KEY=$JWT_SECRET_KEY \
                                --build-arg DB_URL=$DB_URL \
                                --build-arg DB_USERNAME=$DB_USERNAME \
                                --build-arg DB_PASSWORD=$DB_PASSWORD \
                                --build-arg MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
                                --build-arg MYSQL_USER=$MYSQL_USER \
                                --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
                                --build-arg SERVER_DOMAIN=$SERVER_DOMAIN \
                                --build-arg FRONTEND_URL=$FRONTEND_URL \
                                --build-arg KAKAO_REDIRECT_URL=$KAKAO_REDIRECT_URL \
                                --build-arg NEXT_PUBLIC_KAKAO_MAP_API_KEY=$NEXT_PUBLIC_KAKAO_MAP_API_KEY \
                                --build-arg AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
                                --build-arg AWS_SECRET_KEY=$AWS_SECRET_KEY \
                                --build-arg AWS_REGION=$AWS_REGION \
                                --build-arg S3_BUCKET=$S3_BUCKET \
                                --build-arg REDIS_HOST=$REDIS_HOST \
                                --build-arg NEXT_PUBLIC_SKT_API_KEY=$NEXT_PUBLIC_SKT_API_KEY \
                                --build-arg NEXT_PUBLIC_SKT_API_URL=$NEXT_PUBLIC_SKT_API_URL
                            docker compose -f docker-compose-legacy.yml up -d
                        '''
                    }
                }
            }
        }
    }
    
    post {  // 파이프라인 종료 후 처리
        success {  // 파이프라인 성공 시 메시지 출력
            echo 'Pipeline succeeded!'
        }
        failure {  // 파이프라인 실패 시 메시지 출력
            echo 'Pipeline failed!'
            sh "${DOCKER_COMPOSE} -f docker-compose-legacy.yml down"
            sh "${DOCKER_COMPOSE} -f docker-compose-legacy.yml logs > pipeline_failure.log"  // 실패 시 로그 저장  
        }
    }
}
