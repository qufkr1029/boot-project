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
            if (!this.canvas || !this.ctx) return;
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
        lines: null,            // 별자리 연결선 객체
        lineGeometry: null,     // 별자리 연결선 지오메트리
        animationId: null,
        active: false,
        numNodes: 175,          // 선으로 연결될 핵심 별자리 노드 수 (50% 수준인 175로 조정)
        numBgStars: 900,        // 배경을 채울 미세 별 파티클 수 (50% 수준인 900으로 조정)
        nodeData: [],           // 핵심 노드 물리 정보
        bgStarData: [],         // 배경 별 물리 정보

        init() {
            if (!this.canvas) return;
            const width = window.innerWidth;
            const height = window.innerHeight;

            // 1) 씬 생성 및 화사한 은하수 안개 설정 (실버 파스텔 안개)
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2(0xf1f5f9, 0.005);

            // 2) 카메라 설정 (별자리 네트워크 한가운데를 비스듬히 감상하는 시각)
            this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
            this.camera.position.set(0, 30, 95);
            this.camera.lookAt(0, 0, 0);

            // 3) 노드용 위치/색상 배열 및 배경용 별 위치/색상 배열
            const totalParticles = this.numNodes + this.numBgStars;
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(totalParticles * 3);
            const colors = new Float32Array(totalParticles * 3);
            this.nodeData = [];
            this.bgStarData = [];

            // 화사한 라이트 오로라 컬러 정의
            const colorPurple = new THREE.Color('#8b5cf6'); // 바이올렛 별자리
            const colorPink   = new THREE.Color('#ff5e7e'); // 코랄 핑크 별자리
            const colorCyan   = new THREE.Color('#00b4d8'); // 터코이즈 블루 별자리
            const colorTeal   = new THREE.Color('#10b981'); // 민트 그린 별자리
            const colorGold   = new THREE.Color('#ffb703'); // 골든 반짝이
            const colorWhite  = new THREE.Color('#e2e8f0'); // 연백색 배경별

            // A. 별자리 핵심 노드 생성 (350개) - 움직이고 선으로 연결됨
            for (let i = 0; i < this.numNodes; i++) {
                const idx = i * 3;
                // 공간 영역: X: -75 ~ 75, Y: -50 ~ 50, Z: -75 ~ 75
                const x = (Math.random() - 0.5) * 150;
                const y = (Math.random() - 0.5) * 100;
                const z = (Math.random() - 0.5) * 150;

                positions[idx] = x;
                positions[idx + 1] = y;
                positions[idx + 2] = z;

                this.nodeData.push({
                    x: x, y: y, z: z,
                    vx: (Math.random() - 0.5) * 0.16, // 부드럽고 느린 유영 속도
                    vy: (Math.random() - 0.5) * 0.16,
                    vz: (Math.random() - 0.5) * 0.16,
                    pulsePhase: Math.random() * Math.PI * 2
                });

                // 무작위로 화사한 색상 분배
                const randColor = Math.random();
                let c;
                if (randColor < 0.25) c = colorPurple;
                else if (randColor < 0.5) c = colorPink;
                else if (randColor < 0.75) c = colorCyan;
                else c = colorTeal;

                colors[idx] = c.r;
                colors[idx + 1] = c.g;
                colors[idx + 2] = c.b;
            }

            // B. 배경 미세 별 생성 (1,800개) - 기하학 공간의 깊이 레이어 역할
            for (let i = 0; i < this.numBgStars; i++) {
                const idx = (this.numNodes + i) * 3;
                // 배경 별은 구형 성단 형태로 둥글고 넓게 분배
                const radius = 65 + Math.random() * 85;
                const u = Math.random();
                const v = Math.random();
                const theta = u * 2.0 * Math.PI;
                const phi = Math.acos(2.0 * v - 1.0);

                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6; // 위아래로 약간 납작하게
                const z = radius * Math.cos(phi);

                positions[idx] = x;
                positions[idx + 1] = y;
                positions[idx + 2] = z;

                this.bgStarData.push({
                    x: x, y: y, z: z,
                    speed: (Math.random() * 0.0015 - 0.0007),
                    theta: theta,
                    radius: radius,
                    phi: phi
                });

                const c = Math.random() > 0.45 ? colorWhite : colorGold;
                colors[idx] = c.r * 0.70; // 밝기를 은은하게 낮추어 먼 배경으로 표현
                colors[idx + 1] = c.g * 0.70;
                colors[idx + 2] = c.b * 0.70;
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            // 4) 원형 입자 텍스처
            const texture = this.createCircleTexture();

            // 5) 포인트 재질
            const material = new THREE.PointsMaterial({
                size: 1.25,
                vertexColors: true,
                map: texture,
                transparent: true,
                depthWrite: false,
                blending: THREE.NormalBlending
            });

            this.particles = new THREE.Points(this.geometry, material);
            this.scene.add(this.particles);

            // 6) 연결선 지오메트리 및 재질 생성 (LineSegments 사용으로 GPU 렌더링 최적화)
            this.lineGeometry = new THREE.BufferGeometry();
            const maxConnections = this.numNodes * 7; 
            const linePositions = new Float32Array(maxConnections * 2 * 3);
            const lineColors = new Float32Array(maxConnections * 2 * 3);
            this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.38,
                blending: THREE.NormalBlending
            });

            this.lines = new THREE.LineSegments(this.lineGeometry, lineMaterial);
            this.scene.add(this.lines);

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
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');     
            grad.addColorStop(0.2, 'rgba(255, 240, 255, 0.95)');  
            grad.addColorStop(0.55, 'rgba(180, 225, 255, 0.5)');  
            grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');           
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
                const time = Date.now() * 0.001;
                const positions = bg3D.geometry.attributes.position.array;
                const colors = bg3D.geometry.attributes.color.array;

                let mouse3DX = 0;
                let mouse3DY = 0;
                let mouse3DZ = 0;
                let hasMouse = false;

                if (mouse.active && mouse.x !== null) {
                    const normX = (mouse.x / window.innerWidth) * 2 - 1;
                    const normY = -(mouse.y / window.innerHeight) * 2 + 1;
                    mouse3DX = normX * 85;
                    mouse3DY = normY * 45;
                    mouse3DZ = 0;
                    hasMouse = true;
                }

                // 1. 핵심 성좌 노드 물리 연동 (부유 + 경계 바운스 + 마우스 중력 인력)
                for (let i = 0; i < bg3D.numNodes; i++) {
                    const idx = i * 3;
                    const data = bg3D.nodeData[i];

                    // 기본 유영 움직임
                    data.x += data.vx;
                    data.y += data.vy;
                    data.z += data.vz;

                    // 마우스 인력 (마우스 방향으로 부드럽게 끌려감)
                    if (hasMouse) {
                        const dx = mouse3DX - data.x;
                        const dy = mouse3DY - data.y;
                        const dz = mouse3DZ - data.z;
                        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                        
                        if (dist < 45) {
                            const pullForce = (45 - dist) / 45 * 0.04;
                            data.x += (dx / dist) * pullForce * 4.2;
                            data.y += (dy / dist) * pullForce * 4.2;
                            data.z += (dz / dist) * pullForce * 4.2;
                        }
                    }

                    // 공간 경계 이탈 방지 (X: 75, Y: 50, Z: 75)
                    if (Math.abs(data.x) > 75) data.vx *= -1;
                    if (Math.abs(data.y) > 50) data.vy *= -1;
                    if (Math.abs(data.z) > 75) data.vz *= -1;

                    positions[idx] = data.x;
                    positions[idx + 1] = data.y;
                    positions[idx + 2] = data.z;
                }

                // 2. 배경용 은하수 별 공전 연산
                for (let i = 0; i < bg3D.numBgStars; i++) {
                    const idx = (bg3D.numNodes + i) * 3;
                    const data = bg3D.bgStarData[i];

                    data.theta += data.speed * 0.18; // 부드럽고 느리게 회전
                    
                    const x = data.radius * Math.sin(data.phi) * Math.cos(data.theta);
                    const y = data.radius * Math.sin(data.phi) * Math.sin(data.theta) * 0.6;
                    const z = data.radius * Math.cos(data.phi);

                    positions[idx] = x;
                    positions[idx + 1] = y;
                    positions[idx + 2] = z;
                }

                bg3D.geometry.attributes.position.needsUpdate = true;

                // 3. 별자리 네트워크 동적 연결선 연산 (LineSegments 갱신)
                const linePos = bg3D.lineGeometry.attributes.position.array;
                const lineCol = bg3D.lineGeometry.attributes.color.array;
                let lineIdx = 0;
                const maxLinesCount = bg3D.numNodes * 7;
                const limitDistance = 25.0; // 성좌 선 연결 임계거리

                // 임계거리 이내의 성좌 노드 쌍 탐색 후 버퍼 채우기
                for (let i = 0; i < bg3D.numNodes; i++) {
                    const nodeA = bg3D.nodeData[i];
                    const idxA = i * 3;

                    for (let j = i + 1; j < bg3D.numNodes; j++) {
                        if (lineIdx >= maxLinesCount) break;

                        const nodeB = bg3D.nodeData[j];
                        const idxB = j * 3;

                        const dx = nodeA.x - nodeB.x;
                        const dy = nodeA.y - nodeB.y;
                        const dz = nodeA.z - nodeB.z;
                        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                        if (dist < limitDistance) {
                            const alpha = (limitDistance - dist) / limitDistance;

                            // 선의 시작점 (노드 A)
                            linePos[lineIdx * 6] = nodeA.x;
                            linePos[lineIdx * 6 + 1] = nodeA.y;
                            linePos[lineIdx * 6 + 2] = nodeA.z;

                            // 선의 끝점 (노드 B)
                            linePos[lineIdx * 6 + 3] = nodeB.x;
                            linePos[lineIdx * 6 + 4] = nodeB.y;
                            linePos[lineIdx * 6 + 5] = nodeB.z;

                            // 연결선 알파 감쇄 및 입자 고유 색상 매핑
                            lineCol[lineIdx * 6] = colors[idxA] * alpha;
                            lineCol[lineIdx * 6 + 1] = colors[idxA + 1] * alpha;
                            lineCol[lineIdx * 6 + 2] = colors[idxA + 2] * alpha;

                            lineCol[lineIdx * 6 + 3] = colors[idxB] * alpha;
                            lineCol[lineIdx * 6 + 4] = colors[idxB + 1] * alpha;
                            lineCol[lineIdx * 6 + 5] = colors[idxB + 2] * alpha;

                            lineIdx++;
                        }
                    }

                    // 마우스와 노드 사이의 인터랙티브 유도 연결선 추가
                    if (hasMouse && lineIdx < maxLinesCount) {
                        const dx = nodeA.x - mouse3DX;
                        const dy = nodeA.y - mouse3DY;
                        const dz = nodeA.z - mouse3DZ;
                        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                        if (dist < 32.0) {
                            const alpha = (32.0 - dist) / 32.0 * 0.75; // 마우스선은 더 선명하게

                            linePos[lineIdx * 6] = nodeA.x;
                            linePos[lineIdx * 6 + 1] = nodeA.y;
                            linePos[lineIdx * 6 + 2] = nodeA.z;

                            linePos[lineIdx * 6 + 3] = mouse3DX;
                            linePos[lineIdx * 6 + 4] = mouse3DY;
                            linePos[lineIdx * 6 + 5] = mouse3DZ;

                            // 마우스 포인터 방향으로 번져나가는 빛선
                            lineCol[lineIdx * 6] = colors[idxA] * alpha;
                            lineCol[lineIdx * 6 + 1] = colors[idxA + 1] * alpha;
                            lineCol[lineIdx * 6 + 2] = colors[idxA + 2] * alpha;

                            lineCol[lineIdx * 6 + 3] = 0.5 * alpha; // 마우스 중심부는 중립 광택
                            lineCol[lineIdx * 6 + 4] = 0.7 * alpha;
                            lineCol[lineIdx * 6 + 5] = 1.0 * alpha;

                            lineIdx++;
                        }
                    }
                }

                // 남은 버퍼는 렌더링되지 않도록 0으로 완전 초기화
                for (let i = lineIdx; i < maxLinesCount; i++) {
                    linePos[i * 6] = 0;
                    linePos[i * 6 + 1] = 0;
                    linePos[i * 6 + 2] = 0;
                    linePos[i * 6 + 3] = 0;
                    linePos[i * 6 + 4] = 0;
                    linePos[i * 6 + 5] = 0;
                }

                bg3D.lineGeometry.attributes.position.needsUpdate = true;
                bg3D.lineGeometry.attributes.color.needsUpdate = true;

                // 4. 카메라 무브먼트: 별자리 성좌 사이를 서서히 공전 비행하듯 360도 웅장한 이동 회전
                const camAngle = time * 0.024;
                const baseCamX = Math.sin(camAngle) * 98;
                const baseCamZ = Math.cos(camAngle) * 98;
                const baseCamY = 22 + Math.sin(time * 0.06) * 12;

                // 마우스 움직임에 반응하는 강한 3D 패럴랙스
                let parallaxX = 0;
                let parallaxY = 0;
                if (hasMouse) {
                    parallaxX = (mouse.x / window.innerWidth - 0.5) * 26;
                    parallaxY = -(mouse.y / window.innerHeight - 0.5) * 18;
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
        stompClient.debug = () => {}; // STOMP 디버깅 로그 비활성화 (함수로 정의하여 TypeError 방지)

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
