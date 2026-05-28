package ai.app.boot.lotto.dto;

import java.util.List;

/**
 * 로또 6/45 예상 번호 응답 DTO
 */
public record LottoResponse(
    List<List<Integer>> games
) {}
