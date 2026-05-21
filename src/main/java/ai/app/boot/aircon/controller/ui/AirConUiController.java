package ai.app.boot.aircon.controller.ui;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import ai.app.boot.aircon.service.AirConService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "AirCon UI", description = "에어컨 제어 웹 페이지")
@Controller
@RequiredArgsConstructor
public class AirConUiController {

	private final AirConService airConService;

	@Operation(summary = "에어컨 제어 페이지", description = "에어컨 상태를 확인하고 제어할 수 있는 HTML 페이지를 반환합니다.")
	@GetMapping("/aircon")
	public String airconPage(Model model) {
		model.addAttribute("initialState", airConService.getCurrentState().isOn());
		return "aircon/aircon";
	}
}
