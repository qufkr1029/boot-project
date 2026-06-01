package ai.app.boot.benchmark.controller.api;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Map;
import javax.imageio.ImageIO;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Benchmark API", description = "성능 비교를 위한 API")
@RestController
@RequestMapping("/api/benchmark")
@RequiredArgsConstructor
public class BenchmarkApiController {

	@Operation(summary = "더미 이미지 생성 API", description = "인위적인 딜레이가 적용된 더미 이미지를 생성해 반환합니다.")
	@GetMapping(value = "/dummy-image", produces = MediaType.IMAGE_PNG_VALUE)
	public byte[] getDummyImage(
			@RequestParam("id") int id,
			@RequestParam(value = "delay", defaultValue = "80") int delay) throws Exception {
		// 클라이언트 요청에 따라 지연시간(delay ms) 동적 적용
		if (delay > 0) {
			Thread.sleep(delay);
		}

		// 32x32 단색 PNG 이미지 생성
		BufferedImage img = new BufferedImage(32, 32, BufferedImage.TYPE_INT_ARGB);
		Graphics2D g = img.createGraphics();

		// ID 기반으로 색상 다양하게 변경
		float hue = ((id * 23) % 360) / 360.0f;
		g.setColor(Color.getHSBColor(hue, 0.75f, 0.9f));
		g.fillRect(0, 0, 32, 32);
		g.dispose();

		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ImageIO.write(img, "PNG", baos);
		return baos.toByteArray();
	}

	@Operation(summary = "텍스트 에코 API", description = "보내온 텍스트를 그대로 반환하여 전송 테스트를 돕습니다.")
	@PostMapping(value = "/echo")
	public Map<String, String> echoText(@RequestBody Map<String, String> payload) {
		return payload;
	}
}
