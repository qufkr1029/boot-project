package ai.app.boot.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		// 클라이언트가 메시지를 받을 때 사용하는 경로의 접두사
		config.enableSimpleBroker("/topic");
		// 클라이언트가 서버로 메시지를 보낼 때 사용하는 경로의 접두사
		config.setApplicationDestinationPrefixes("/app");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		// 웹소켓 연결 엔드포인트 설정
		registry.addEndpoint("/ws-aircon")
				.setAllowedOriginPatterns("*")
				.withSockJS(); // 낮은 버전 브라우저 지원용
	}
}
