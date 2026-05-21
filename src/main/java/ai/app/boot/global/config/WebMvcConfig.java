package ai.app.boot.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import ai.app.boot.global.logging.RequestHandlerLoggingInterceptor;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	private final RequestHandlerLoggingInterceptor requestHandlerLoggingInterceptor;

	public WebMvcConfig(RequestHandlerLoggingInterceptor requestHandlerLoggingInterceptor) {
		this.requestHandlerLoggingInterceptor = requestHandlerLoggingInterceptor;
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(requestHandlerLoggingInterceptor);
	}

}
