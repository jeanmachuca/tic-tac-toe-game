const Profile = (() => {
  function getStats() {
    const user = Auth.getUser();
    if (!user) return { wins: 0, losses: 0, draws: 0, total: 0 };
    const all = JSON.parse(localStorage.getItem('tictactoe_stats') || '{}');
    return all[user.uid] || { wins: 0, losses: 0, draws: 0, total: 0 };
  }

  function saveStats(stats) {
    const user = Auth.getUser();
    if (!user) return;
    const all = JSON.parse(localStorage.getItem('tictactoe_stats') || '{}');
    all[user.uid] = stats;
    localStorage.setItem('tictactoe_stats', JSON.stringify(all));
  }

  function recordWin() {
    const s = getStats();
    s.wins++; s.total++;
    saveStats(s);
  }

  function recordLoss() {
    const s = getStats();
    s.losses++; s.total++;
    saveStats(s);
  }

  function recordDraw() {
    const s = getStats();
    s.draws++; s.total++;
    saveStats(s);
  }

  function resetStats() {
    saveStats({ wins: 0, losses: 0, draws: 0, total: 0 });
  }

  function winRate() {
    const s = getStats();
    return s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0;
  }

  function renderAvatar(user, size) {
    const px = size || 40;
    if (user.photoURL) {
      return `<img src="${user.photoURL}" width="${px}" height="${px}" class="avatar" alt="">`;
    }
    const initial = (user.name || '?')[0].toUpperCase();
    return `<div class="avatar avatar-fallback" style="width:${px}px;height:${px}px;font-size:${px*0.45}px">${initial}</div>`;
  }

  function renderCompact(user) {
    if (!user) return '';
    return `
      <div class="user-compact">
        ${renderAvatar(user, 32)}
        <span class="user-name">${user.name}</span>
      </div>
    `;
  }

  function renderFull(user) {
    if (!user) return '';
    const stats = getStats();
    return `
      <div class="profile-card">
        ${renderAvatar(user, 80)}
        <h2>${user.name}</h2>
        ${user.email ? `<p class="profile-email">${user.email}</p>` : ''}
        <div class="stats-grid">
          <div class="stat"><span class="stat-val">${stats.total}</span><span class="stat-lbl">Games</span></div>
          <div class="stat"><span class="stat-val wins">${stats.wins}</span><span class="stat-lbl">Wins</span></div>
          <div class="stat"><span class="stat-val losses">${stats.losses}</span><span class="stat-lbl">Losses</span></div>
          <div class="stat"><span class="stat-val draws">${stats.draws}</span><span class="stat-lbl">Draws</span></div>
          <div class="stat"><span class="stat-val">${winRate()}%</span><span class="stat-lbl">Win Rate</span></div>
        </div>
        <button class="reset reset-sm" onclick="Profile.resetStats();renderFull(Auth.getUser())">Reset Stats</button>
      </div>
    `;
  }

  return { recordWin, recordLoss, recordDraw, renderCompact, renderFull, getStats, resetStats };
})();
