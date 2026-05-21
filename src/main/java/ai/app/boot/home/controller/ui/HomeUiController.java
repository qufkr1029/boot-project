package ai.app.boot.home.controller.ui;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import ai.app.boot.aircon.service.AirConService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 루트 {@code /} 는 Thymeleaf 뷰 {@code intro} ({@code templates/intro.html}) 로 렌더링합니다.
 */
@Tag(name = "Home UI", description = "홈/인트로 웹 페이지")
@Controller
@RequiredArgsConstructor
public class HomeUiController {

	private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd-E-HH:mm", Locale.KOREAN);
	private final AirConService airConService;

	@Operation(summary = "인트로 페이지", description = "애플리케이션의 시작 페이지(HTML)를 반환합니다.")
	@GetMapping("/")
	public String intro(Model model) {
		model.addAttribute("appTitle", "Introduction");
		model.addAttribute("requestTime", FORMAT.format(OffsetDateTime.now()));
		model.addAttribute("initialState", airConService.getCurrentState().isOn());
		return "home/intro";
	}

	@Operation(summary = "PDF 뷰어 테스트 페이지", description = "PDF 뷰어 테스트(HTML) 페이지를 반환합니다.")
	@GetMapping("/pdf-viewer")
	public String pdfViewer(Model model) {
		model.addAttribute("appTitle", "PDF Viewer Test");
		return "home/pdf-viewer";
	}
}
