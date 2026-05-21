package ai.app.boot.global.logging;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 요청마다 MDC(requestId·HTTP 메서드·URI)를 맞추고, 동일 값을 {@value #HEADER_REQUEST_ID} 응답 헤더로 돌려 줍니다.
 * 요청 시작·완료 요약 로그는 핸들러가 정해진 뒤에만 의미가 있으므로 {@link RequestHandlerLoggingInterceptor}에서 남깁니다.
 */
@Component
@Order(1)
public class RequestLoggingFilter extends OncePerRequestFilter {

	public static final String HEADER_REQUEST_ID = "X-Request-Id";

	public static final String MDC_REQUEST_ID = "requestId";
	public static final String MDC_REQUEST_METHOD = "requestMethod";
	public static final String MDC_REQUEST_URI = "requestUri";
	public static final String MDC_CONTROLLER = "controller";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String requestId = resolveRequestId(request);
		MDC.put(MDC_REQUEST_ID, requestId);
		MDC.put(MDC_REQUEST_METHOD, request.getMethod());
		MDC.put(MDC_REQUEST_URI, request.getRequestURI());
		response.setHeader(HEADER_REQUEST_ID, requestId);
		try {
			filterChain.doFilter(request, response);
		}
		finally {
			MDC.clear();
		}
	}

	private static String resolveRequestId(HttpServletRequest request) {
		return Optional.ofNullable(request.getHeader(HEADER_REQUEST_ID))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.orElseGet(() -> UUID.randomUUID().toString());
	}

}
