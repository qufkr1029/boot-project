document.addEventListener('DOMContentLoaded', () => {
	const imageGrid = document.getElementById('image-grid');
	const startBtn = document.getElementById('start-btn');
	const resetBtn = document.getElementById('reset-btn');
	const currentProtocolEl = document.getElementById('current-protocol');
	const loadedCountEl = document.getElementById('loaded-count');
	const elapsedTimeEl = document.getElementById('elapsed-time');

	const imageCountSelect = document.getElementById('image-count-select');
	const latencySelect = document.getElementById('latency-select');

	// 프로토콜 및 포트 리다이렉션 토글 바인딩
	const switchHttp1 = document.getElementById('switch-http1');
	const switchHttp2 = document.getElementById('switch-http2');

	const isHttps = window.location.protocol === 'https:';

	// 현재 접속 프로토콜 기반 액티브 탭 색칠
	if (isHttps) {
		switchHttp2.classList.add('active');
	} else {
		switchHttp1.classList.add('active');
	}

	// 각 스위치 클릭 이벤트 바인딩
	switchHttp1.addEventListener('click', () => {
		if (window.location.protocol === 'https:') {
			window.location.href = 'http:' + window.location.href.substring(window.location.protocol.length);
		}
	});

	switchHttp2.addEventListener('click', () => {
		if (window.location.protocol === 'http:') {
			window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
		}
	});

	let startTime = null;
	let loadedCount = 0;
	let totalImagesCount = 300;

	// 1. 프로토콜 자동 감지
	function detectProtocol() {
		const entries = window.performance.getEntriesByType('navigation');
		if (entries.length > 0) {
			const protocol = entries[0].nextHopProtocol;
			if (protocol) {
				currentProtocolEl.textContent = protocol.toUpperCase();
				return;
			}
		}
		if (window.location.protocol === 'https:') {
			currentProtocolEl.textContent = 'HTTP/2 (H2)';
		} else {
			currentProtocolEl.textContent = 'HTTP/1.1';
		}
	}

	// 2. 바둑판 그리드 뼈대 생성
	function createGridShell() {
		totalImagesCount = parseInt(imageCountSelect.value, 10);
		loadedCountEl.textContent = `0 / ${totalImagesCount}`;
		imageGrid.innerHTML = '';
		
		// 이미지 개수에 맞춰 Grid 열(Columns) 개수 보정 (100개면 10열, 300/500개면 20열)
		if (totalImagesCount <= 100) {
			imageGrid.style.gridTemplateColumns = 'repeat(10, 1fr)';
			imageGrid.style.maxWidth = '380px';
		} else {
			imageGrid.style.gridTemplateColumns = 'repeat(20, 1fr)';
			imageGrid.style.maxWidth = '680px';
		}

		for (let i = 1; i <= totalImagesCount; i++) {
			const tile = document.createElement('div');
			tile.className = 'tile';
			tile.id = `tile-${i}`;
			tile.textContent = i;
			imageGrid.appendChild(tile);
		}
	}

	// 3. 이미지 비동기 로딩 시작
	function startComparisonTest() {
		startBtn.disabled = true;
		imageCountSelect.disabled = true;
		latencySelect.disabled = true;

		createGridShell();
		
		loadedCount = 0;
		loadedCountEl.textContent = `0 / ${totalImagesCount}`;
		elapsedTimeEl.textContent = '로딩 중...';
		
		const delayVal = latencySelect.value;
		
		// 타이머 시작
		startTime = performance.now();

		for (let i = 1; i <= totalImagesCount; i++) {
			const tile = document.getElementById(`tile-${i}`);
			const img = document.createElement('img');
			
			// 동적 delay 파라미터 및 캐시 회피용 파라미터 추가
			img.src = `/api/benchmark/dummy-image?id=${i}&delay=${delayVal}&nocache=${Math.random()}`;
			img.alt = `img-${i}`;

			img.onload = () => {
				img.classList.add('loaded');
				loadedCount++;
				loadedCountEl.textContent = `${loadedCount} / ${totalImagesCount}`;
				
				if (loadedCount === totalImagesCount) {
					const endTime = performance.now();
					const totalTime = (endTime - startTime).toFixed(0);
					elapsedTimeEl.textContent = `${totalTime} ms`;
					finishTest();
				}
			};

			img.onerror = () => {
				tile.style.backgroundColor = '#ef4448';
				tile.textContent = 'Err';
				loadedCount++;
				if (loadedCount === totalImagesCount) {
					const endTime = performance.now();
					const totalTime = (endTime - startTime).toFixed(0);
					elapsedTimeEl.textContent = `${totalTime} ms (오류)`;
					finishTest();
				}
			};

			tile.innerHTML = '';
			tile.appendChild(img);
		}
	}

	function finishTest() {
		startBtn.disabled = false;
		imageCountSelect.disabled = false;
		latencySelect.disabled = false;
	}

	// 4. 리셋 기능
	function resetTest() {
		createGridShell();
		loadedCount = 0;
		loadedCountEl.textContent = `0 / ${totalImagesCount}`;
		elapsedTimeEl.textContent = '0 ms';
		finishTest();
	}

	// 이벤트 리스너 등록
	startBtn.addEventListener('click', startComparisonTest);
	resetBtn.addEventListener('click', resetTest);
	imageCountSelect.addEventListener('change', createGridShell);

	// 초기 구동
	detectProtocol();
	createGridShell();
});
