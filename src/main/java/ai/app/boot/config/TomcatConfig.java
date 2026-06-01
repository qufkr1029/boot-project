package ai.app.boot.config;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {

	@Bean
	public WebServerFactoryCustomizer<TomcatServletWebServerFactory> additionalConnectorCustomizer() {
		return factory -> {
			Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
			connector.setScheme("http");
			connector.setPort(8888);        // 추가할 HTTP 전용 포트
			connector.setSecure(false);

			factory.addAdditionalConnectors(connector);
		};
	}
}
