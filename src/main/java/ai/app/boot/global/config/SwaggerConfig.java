package ai.app.boot.global.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

	@Bean
	public OpenAPI openAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Boot Application API")
						.description("Spring Boot 4.0.1 기반 토이 프로젝트 API 명세서입니다.\n\n" +
								"### WebSocket API 정보\n" +
								"- **Endpoint**: `/ws-stomp` (SockJS 지원)\n" +
								"- **Subscribe**: `/topic/aircon/state` (에어컨 상태 변경 수신)\n" +
								"- **Publish**: `/app/aircon/toggle` (에어컨 상태 토글 요청)")
						.version("v0.0.1"));
	}

	@Bean
	public GroupedOpenApi restApi() {
		return GroupedOpenApi.builder()
				.group("1. REST API")
				.pathsToMatch("/api/**")
				.build();
	}

	@Bean
	public GroupedOpenApi uiApi() {
		return GroupedOpenApi.builder()
				.group("2. UI Controllers")
				.pathsToExclude("/api/**")
				.build();
	}
}
