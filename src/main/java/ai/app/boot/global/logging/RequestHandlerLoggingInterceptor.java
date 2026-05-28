package ai.app.boot.global.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 핸들러가 정해진 뒤 컨트롤러 단순 클래스명을 MDC에 넣고, {@code logging.pattern.console}에 맞춘 요청 시작·완료 로그를 남깁니다.
 */
@Component
public class RequestHandlerLoggingInterceptor implements HandlerInterceptor {

	private static final Logger log = LoggerFactory.getLogger(RequestHandlerLoggingInterceptor.class);

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
		if (handler instanceof HandlerMethod hm) {
			MDC.put(RequestLoggingFilter.MDC_CONTROLLER, hm.getBeanType().getSimpleName());
			log.info("요청 처리 시작");
		}
		return true;
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
			Exception ex) {
		if (handler instanceof HandlerMethod) {
			log.info("요청 처리 완료 status={}", response.getStatus());
			MDC.remove(RequestLoggingFilter.MDC_CONTROLLER);
		}
	}
}
