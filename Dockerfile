# ===== Stage 1: 애플리케이션 빌드 (최종 이미지에는 포함되지 않음) =====

# Step 1: 빌드 환경 이미지 (JDK 25 + Gradle 9.8, Alpine)
FROM gradle:9.8-jdk25-alpine AS build

# Step 2: 작업 디렉터리 지정 (이후 명령의 기준 경로)
WORKDIR /home/gradle/project

# Step 3 [레이어 1]: 의존성 설정 파일만 복사
# 이 파일들이 바뀌지 않으면 Step 4 결과를 캐시에서 재사용함
COPY --chown=gradle:gradle build.gradle settings.gradle gradle.properties ./

# Step 4 [레이어 2]: 의존성 미리 다운로드
# 소스와 무관하므로 소스만 수정한 빌드에서는 캐시 사용
# org.gradle.java.home 줄은 로컬 PC 경로라 컨테이너에서 제거
# 의존성 해석 실패가 빌드를 막지 않도록 || true 사용
RUN sed -i '/org.gradle.java.home/d' gradle.properties \
 && gradle dependencies --no-daemon > /dev/null 2>&1 || true

# Step 5 [레이어 3]: 소스 코드 복사
# 소스가 바뀌면 이 단계부터 다시 실행됨
COPY --chown=gradle:gradle src ./src

# Step 6 [레이어 4]: 애플리케이션 빌드 (테스트 제외)
# 컴파일과 jar 패키징만 수행
RUN gradle bootJar -x test --no-daemon

# ===== Stage 2: 실행 환경 (최종 이미지) =====

# Step 7: 실행 이미지 (JRE 25, Alpine)
FROM eclipse-temurin:25-jre-alpine

# Step 8: 작업 디렉터리 지정
WORKDIR /app

# Step 9: 빌드 산출물 jar만 복사 (Gradle, JDK 등 빌드 도구는 제외됨)
COPY --from=build /home/gradle/project/build/libs/boot-0.0.1-SNAPSHOT.jar app.jar

# Step 10: 포트 문서화 (실제 공개는 docker-compose.yml의 ports에서 설정)
EXPOSE 8080

# Step 11: 컨테이너 시작 시 실행할 명령
ENTRYPOINT ["java", "-jar", "app.jar"]