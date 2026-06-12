const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const scoreWinsEl = document.getElementById('scoreWins');
const scoreLossesEl = document.getElementById('scoreLosses');
const scoreDrawEl = document.getElementById('scoreDraw');
const winLineEl = document.getElementById('winLine');
const parallaxBg = document.getElementById('parallaxBg');

let board, currentPlayer, gameActive;

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6],
];

function init() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  winLineEl.classList.remove('visible');
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('x', 'o', 'taken', 'win', 'fade', 'pop-in');
  });
  render();
}

function render() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    const mark = board[i];
    cell.className = 'cell' + (mark ? ' taken ' + mark.toLowerCase() : '');
    cell.textContent = mark || '';
    if (mark && !cell.classList.contains('pop-in')) {
      cell.classList.add('pop-in');
    }
  });
  statusEl.textContent = gameActive
    ? `Player ${currentPlayer}'s turn`
    : statusEl.textContent;
  const stats = Profile.getStats();
  scoreWinsEl.textContent = stats.wins;
  scoreLossesEl.textContent = stats.losses;
  scoreDrawEl.textContent = stats.draws;
}

function checkWinner() {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: pattern };
    }
  }
  return board.every(cell => cell) ? { winner: 'draw', line: null } : null;
}

function highlightWin(line) {
  const cells = document.querySelectorAll('.cell');
  line.forEach(i => cells[i].classList.add('win'));
  document.querySelectorAll('.cell:not(.win)').forEach(c => c.classList.add('fade'));

  const rects = line.map(i => cells[i].getBoundingClientRect());
  const boardRect = boardEl.getBoundingClientRect();
  const startX = rects[0].left + rects[0].width / 2 - boardRect.left;
  const startY = rects[0].top + rects[0].height / 2 - boardRect.top;
  const endX = rects[2].left + rects[2].width / 2 - boardRect.left;
  const endY = rects[2].top + rects[2].height / 2 - boardRect.top;

  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  winLineEl.style.cssText = `
    width: ${length}px;
    left: ${startX}px;
    top: ${startY}px;
    transform: rotate(${angle}deg);
    transform-origin: 0 0;
  `;
  requestAnimationFrame(() => winLineEl.classList.add('visible'));
}

function handleMove(e) {
  const cell = e.target.closest('.cell');
  if (!cell || !gameActive) return;
  const index = parseInt(cell.dataset.index);
  if (board[index]) return;

  board[index] = currentPlayer;
  cell.classList.add('pop-in');
  const result = checkWinner();

  if (result) {
    gameActive = false;
    if (result.winner === 'draw') {
      Profile.recordDraw();
      statusEl.textContent = "It's a draw!";
    } else {
      if (result.winner === 'X') Profile.recordWin();
      else Profile.recordLoss();
      statusEl.textContent = `Player ${result.winner} wins!`;
      highlightWin(result.line);
    }
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
  render();
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  winLineEl.classList.remove('visible');
  statusEl.textContent = "Player X's turn";
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('x', 'o', 'taken', 'win', 'fade', 'pop-in');
  });
  render();
}

boardEl.addEventListener('click', handleMove);
resetBtn.addEventListener('click', resetGame);

const cellEls = document.querySelectorAll('.cell');
cellEls.forEach(cell => {
  cell.addEventListener('mouseenter', () => {
    if (!gameActive || board[cell.dataset.index]) return;
    cell.classList.add('hover-' + currentPlayer.toLowerCase());
  });
  cell.addEventListener('mouseleave', () => {
    cell.classList.remove('hover-x', 'hover-o');
  });
});

function updateAuthUI(user) {
  const display = document.getElementById('userDisplay');
  const loginContainer = document.getElementById('loginContainer');
  if (user) {
    display.innerHTML = `
      <a href="profile.html" class="user-link">
        ${Profile.renderAvatar(user, 28)}
        <span class="user-name">${user.name}</span>
      </a>
    `;
    loginContainer.innerHTML = '<button class="gbtn gbtn-sm" onclick="Auth.signOut();location.reload()">Sign Out</button>';
  } else {
    display.innerHTML = '';
    Auth.renderButton('loginContainer');
  }
}

Auth.onAuthChange(updateAuthUI);
updateAuthUI(Auth.getUser());
init();

document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  parallaxBg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
});
