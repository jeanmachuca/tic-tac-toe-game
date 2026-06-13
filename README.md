# Tic-Tac-Toe — AI-Assisted Development Diary

A classic Tic-Tac-Toe game built entirely through AI-assisted development.  
**Play:** https://jeanmachuca.github.io/tic-tac-toe-game/

## Overview

Every line was written by an AI agent ([opencode](https://opencode.ai/)) in
response to natural-language prompts. This README documents the prompts,
decisions, and reasoning behind each feature — preserving the process as a
reference for AI-assisted development.

---

## Prompt Index

| # | Prompt | What It Built |
|---|--------|---------------|
| 1 | *Create a tic-tac-toe game in a new folder* | Basic game loop, 3×3 board, win/draw detection |
| 2 | *Redesign with glassmorphism, parallax, neon* | Dark gradient theme, glass panels, neon X/O, glow effects |
| 3 | *Add Google Sign-In* | GIS auth, Guest fallback, session persistence |
| 4 | *Add an AI opponent with difficulty levels* | Minimax AI (easy/normal/hard), mode toggle |
| 5 | *Make it a PWA* | Service worker, manifest, SVG icons |
| 6 | *Move Google credentials to secrets* | GitHub Actions deploy, secret injection |

---

## Phase 1 — Core Game

**Prompt:** *Create a tic-tac-toe game in a new folder under /workspace. Vanilla HTML/CSS/JS, no build step.*

The initial prompt produced a minimal but complete game:

- 3×3 board rendered as a CSS Grid
- Click-to-place with X/O alternation
- Win detection (8 lines: 3 rows, 3 columns, 2 diagonals)
- Draw detection (board full, no winner)
- Scoreboard tracking X wins, O wins, draws per session (in-memory object)
- Reset button clearing the board, keeping scores

**Key decisions made by the AI:**

- Board represented as a 2D array of null/'X'/'O'
- Win check iterates the 8-line array every move (no memoization — the board is small enough that optimisation is unnecessary complexity)
- Re-render on every state change (no virtual DOM — vanilla JS is fine for ~9 cells)

---

## Phase 2 — Glassmorphism + Neon Theme

**Prompt:** *Redesign with glassmorphism style: backdrop-filter blur, dark background, parallax mouse effect, neon X and O, glowing win line.*

The AI reworked the entire visual layer while keeping the game logic untouched:

- **Background:** Radial-gradient dark cinematic (`#0a0a0f` base, `#1a0a2e` purple, `#0d1b2a` blue)
- **Glass panels:** `backdrop-filter: blur(12px)` with `rgba(255,255,255,0.05)` backgrounds
- **Neon X:** `#00d4ff` with `text-shadow` glow
- **Neon O:** `#ff2d95` with `text-shadow` glow
- **Hover preview:** Ghosted X/O appears in the cell before clicking (only for valid moves)
- **Win line:** Gradient `linear-gradient(90deg, #00d4ff, #ff2d95)` positioned absolutely over winning cells
- **Parallax:** Mousemove listener shifts background-position fractionally

**Prompt refinement:** The initial glassmorphism output used a light theme. Follow-up prompt: *Keep glassmorphism but make it a dark theme — deep navy/purple gradient, neon cyan and pink marks, subtle border glow on hover.* This produced the final look.

---

## Phase 3 — Google Sign-In

**Prompt:** *Add Google Sign-In using the GIS library (accounts.google.com/gsi/client). On sign-in, show the user's Google name/avatar in the nav. Fall back to guest mode if sign-in fails or is blocked.*

**What the AI produced:**

- `config.js` with `googleClientId` — single source of truth for OAuth config
- `auth.js` — GIS initialization, callback handling, session persistence via `localStorage`
- Auth-aware nav in `index.html` — shows avatar + name when signed in, "Sign In" button when not
- Guest fallback button visible even when Google sign-in is offered
- `profile.html` + `profile.js` — per-user stats stored in `localStorage.tictactoe_stats`
- Stats grouped by user ID (Google sub or guest UID): wins, losses, draws, total games, win rate

**Key decision — config pattern:** The AI chose `APP_CONFIG` (a const global) rather than inline script vars or data attributes. This made it easy to inject secrets at deploy time later (Phase 6).

**Prompt refinement — FedCM fix:** The `google.accounts.id.prompt()` call triggered FedCM errors in Chrome. Fix prompt: *Google prompt() throws FedCM errors. Remove it and rely on the click-to-sign-in flow only. Make guest button always visible.* The AI removed `prompt()` and kept guest as an always-visible fallback.

---

## Phase 4 — AI Opponent

**Prompt:** *Add an AI opponent. Three difficulty levels: Easy (random, occasionally smart), Normal (minimax depth 3), Hard (full minimax). Let the player toggle between 2-player mode and vs-CPU mode, and select difficulty.*

**What the AI built:**

- `ai.js` — self-contained `AI` object with no module system
- **Easy:** 70 % random, 30 % smart (blocks obvious wins, takes obvious wins)
- **Normal:** Minimax with depth limit 3 (explores 3 plies ahead)
- **Hard:** Full minimax (explores full tree, unbeatable in 3×3)
- Mode bar in HTML: `[2 Players] [vs CPU]` toggle + `[Easy] [Normal] [Hard]`
- CPU plays as O, delays 400 ms (`setTimeout`), cells are locked during AI "thinking"
- Game resets on mode/difficulty change

**Prompt refinement — Easy difficulty:** The first AI output made Easy purely random. Follow-up: *Make Easy occasionally make smart moves (30 %) so it doesn't feel completely braindead, but still loses most games.* The AI added a 30 % chance to pick a blocking/winning move.

**Prompt refinement — Marker disappearing:** *When the AI plays, the hover preview marker disappears as soon as the AI takes its turn. The hover logic should account for isCpuThinking. Also, the AI's marker duration is too fast — the fade-out triggers during the AI's delay.* The AI fixed the render function to set `textContent` (it was clearing without re-setting for empty cells) and added `isCpuThinking` state checks in the hover handler.

---

## Phase 5 — PWA

**Prompt:** *Make it installable as a PWA. Add a service worker with cache-first strategy, a web app manifest, and SVG icons. Include Apple meta tags for iOS.*

**What the AI produced:**

- `manifest.json` — standalone display, theme colour `#0a0a1a`, SVG icons at 192 and 512
- `sw.js` — install event precaches app files, fetch event serves from cache with network fallback
- `icon-192.svg` and `icon-512.svg` — neon X/O symbol on transparent background
- `<link>` tags for manifest + Apple touch icon + status bar style

**Key decision — cache strategy:** The AI chose cache-first (offline-first) for all app assets and network-first for external URLs (Google API). This ensures the game loads without internet after the first visit.

**Prompt refinement — PRECACHE completeness:** The AI originally forgot to list `ai.js` in the PRECACHE array. A later prompt caught this and the AI fixed it alongside the AI feature PR.

---

## Phase 6 — GitHub Secrets

**Prompt:** *Google credentials should come from GH secrets not raw hardcoded.*

**What changed:**

- `config.js` placeholder `__GOOGLE_CLIENT_ID__` replaces the hardcoded value
- `.github/workflows/deploy.yml` injects `${{ secrets.GOOGLE_CLIENT_ID }}` at deploy time
- Pages switched from legacy (branch-based) to **GitHub Actions deployment**
- `GOOGLE_CLIENT_ID` stored as a repo secret

**Prompt refinement — switching deployment mode:** The AI had to switch the Pages `build_type` from `legacy` to `workflow` via the GitHub API (`gh api -X PUT ...`) after creating the workflow file, since legacy Pages doesn't run workflows.

---

## Lessons Learned

### What worked well

- **Iterative prompts** — building in phases (game → theme → auth → AI → PWA → secrets) with small, focused prompts produced clean, layered code
- **Chat-style follow-ups** — refining one aspect at a time (e.g. "make Easy smarter") was faster than trying to specify everything upfront
- **Self-correction** — when the AI made mistakes (FedCM errors, marker disappearing, missing cache entries), describing the symptom was enough for a fix

### Where the AI stumbled

- **FedCM prompt() behaviour** — the AI didn't anticipate that `google.accounts.id.prompt()` would trigger browser permission errors. Needed a human report to switch to click-only flow.
- **PRECACHE omissions** — new files (like `ai.js`) weren't automatically added to the SW cache list. The AI needs explicit reminders.
- **Secrets in static sites** — the AI initially tried several approaches (env vars, build-time `.env`, gitignored config) before settling on GitHub Actions injection, because a static site has no server to inject secrets at request time.

### Prompting tips (from experience)

| Goal | Prompt Style |
|------|-------------|
| New feature | Describe the user-facing behaviour, not the implementation |
| Bug fix | Describe the symptom, attach the relevant file |
| Design change | Show don't tell — reference an existing visual style (e.g. "dark glassmorphism") |
| Refinement | Single-sentence delta from current state |
| Security | State the constraint explicitly ("from GH secrets, not hardcoded") |
