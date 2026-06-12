# Tic-Tac-Toe Game

Vanilla JS game — no build step, no dependencies, no package manager.

## Commands

```bash
python3 -m http.server 8080
```

## Structure

| File | Role |
|------|------|
| `index.html` | Game board with auth-aware nav |
| `profile.html` | Gamer profile with stats |
| `script.js` | Game logic (board, win detection, moves) |
| `config.js` | Google OAuth client ID + app config |
| `auth.js` | Google Sign-In (GIS) + localStorage session |
| `profile.js` | Stats tracking (localStorage per user) |
| `style.css` | Neon theme + profile layout |

## Auth

- Uses Google Identity Services (`accounts.google.com/gsi/client`)
- Falls back to "Play as Guest" if `config.js` has no client ID
- Auth state + game stats persist in localStorage per user
- To enable real Google sign-in: set `googleClientId` in `config.js` and add your GitHub Pages URL to the OAuth consent screen authorized origins
