let stompClient = null;
const elements = {
    body: document.body,
    btn: document.getElementById('toggleBtn'),
    badge: document.getElementById('statusBadge'),
    fan: document.getElementById('fanIcon')
};

function connect() {
    const socket = new SockJS('/ws-aircon');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; 

    stompClient.connect({}, (frame) => {
        stompClient.subscribe('/topic/aircon/state', (response) => {
            const data = JSON.parse(response.body);
            updateUI(data.isOn);
        });
    }, (error) => {
        console.error('WebSocket Error:', error);
        setTimeout(connect, 5000); // 에러 시 재연결 시도
    });
}

function updateUI(isOn) {
    // 클래스 기반으로 상태 제어 (하드코딩 제거)
    elements.body.classList.toggle('on-bg', isOn);
    elements.fan.classList.toggle('spinning', isOn);
    
    elements.badge.textContent = isOn ? '에어컨 켜짐' : '에어컨 꺼짐';
    elements.badge.className = `status-badge ${isOn ? 'status-on' : 'status-off'}`;
}

elements.btn.onclick = () => {
    if (stompClient?.connected) {
        stompClient.send("/app/aircon/toggle", {}, {});
    }
};

// 초기 상태 반영 및 연결
if (typeof window.initialState !== 'undefined') {
    updateUI(window.initialState);
}
connect();
