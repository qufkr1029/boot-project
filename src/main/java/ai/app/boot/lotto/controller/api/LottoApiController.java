package ai.app.boot.lotto.controller.api;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ai.app.boot.lotto.dto.LottoResponse;
import ai.app.boot.lotto.dto.PensionLottoResponse;
import ai.app.boot.lotto.service.LottoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Lotto API", description = "로또 번호 생성 관련 API")
@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class LottoApiController {

	private final LottoService lottoService;

	@Operation(summary = "로또 번호 생성", description = "6개 숫자로 구성된 로또 게임 번호를 생성합니다.")
	@GetMapping("/lotto")
	public ResponseEntity<LottoResponse> generateLotto() {
		return ResponseEntity.ok(lottoService.generateLottoGames());
	}

	@Operation(summary = "연금복권 번호 생성", description = "조, 십만, 만, 천, 백, 십, 일 자리를 포함한 연금복권 번호를 생성합니다.")
	@GetMapping("/pension-lotto")
	public ResponseEntity<PensionLottoResponse> generatePensionLotto() {
		return ResponseEntity.ok(lottoService.generatePensionLottoGames());
	}
}
