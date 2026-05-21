package ai.app.boot.lotto.service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;

import ai.app.boot.lotto.dto.LottoResponse;
import ai.app.boot.lotto.dto.PensionLottoResponse;

@Service
public class LottoService {

	private final SecureRandom random = new SecureRandom();

	/**
	 * 로또 6/45 예상 번호 5게임을 생성합니다.
	 */
	public LottoResponse generateLottoGames() {
		List<Integer> numbers = IntStream.rangeClosed(1, 45).boxed().toList();
		List<List<Integer>> games = new ArrayList<>();

		for (int i = 0; i < 5; i++) {
			List<Integer> shuffleList = new ArrayList<>(numbers);
			Collections.shuffle(shuffleList, random);
			List<Integer> lotto = shuffleList.stream()
					.limit(6)
					.sorted()
					.toList();
			games.add(lotto);
		}
		return new LottoResponse(games);
	}

	/**
	 * 연금복권 720+ 예상 번호 5게임을 생성합니다.
	 */
	public PensionLottoResponse generatePensionLottoGames() {
		List<String> games = new ArrayList<>();

		for (int i = 0; i < 5; i++) {
			int group = random.nextInt(5) + 1;
			String numbers = IntStream.range(0, 6)
					.mapToObj(j -> String.valueOf(random.nextInt(10)))
					.collect(Collectors.joining(""));
			games.add(group + "조 " + numbers);
		}
		return new PensionLottoResponse(games);
	}
}
