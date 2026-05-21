package ai.app.boot.lotto.controller.ui;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import ai.app.boot.lotto.service.LottoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Lotto UI", description = "로또 관련 웹 페이지")
@Controller
@RequiredArgsConstructor
public class LottoUiController {

	private final LottoService lottoService;

	@Operation(summary = "로또 번호 생성 페이지", description = "로또 번호를 생성하고 확인할 수 있는 HTML 페이지를 반환합니다.")
	@GetMapping("/lotto")
	public String lotto(Model model) {
		model.addAttribute("games", lottoService.generateLottoGames().games());
		return "lotto/lotto";
	}

	@Operation(summary = "연금복권 번호 생성 페이지", description = "연금복권 번호를 생성하고 확인할 수 있는 HTML 페이지를 반환합니다.")
	@GetMapping("/pension-lotto")
	public String pensionLotto(Model model) {
		model.addAttribute("games", lottoService.generatePensionLottoGames().games());
		return "lotto/pension-lotto";
	}
}
