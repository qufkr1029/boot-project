package ai.app.boot.aircon.controller.api;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import ai.app.boot.aircon.dto.AirConResponse;
import ai.app.boot.aircon.service.AirConService;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class AirConMessageController {

	private final AirConService airConService;

	/**
	 * 클라이언트가 /app/aircon/toggle 로 메시지를 보내면 호출됩니다.
	 * 처리 후 /topic/aircon/state 를 구독 중인 모든 클라이언트에게 결과를 전송합니다.
	 */
	@MessageMapping("/aircon/toggle")
	@SendTo("/topic/aircon/state")
	public AirConResponse toggle() {
		return airConService.toggle();
	}
}
