# AlgoArchitect — MVP Sprint Plan

> Source: *Product Requirements Document (PRD): AlgoArchitect*
> Version: 1.0 · Created: 2026-11-04 · Status: Draft for team review

---

## 1. Planning Summary

| Item | Decision |
|---|---|
| Product | AlgoArchitect: a mobile-first, offline-first PWA that trains engineers to match real-world architecture scenarios to algorithms and data structures |
| Team | Small team (2–4 people). The plan assumes **3 developers** plus a part-time designer/content reviewer |
| Cadence | **2-week sprints**, Monday → Friday of the following week |
| Sprints | Sprint 0 + Sprints 1–5 (6 sprints, 12 working weeks) |
| Start | **Mon 2026-11-09** |
| Holiday break | **Mon 2026-12-21 → Fri 2027-01-01** (no sprint) |
| MVP delivery | **Fri 2027-02-12** |
| Stack | React 18 + Vite + TypeScript, Workbox (`vite-plugin-pwa`), Zustand, Dexie (IndexedDB), Tailwind CSS, Vitest + Testing Library, Playwright |
| Backend | **None for the MVP.** All progress stays on the device. Cloud sync and accounts come after the MVP |
| Hosting | Static hosting with HTTPS (Netlify / Vercel / GitHub Pages / Cloudflare Pages) |

### 1.1 Timeline at a glance

| Sprint | Dates | Theme | PRD phase | Milestone |
|---|---|---|---|---|
| Sprint 0 | Nov 09 – Nov 20, 2026 | Discovery, design & tooling | Pre-Phase 1 | M0: Repo, CI, design system, content schema approved |
| Sprint 1 | Nov 23 – Dec 04, 2026 | PWA foundation & mobile shell | Phase 1 | M1: Installable offline shell |
| Sprint 2 | Dec 07 – Dec 18, 2026 | Core game loop & content engine | Phase 2 | M2: Playable loop with 15 scenarios |
| — | Dec 21, 2026 – Jan 01, 2027 | Holiday break | — | — |
| Sprint 3 | Jan 04 – Jan 15, 2027 | Mini-validations & full content set | Phase 2 | M3: Content complete (50 scenarios) |
| Sprint 4 | Jan 18 – Jan 29, 2027 | Progression: spaced repetition, levels, streaks | Phase 3 | M4: Feature complete |
| Sprint 5 | Feb 01 – Feb 12, 2027 | Hardening, beta & launch | Release | **M5: MVP released** |

```
Nov 2026          Dec 2026              Jan 2027              Feb 2027
|--S0--|--S1--|--S2--|::break::|--S3--|--S4--|--S5--|
 09    23     07     21        04     18     01    12 ★ MVP
```

---

## 2. MVP Definition

### 2.1 Product goals → MVP success criteria

| PRD goal | How the MVP delivers it | Measurable target (beta) |
|---|---|---|
| Knowledge retention | Spaced-repetition queue resurfaces weak concepts | ≥ 60% of reviews answered correctly on the 2nd exposure |
| Pattern recognition | Scenario Matching + Mini-Validation over 50 real-world mappings | Average session accuracy improves ≥ 15% between a user's first and fifth sessions |
| Commute-friendly | One-handed, tap-only UI that works fully offline | 100% of game flows work in airplane mode; all primary actions sit in the bottom 40% of the screen; a session fits in ≤ 5 min |
| Progression & habit | XP, levels, daily streaks | ≥ 30% of beta testers keep a 3+ day streak |

### 2.2 In scope (MVP)

1. **PWA shell**: installable, service worker, offline caching, app manifest and icons.
2. **One-handed mobile UI**: bottom-anchored actions, large tap targets, works in portrait from 360 px wide.
3. **Scenario Matching**: a scenario or constraint with 3–4 candidate approaches. The user picks one and sees an explanation.
4. **Mini-Validation**, two interaction types:
   - **Big-O selection**: pick the time or space complexity.
   - **Trace-first-step**: tap the node, cell or element the algorithm visits or processes first.
5. **Content**: **50 hardcoded scenarios**, 10 for each of the 5 domains (Graphs & Routing, Dynamic Programming, Trees & Tries, Sorting & Searching, Hashing & Heaps).
6. **Session engine**: daily session made of due reviews plus new scenarios, with a session summary.
7. **Spaced repetition**: SM-2-style scheduler for each scenario and concept.
8. **Leveling**: XP per answer, level thresholds, level-up feedback.
9. **Daily streaks**: streak counter, local-day rollover, one streak freeze.
10. **Stats screen**: accuracy per domain, weakest concepts, streak, level.
11. **Local persistence**: IndexedDB (Dexie) with a schema version and migrations.
12. **Data portability**: export and import progress as JSON. This protects users while there is no cloud sync.
13. **Privacy-friendly analytics**, optional. Events are queued offline and flushed when back online. The PRD's "sync when back online" is reduced to this for the MVP.

### 2.3 Out of scope (after the MVP)

- User accounts, authentication, cross-device cloud sync.
- Leaderboards, social or sharing features.
- Content CMS or authoring UI. Content is a versioned JSON file in the repo.
- Procedurally generated scenarios. The "scenario generator" in the MVP **selects and shuffles** authored scenarios and does not create new ones.
- Push notifications for streak reminders (possibly a stretch goal in Sprint 5).
- Localization. The MVP is English only, but strings are kept in i18n files.
- Native app-store builds.

### 2.4 Key assumptions

- Team capacity is about **24 story points per sprint**: 3 devs × ~8 pts, Fibonacci points with 1 pt ≈ half a day.
- One dev also acts as **content owner** and writes or verifies scenarios. The designer is roughly 50% in Sprint 0 and Sprint 1, then about 20% after that.
- Ceremonies take about 10% of capacity and are already accounted for.

---

## 3. Team & Ways of Working

### 3.1 Roles

| Role | Responsibility |
|---|---|
| Product Owner (PO) | Owns the backlog, accepts stories, final call on scope. Can be one of the devs |
| Scrum Master / Facilitator | Runs ceremonies, tracks blockers and burndown. Rotates every sprint |
| Dev A: Platform | PWA, service worker, persistence, CI/CD, performance |
| Dev B: Gameplay/UI | Screens, game loop, mini-validation components, accessibility |
| Dev C: Content & Logic | Content schema, scenario authoring, SRS/XP/streak logic, tests |
| Designer (part-time) | Wireframes, design tokens, interaction specs, usability tests |

### 3.2 Ceremonies (per 2-week sprint)

| Ceremony | When | Length |
|---|---|---|
| Sprint Planning | Day 1 (Mon) | 1.5 h |
| Daily stand-up (async or sync) | Daily | 15 min |
| Backlog refinement | Day 6 (Mon, week 2) | 1 h |
| Sprint Review / Demo | Day 10 (Fri) | 45 min |
| Retrospective | Day 10 (Fri) | 45 min |

### 3.3 Definition of Ready (DoR)

- The story has a user-story statement, acceptance criteria, and an estimate.
- Designs are attached if the story has UI.
- Dependencies are identified and not blocking.
- For content: the scenario has a passed technical review.

### 3.4 Definition of Done (DoD)

- Code is merged to `main` through a PR with at least 1 approving review.
- Lint, type-check and unit tests pass in CI. Logic modules (`srs`, `xp`, `streak`, `content`) keep coverage ≥ 80%.
- It works offline in airplane mode where relevant.
- It is usable one-handed: primary actions are in the thumb zone and tap targets are ≥ 48×48 px.
- Accessibility: there is a visible focus state, color contrast is ≥ 4.5:1, and screen-reader labels are present.
- Lighthouse PWA checks still pass and the performance score stays ≥ 90 on mobile.
- It is deployed to the preview/staging URL and the PO has accepted it.

### 3.5 Branching & environments

- `main` is always deployable. Feature branches use the form `feat/<story-id>-short-name`.
- Every PR gets a preview deploy. `main` deploys automatically to **staging**, and a tagged release (`v0.x`, `v1.0.0`) deploys to **production**.
- Use Conventional Commits. The changelog is generated at release time.

---

## 4. Technical Architecture (MVP)

### 4.1 High-level structure

```
src/
  app/            # routes, providers, layout (bottom nav)
  features/
    session/      # session engine, game loop state machine
    scenario/     # Scenario Matching UI
    validation/   # Big-O picker, Trace-first-step components
    progress/     # stats screen, level & streak widgets
    settings/     # export/import, reset, analytics opt-in
  domain/
    srs/          # spaced-repetition scheduler (pure TS)
    xp/           # XP & level thresholds (pure TS)
    streak/       # streak rules (pure TS)
    content/      # content loader, schema validation (zod)
  data/
    db.ts         # Dexie schema + migrations
    repositories/ # progress, reviews, events
  content/
    scenarios.v1.json
  sw/             # Workbox config / custom SW logic
```

Domain logic is **pure TypeScript with no React dependency**, so it is unit-testable and can be reused if a backend is added later.

### 4.2 Content schema (draft, frozen in Sprint 0)

```ts
type Domain = 'graphs' | 'dp' | 'trees' | 'sorting' | 'hashing';

interface Scenario {
  id: string;                 // e.g. "graphs-007"
  version: number;
  domain: Domain;
  concept: string;            // e.g. "dijkstra" — SRS tracks by concept too
  difficulty: 1 | 2 | 3;
  title: string;              // "Ride-hailing ETA"
  prompt: string;             // the real-world constraint/feature request
  options: { id: string; label: string; rationale: string }[]; // 3–4
  correctOptionId: string;
  explanation: string;        // why the best answer wins, trade-offs
  validations: Validation[];  // 1–2 mini-validation steps
  tags: string[];
}

type Validation =
  | { type: 'bigO'; question: string; choices: string[]; answer: string }
  | { type: 'traceFirstStep'; question: string;
      visual: GraphVisual | ArrayVisual | TreeVisual; answerTargetId: string };
```

### 4.3 Local data model (IndexedDB via Dexie)

| Store | Key | Fields |
|---|---|---|
| `reviews` | `scenarioId` | `easiness`, `intervalDays`, `repetitions`, `dueAt`, `lapses`, `lastResult` |
| `attempts` | auto-increment | `scenarioId`, `concept`, `domain`, `correct`, `validationResults`, `durationMs`, `timestamp` |
| `profile` | `'me'` | `xp`, `level`, `streakCount`, `longestStreak`, `lastActiveLocalDate`, `freezesAvailable`, `settings` |
| `eventQueue` | auto-increment | analytics events waiting to be flushed when online |
| `meta` | key | `schemaVersion`, `contentVersion`, `installedAt` |

LocalStorage holds only tiny UI preferences such as theme. All game state lives in IndexedDB.

### 4.4 Core algorithms

**Spaced repetition (SM-2 variant)**
- Map each answer to a quality score `q` (0–5). Wrong match = 1. Correct match but a failed validation = 3. Everything correct = 4. Everything correct and fast (< 15 s) = 5.
- `q < 3` → `repetitions = 0`, `interval = 1 day`, `lapses++`.
- Otherwise the interval goes 1 → 3 → `round(prev × easiness)`, and `easiness = max(1.3, EF + 0.1 − (5−q)(0.08 + (5−q)·0.02))`.
- Concept weakness = rolling accuracy of the last 5 attempts for that concept. It feeds new-scenario selection.

**Daily session composition**
- 10 items by default: due reviews first, oldest first, capped at 7. The rest are new scenarios, weighted toward weak domains and unlocked difficulty.
- If nothing is due and nothing is new, run a practice session that does not affect the SRS.

**XP & levels**
- Correct match +10 XP, each correct validation +5 XP, first-try bonus +5, session completion +20.
- Level threshold: `xpForLevel(n) = 50 × n × (n + 1)` (L1 = 100, L2 = 300, L3 = 600, …).
- Difficulty-2 scenarios unlock at Level 3, difficulty-3 at Level 6.

**Streaks**
- A day counts when ≥ 1 session is completed, using the device's local calendar day.
- Missing exactly one day while a freeze is available uses up the freeze and keeps the streak. Users earn 1 freeze every 7-day streak, holding at most 2.
- Rollover logic must handle timezone changes and the device clock moving backwards (never award a streak twice for the same day).

### 4.5 Offline strategy

- **Precache** the app shell, JS/CSS bundles, fonts, icons and `scenarios.v1.json` at install time.
- **Runtime:** stale-while-revalidate for static assets. There are no runtime API calls in the MVP except the optional analytics flush.
- **Updates:** a "New version available — tap to refresh" toast. The app never interrupts an active session.
- **Analytics:** events are written to `eventQueue` and flushed on `online` or `visibilitychange` events, in batches with retry and backoff.

---

## 5. Product Backlog (MVP)

Estimates are in story points (SP). Priorities follow MoSCoW: **M**ust, **S**hould, **C**ould.

### Epic E1 — Project Setup & Design (Sprint 0)
| ID | Story | Pri | SP |
|---|---|---|---|
| E1-01 | Set up the repo with Vite + React + TS, ESLint, Prettier, Husky and Conventional Commits | M | 2 |
| E1-02 | Set up the CI pipeline (lint, type-check, test, build) and preview deploys | M | 3 |
| E1-03 | Create design tokens and base components (Button, Card, OptionTile, BottomBar) | M | 5 |
| E1-04 | Produce low-fi and hi-fi wireframes: Home, Session, Feedback, Summary, Stats, Settings | M | 5 |
| E1-05 | Define the content schema and author guide, with a zod validator and a CI content check | M | 3 |
| E1-06 | Write 5 pilot scenarios (1 per domain) to validate the format | M | 3 |
| E1-07 | Write ADRs for stack, state management, persistence and SRS algorithm | S | 1 |

### Epic E2 — PWA Foundation (Sprint 1)
| ID | Story | Pri | SP |
|---|---|---|---|
| E2-01 | As a user, I can install the app on my home screen (manifest, icons, splash) | M | 2 |
| E2-02 | As a user, the app loads and works with no connection (service worker precache) | M | 5 |
| E2-03 | As a dev, I have a Dexie DB with versioned schema and migration tests | M | 3 |
| E2-04 | As a dev, I have Zustand stores hydrated from and persisted to IndexedDB | M | 3 |
| E2-05 | As a user, I navigate with a bottom tab bar (Play / Stats / Settings) one-handed | M | 3 |
| E2-06 | As a user, I see a Home screen with a "Start session" CTA in the thumb zone | M | 2 |
| E2-07 | As a user, I'm told when a new version is available, and I choose when to refresh | S | 2 |
| E2-08 | As a user, I see an offline indicator, and nothing breaks while offline | S | 1 |
| E2-09 | Add a Lighthouse CI budget (PWA pass, perf ≥ 90) | S | 2 |

### Epic E3 — Core Game Loop & Content Engine (Sprints 2–3)
| ID | Story | Pri | SP |
|---|---|---|---|
| E3-01 | Build the content loader, which validates `scenarios.v1.json` at build time and at runtime | M | 2 |
| E3-02 | Build the session state machine (idle → question → validation → feedback → next → summary) | M | 5 |
| E3-03 | As a user, I read a scenario and pick one of 3–4 approaches (Scenario Matching) | M | 5 |
| E3-04 | As a user, I get instant feedback with the explanation and why the other options lose | M | 3 |
| E3-05 | Build the scenario selector: shuffled options, no repeats within a session, domain filter | M | 3 |
| E3-06 | Record each attempt to IndexedDB | M | 2 |
| E3-07 | As a user, I see a session summary (score, XP placeholder, concepts covered) | M | 3 |
| E3-08 | As a user, I can resume an interrupted session after closing the app | S | 3 |
| E3-09 | As a user, I can practice a single domain on demand | C | 2 |
| E3-10 | **Mini-Validation: Big-O picker** (time and/or space) | M | 3 |
| E3-11 | **Mini-Validation: Trace-first-step**, with graph, array and tree visuals in SVG | M | 8 |
| E3-12 | Make the validation components accessible (keyboard and screen reader, with a non-visual alternative for trace) | M | 3 |
| E3-13 | Content: write scenarios 6–25 (Graphs, DP, Trees) | M | 5 |
| E3-14 | Content: write scenarios 26–50 (Sorting, Hashing, plus top-ups) | M | 5 |
| E3-15 | Content: technical peer review of all 50 scenarios, with sign-off | M | 3 |

### Epic E4 — Progression & Analytics (Sprint 4)
| ID | Story | Pri | SP |
|---|---|---|---|
| E4-01 | Build the SM-2 scheduler as a pure module with exhaustive unit tests | M | 5 |
| E4-02 | Build the daily session composer (due reviews + weak-area new items) | M | 3 |
| E4-03 | Build the XP rules and level thresholds, with a level-up animation and toast | M | 3 |
| E4-04 | Lock difficulty tiers behind levels | S | 2 |
| E4-05 | Build daily streaks with local-day rollover, freezes and clock-skew safety | M | 5 |
| E4-06 | As a user, I see a Stats screen (accuracy per domain, weakest concepts, streak, level) | M | 5 |
| E4-07 | As a user, I see "X reviews due today" on Home | S | 1 |
| E4-08 | Add an offline analytics event queue and flush on reconnect (opt-in) | S | 3 |

### Epic E5 — Hardening & Launch (Sprint 5)
| ID | Story | Pri | SP |
|---|---|---|---|
| E5-01 | As a user, I can export and import my progress as JSON | M | 3 |
| E5-02 | As a user, I can reset my progress (with confirmation) | S | 1 |
| E5-03 | Write E2E Playwright suite: first run, full session, offline session, install and update | M | 5 |
| E5-04 | Run a cross-device QA pass (iOS Safari, Android Chrome, small screens) and fix bugs | M | 5 |
| E5-05 | Do an accessibility audit (axe and manual) and fix issues | M | 3 |
| E5-06 | Onboarding: a 3-screen intro and a first-session tutorial hint | S | 3 |
| E5-07 | Run a closed beta with 10–20 engineers, a feedback form, and triage | M | 2 |
| E5-08 | Production deploy, custom domain, privacy note, release notes `v1.0.0` | M | 2 |
| E5-09 | Optional streak reminder with the local Notification API | C | 3 |

**Total MVP (Must + Should): about 150 SP.** Capacity is about 6 × 24 = 144 SP, so the **Could** items (E3-09, E5-09) are the scope buffer and get cut first.

---

## 6. Sprint-by-Sprint Plan

### Sprint 0: Discovery, Design & Tooling
**Dates:** Mon 2026-11-09 → Fri 2026-11-20
**Sprint goal:** *"The team can ship code to a preview URL, the UI is designed, and the content format is proven with 5 real scenarios."*

| Story | SP | Owner |
|---|---|---|
| E1-01 Repo scaffold & tooling | 2 | Dev A |
| E1-02 CI pipeline + preview deploys | 3 | Dev A |
| E1-03 Design tokens + base components | 5 | Dev B + Designer |
| E1-04 Wireframes (all MVP screens) | 5 | Designer + Dev B |
| E1-05 Content schema + validator + author guide | 3 | Dev C |
| E1-06 5 pilot scenarios | 3 | Dev C |
| E1-07 ADRs | 1 | Dev A |
| **Total** | **22** | |

**Deliverables:** a running repo with CI, Storybook (or a component playground) with the base components, approved wireframes, a frozen content schema, and 5 pilot scenarios.
**Exit criteria / demo:** a PR deploys automatically to a preview URL, and the team walks through clickable wireframes of the full session flow.
**Risks to watch:** scope creep in design. Keep the visuals minimal and spend the effort on the interaction design.

---

### Sprint 1: PWA Foundation & Mobile Shell
**Dates:** Mon 2026-11-23 → Fri 2026-12-04
**Sprint goal:** *"A user can install AlgoArchitect, open it in airplane mode, and move around a one-handed shell whose state persists across restarts."*

| Story | SP | Owner |
|---|---|---|
| E2-01 Installable manifest & icons | 2 | Dev A |
| E2-02 Service worker offline precache | 5 | Dev A |
| E2-03 Dexie DB + migrations | 3 | Dev C |
| E2-04 Zustand ↔ IndexedDB persistence | 3 | Dev C |
| E2-05 Bottom tab navigation | 3 | Dev B |
| E2-06 Home screen + CTA | 2 | Dev B |
| E2-07 Update-available toast | 2 | Dev A |
| E2-08 Offline indicator | 1 | Dev B |
| E2-09 Lighthouse CI budget | 2 | Dev A |
| **Total** | **23** | |

**Deliverables:** an installable PWA shell on staging.
**Exit criteria / demo:** install on a real Android and iPhone, turn on airplane mode, kill the app, reopen it, and the shell loads with persisted settings. Lighthouse PWA check passes.
**Milestone:** **M1: Installable offline shell.**

---

### Sprint 2: Core Game Loop & Content Engine
**Dates:** Mon 2026-12-07 → Fri 2026-12-18
**Sprint goal:** *"A user can play a full session of Scenario Matching questions offline and see a summary at the end."*

| Story | SP | Owner |
|---|---|---|
| E3-01 Content loader + validation | 2 | Dev C |
| E3-02 Session state machine | 5 | Dev B |
| E3-03 Scenario Matching UI | 5 | Dev B |
| E3-04 Feedback & explanation screen | 3 | Dev B |
| E3-05 Scenario selector | 3 | Dev C |
| E3-06 Attempt recording | 2 | Dev A |
| E3-07 Session summary | 3 | Dev A |
| E3-13 (part 1) Content: +10 scenarios → 15 total | 2 | Dev C |
| **Total** | **25** | |

**Deliverables:** a playable core loop with 15 scenarios.
**Exit criteria / demo:** offline, start a session, answer 10 questions, read the explanations, reach the summary, and see attempts stored in IndexedDB.
**Milestone:** **M2: Playable loop.**
**Before the break:** tag `v0.2.0` on staging and invite 3–5 friendly testers to play during the holidays. This step is optional.

---

### Holiday Break: Mon 2026-12-21 → Fri 2027-01-01
No sprint commitments. Content writing can continue on a volunteer basis, and informal tester feedback can be collected.

---

### Sprint 3: Mini-Validations & Full Content Set
**Dates:** Mon 2027-01-04 → Fri 2027-01-15
**Sprint goal:** *"Every scenario includes a mini-validation step, and all 50 scenarios are written, reviewed and live."*

| Story | SP | Owner |
|---|---|---|
| E3-10 Big-O picker | 3 | Dev B |
| E3-11 Trace-first-step (graph/array/tree SVG) | 8 | Dev B + Dev A |
| E3-12 Validation accessibility | 3 | Dev A |
| E3-13 (part 2) Content: scenarios 16–25 | 3 | Dev C |
| E3-14 Content: scenarios 26–50 | 5 | Dev C (+ team) |
| E3-15 Content peer review & sign-off | 3 | All |
| **Total** | **25** | |

**Content distribution target (50 total):**

| Domain | Count | Sample concepts |
|---|---|---|
| Graphs & Routing | 10 | Dijkstra (ETA routing), A* (game/map pathfinding), BFS (social degrees), DFS (cycle detection), Topological sort (build/dependency resolution) |
| Dynamic Programming | 10 | LCS (diff engines), Knapsack (budget/resource allocation), Memoization (pricing calculators), Edit distance (spell-check) |
| Trees & Tries | 10 | Tries (autocomplete), B-Trees (DB indexes), BST (ordered sets), Segment/interval ideas (calendar conflicts) |
| Sorting & Searching | 10 | Mergesort (external sort of logs), Quicksort (in-memory sort), Binary search (pagination cursors, version bisect), Quickselect (p95 latency) |
| Hashing & Heaps | 10 | Hash maps (caching/dedup), Consistent hashing (sharding/load balancing), Min-heap (job scheduler), Max-heap (top-K trending) |

Difficulty mix per domain is 4 × D1, 4 × D2, 2 × D3.

**Exit criteria / demo:** play a session with both validation types. The content CI check passes with 50 valid scenarios, and every scenario has a reviewer sign-off.
**Milestone:** **M3: Content complete.**
**Carry-over:** E3-08 (resume interrupted session) moves to Sprint 4 if capacity runs out.

---

### Sprint 4: Progression: Spaced Repetition, Levels & Streaks
**Dates:** Mon 2027-01-18 → Fri 2027-01-29
**Sprint goal:** *"The app remembers what each user struggles with, brings it back at the right time, and rewards daily practice."*

| Story | SP | Owner |
|---|---|---|
| E4-01 SM-2 scheduler | 5 | Dev C |
| E4-02 Daily session composer | 3 | Dev C |
| E4-03 XP & levels | 3 | Dev B |
| E4-04 Difficulty unlocks | 2 | Dev B |
| E4-05 Daily streaks + freeze | 5 | Dev A |
| E4-06 Stats screen | 5 | Dev B |
| E4-07 "Reviews due" on Home | 1 | Dev A |
| **Total** | **24** | |

*E4-08 (analytics queue, 3 SP) and E3-08 (resume session, 3 SP) are stretch goals in this sprint and otherwise move to Sprint 5.*

**Exit criteria / demo:**
- Unit tests show that SM-2 intervals follow the spec for a table of answer sequences.
- Simulated dates (a mocked clock) show the streak increments, the freeze is used, the streak resets after 2 missed days, and a backwards clock change does not double-count.
- Answering a concept wrong makes it come back the next day.

**Milestone:** **M4: Feature complete (code freeze for new features at the end of the sprint).**

---

### Sprint 5: Hardening, Beta & Launch
**Dates:** Mon 2027-02-01 → Fri 2027-02-12
**Sprint goal:** *"AlgoArchitect v1.0.0 is stable, accessible, tested on real devices, validated by beta users, and live in production."*

| Story | SP | Owner |
|---|---|---|
| E5-01 Export/import progress | 3 | Dev C |
| E5-02 Reset progress | 1 | Dev C |
| E5-03 E2E Playwright suite | 5 | Dev A |
| E5-04 Cross-device QA + bug fixing | 5 | All |
| E5-05 Accessibility audit & fixes | 3 | Dev B |
| E5-06 Onboarding | 3 | Dev B |
| E5-07 Closed beta (10–20 users) | 2 | PO |
| E5-08 Production release v1.0.0 | 2 | Dev A |
| **Total** | **24** | |

**Week-by-week:**
- **Week 1 (Feb 1–5):** E2E suite, export and import, onboarding, then deploy `v1.0.0-rc.1` and **start the closed beta on Wed Feb 3**.
- **Week 2 (Feb 8–12):** beta feedback triage (fix P0/P1 issues only), accessibility fixes, regression run, then **release `v1.0.0` on Thu Feb 11**. Fri Feb 12 is the review, retro and buffer day.

**Milestone:** **M5: MVP released (Fri 2027-02-12).**

---

## 7. Release Checklist (MVP Go/No-Go)

- [ ] All **Must** stories are done and meet the DoD.
- [ ] 50 scenarios are live, peer-reviewed, and pass the content CI check.
- [ ] A full session works in airplane mode on iOS Safari (latest 2 versions) and Android Chrome.
- [ ] The app installs correctly on iOS (Add to Home Screen) and Android (install prompt).
- [ ] Lighthouse mobile shows PWA ✅, Performance ≥ 90, Accessibility ≥ 95.
- [ ] Initial JS bundle is ≤ 200 KB gzipped, and Time to Interactive is < 3 s on a mid-range phone (4G throttled).
- [ ] The E2E suite is green and there are no open P0/P1 bugs.
- [ ] Data migration from `v0.x` beta data is tested, or the beta data is explicitly reset.
- [ ] Export and import round-trips without data loss.
- [ ] The privacy note is published and analytics stay off until the user opts in.
- [ ] Release notes and a known-issues list are published.

---

## 8. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Writing and verifying 50 high-quality scenarios takes longer than estimated | High | High | Pilot 5 in Sprint 0, spread authoring across Sprints 2–3, use the holiday buffer, review in pairs. Fallback: launch with 40 and add 10 in v1.1 |
| R2 | The Trace-first-step visualizations (SVG graph/tree) are complex | Medium | High | Estimated at 8 SP. Start with fixed pre-laid-out visuals in the JSON and no auto-layout. Fallback: a tap-on-list alternative |
| R3 | iOS Safari PWA limits (storage eviction, install UX) | Medium | Medium | Request `navigator.storage.persist()`, show install instructions on iOS, offer JSON export as a backup |
| R4 | Data loss with no cloud backup | Medium | High | Export and import in the MVP, migrations tested in CI, never delete stores destructively |
| R5 | Holiday break reduces momentum | Medium | Low | Tag v0.2.0 before the break, then a short re-planning session on Jan 4 |
| R6 | Streak and date edge cases (timezones, clock changes) | Medium | Medium | Pure streak module tested with a mocked clock and a table of edge cases |
| R7 | Small team: one person's absence blocks an area | Medium | Medium | Pair on critical modules, document ADRs, no single owner without a reviewer |
| R8 | Scope creep (accounts and sync requests) | Medium | Medium | Out-of-scope list in §2.3. PO controls the backlog and changes go to v1.1 |

---

## 9. Quality & Testing Strategy

| Layer | Tooling | What |
|---|---|---|
| Static | TypeScript strict, ESLint, Prettier | Every commit |
| Content | zod schema + custom rules (exactly one correct option, 3–4 options, Big-O answer is in the choices, trace target exists in the visual) | CI on every PR touching `content/` |
| Unit | Vitest | `srs`, `xp`, `streak`, `session composer`, `content` with ≥ 80% coverage |
| Component | Testing Library | Option selection, validation components, feedback |
| E2E | Playwright (mobile viewport, offline emulation) | First run, full session, offline session, update flow, export/import |
| Perf / PWA | Lighthouse CI | Budgets enforced on `main` |
| Accessibility | axe-core + manual VoiceOver/TalkBack | Sprint 3 and Sprint 5 |
| Usability | 5-user hallway tests | End of Sprint 2 (loop) and Sprint 4 (progression) |

---

## 10. Metrics to Track

**Delivery metrics (each sprint)**
- Committed vs. completed SP (target ≥ 85%) and a burndown chart.
- Count of scenarios authored vs. the plan (5 → 15 → 50).
- Escaped bugs per sprint.

**Product metrics (beta and after launch, local or opt-in analytics)**
- D1 / D7 retention among beta testers.
- Sessions per user per week, and average session length (target ≤ 5 min).
- Accuracy per domain, plus second-exposure accuracy for SRS effectiveness.
- Share of users with a 3+ and 7+ day streak.

---

## 11. Post-MVP Roadmap (v1.1+)

1. Accounts plus cloud sync of progress (e.g., Supabase), building on the existing `eventQueue` and repository layer.
2. More content (100+ scenarios) and new domains (string algorithms, union-find, bloom filters, rate limiting).
3. Procedural scenario variations (parameterized constraints).
4. Push reminders, weekly recap.
5. Localization (pt-BR first).
6. Leaderboards and shareable streak cards.

---

## 12. Open Questions

| # | Question | Owner | Needed by |
|---|---|---|---|
| Q1 | Final team member names and role assignments | PO | Sprint 0 planning (Nov 9) |
| Q2 | Which hosting provider and domain name? | Dev A | End of Sprint 0 |
| Q3 | Analytics provider (Plausible, Umami, or none) for opt-in events | PO | Sprint 4 planning (Jan 18) |
| Q4 | Who are the beta testers (target 10–20 engineers)? | PO | Sprint 4 end (Jan 29) |
| Q5 | Is a visual brand or logo needed for the MVP, or is a placeholder fine? | Designer | Sprint 0 end |
