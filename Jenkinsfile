pipeline {  // 파이프라인 정의 시작

    agent any
    
    environment {  // 파이프라인에서 사용할 환경 변수 정의
        BRANCH_NAME = "${env.BRANCH_NAME ?: "dev"}"
        DEPLOY_ENV = "${env.DEPLOY_ENV}"
        NGINX_CONF_PATH = '/home/ubuntu/nginx/conf.d'
        NGINX_HTML_PATH = '/home/ubuntu/nginx/html'
        DOCKER_COMPOSE_PATH = '/home/ubuntu'
        BACKEND_CONTAINER_NAME = "backend-${env.BRANCH_NAME}"
        FRONTEND_CONTAINER_NAME = "frontend-${env.BRANCH_NAME}"
        BACKEND_NEW_CONTAINER_NAME = "backend-${env.BRANCH_NAME}-new"
        FRONTEND_NEW_CONTAINER_NAME = "frontend-${env.BRANCH_NAME}-new"
    }
    
    stages {  // 파이프라인의 주요 단계들 정의

        stage('Debug') {  // 현재 브랜치 디버깅용 스테이지
            steps {
                sh 'whoami'
                sh 'id'
                script {
                    echo "Current Branch: ${BRANCH_NAME}"
                    // Git 저장소 권한 설정
                    sh 'git config --global --add safe.directory /var/jenkins_home/workspace/dev'
                }
            }
        }
        
        stage('Checkout') {  // 첫 번째 단계: 코드 체크아웃
            steps {
                checkout scm  // 소스 코드 관리(SCM)에서 현재 브랜치의 코드 체크아웃
                script {
                    echo "Checked out Branch: ${BRANCH_NAME}"
                }
            }
        }

        stage('Check Changes') {
            steps {
                script {
                    try {
                        // Git 저장소 초기화 확인
                        sh 'git config --global --add safe.directory /var/jenkins_home/workspace/dev'
                        
                        // 현재 커밋 해시 가져오기
                        def currentCommit = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                        
                        // 이전 커밋이 있는지 확인
                        def hasPreviousCommit = sh(script: 'git rev-parse HEAD^ 2>/dev/null || echo "no_previous"', returnStdout: true).trim()
                        
                        if (hasPreviousCommit == 'no_previous') {
                            // 초기 커밋인 경우
                            env.FRONTEND_CHANGES = 'true'
                            env.BACKEND_CHANGES = 'true'
                        } else {
                            // 변경된 파일 목록 가져오기
                            def changedFiles = sh(script: 'git diff --name-only HEAD^ HEAD', returnStdout: true).trim().split('\n')
                            
                            // 정확한 경로 매칭을 위한 정규식 패턴
                            def frontendPattern = ~/^frontend\//
                            def backendPattern = ~/^backend\//
                            
                            // 변경 여부 확인
                            env.FRONTEND_CHANGES = changedFiles.any { it =~ frontendPattern } ? 'true' : 'false'
                            env.BACKEND_CHANGES = changedFiles.any { it =~ backendPattern } ? 'true' : 'false'
                        }
                        
                        echo "Frontend 변경 여부: ${FRONTEND_CHANGES}"
                        echo "Backend 변경 여부: ${BACKEND_CHANGES}"
                    } catch (Exception e) {
                        echo "변경 사항 확인 중 오류 발생: ${e.getMessage()}"
                        // 오류 발생 시 안전하게 모든 변경사항이 있다고 가정
                        env.FRONTEND_CHANGES = 'true'
                        env.BACKEND_CHANGES = 'true'
                    }
                }
            }
        }
        
        stage('Build') {  // 빌드 단계
            failFast true  // 하나라도 실패하면 전체 중단
            parallel {
                stage('Frontend Build') {
                    when {
                        expression { env.FRONTEND_CHANGES == 'true' }
                    }
                    agent {
                        docker {
                        image 'node:20.18'       // Node 20.x 공식 이미지 (npm 내장)
                        args  '-u root'          // 필요하다면 root 권한으로
                        }
                    }
                    steps {
                        script {
                            try {
                                dir('frontend') {
                                    def credentialsList = []
                                    
                                    credentialsList.addAll([
                                        string(credentialsId: 'NEXT_PUBLIC_KAKAO_MAP_API_KEY', variable: 'NEXT_PUBLIC_KAKAO_MAP_API_KEY'),
                                        string(credentialsId: 'NEXT_PUBLIC_SKT_API_KEY', variable: 'NEXT_PUBLIC_SKT_API_KEY'),
                                        string(credentialsId: 'NEXT_PUBLIC_SKT_API_URL', variable: 'NEXT_PUBLIC_SKT_API_URL'),
                                        string(credentialsId: 'NEXT_PUBLIC_FIREBASE_API_KEY', variable: 'NEXT_PUBLIC_FIREBASE_API_KEY'),
                                        string(credentialsId: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', variable: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
                                        string(credentialsId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', variable: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
                                        string(credentialsId: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', variable: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
                                        string(credentialsId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', variable: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
                                        string(credentialsId: 'NEXT_PUBLIC_FIREBASE_APP_ID', variable: 'NEXT_PUBLIC_FIREBASE_APP_ID'),
                                        string(credentialsId: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY', variable: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY')
                                    ])

                                    if (env.BRANCH_NAME == 'dev') {
                                        credentialsList.addAll([
                                            string(credentialsId: 'DEV_API_URL', variable: 'NEXT_PUBLIC_API_URL')
                                        ])
                                    } else if (env.BRANCH_NAME == 'master') {
                                        credentialsList.addAll([
                                            string(credentialsId: 'MASTER_API_URL', variable: 'NEXT_PUBLIC_API_URL')
                                        ])
                                    }

                                    withCredentials(credentialsList) {
                                        sh '''
                                            export NEXT_PUBLIC_KAKAO_MAP_API_KEY=$NEXT_PUBLIC_KAKAO_MAP_API_KEY
                                            export NEXT_PUBLIC_SKT_API_KEY=$NEXT_PUBLIC_SKT_API_KEY
                                            export NEXT_PUBLIC_SKT_API_URL=$NEXT_PUBLIC_SKT_API_URL
                                            export NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
                                            export NEXT_PUBLIC_FIREBASE_API_KEY
                                            export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
                                            export NEXT_PUBLIC_FIREBASE_PROJECT_ID
                                            export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
                                            export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
                                            export NEXT_PUBLIC_FIREBASE_APP_ID
                                            export NEXT_PUBLIC_FIREBASE_VAPID_KEY

                                            yarn install
                                            yarn build
                                        '''
                                    }
                                }
                            } catch (Exception e) {
                                env.FAILURE_STAGE = "프론트엔드 빌드"
                                env.FAILURE_MESSAGE = e.getMessage()
                                throw e
                            }
                        }
                    }
                }

                stage('Backend Build') {
                    when {
                        expression { env.BACKEND_CHANGES == 'true' }
                    }
                    steps {
                        script {
                            try {
                                dir('backend') {
                                    sh 'chmod +x gradlew'
                                    sh './gradlew clean build -x test'
                                    sh 'ls -la build/libs/ || echo "빌드 실패"'
                                }
                            } catch (Exception e) {
                                env.FAILURE_STAGE = "백엔드 빌드"
                                env.FAILURE_MESSAGE = e.getMessage()
                                throw e
                            }
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            failFast true
            parallel {
                stage('SonarQube Analysis - Backend') {
                    when {
                        allOf {
                            expression { return env.BACKEND_CHANGES == 'true' }
                            expression { return env.BRANCH_NAME == 'dev' }
                        }
                    }
                    steps {
                        script {
                            try {
                                withSonarQubeEnv('sonarqube') {
                                    dir('backend') {
                                        sh """
                                            ./gradlew sonar \\
                                            -Dsonar.projectKey=Conkiri-backend \\
                                            -Dsonar.java.binaries=build/classes/java/main \\
                                            -Dsonar.java.source=17 \\
                                            -Dsonar.sourceEncoding=UTF-8 \\
                                            -Dsonar.exclusions=**/resources/**
                                        """
                                    }
                                }
                            } catch (Exception e) {
                                echo "SonarQube Backend 분석 중 오류가 발생했습니다: ${e.getMessage()}"
                            }
                        }
                    }
                }

                stage('SonarQube Analysis - Frontend') {
                    when {
                        allOf {
                            expression { return env.FRONTEND_CHANGES == 'true' }
                            expression { return env.BRANCH_NAME == 'dev' }
                        }
                    }
                    agent {
                        docker {
                        image 'node:20.18'       // Node 20.x 공식 이미지 (npm 내장)
                        args  '-u root'          // 필요하다면 root 권한으로
                        }
                    }
                    steps {
                        script {
                            try {
                                def scannerHome = tool 'sonarqube'
                                withSonarQubeEnv('sonarqube') {
                                    dir('frontend') {
                                        sh """
                                        ${scannerHome}/bin/sonar-scanner \\
                                        -Dsonar.projectKey=Conkiri-frontend \\
                                        -Dsonar.sources=src \\
                                        -Dsonar.sourceEncoding=UTF-8 \\
                                        -Dsonar.typescript.tsconfigPath=sonar-tsconfig.json \\
                                        -Dsonar.exclusions=node_modules/** \\
                                        -Dsonar.issues.assign.issuesCreator=true
                                        """
                                    }
                                }
                            } catch (Exception e) {
                                echo "SonarQube Frontend 분석 중 오류가 발생했습니다: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }

        stage('Docker Build and Deploy') {
            steps {
                script {
                    try {
                        // 기존 컨테이너 정리
                        // sh """
                        //     # 기존 컨테이너 중지 및 삭제
                        //     docker stop backend-dev-new frontend-dev-new || true
                        //     docker rm backend-dev-new frontend-dev-new || true
                        // """
                        
                        def credentialsList = []
                        
                        // 기본 credentials
                        credentialsList.addAll([
                            string(credentialsId: 'DB_USERNAME', variable: 'DB_USERNAME'),
                            string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                            string(credentialsId: 'KAKAO_CLIENT_ID', variable: 'KAKAO_CLIENT_ID'),
                            string(credentialsId: 'KAKAO_CLIENT_SECRET', variable: 'KAKAO_CLIENT_SECRET'),
                            string(credentialsId: 'JWT_SECRET_KEY', variable: 'JWT_SECRET_KEY'),
                            string(credentialsId: 'MYSQL_USER', variable: 'MYSQL_USER'),
                            string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASSWORD'),
                            string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASSWORD'),
                            string(credentialsId: 'NEXT_PUBLIC_KAKAO_MAP_API_KEY', variable: 'NEXT_PUBLIC_KAKAO_MAP_API_KEY'),
                            string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY'),
                            string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_KEY'),
                            string(credentialsId: 'AWS_REGION', variable: 'AWS_REGION'),
                            string(credentialsId: 'S3_BUCKET', variable: 'S3_BUCKET'),
                            string(credentialsId: 'NEXT_PUBLIC_SKT_API_KEY', variable: 'NEXT_PUBLIC_SKT_API_KEY'),
                            string(credentialsId: 'NEXT_PUBLIC_SKT_API_URL', variable: 'NEXT_PUBLIC_SKT_API_URL'),
                            string(credentialsId: 'RABBITMQ_USERNAME', variable: 'RABBITMQ_USERNAME'),
                            string(credentialsId: 'RABBITMQ_PASSWORD', variable: 'RABBITMQ_PASSWORD'),
                            string(credentialsId: 'FIREBASE_PROJECT_ID', variable: 'FIREBASE_PROJECT_ID'),
                            string(credentialsId: 'FIREBASE_CLIENT_EMAIL', variable: 'FIREBASE_CLIENT_EMAIL'),
                            string(credentialsId: 'FIREBASE_PRIVATE_KEY', variable: 'FIREBASE_PRIVATE_KEY'),
                            string(credentialsId: 'FIREBASE_CLIENT_ID', variable: 'FIREBASE_CLIENT_ID'),
                            string(credentialsId: 'FIREBASE_PRIVATE_KEY_ID', variable: 'FIREBASE_PRIVATE_KEY_ID'),
                            string(credentialsId: 'OPENAI_API_KEY', variable: 'OPENAI_API_KEY'),
                            string(credentialsId: 'NEXT_PUBLIC_FIREBASE_API_KEY', variable: 'NEXT_PUBLIC_FIREBASE_API_KEY'),
                            string(credentialsId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', variable: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
                            string(credentialsId: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', variable: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
                            string(credentialsId: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', variable: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
                            string(credentialsId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', variable: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
                            string(credentialsId: 'NEXT_PUBLIC_FIREBASE_APP_ID', variable: 'NEXT_PUBLIC_FIREBASE_APP_ID'),
                            string(credentialsId: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY', variable: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY'),
                            string(credentialsId: 'PINECONE_API_KEY', variable: 'PINECONE_API_KEY'),
                            string(credentialsId: 'PINECONE_ENVIRONMENT', variable: 'PINECONE_ENVIRONMENT')
                        ])
                        
                        // 브랜치별 추가 credentials
                        if (env.BRANCH_NAME == 'dev') {
                            credentialsList.addAll([
                                string(credentialsId: 'DEV_DB_URL', variable: 'DB_URL'),
                                string(credentialsId: 'DEV_REDIS_HOST', variable: 'REDIS_HOST'),
                                string(credentialsId: 'DEV_FRONTEND_URL', variable: 'FRONTEND_URL'),
                                string(credentialsId: 'DEV_API_URL', variable: 'NEXT_PUBLIC_API_URL'),
                                string(credentialsId: 'DEV_KAKAO_REDIRECT_URL', variable: 'KAKAO_REDIRECT_URI'),
                                string(credentialsId: 'DEV_CHATBOT_PYTHON_URL', variable: 'CHATBOT_PYTHON_URL')
                            ])
                        } else if (env.BRANCH_NAME == 'master') {
                            credentialsList.addAll([
                                string(credentialsId: 'MASTER_DB_URL', variable: 'DB_URL'),
                                string(credentialsId: 'MASTER_REDIS_HOST', variable: 'REDIS_HOST'),
                                string(credentialsId: 'MASTER_FRONTEND_URL', variable: 'FRONTEND_URL'),
                                string(credentialsId: 'MASTER_API_URL', variable: 'NEXT_PUBLIC_API_URL'),
                                string(credentialsId: 'MASTER_KAKAO_REDIRECT_URL', variable: 'KAKAO_REDIRECT_URI'),
                                string(credentialsId: 'MASTER_CHATBOT_PYTHON_URL', variable: 'CHATBOT_PYTHON_URL')
                            ])
                        }
                        
                        withCredentials(credentialsList) {
                            // 현재 실행 중인 컨테이너 이름 저장
                            env.OLD_BACKEND_CONTAINER_NAME = sh(script: "docker ps --filter 'name=${env.BACKEND_CONTAINER_NAME}' --format '{{.Names}}'", returnStdout: true).trim()
                            env.OLD_FRONTEND_CONTAINER_NAME = sh(script: "docker ps --filter 'name=${env.FRONTEND_CONTAINER_NAME}' --format '{{.Names}}'", returnStdout: true).trim()
                            
                            sh '''
                                # Docker 빌드 및 새 버전 컨테이너 시작
                                docker compose -f docker-compose-${BRANCH_NAME}.yml build \
                                    --build-arg KAKAO_CLIENT_ID=$KAKAO_CLIENT_ID \
                                    --build-arg KAKAO_CLIENT_SECRET=$KAKAO_CLIENT_SECRET \
                                    --build-arg JWT_SECRET_KEY=$JWT_SECRET_KEY \
                                    --build-arg DB_URL=$DB_URL \
                                    --build-arg DB_USERNAME=$DB_USERNAME \
                                    --build-arg DB_PASSWORD=$DB_PASSWORD \
                                    --build-arg MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
                                    --build-arg MYSQL_USER=$MYSQL_USER \
                                    --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
                                    --build-arg FRONTEND_URL=$FRONTEND_URL \
                                    --build-arg KAKAO_REDIRECT_URI=$KAKAO_REDIRECT_URI \
                                    --build-arg NEXT_PUBLIC_KAKAO_MAP_API_KEY=$NEXT_PUBLIC_KAKAO_MAP_API_KEY \
                                    --build-arg AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
                                    --build-arg AWS_SECRET_KEY=$AWS_SECRET_KEY \
                                    --build-arg AWS_REGION=$AWS_REGION \
                                    --build-arg S3_BUCKET=$S3_BUCKET \
                                    --build-arg REDIS_HOST=$REDIS_HOST \
                                    --build-arg NEXT_PUBLIC_SKT_API_KEY=$NEXT_PUBLIC_SKT_API_KEY \
                                    --build-arg NEXT_PUBLIC_SKT_API_URL=$NEXT_PUBLIC_SKT_API_URL \
                                    --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
                                    --build-arg RABBITMQ_USERNAME=$RABBITMQ_USERNAME \
                                    --build-arg RABBITMQ_PASSWORD=$RABBITMQ_PASSWORD \
                                    --build-arg FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
                                    --build-arg FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL \
                                    --build-arg FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY \
                                    --build-arg FIREBASE_CLIENT_ID=$FIREBASE_CLIENT_ID \
                                    --build-arg FIREBASE_PRIVATE_KEY_ID=$FIREBASE_PRIVATE_KEY_ID \
                                    --build-arg OPENAI_API_KEY=$OPENAI_API_KEY \
                                    --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
                                    --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
                                    --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
                                    --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
                                    --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
                                    --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
                                    --build-arg NEXT_PUBLIC_FIREBASE_VAPID_KEY=$NEXT_PUBLIC_FIREBASE_VAPID_KEY \
                                    --build-arg CHATBOT_PYTHON_URL=$CHATBOT_PYTHON_URL \
                                    --build-arg PINECONE_API_KEY=$PINECONE_API_KEY \
                                    --build-arg PINECONE_ENVIRONMENT=$PINECONE_ENVIRONMENT

                                docker compose -f docker-compose-${BRANCH_NAME}.yml up -d
                            '''
                                
                            // sh """
                            //     # 초기 트래픽 설정 (90:10)
                            //     # Nginx 설정 파일 백업
                            //     cp ${NGINX_CONF_PATH}/${BRANCH_NAME}.conf ${NGINX_CONF_PATH}/${BRANCH_NAME}.conf.backup
                                
                            //     # 트래픽 설정 적용
                            //     sed -i "/upstream ${BACKEND_CONTAINER_NAME}/,/}/ s/weight=[0-9]*/weight=90/" ${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf
                            //     sed -i "/upstream ${BACKEND_NEW_CONTAINER_NAME}/,/}/ s/weight=[0-9]*/weight=10/" ${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf
                                
                            //     # Nginx 설정 테스트
                            //     docker exec nginx nginx -t
                                
                            //     # Nginx 재시작
                            //     docker exec nginx nginx -s reload
                            // """
                        }

                        // // 타임아웃 설정과 함께 카나리 배포 수행
                        // timeout(time: 1, unit: 'HOURS') {
                        //     def trafficPercentages = [10, 30, 50, 80, 100]
                        //     for (percentage in trafficPercentages) {
                        //         echo "트래픽 ${percentage}%로 증가 중..."
                                
                        //         // 트래픽 조정
                        //         sh """
                        //             #!/bin/bash
                        //             if [ ${percentage} -eq 100 ]; then
                        //                 # 기존 컨테이너 server 라인 주석 처리
                        //                 sed -i "/upstream ${BACKEND_CONTAINER_NAME}/,/}/ s/^\\(\\s*server.*\\)/#\\1/" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                        //                 # 새 컨테이너 weight=100으로 변경
                        //                 # 먼저 server 라인이 있는지 확인
                        //                 if grep -q "server.*${BACKEND_NEW_CONTAINER_NAME}" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf; then
                        //                     sed -i "/upstream ${BACKEND_NEW_CONTAINER_NAME}/,/}/ s/weight=[0-9]*/weight=100/" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                        //                 else
                        //                     # server 라인이 없으면 추가
                        //                     sed -i "/upstream ${BACKEND_NEW_CONTAINER_NAME}/a\\    server ${BACKEND_NEW_CONTAINER_NAME}:8085 weight=100;" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                        //                 fi
                        //             else
                        //                 # POSIX 호환 방식으로 계산
                        //                 old_weight=`expr 100 - ${percentage}`
                        //                 new_weight=${percentage}
                        //                 if [ \$old_weight -le 0 ]; then old_weight=1; fi
                        //                 if [ \$new_weight -le 0 ]; then new_weight=1; fi
                                        
                        //                 # 기존 컨테이너 weight 수정, server 라인이 없으면 추가
                        //                 if grep -q "server.*${BACKEND_CONTAINER_NAME}" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf; then
                        //                     sed -i "/upstream ${BACKEND_CONTAINER_NAME}/,/}/ s/weight=[0-9]*/weight=\${old_weight}/" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                        //                 else
                        //                     sed -i "/upstream ${BACKEND_CONTAINER_NAME}/a\\    server ${BACKEND_CONTAINER_NAME}:8085 weight=\${old_weight};" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                        //                 fi
                                        
                        //                 # 새 컨테이너 weight 수정, server 라인이 없으면 추가
                        //                 if grep -q "server.*${BACKEND_NEW_CONTAINER_NAME}" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf; then
                        //                     sed -i "/upstream ${BACKEND_NEW_CONTAINER_NAME}/,/}/ s/weight=[0-9]*/weight=\${new_weight}/" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                        //                 else
                        //                     sed -i "/upstream ${BACKEND_NEW_CONTAINER_NAME}/a\\    server ${BACKEND_NEW_CONTAINER_NAME}:8085 weight=\${new_weight};" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                        //                 fi
                        //             fi
                                    
                        //             # 설정 확인
                        //             echo "Nginx 설정 변경 후:"
                        //             grep -A 3 "upstream" \${env.NGINX_CONF_PATH}/\${BRANCH_NAME}.conf
                                    
                        //             # Nginx 설정 테스트 및 재시작
                        //             docker exec nginx nginx -t
                        //             docker exec nginx nginx -s reload
                        //         """
                                
                        //         // 10초 대기
                        //         sleep 10

                        //         // 백엔드 메트릭 체크
                        //         def backendMetrics = checkBackendMetrics()
                        //         echo "현재 백엔드 메트릭 - 에러율: ${backendMetrics.errorRate}, 응답시간: ${backendMetrics.responseTime}"
                                
                        //         // 프론트엔드 메트릭 체크
                        //         def frontendMetrics = checkFrontendMetrics()
                        //         echo "현재 프론트엔드 메트릭 - 에러율: ${frontendMetrics.errorRate}, 응답시간: ${frontendMetrics.responseTime}"
                                
                        //         if (!backendMetrics.isHealthy || !frontendMetrics.isHealthy) {
                        //             echo "메트릭 이상 감지. 롤백을 시작합니다."
                        //             rollbackDeployment()
                        //             error "트래픽 전환 과정 중 문제 발생. 롤백 수행"
                        //         }

                        //         // 100% 전환 완료 시 이전 버전 정리
                        //         if (percentage == 100) {
                        //             cleanupOldVersions()
                        //         }
                        //     }
                        // }
                    } catch (Exception e) {
                        env.FAILURE_STAGE = "Docker 빌드 및 배포"
                        env.FAILURE_MESSAGE = e.getMessage()
                        throw e
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "환경 : ${env.DEPLOY_ENV} 배포 성공!"
            sh "docker ps | grep backend"

            script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                def changes = ""

                if (env.FRONTEND_CHANGES == 'true') {
                    changes += "Frontend"
                }
                if (env.BACKEND_CHANGES == 'true') {
                    if (changes) {
                        changes += ", Backend"
                    } else {
                        changes += "Backend"
                    }
                }
                if (!changes) {
                    changes = "설정 변경"
                }

                mattermostSend(
                        color: 'good',
                        message: "✅ 배포 성공: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n" +
                                "👤 작성자: ${Author_ID} (${Author_Name})\n" +
                                "🔄 변경사항: ${changes}\n" +
                                "🌐 환경: ${env.DEPLOY_ENV}\n" +
                                "🔍 <${env.BUILD_URL}|상세 정보 보기>",
                        endpoint: 'https://meeting.ssafy.com/hooks/x3y97jyiepfujyib9gh8fukgcw',
                        channel: '9fujkh75xfy57joc3tsof6eryc'
                )
            }
        }

        failure {
            echo "환경 : ${env.DEPLOY_ENV} 배포 실패!"
            echo "실패 원인을 확인합니다."
            sh "docker ps -a | grep backend || echo '백엔드 컨테이너가 없습니다'"

            script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()

                // 실패 단계와 메시지 확인
                def failStage = env.FAILURE_STAGE ?: "알 수 없음"
                def failMessage = env.FAILURE_MESSAGE ?: "자세한 로그를 확인해주세요"

                mattermostSend(
                        color: 'danger',
                        message: "❌ 배포 실패: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n" +
                                "👤 작성자: ${Author_ID} (${Author_Name})\n" +
                                "⚠️ 실패 단계: ${failStage}\n" +
                                "📝 실패 내용: ${failMessage}\n" +
                                "🌐 환경: ${env.DEPLOY_ENV}\n" +
                                "🔍 <${env.BUILD_URL}|상세 정보 보기>",
                        endpoint: 'https://meeting.ssafy.com/hooks/x3y97jyiepfujyib9gh8fukgcw',
                        channel: '9fujkh75xfy57joc3tsof6eryc'
                )
            }
        }

        always {
            echo "빌드 및 배포 과정이 종료되었습니다."
        }
    }

}

// 메트릭 체크 함수
def checkBackendMetrics() {
    def metrics = [
        isHealthy: true,
        errorRate: 0,
        responseTime: 0
    ]
    
    try {
        // 에러율 체크
        def response = sh(script: "curl -s -w '%{http_code}' http://localhost:8085/api/actuator/health", returnStdout: true).trim()
        def statusCode = response.tokenize('\n').last()
        metrics.errorRate = (statusCode == '200') ? 0 : 1
        
        // 응답시간 체크
        def responseTime = sh(script: "curl -s -w '%{time_total}' -o /dev/null http://localhost:8085/api/actuator/health", returnStdout: true).trim()
        metrics.responseTime = responseTime.toFloat()
        
        // 지표 검증
        if (metrics.errorRate > 0 || metrics.responseTime > 1000) {
            metrics.isHealthy = false
        }
    } catch (Exception e) {
        echo "백엔드 메트릭 체크 중 오류 발생: ${e.getMessage()}"
        metrics.isHealthy = false
    }
    
    return metrics
}

// 롤백 함수 통합
def rollbackDeployment() {
    sh """
        # 트래픽을 이전 버전으로 완전히 되돌림
        sed -i 's/weight=[0-9]*/weight=100/g' ${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf
        sed -i 's/weight=[0-9]*/weight=0/g' ${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf
        docker exec nginx nginx -s reload
        
        # 새 버전 컨테이너 중지 및 삭제
        docker stop ${env.BACKEND_NEW_CONTAINER_NAME} ${env.FRONTEND_NEW_CONTAINER_NAME} || true
        docker rm ${env.BACKEND_NEW_CONTAINER_NAME} ${env.FRONTEND_NEW_CONTAINER_NAME} || true
        
        # 백업된 nginx 설정 파일 삭제
        if [ -f "${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf.backup" ]; then
            rm "${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf.backup"
        fi
    """
}

// 배포 성공 후 정리 함수 통합
def cleanupOldVersions() {
    sh """
        # 이전 버전 컨테이너 중지 및 삭제
        if [ ! -z "${env.BACKEND_CONTAINER_NAME}" ]; then
            docker stop ${env.BACKEND_CONTAINER_NAME} || true
            docker rm ${env.BACKEND_CONTAINER_NAME} || true
        fi
        if [ ! -z "${env.FRONTEND_CONTAINER_NAME}" ]; then
            docker stop ${env.FRONTEND_CONTAINER_NAME} || true
            docker rm ${env.FRONTEND_CONTAINER_NAME} || true
        fi
        
        # 새 버전 컨테이너 이름 변경
        docker rename ${env.BACKEND_NEW_CONTAINER_NAME} ${env.BACKEND_CONTAINER_NAME}
        docker rename ${env.FRONTEND_NEW_CONTAINER_NAME} ${env.FRONTEND_CONTAINER_NAME}
        
        # 컨테이너 중지
        docker stop ${env.BACKEND_CONTAINER_NAME} ${env.FRONTEND_CONTAINER_NAME}
        
        # 새로운 포트 매핑으로 컨테이너 재시작
        docker run -d --name ${env.BACKEND_CONTAINER_NAME} \
            -p 8085:8085 \
            --network app-network \
            ${env.BACKEND_CONTAINER_NAME}
            
        docker run -d --name ${env.FRONTEND_CONTAINER_NAME} \
            -p 3002:3000 \
            --network app-network \
            ${env.FRONTEND_CONTAINER_NAME}
            
        # 백업된 nginx 설정 파일 삭제
        if [ -f "${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf.backup" ]; then
            rm "${env.NGINX_CONF_PATH}/${BRANCH_NAME}.conf.backup"
        fi
    """
}

// 프론트엔드 메트릭 체크 함수
def checkFrontendMetrics() {
    def metrics = [
        isHealthy: true,
        errorRate: 0,
        responseTime: 0
    ]
    
    try {
        // 에러율 체크
        def response = sh(script: "curl -s -w '%{http_code}' http://localhost:3002/api/health", returnStdout: true).trim()
        def statusCode = response.tokenize('\n').last()
        metrics.errorRate = (statusCode == '200') ? 0 : 1
        
        // 응답시간 체크
        def responseTime = sh(script: "curl -s -w '%{time_total}' -o /dev/null http://localhost:3002/api/health", returnStdout: true).trim()
        metrics.responseTime = responseTime.toFloat()
        
        // 지표 검증
        if (metrics.errorRate > 0 || metrics.responseTime > 1000) {
            metrics.isHealthy = false
        }
    } catch (Exception e) {
        echo "프론트엔드 메트릭 체크 중 오류 발생: ${e.getMessage()}"
        metrics.isHealthy = false
    }
    
    return metrics
}
