document.addEventListener('DOMContentLoaded', () => {
    const gameList = document.getElementById('game-list');
    const btnServer = document.getElementById('btn-server');
    const btnClient = document.getElementById('btn-client');
    const btnCopyAll = document.getElementById('btn-copy-all');

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);

    let toastTimer;
    const showToast = (message) => {
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    };

    const getBallClass = n => `b-${Math.floor((n-1)/10)*10+1}`;

    const renderGames = (games, isLocal) => {
        gameList.innerHTML = games.map((nums, i) => `
            <li class="game-card">
                <div class="game-info">
                    <div class="game-label">${i+1}번째 게임 ${isLocal ? '(로컬)' : '(서버)'}</div>
                    <div class="balls">${nums.map(n => `<div class="ball ${getBallClass(n)}">${n}</div>`).join('')}</div>
                </div>
                <button class="copy-btn" data-game="[${nums.join(', ')}]" title="복사하기">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </li>`).join('');
    };

    // Render initial games from server if available
    if (window.initialGames && window.initialGames.length > 0) {
        renderGames(window.initialGames, false);
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast('복사되었습니다: ' + text);
        });
    };

    // Event Delegation for Copy Buttons
    gameList.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-btn');
        if (btn) {
            copyToClipboard(btn.dataset.game);
        }
    });

    btnCopyAll.addEventListener('click', () => {
        const games = Array.from(gameList.querySelectorAll('.copy-btn'))
            .map(btn => btn.dataset.game);
        if (games.length > 0) {
            copyToClipboard(games.join('\n'));
        } else {
            showToast('복사할 번호가 없습니다.');
        }
    });

    let isProcessing = false;
    btnServer.addEventListener('click', async () => {
        if (isProcessing) return;
        isProcessing = true;
        btnServer.style.opacity = '0.6';
        
        try {
            const response = await fetch('/api/lotto');
            const data = await response.json();
            renderGames(data.games, false);
        } catch (err) {
            showToast('서버 호출에 실패했습니다.');
        } finally {
            isProcessing = false;
            btnServer.style.opacity = '1';
        }
    });

    btnClient.addEventListener('click', () => {
        const games = Array.from({length: 5}, () => 
            Array.from({length: 45}, (_, i) => i + 1)
                .sort(() => Math.random() - 0.5).slice(0, 6).sort((a, b) => a - b)
        );
        renderGames(games, true);
    });
});
