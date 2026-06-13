const AI = (() => {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
  ];

  function available(board) {
    return board.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);
  }

  function winner(board) {
    for (const p of winPatterns) {
      const [a,b,c] = p;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  }

  function minimax(board, depth, isMax, aiPlayer, humanPlayer, maxDepth) {
    const w = winner(board);
    if (w === aiPlayer) return 10 - depth;
    if (w === humanPlayer) return depth - 10;
    if (available(board).length === 0) return 0;
    if (maxDepth && depth >= maxDepth) return 0;

    const moves = available(board);
    if (isMax) {
      let best = -Infinity;
      for (const m of moves) {
        board[m] = aiPlayer;
        best = Math.max(best, minimax(board, depth + 1, false, aiPlayer, humanPlayer, maxDepth));
        board[m] = null;
      }
      return best;
    } else {
      let best = Infinity;
      for (const m of moves) {
        board[m] = humanPlayer;
        best = Math.min(best, minimax(board, depth + 1, true, aiPlayer, humanPlayer, maxDepth));
        board[m] = null;
      }
      return best;
    }
  }

  function bestMove(board, aiPlayer, humanPlayer, maxDepth) {
    let bestScore = -Infinity;
    let bestMoves = [];
    for (const m of available(board)) {
      board[m] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer, humanPlayer, maxDepth);
      board[m] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [m];
      } else if (score === bestScore) {
        bestMoves.push(m);
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  function easy(board, player) {
    const opp = player === 'X' ? 'O' : 'X';
    const av = available(board);
    if (av.length === 0) return null;

    if (Math.random() < 0.3) {
      const w = winner(board);
      if (w) return null;
      const c = [...board];
      for (const m of av) {
        c[m] = player;
        if (winner(c) === player) return m;
        c[m] = null;
      }
    }

    return av[Math.floor(Math.random() * av.length)];
  }

  function normal(board, player) {
    const opp = player === 'X' ? 'O' : 'X';
    return bestMove([...board], player, opp, 3);
  }

  function hard(board, player) {
    const opp = player === 'X' ? 'O' : 'X';
    return bestMove([...board], player, opp, null);
  }

  function getMove(board, difficulty, player) {
    const b = [...board];
    switch (difficulty) {
      case 'easy': return easy(b, player);
      case 'normal': return normal(b, player);
      case 'hard': return hard(b, player);
      default: return hard(b, player);
    }
  }

  return { getMove };
})();
