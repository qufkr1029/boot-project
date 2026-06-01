package ai.app.boot.benchmark.controller.ui;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Benchmark UI", description = "성능 비교 웹 페이지")
@Controller
@RequiredArgsConstructor
public class BenchmarkUiController {

	@Operation(summary = "HTTP/1.1 vs HTTP/2 비교 테스트 페이지", description = "HTTP 버전 간 성능 비교를 할 수 있는 HTML 페이지를 반환합니다.")
	@GetMapping("/benchmark/http-compare")
	public String httpCompare(Model model) {
		model.addAttribute("appTitle", "HTTP/1.1 vs HTTP/2 Comparison");
		return "benchmark/http-compare";
	}
}
