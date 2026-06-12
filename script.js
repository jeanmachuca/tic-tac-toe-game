const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');

let board, currentPlayer, gameActive, scores;

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6],
];

function init() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  scores = { X: 0, O: 0, draw: 0 };
  render();
}

function render() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    cell.textContent = board[i] || '';
    cell.className = 'cell' + (board[i] ? ' taken' : '');
    if (board[i]) cell.classList.add(board[i].toLowerCase());
  });
  statusEl.textContent = gameActive
    ? `Player ${currentPlayer}'s turn`
    : statusEl.textContent;
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
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
  line.forEach(i => {
    document.querySelector(`.cell[data-index="${i}"]`).classList.add('win');
  });
}

function handleMove(e) {
  const cell = e.target;
  const index = parseInt(cell.dataset.index);
  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  const result = checkWinner();

  if (result) {
    gameActive = false;
    if (result.winner === 'draw') {
      scores.draw++;
      statusEl.textContent = "It's a draw!";
    } else {
      scores[result.winner]++;
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
  statusEl.textContent = "Player X's turn";
  render();
}

boardEl.addEventListener('click', handleMove);
resetBtn.addEventListener('click', resetGame);

init();
