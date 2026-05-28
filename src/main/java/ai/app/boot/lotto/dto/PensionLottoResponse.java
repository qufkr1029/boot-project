package ai.app.boot.lotto.dto;

import java.util.List;

/**
 * 연금복권 720+ 예상 번호 응답 DTO
 */
public record PensionLottoResponse(
    List<String> games
) {}

