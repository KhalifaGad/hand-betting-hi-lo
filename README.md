# Hi-Lo Hand Betting

A neon Mahjong-flavoured hi-lo betting game built with Angular 22. You're dealt a
hand of tiles; bet whether the **next** hand's total will be **higher** or
**lower**. Chain wins to build a streak (and your score), but watch the honor
tiles — each one you play drifts toward a knockout, and if any copy hits the edge
the game is over.

**Live:** https://khalifagad.github.io/hand-betting-hi-lo/

---

## How to play

- Each hand has a **total** (the sum of its tiles). Bet **Higher** or **Lower** on
  the next hand's total relative to the current one. A correct call is a **win**, a
  tie is a **push** (no change), otherwise a **loss**.
- **Scoring:** each win advances your **streak** and adds `streak × 100` to your
  score. A loss resets the streak.
- **Honor tiles drift:** every honor tile in a hand you play moves **+1 on a win**
  and **−1 on a loss**. When any honor copy reaches **0 or 10**, that tile is
  knocked out and the game ends.
- **The deck reshuffles:** when the draw pile runs dry it merges a fresh deck back
  in (up to a configurable number of reshuffles). The honor population grows with
  each reshuffle — veterans keep their drifted values, fresh copies enter at 5.

**Keyboard:** `←` bet lower · `→` bet higher · `G` toggle the end-of-game summary preview.

---

## Getting started

**Prerequisites:** Node `22.12+` (an [`.nvmrc`](.nvmrc) pins `22.22.3`) and npm `10+`.

```bash
nvm use            # picks up .nvmrc
npm ci             # install exact, locked dependencies

npm start          # dev server at http://localhost:4200
npm test           # run the unit/component suite (vitest + jsdom, headless)
npm run build      # production build → dist/hand-betting-hi-lo/browser
npm run lint       # eslint
npm run format     # prettier --write
```

---

## Architecture

The codebase separates **pure game rules** from the **Angular reactive shell**, and
depends on **abstractions at every seam** so pieces are swappable and testable.

```
src/app/
  core/                     app-wide, framework-light building blocks
    config/                 GAME_CONFIG — all tunable rules in one place
    models/                 shared domain types (Tile, GameView, GameRun, …)
    persistence/            GameResultRepository (interface + token) + localStorage impl
  features/
    game/
      services/game-engine/ engine + the pure collaborators it orchestrates
        scorer.ts           pure: score + streak transitions
        scaler.ts           pure: honor-value drift + bust detection
        deck.ts             pure: create / shuffle / draw / reshuffle
        game-engine.service.ts  the Angular shell: owns signals, exposes GameView
      components/           presentational UI (hand, bet controls, tile board, …)
    landing/                landing page + leaderboard presenter
  shared/                   reusable presentational pieces (mahjong tile, …)
```

**Key decisions:**

- **Pure rules vs. reactive shell.** `Scorer`, `Scaler`, and `Deck` are plain,
  framework-free classes — deterministic, no Angular, unit-tested without `TestBed`.
  `GameEngineService` is a thin shell that holds the state as **signals** and
  delegates every transition to those collaborators. The game logic is portable and
  trivially testable; Angular only handles reactivity.
- **Swappable seams via DI tokens.** The UI depends on a `GameService` interface
  (`GAME_SERVICE` token), never the concrete engine. Persistence is a
  `GameResultRepository` interface (`GAME_RESULT_REPOSITORY` token) with a localStorage
  implementation today — an HTTP backend later wouldn't touch the engine or the UI.
- **Config-driven rules.** Every rule lives in `GAME_CONFIG`, so behaviour changes
  without code changes (see below). The UI reads thresholds from config too, so the
  display always matches the rules.
- **Determinism by injection.** `Deck` takes its id generator and RNG as
  constructor params, so shuffles/ids can be seeded in tests instead of relying on
  `Math.random`/`crypto`.
- **Store raw, derive views.** The repository keeps every run; "top 5" and "games
  played" are read-side projections. The leaderboard service is a thin presenter
  that maps stored runs into display rows.

### Configuration

All rules are centralised in [`core/config/game-config.ts`](src/app/core/config/game-config.ts):

| Key | Default | Meaning |
|---|---|---|
| `handSize` | `2` | Tiles dealt per hand |
| `tileRepetition` | `4` | Copies of each tile face per deck |
| `maxReshuffles` | `3` | Reshuffles allowed before the deck is exhausted |
| `honorStart` | `5` | Starting value of every honor tile |
| `dangerLow` / `dangerHigh` | `3` / `7` | Edge band — markers turn red, row flags "at risk" |
| `bustLow` / `bustHigh` | `0` / `10` | Knockout thresholds — game over when an honor hits either |
| `scorePerStreak` | `100` | Points per win, multiplied by the current streak |

---

## Testing

`npm test` runs the suite via the Angular `unit-test` builder (vitest + **jsdom**,
so no real browser is needed — it runs headless in CI). Coverage spans the pure
rule classes (`Scorer`, `Scaler`, `Deck` logic), the leaderboard presenter, and the
key components, with reduced-motion / SSR-safe resting states verified.

---

## Deployment

Pushing to `master` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which installs, **runs the tests as a gate**, builds with the project base-href,
adds an `index.html`→`404.html` SPA fallback, and publishes to **GitHub Pages**.

> One-time setup: enable **Settings → Pages → Source → "GitHub Actions"** on the repo.

---

## Accessibility

Built to WCAG AA: semantic roles and ARIA labels, full keyboard play (arrow keys +
shortcuts), focus management for the mobile sheet/overlays, OKLCH colour tokens
tuned for contrast, and `prefers-reduced-motion` honoured throughout (every
animation resolves to a correct resting state).

---

## Known limitations / trade-offs

- **Local, single-player persistence.** Scores live in the browser's
  `localStorage` (per-device). The repository abstraction is in place so a shared
  backend could be added without touching the engine or UI.
- **No server.** This is a fully client-side app — there's no auth, sync, or
  cross-device leaderboard.

---

## AI vs. hand-authored

This project used AI as a directed tool, not an autopilot — I owned the
architecture and game design, and reviewed/iterated on generated code rather than
accepting it blindly.

- **Hand-authored:** the game engine and rules (`Scorer`, `Scaler`, `Deck`,
  reshuffle/bust flow), the leaderboard + persistence logic, and the overall module
  structure and abstractions (the DI seams, config-driven design).
- **AI-assisted:** the visual design (produced with Claude Design) and its handoff
  spec; UI component implementation and styling built from that handoff with Claude
  Code; test scaffolding; and this README + CI workflow.

Authorship is mixed in places (e.g. the leaderboard *logic* is hand-written while
some of its *tests* were AI-assisted) — the split above describes where each
primarily contributed.
