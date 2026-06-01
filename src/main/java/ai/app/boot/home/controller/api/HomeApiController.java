package ai.app.boot.home.controller.api;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Home API", description = "기본 인사를 위한 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HomeApiController {

	@Operation(summary = "인사 메시지", description = "안녕하세요 메시지를 반환합니다.")
	@GetMapping(value = "/hello", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, String>> hello() {
		return ResponseEntity.ok(Map.of("message", "안녕하세요"));
	}

	@Operation(summary = "작별 메시지", description = "안녕히 가세요 메시지를 반환합니다.")
	@GetMapping(value = "/bye", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, String>> bye() {
		return ResponseEntity.ok(Map.of("message", "안녕히 가세요"));
	}

	@Operation(summary = "스레드 정보", description = "현재 스레드 정보를 반환합니다.")
	@GetMapping("/thread-info")
	public String getThreadInfo() {
		Thread currentThread = Thread.currentThread();
		// 가상 스레드인 경우 true, 일반 플랫폼 스레드인 경우 false 반환
		boolean isVirtual = currentThread.isVirtual(); 
		
		return String.format("Thread Name: %s, Is Virtual: %b", currentThread.toString(), isVirtual);
	}
}

