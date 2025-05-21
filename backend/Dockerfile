# 빌드 스테이지
FROM gradle:7.6.1-jdk17 AS build

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 설정 파일 복사
COPY build.gradle settings.gradle /app/

# 소스 코드 복사
COPY src /app/src

# 테스트 제외하고 빌드
RUN gradle build -x test

# 실행 스테이지
FROM openjdk:17-slim

# 보안을 위한 비 root 사용자 생성
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

# 빌드된 jar 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 사용자 전환
USER appuser

# 포트 설정
EXPOSE 8080

# 컨테이너 환경에 최적화된 JVM 옵션과 함께 실행 명령어 설정
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app.jar"]