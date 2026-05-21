package ai.app.boot.aircon.service;

import org.springframework.stereotype.Service;
import ai.app.boot.aircon.dto.AirConResponse;

@Service
public class AirConService {

	// 서버 메모리에 에어컨 상태 저장 (실제 환경에서는 DB나 Redis 사용 권장)
	private boolean isOn = false;

	public AirConResponse getCurrentState() {
		return new AirConResponse(isOn);
	}

	public AirConResponse toggle() {
		this.isOn = !this.isOn;
		return new AirConResponse(isOn);
	}
}
