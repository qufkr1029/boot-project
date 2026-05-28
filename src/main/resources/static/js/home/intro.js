document.addEventListener('DOMContentLoaded', () => {
    // 탭 활성화 여부 감지 (비활성 시 프레임 정지용)
    let isTabActive = true;
    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    // 마우스 상태 공유 정보
    const mouse = {
        x: null,
        y: null,
        radius: 200, // 마우스 영향 반경
        active: false
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
        mouse.active = false;
    });

    // ==========================================
    // 1. 2D 라인 네트워크 배경 모듈
    // ==========================================
    const bg2D = {
        canvas: document.getElementById('bg-canvas-2d'),
        ctx: null,
        particles: [],
        animationId: null,
        active: false,
        width: 0,
        height: 0,

        init() {
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.initParticles();
        },

        resize() {
            if (!this.canvas) return;
            const dpr = window.devicePixelRatio || 1;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(dpr, dpr);

            // 파티클 위치 보정
            this.particles.forEach(p => {
                if (p.x > this.width) p.x = Math.random() * this.width;
                if (p.y > this.height) p.y = Math.random() * this.height;
            });
        },

        initParticles() {
            this.particles = [];
            const particleDensity = 6000;
            const maxParticlesCount = 250;
            const minParticlesCount = 80;
            const count = Math.min(maxParticlesCount, Math.max(minParticlesCount, Math.floor((this.width * this.height) / particleDensity)));

            for (let i = 0; i < count; i++) {
                this.particles.push(this.createParticle());
            }
        },

        createParticle() {
            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5, // 느린 부유 속도
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1.2,
                baseAlpha: Math.random() * 0.2 + 0.25,
                alpha: Math.random() * 0.2 + 0.25,

                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    // 화면 경계 복귀
                    if (this.x < 0) this.x = bg2D.width;
                    if (this.x > bg2D.width) this.x = 0;
                    if (this.y < 0) this.y = bg2D.height;
                    if (this.y > bg2D.height) this.y = 0;

                    // 마우스 상호작용
                    if (mouse.active && mouse.x !== null) {
                        const dx = mouse.x - this.x;
                        const dy = mouse.y - this.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < mouse.radius) {
                            const force = (mouse.radius - dist) / mouse.radius;
                            this.x -= (dx / dist) * force * 0.35;
                            this.y -= (dy / dist) * force * 0.35;
                            this.alpha = Math.min(0.9, this.baseAlpha + force * 0.45);
                        } else {
                            if (this.alpha > this.baseAlpha) this.alpha -= 0.01;
                        }
                    } else {
                        if (this.alpha > this.baseAlpha) this.alpha -= 0.01;
                    }
                },

                draw() {
                    bg2D.ctx.beginPath();
                    bg2D.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    bg2D.ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
                    bg2D.ctx.fill();
                }
            };
        },

        drawConnections() {
            for (let i = 0; i < this.particles.length; i++) {
                const p1 = this.particles[i];
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        const alpha = ((110 - dist) / 110) * 0.18 * Math.min(p1.alpha, p2.alpha);
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                        this.ctx.lineWidth = 0.8;
                        this.ctx.stroke();
                    }
                }

                // 마우스 연결선
                if (mouse.active && mouse.x !== null) {
                    const dx = mouse.x - p1.x;
                    const dy = mouse.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const alpha = ((mouse.radius - dist) / mouse.radius) * 0.4 * p1.alpha;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(mouse.x, mouse.y);
                        this.ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`;
                        this.ctx.lineWidth = 1.0;
                        this.ctx.stroke();
                    }
                }
            }
        },

        drawMouseGlow() {
            if (mouse.active && mouse.x !== null) {
                const gradient = this.ctx.createRadialGradient(
                    mouse.x, mouse.y, 0,
                    mouse.x, mouse.y, mouse.radius
                );
                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.05)');
                gradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.02)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                this.ctx.beginPath();
                this.ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }
        },

        start() {
            if (this.active) return;
            this.active = true;
            this.canvas.classList.add('active');
            if (!this.ctx) this.init();
            this.animate();
        },

        stop() {
            this.active = false;
            this.canvas.classList.remove('active');
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        },

        animate() {
            if (!bg2D.active) return;
            if (isTabActive) {
                bg2D.ctx.clearRect(0, 0, bg2D.width, bg2D.height);
                bg2D.drawMouseGlow();
                bg2D.particles.forEach(p => {
                    p.update();
                    p.draw();
                });
                bg2D.drawConnections();
            }
            bg2D.animationId = requestAnimationFrame(bg2D.animate);
        }
    };

    // ==========================================
    // 2. 3D 파티클 웨이브 배경 모듈 (Three.js)
    // ==========================================
    const bg3D = {
        canvas: document.getElementById('bg-canvas-3d'),
        renderer: null,
        scene: null,
        camera: null,
        particles: null,
        geometry: null,
        animationId: null,
        active: false,
        numParticles: 8000, // 파티클 수를 8,000개로 늘려 밀도 향상
        particleData: [],   // 개별 파티클 메타데이터

        init() {
            if (!this.canvas) return;
            const width = window.innerWidth;
            const height = window.innerHeight;

            // 1) 씬 생성
            this.scene = new THREE.Scene();
            // 우주 깊이감을 표현하기 위해 EXP2 안개 효과 추가
            this.scene.fog = new THREE.FogExp2(0x060610, 0.008);

            // 2) 카메라 설정 (원거리 우주 파노라마 시각)
            this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
            this.camera.position.set(0, 45, 90);
            this.camera.lookAt(0, 0, 0);

            // 3) 버퍼 지오메트리 정보 및 메타데이터 정의
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.numParticles * 3);
            const colors = new Float32Array(this.numParticles * 3);
            this.particleData = [];

            // 화려한 네온 컬러 팔레트 정의
            const colorCore = new THREE.Color('#fffae6');   // 중심핵: 초고온 골드/화이트
            const colorPink = new THREE.Color('#ff007f');   // 안쪽 나선: 핫 핑크
            const colorPurple = new THREE.Color('#7b2cbf'); // 중간 나선: 네온 바이올렛
            const colorCyan = new THREE.Color('#00f0ff');   // 외곽 나선: 일렉트릭 시안
            const colorIndigo = new THREE.Color('#10143a'); // 우주 먼지: 딥 인디고

            for (let i = 0; i < this.numParticles; i++) {
                const idx = i * 3;
                
                // 70%는 정교한 4선 나선 은하, 30%는 주변의 구형 성운(Nebula Dust)
                const isGalaxy = i < this.numParticles * 0.70;

                if (isGalaxy) {
                    // 4방향 나선 은하 팔(Spiral Arms) 인덱스 분배
                    const armIndex = i % 4;
                    // 중심부에 밀집되도록 지수 함수형 랜덤 반경 분배
                    const radius = Math.pow(Math.random(), 2.0) * 58;
                    // 은하 회전각 + 노이즈 분산
                    const angle = (armIndex * 2 * Math.PI / 4) + (radius * 0.065) + (Math.random() - 0.5) * 0.38;
                    // 중심부는 둥글고 가장자리로 갈수록 얇게 납작해지는 은하 원반 Y 두께 설정
                    const y = (Math.random() - 0.5) * 6.5 * (1 - radius / 58);

                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;

                    positions[idx] = x;
                    positions[idx + 1] = y;
                    positions[idx + 2] = z;

                    this.particleData.push({
                        type: 'galaxy',
                        radius: radius,
                        angle: angle,
                        baseY: y,
                        yPhase: Math.random() * Math.PI * 2,
                        speed: (0.007 + (1 - radius / 58) * 0.024), // 중심부 공전 속도 가속화
                        pulsePhase: Math.random() * Math.PI * 2,
                        pulseSpeed: 0.8 + Math.random() * 1.5
                    });

                    // 거리별 화려한 그라데이션 블렌딩
                    let c;
                    if (radius < 8) {
                        c = new THREE.Color().lerpColors(colorCore, colorPink, radius / 8);
                    } else if (radius < 26) {
                        c = new THREE.Color().lerpColors(colorPink, colorPurple, (radius - 8) / 18);
                    } else {
                        c = new THREE.Color().lerpColors(colorPurple, colorCyan, (radius - 26) / 32);
                    }

                    colors[idx] = c.r;
                    colors[idx + 1] = c.g;
                    colors[idx + 2] = c.b;
                } else {
                    // 외곽을 구형으로 감싸며 신비로움을 더하는 우주 성운/먼지 입자
                    const radius = 32 + Math.random() * 48;
                    const u = Math.random();
                    const v = Math.random();
                    const theta = u * 2.0 * Math.PI;
                    const phi = Math.acos(2.0 * v - 1.0);

                    // 타원체 형태로 우주 가스 분포
                    const x = radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.5;
                    const z = radius * Math.cos(phi);

                    positions[idx] = x;
                    positions[idx + 1] = y;
                    positions[idx + 2] = z;

                    this.particleData.push({
                        type: 'nebula',
                        radius: radius,
                        angle: theta,
                        baseY: y,
                        yPhase: Math.random() * Math.PI * 2,
                        speed: (Math.random() * 0.004 - 0.002), // 미세한 공전/역공전 속도
                        pulsePhase: Math.random() * Math.PI * 2,
                        pulseSpeed: 0.5 + Math.random() * 1.0
                    });

                    // 청록색과 딥 블루가 조화를 이루는 컬러
                    const c = new THREE.Color().lerpColors(colorCyan, colorIndigo, Math.random() * 0.85);
                    colors[idx] = c.r;
                    colors[idx + 1] = c.g;
                    colors[idx + 2] = c.b;
                }
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            // 4) 고급스러운 멀티-글로우 원형 입자 텍스처 생성
            const texture = this.createCircleTexture();

            // 5) 포인트 재질 구성
            const material = new THREE.PointsMaterial({
                size: 1.15, // 입자 크기를 살짝 키워 화려함 강조
                vertexColors: true,
                map: texture,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            // 6) 파티클 시스템 생성 및 추가
            this.particles = new THREE.Points(this.geometry, material);
            this.scene.add(this.particles);

            // 7) WebGL 렌더러 초기화
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true
            });
            this.renderer.setPixelRatio(window.devicePixelRatio || 1);
            this.renderer.setSize(width, height);
        },

        createCircleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            // 중심은 눈부신 화이트, 외곽은 신비로운 핑크/네온 오라가 감도는 그라데이션
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');     // 하이라이트 코어
            grad.addColorStop(0.15, 'rgba(255, 220, 255, 0.9)');  // 핑크 감쇠막
            grad.addColorStop(0.45, 'rgba(100, 180, 255, 0.45)'); // 소프트 블루 글로우
            grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');           // 완전 투명 경계
            
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(canvas);
        },

        resize() {
            if (!this.active || !this.renderer) return;
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        },

        start() {
            if (this.active) return;
            this.active = true;
            this.canvas.classList.add('active');
            if (!this.renderer) this.init();
            this.animate();
        },

        stop() {
            this.active = false;
            this.canvas.classList.remove('active');
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        },

        animate() {
            if (!bg3D.active) return;
            bg3D.animationId = requestAnimationFrame(bg3D.animate);

            if (isTabActive) {
                const time = Date.now() * 0.0014;
                const positions = bg3D.geometry.attributes.position.array;

                for (let i = 0; i < bg3D.numParticles; i++) {
                    const idx = i * 3;
                    const data = bg3D.particleData[i];

                    // 1. 기본 회전 및 은하 공전 연산
                    data.angle += data.speed * 0.22;

                    let currentAngle = data.angle;
                    // 파티클 호흡(Breathing) 효과: 전체가 부드럽게 팽창/수축을 반복하며 살아 숨쉬는 성운 연출
                    let currentRadius = data.radius + Math.sin(time * data.pulseSpeed + data.pulsePhase) * 0.35;
                    // Y축 출렁임
                    let currentY = data.baseY + Math.sin(time * 1.8 + data.yPhase) * 1.6;

                    // 2. 마우스 상호작용 (중력 및 소용돌이 기류 추가)
                    if (mouse.active && mouse.x !== null) {
                        const normX = (mouse.x / window.innerWidth) * 2 - 1;
                        const normY = -(mouse.y / window.innerHeight) * 2 + 1;

                        // 3D 공간 상의 마우스 가상 좌표 추정
                        const mouse3DX = normX * 62;
                        const mouse3DZ = -normY * 62;

                        const tempX = Math.cos(currentAngle) * currentRadius;
                        const tempZ = Math.sin(currentAngle) * currentRadius;

                        const dx = tempX - mouse3DX;
                        const dz = tempZ - mouse3DZ;
                        const dist = Math.sqrt(dx * dx + dz * dz);

                        // 마우스 근처 28단위 범위 내 파티클 변형
                        if (dist < 28) {
                            const force = (28 - dist) / 28;
                            
                            // A) 회전 소용돌이(Vortex Swirl) 추가: 마우스 중심 주변으로 강렬하게 휘감김
                            currentAngle += force * 0.20;
                            // B) 인력 끌림 효과: 은하가 마우스 주변으로 왜곡되어 쏠림
                            currentRadius -= force * 3.8;
                            // C) Y축 파동 왜곡: 입체감이 살아나는 수직 왜곡
                            currentY += Math.sin(time * 5.0 + data.yPhase) * force * 5.5;
                        }
                    }

                    // 최종 연산 값 버퍼 좌표계 반영
                    positions[idx] = Math.cos(currentAngle) * currentRadius;
                    positions[idx + 1] = currentY;
                    positions[idx + 2] = Math.sin(currentAngle) * currentRadius;
                }

                bg3D.geometry.attributes.position.needsUpdate = true;

                // 3. 다이내믹 카메라 경로 비행 (공전과 상하 요동, 마우스 패럴랙스 결합)
                const camAngle = time * 0.04;
                const baseCamX = Math.sin(camAngle) * 88;
                const baseCamZ = Math.cos(camAngle) * 88;
                // 시간에 따라 3D 높낮이가 오르내리며 은하의 입체 구조가 드러남
                const baseCamY = 32 + Math.sin(time * 0.10) * 16;

                // 마우스 패럴랙스: 마우스 무브에 따라 카메라 각도 추가 편향
                let parallaxX = 0;
                let parallaxY = 0;
                if (mouse.active && mouse.x !== null) {
                    parallaxX = (mouse.x / window.innerWidth - 0.5) * 18;
                    parallaxY = -(mouse.y / window.innerHeight - 0.5) * 12;
                }

                bg3D.camera.position.x = baseCamX + parallaxX;
                bg3D.camera.position.y = baseCamY + parallaxY;
                bg3D.camera.position.z = baseCamZ;
                bg3D.camera.lookAt(0, 0, 0);

                bg3D.renderer.render(bg3D.scene, bg3D.camera);
            }
        }
    };

    // ==========================================
    // 3. 에어컨 제어 웹소켓 연동 모듈
    // ==========================================
    function connectAirconSocket() {
        if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
            console.warn('SockJS or Stomp library not loaded. Retrying in 1s...');
            setTimeout(connectAirconSocket, 1000);
            return;
        }

        const socket = new SockJS('/ws-aircon');
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; // STOMP 프레임 디버깅 로그 출력 숨김

        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/aircon/state', (response) => {
                try {
                    const data = JSON.parse(response.body);
                    updateAirconUI(data.isOn);
                } catch (e) {
                    console.error('Error parsing aircon state payload:', e);
                }
            });
        }, (error) => {
            console.error('Aircon WebSocket Connection Error:', error);
            setTimeout(connectAirconSocket, 5000); // 실패 시 5초 후 재시도
        });
    }

    function updateAirconUI(isOn) {
        const badge = document.getElementById('aircon-status-badge');
        const fan = document.getElementById('intro-fan-icon');

        if (badge) {
            badge.textContent = isOn ? '작동 중' : '정지됨';
            badge.className = `status-badge-mini ${isOn ? 'status-on' : 'status-off'}`;
        }

        if (fan) {
            fan.classList.toggle('spinning', isOn);
        }
    }

    // ==========================================
    // 4. 서버 동기화 실시간 시계 모듈
    // ==========================================
    const serverTimeOnLoad = typeof window.serverTime === 'number' ? window.serverTime : Date.now();
    const clientTimeOnLoad = Date.now();
    const timeOffset = serverTimeOnLoad - clientTimeOnLoad;

    function formatTime(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    function updateClock() {
        const clockEl = document.getElementById('current-time');
        if (clockEl) {
            const syncedDate = new Date(Date.now() + timeOffset);
            clockEl.textContent = formatTime(syncedDate);
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    // ==========================================
    // 5. 배경 전환 이벤트 바인딩 및 초기화
    // ==========================================
    const selectEl = document.getElementById('bg-effect-select');
    let currentBg = localStorage.getItem('intro-bg-effect') || '2d';

    if (selectEl) {
        selectEl.value = currentBg;
        selectEl.addEventListener('change', (e) => {
            switchBg(e.target.value);
        });
    }

    function switchBg(type) {
        currentBg = type;
        localStorage.setItem('intro-bg-effect', type);

        if (type === '2d') {
            document.body.classList.remove('bg-3d-active');
            bg3D.stop();
            bg2D.start();
        } else {
            document.body.classList.add('bg-3d-active');
            bg2D.stop();
            bg3D.start();
        }
    }

    // 리사이즈 공동 바인딩
    window.addEventListener('resize', () => {
        bg2D.resize();
        bg3D.resize();
    });

    // 에어컨 초기 상태 설정 및 최초 연동
    if (typeof window.initialState !== 'undefined') {
        updateAirconUI(window.initialState);
    }

    connectAirconSocket();
    
    // 초기화 선택된 배경 적용
    switchBg(currentBg);
});
