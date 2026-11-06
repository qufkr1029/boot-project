# Stage 1: 애플리케이션 빌드
FROM gradle:9.8-jdk25-alpine AS build
WORKDIR /home/gradle/project

# [레이어 1] 의존성 설정 파일만 복사
# 이 파일들이 바뀌지 않으면 아래 의존성 다운로드 레이어는 캐시에서 재사용됨
COPY --chown=gradle:gradle build.gradle settings.gradle gradle.properties ./

# [레이어 2] 의존성 미리 다운로드
# 소스 코드와 무관하므로 소스만 수정한 빌드에서는 캐시 사용
# org.gradle.java.home 줄은 로컬 PC 경로를 가리키므로 컨테이너에서 제거
# 의존성 해석 실패가 빌드를 막지 않도록 || true 사용
RUN sed -i '/org.gradle.java.home/d' gradle.properties \
 && gradle dependencies --no-daemon > /dev/null 2>&1 || true

# [레이어 3] 소스 코드 복사
# 소스가 바뀔 때마다 이 레이어부터 다시 실행됨
COPY --chown=gradle:gradle src ./src

# [레이어 4] 애플리케이션 빌드 (테스트 제외)
# 소스 변경 시 컴파일과 jar 패키징만 수행
RUN gradle bootJar -x test --no-daemon

# Stage 2: 실행 환경
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# 빌드 산출물 jar만 복사 (Gradle, JDK 등 빌드 도구는 최종 이미지에서 제외됨)
COPY --from=build /home/gradle/project/build/libs/boot-0.0.1-SNAPSHOT.jar app.jar

# 컨테이너가 사용하는 포트 문서화 (실제 포트 공개는 docker-compose.yml의 ports에서 설정)
EXPOSE 8080

# 컨테이너 시작 시 실행할 명령
ENTRYPOINT ["java", "-jar", "app.jar"]