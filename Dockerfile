# Stage 1: Build the application
FROM gradle:jdk25 AS build
WORKDIR /home/gradle/project

# 소스 파일 복사 및 Gradle 빌드 (테스트 생략으로 속도 최적화)
COPY --chown=gradle:gradle . .
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:25-jre
WORKDIR /app

# 빌드 산출물 jar만 런타임 이미지로 복사
COPY --from=build /home/gradle/project/build/libs/boot-0.0.1-SNAPSHOT.jar app.jar

# 컨테이너 외부로 8080 포트 통로 노출
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
