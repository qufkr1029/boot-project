document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    // High DPI display support scaling
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        ctx.scale(dpr, dpr);
    }
    
    window.addEventListener('resize', () => {
        resize();
        // Adjust particle positions to be within bounds
        particles.forEach(p => {
            if (p.x > width) p.x = Math.random() * width;
            if (p.y > height) p.y = Math.random() * height;
        });
    });
    
    resize();

    // Mouse states
    const mouse = {
        x: null,
        y: null,
        radius: 200, // Distance of mouse influence
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

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; // Slow floating velocity
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1.2; // 1.2 to 3.2 pixels
            this.baseAlpha = Math.random() * 0.2 + 0.25; // Visually optimized for light mode (0.25 to 0.45)
            this.alpha = this.baseAlpha;
        }

        update() {
            // Constant drift
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Mouse interaction physics
            if (mouse.active && mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    // Soft attraction towards mouse
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 0.35;
                    this.y -= (dy / dist) * force * 0.35;
                    
                    // Intensify particle opacity when close to the pointer
                    this.alpha = Math.min(0.9, this.baseAlpha + force * 0.45);
                } else {
                    // Decay back to base opacity
                    if (this.alpha > this.baseAlpha) {
                        this.alpha -= 0.01;
                    }
                }
            } else {
                if (this.alpha > this.baseAlpha) {
                    this.alpha -= 0.01;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`; // Indigo particles
            ctx.fill();
        }
    }

    const particles = [];
    const particleDensity = 6000; // Pixels per particle (Lower = denser)
    const maxParticlesCount = 250;
    const minParticlesCount = 80;
    
    function initParticles() {
        particles.length = 0;
        const count = Math.min(maxParticlesCount, Math.max(minParticlesCount, Math.floor((width * height) / particleDensity)));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // Connect particles and mouse
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            
            // Draw lines to other close particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    const alpha = ((110 - dist) / 110) * 0.18 * Math.min(p1.alpha, p2.alpha);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`; // Soft indigo connecting lines
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Draw line to mouse pointer
            if (mouse.active && mouse.x !== null) {
                const dx = mouse.x - p1.x;
                const dy = mouse.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const alpha = ((mouse.radius - dist) / mouse.radius) * 0.4 * p1.alpha;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`; // Darker indigo lines connecting to cursor
                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                }
            }
        }
    }

    // Glowing cursor aura
    function drawMouseGlow() {
        if (mouse.active && mouse.x !== null) {
            const gradient = ctx.createRadialGradient(
                mouse.x, mouse.y, 0,
                mouse.x, mouse.y, mouse.radius
            );
            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.05)');
            gradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.02)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    // Optimization: Pause rendering when tab is hidden
    let isTabActive = true;
    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    function animate() {
        if (isTabActive) {
            ctx.clearRect(0, 0, width, height);
            
            drawMouseGlow();
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            drawConnections();
        }
        requestAnimationFrame(animate);
    }

    // Aircon WebSocket Connection (Read-only status sync)
    function connectAirconSocket() {
        if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
            console.warn('SockJS or Stomp library not loaded. Retrying in 1s...');
            setTimeout(connectAirconSocket, 1000);
            return;
        }

        const socket = new SockJS('/ws-aircon');
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; // Hide STOMP frame debugging logs

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
            setTimeout(connectAirconSocket, 5000); // Retry after 5s on failure
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

    initParticles();
    animate();
    
    // Initialize aircon UI status with server value
    if (typeof window.initialState !== 'undefined') {
        updateAirconUI(window.initialState);
    }
    
    connectAirconSocket();
});
