package ai.app.boot.lotto.service;

import static org.assertj.core.api.Assertions.assertThat;

import module java.base;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import ai.app.boot.lotto.dto.LottoResponse;
import ai.app.boot.lotto.dto.PensionLottoResponse;

class LottoServiceTest {

	private final LottoService lottoService = new LottoService();

	@Test
	@DisplayName("로또 5게임 예상 번호 생성 검증")
	void generateLottoGamesTest() {
		// when (실행)
		LottoResponse response = lottoService.generateLottoGames();

		// then (검증)
		// 1. 결과가 null이 아님을 검증
		assertThat(response).isNotNull();
		assertThat(response.games()).isNotNull();

		// 2. 정확히 5게임이 생성되었는지 검증
		assertThat(response.games()).hasSize(5);

		for (List<Integer> game : response.games()) {
			// 3. 각 게임당 번호가 6개인지 검증
			assertThat(game).hasSize(6);

			// 4. 각 번호가 1~45 범위 내에 있는지 검증
			for (int num : game) {
				assertThat(num).isBetween(1, 45);
			}

			// 5. 중복이 없는지 검증 (Set에 담았을 때 개수가 6개여야 함)
			assertThat(new HashSet<>(game)).hasSize(6);

			// 6. 오름차순으로 정렬되어 있는지 검증 (앞에 위치한 번호가 뒤에 위치한 번호보다 항상 작아야 함)
			for (int i = 0; i < game.size() - 1; i++) {
				assertThat(game.get(i)).isLessThan(game.get(i + 1));
			}
		}
	}

	@Test
	@DisplayName("연금복권 5게임 예상 번호 생성 검증")
	void generatePensionLottoGamesTest() {
		// when (실행)
		PensionLottoResponse response = lottoService.generatePensionLottoGames();

		// then (검증)
		// 1. 결과가 null이 아님을 검증
		assertThat(response).isNotNull();
		assertThat(response.games()).isNotNull();

		// 2. 정확히 5게임이 생성되었는지 검증
		assertThat(response.games()).hasSize(5);

		for (String game : response.games()) {
			// 3. 각 게임 번호가 "X조 XXXXXX" 형식에 맞는지 검증 (조는 1~5, 뒤는 6자리 숫자)
			assertThat(game).matches("^[1-5]조 \\d{6}$");
		}
	}
}
