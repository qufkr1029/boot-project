package ai.app.boot.config;

import java.util.concurrent.Executors;

import org.apache.catalina.connector.Connector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {

	@Value("${spring.threads.virtual.enabled:false}")
	private boolean virtualThreadsEnabled;

	@Bean
	public WebServerFactoryCustomizer<TomcatServletWebServerFactory> additionalConnectorCustomizer() {
		return factory -> {
			Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
			connector.setScheme("http");
			connector.setPort(8888);        // 추가할 HTTP 전용 포트
			connector.setSecure(false);

			if (virtualThreadsEnabled) {
				connector.getProtocolHandler().setExecutor(Executors.newVirtualThreadPerTaskExecutor());
			}

			factory.addAdditionalConnectors(connector);
		};
	}
}
