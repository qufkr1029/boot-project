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

    const renderGames = (games, isLocal) => {
        gameList.innerHTML = games.map((game, i) => {
            const group = game.charAt(0);
            const numbers = game.split(' ')[1];
            let digitsHtml = `<div class="digit group-digit">${group}</div><div class="separator">조</div>`;
            for(let digit of numbers) {
                digitsHtml += `<div class="digit">${digit}</div>`;
            }
            return `
                <div class="game-card">
                    <div class="game-info">
                        <div class="game-label">${i+1}번째 게임 ${isLocal ? '(로컬)' : '(서버)'}</div>
                        <div class="digits">${digitsHtml}</div>
                    </div>
                    <button class="copy-btn" data-game="${game}" title="복사하기">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>`;
        }).join('');
    };

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
            const response = await fetch('/api/pension-lotto');
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
        const games = Array.from({length: 5}, () => {
            const group = Math.floor(Math.random() * 5) + 1;
            const nums = Array.from({length: 6}, () => Math.floor(Math.random() * 10)).join('');
            return `${group}조 ${nums}`;
        });
        renderGames(games, true);
    });
});
