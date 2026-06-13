# Intent–Result Alignment in AI-Assisted Development

A practical tutorial based on building this Tic-Tac-Toe game end-to-end with an AI agent.

---

## What Is Intent–Result Alignment (IRA)?

**IRA** measures how closely the AI's output matches what you actually wanted.  
Low IRA = wasted iterations, broken code, frustration.  
High IRA = the AI produces something useful on the first or second try.

This session was tracked to study exactly which prompting techniques improve
IRA. This document codifies what worked, what didn't, and why.

---

## The Core Insight: The Prompt Ladder

Every prompt falls on a ladder of specificity:

| Level | Example | IRA |
|-------|---------|-----|
| **Aspirational** | *"Make it look cool"* | Very low |
| **Functional** | *"Add Google Sign-In"* | Medium |
| **Constrained** | *"Add Google Sign-In using GIS, fallback to guest, persist in localStorage"* | High |
| **Behavioural** | *"When the user clicks Sign In, show the Google picker. After callback, show avatar in nav. If GIS fails, show a Guest button that creates a local session."* | Very high |
| **Exemplar** | *"Like the sign-in on this reference site: <URL>. Only the modal part, not the full page."* | Highest |

The trick is knowing **how far up the ladder to start** and **when to climb**.

---

## Technique 1 — The Phase Contract (Scope Control)

**The mistake:** Describe everything upfront.  
**The fix:** Build in phases. Each phase has one clear goal. The AI never holds
more than ~5 files of context; dumping a 20-point spec causes the middle items
to be forgotten or implemented badly.

### This session's phases

```
Phase 1: "Create a tic-tac-toe game"              → core game loop
Phase 2: "Redesign with glassmorphism, neon"       → theme only
Phase 3: "Add Google Sign-In"                      → auth only
Phase 4: "Add AI opponent, three difficulties"     → AI only
Phase 5: "Make it a PWA"                           → offline/manifest
Phase 6: "Credentials from GH secrets"             → security/deploy
```

Each phase touched at most 3–4 files. The AI could reason about each one
completely.

**IRA rule:** If your prompt mentions more than 3 concerns, split it.

---

## Technique 2 — The Delta Prompt (Refinement)

**The mistake:** Re-explaining the entire feature when asking for a change.  
**The fix:** Describe only the delta from the current state.

### Bad (low IRA)

> *"The AI opponent isn't very fun. Can you make it smarter? I was thinking
> you could use minimax with alpha-beta pruning. The difficulty should be
> Easy, Normal, Hard. Easy does random, Normal does depth-limited..."*  
> *(AI reads "minimax with alpha-beta pruning", over-engineers Easy,
> ignores the depth cap)*

### Good (high IRA)

> *"Make Easy occasionally make smart moves (30 %) so it doesn't feel
> completely braindead, but still loses most games."*

The AI already knows the architecture. It just needs the change.

**IRA rule:** After the first prompt in a phase, every follow-up should be
2–3 sentences max. If you need more, you skipped a phase.

---

## Technique 3 — The Symptom Report (Bug Fixes)

**The mistake:** Telling the AI what code to change.  
**The fix:** Describe what you see; let the AI diagnose.

### Bad (low IRA)

> *"In `render()` on line 142, you're doing
> `cell.textContent = mark || ''` but this clears the cell when the AI
> takes its turn because `mark` is null during the thinking delay."*

The AI doesn't learn from this — it just executes. It also might miss the
root cause if your diagnosis is wrong.

### Good (high IRA)

> *"When the AI plays, the hover preview marker disappears as soon as the
> AI takes its turn."*

The AI reads `render()`, finds the bug (`textContent` being cleared),
checks the hover handler, notices the missing `isCpuThinking` guard,
and fixes both problems in one pass.

**IRA rule:** Describe the symptom, attach the relevant file, let the AI
triage. The AI is better at root-cause analysis than most humans.

---

## Technique 4 — Constraint-First (Security / Production)

**The mistake:** *"Store the Google client ID somewhere safe."*  
**The fix:** *"Google credentials should come from GH secrets, not raw
hardcoded."*

The AI has a strong drive to produce working code. If you don't constrain
*how*, it will pick the path of least resistance (hardcoding). You must
state the constraint before the AI commits to a plan.

### In this session

The prompt *"Google credentials should come from GH secrets not raw
hardcoded"* produced the desired outcome on the first try. But it took
several approaches under the hood that the AI tried and rejected before
settling on the right one:

1. ❌ Store in a `.env` file (gitignored) — *still needs manual setup*
2. ❌ `process.env` at build time — *static site, no server*
3. ❌ Browser `env.js` served only in prod — *complex, fragile*
4. ✅ GitHub Actions + `${{ secrets.GOOGLE_CLIENT_ID }}` + placeholder

**IRA rule:** For security, correctness, or compatibility, state the
constraint in the first sentence. The AI explores fewer dead ends.

---

## Technique 5 — Design by Reference

**The mistake:** *"Make it look modern."*  
**The fix:** *"Glassmorphism style: backdrop-filter blur, dark background,
parallax mouse effect, neon X and O."*

The AI has seen glassmorphism, neon, parallax — but it needs the keywords
to map them to CSS. "Modern" is semantically empty to the model.

### Reference packing

A single prompt packed 5 visual elements:

```
backdrop-filter blur       → .glass class with backdrop-filter: blur(12px)
dark background             → radial-gradient(#0a0a0f, #1a0a2e, #0d1b2a)
parallax mouse effect       → mousemove listener shifting background-position
neon X (#00d4ff)            → text-shadow: 0 0 10px #00d4ff, 0 0 40px #00d4ff
neon O (#ff2d95)            → same with pink
```

Each keyword maps to a CSS property the AI already knows.

**IRA rule:** Use the vocabulary of the target technology. "Make it pop" is
not CSS. "Neon text-shadow" is.

---

## Technique 6 — The Pivot Prompt (Correcting Direction)

Sometimes the AI goes down the wrong path entirely. The fix is not to
explain why it's wrong, but to give the correct approach directly.

### In this session

The AI wanted to keep `google.accounts.id.prompt()` for auto sign-in,
despite it causing FedCM errors. Two approaches:

**Low IRA — explaining:**
> *"FedCM is a new Chrome permission model. The prompt() call triggers a
> browser dialog that users reject. It's better UX to only sign in on
> click."*  
> *(AI adds a try-catch but keeps prompt(), because it thinks the issue
> is error handling, not the call itself.)*

**High IRA — pivoting:**
> *"Google prompt() throws FedCM errors. Remove it and rely on the
> click-to-sign-in flow only. Make guest button always visible."*  
> *(AI deletes the prompt() call and adjusts the guest logic.)*

**IRA rule:** When the AI is on the wrong track, don't explain — prescribe.
Save the explanation for the delta prompt that refines a correct approach.

---

## Technique 7 — The Checklist Close (Explicit Verification)

**The mistake:** Assuming the AI remembers everything it built.  
**The fix:** Ask for specific proofs.

### In this session

After the PWA phase, `ai.js` was not in the SW precache. The AI forgot to
add it because the SW file was opened 5+ conversation turns ago.

The fix wasn't a new technique — it was a simple prompt:

> *"Update sw.js to cache ai.js"*

But the IRA lesson is: **the AI's working memory is ~4 files and ~8 turns.**
If a file hasn't been mentioned in a while, it effectively doesn't exist to
the model unless you re-reference it.

### Practical checklist prompts

```
"Verify the site loads offline."
"Check that the failed test case now passes."
"Is the new file in the PR?"
"Run the linter."
"Does config.js still contain the placeholder or the real secret?"
```

**IRA rule:** End each phase with a verification prompt. Treat the AI like
a junior developer who needs to be reminded to check their work.

---

## The IRA Scoring Rubric

Use this to audit your own prompting:

| Criterion | Bad (0) | OK (1) | Good (2) |
|-----------|---------|--------|----------|
| **Scope** | Multiple features in one prompt | One feature, vague | One feature, precise |
| **Constraints** | None stated | Mentioned after AI starts | Stated first |
| **Refinement** | Re-explains everything | Partial re-explanation | 2-sentence delta |
| **Bug report** | Tells AI what code to change | Describes symptom, no file | Describes symptom + relevant file |
| **Verification** | None | "Does it work?" | Specific check ("Is ai.js in the PRECACHE?") |

**Target:** 8–10 per phase. Below 6 means you're iterating more than
necessary.

---

## Putting It All Together — A Worked Example

### The naive approach (IRA ≈ 3/10)

> *"Build me a tic-tac-toe game. Make it look modern with glassmorphism,
> add Google sign-in, make it a PWA, and add an AI that's smart. Use
> GitHub Actions to deploy with secrets."*

The AI will produce something, but each feature will be shallow,
cache files will be missing, secrets will be hardcoded, and the AI
won't be sure about any of it.

### The IRA approach (IRA ≈ 9/10)

```
Phase 1: "Create a tic-tac-toe game in /workspace/tic-tac-toe-game."
         "Check win detection works: X horizontal, O vertical, X diagonal."
Phase 2: "Redesign with glassmorphism: backdrop-filter blur, dark gradient,
          parallax mouse effect, neon X (#00d4ff) and O (#ff2d95)."
         "Make the dark theme deeper — navy/purple, not grey."
Phase 3: "Add Google Sign-In using GIS. Fallback to guest if it fails.
          Show avatar in nav. Persist session in localStorage."
         "Remove prompt() — it causes FedCM errors. Guest always visible."
Phase 4: "Add AI: Easy (random), Normal (depth-3 minimax), Hard (full minimax).
          Let player toggle 2P vs CPU and select difficulty."
         "Make Easy 30% smart so it isn't braindead."
Phase 5: "Make it a PWA: manifest, service worker cache-first, icons."
Phase 6: "Credentials from GH secrets, not hardcoded."
         "Verify config.js does not contain the real client ID on the live site."
```

Each phase is precise. Each has a verification. Refinements are deltas.
The result is a production-quality game built in 6 focused rounds with
zero wasted code.

---

## Summary: The IRA Cheat Sheet

```
┌─────────────────────────────────────────────────────────┐
│ 1. Phase contract — one goal per prompt                 │
│ 2. Delta prompt — describe the change, not the context  │
│ 3. Symptom report — tell what you see, not what to fix  │
│ 4. Constraint first — state security/limits up front    │
│ 5. Design by reference — use the technology's vocabulary│
│ 6. Pivot prompt — prescribe, don't explain, when wrong  │
│ 7. Checklist close — verify explicitly                  │
└─────────────────────────────────────────────────────────┘
```
