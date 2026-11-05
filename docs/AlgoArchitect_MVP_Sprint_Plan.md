# AlgoArchitect — MVP Sprint Plan

> Source: *Product Requirements Document (PRD): AlgoArchitect*
> Version: 1.1 · Created: 2026-11-04 · Updated: 2026-11-04 (adds the ordered-trace challenge and the Study area; MVP moves to Feb 26, 2027) · Status: Draft for team review

---

## 1. Planning Summary

| Item | Decision |
|---|---|
| Product | AlgoArchitect: a mobile-first, offline-first PWA that trains engineers to match real-world architecture scenarios to algorithms and data structures |
| Team | Small team (2–4 people). The plan assumes **3 developers** plus a part-time designer/content reviewer |
| Cadence | **2-week sprints**, Monday → Friday of the following week |
| Sprints | Sprint 0 + Sprints 1–6 (7 sprints, 14 working weeks) |
| Start | **Mon 2026-11-09** |
| Holiday break | **Mon 2026-12-21 → Fri 2027-01-01** (no sprint) |
| MVP delivery | **Fri 2027-02-26** (moved from Feb 12 to add the Study area and the ordered-trace challenge) |
| Stack | React 18 + Vite + TypeScript, Workbox (`vite-plugin-pwa`), Zustand, Dexie (IndexedDB), Tailwind CSS, Vitest + Testing Library, Playwright |
| Backend | **None for the MVP.** All progress stays on the device. Cloud sync and accounts come after the MVP |
| Study content | The [Patterns Handbook](https://github.com/armanithiago/patterns-handbook) (30 chapters + 4 appendices), converted at build time and **bundled offline** |
| Hosting | Static hosting with HTTPS (Netlify / Vercel / GitHub Pages / Cloudflare Pages) |

### 1.0 Progress (updated 2026-11-05, after Sprint 3)

| Sprint | Status | Notes |
|---|---|---|
| Sprint 0 | **Partly done** | Done: repo, tooling, CI (E1-01, E1-02), design tokens and base components (E1-03, no Storybook yet), wireframes (E1-04, in the design system and the demo), content schema and validator (E1-05). Not done: ADRs (E1-07). The 5 pilot scenarios (E1-06) were folded into Sprint 2 |
| Sprint 1 | **Done** | E2-01 to E2-09 merged and verified in a real browser (offline reload, manifest, icons, thumb rule). Not verified: installing on a real phone |
| Sprint 2 | **Done** | E3-01 to E3-07 and E3-13 part 1 merged. Verified in the production build, **offline**: a 10-question session across all five domains, 10 attempts saved to IndexedDB, XP awarded once. 15 scenarios, 302 tests. Main bundle 146.5 kB gzipped (limit 200) |
| Sprint 3 | **Done** | E3-10 to E3-12 and E3-13 to E3-15 merged, plus the trace-order validation (E6-07 UI) pulled forward from Sprint 5. **50 scenarios**, 10 per domain, difficulty 4/4/2 in each, 40 Big-O + 15 first-step + 10 trace-order validations. Verified in the production build, offline: a full session through the real UI with all three validation types and wrong answers, 10 attempts saved with their validation results, XP computed independently (120) equal to the persisted XP. 425 tests |

**Sprint 3 notes**
- The peer review (E3-15) was a by-hand technical review of all 35 new scenarios by the orchestrator. It found two duplicate scenarios (replaced with frequency counting and the two-heap running median) and two ambiguous binary-search questions (now state `lo = 0`, `hi = last index`, matching the handbook). A second human review is still recommended before launch.
- A flaky test (a fixed 20 ms wait for IndexedDB writes) failed on CI twice; fixed with `flushAttemptWrites()`.

**Known gaps carried forward**
- On 320 px phones the trace hit areas of `trees-002` overlap by under 1 px: the 52-unit spacing rule gives 42.6 px there. Raise the rule to about 59 units or reduce the card padding at 320 px.
- Trace-order verdict text (`Order: Y B D A E C`) and the wrong-answer wording for `traceFirstStep` were written from the design doc's copy rules; they have not been reviewed by a person.
- CI uses `actions/checkout@v4` and `setup-node@v4` on a deprecated Node 20 runtime (a warning today).
- Not built: resume an interrupted session (E3-08), system Back opening the end-session confirmation, the Study button (Sprint 5), spaced repetition and streaks (Sprint 4).
- The `[X]` close button is not reachable while the explanation sheet is open (Esc and Next scenario are the exits).
- Not verified: real iPhone and Android installation, haptics on a real device, VoiceOver and TalkBack, the content check on the full 50 scenarios, the GitHub Actions run after the latest pushes.
- Content: B-trees have no scenario because the handbook has no B-tree section.

### 1.1 Timeline at a glance

| Sprint | Dates | Theme | PRD phase | Milestone |
|---|---|---|---|---|
| Sprint 0 | Nov 09 – Nov 20, 2026 | Discovery, design & tooling | Pre-Phase 1 | M0: Repo, CI, design system, content schema approved |
| Sprint 1 | Nov 23 – Dec 04, 2026 | PWA foundation & mobile shell | Phase 1 | M1: Installable offline shell |
| Sprint 2 | Dec 07 – Dec 18, 2026 | Core game loop & content engine | Phase 2 | M2: Playable loop with 15 scenarios |
| — | Dec 21, 2026 – Jan 01, 2027 | Holiday break | — | — |
| Sprint 3 | Jan 04 – Jan 15, 2027 | Mini-validations & full content set | Phase 2 | M3: Content complete (50 scenarios) |
| Sprint 4 | Jan 18 – Jan 29, 2027 | Progression: spaced repetition, levels, streaks | Phase 3 | M4: Feature complete |
| Sprint 5 | Feb 01 – Feb 12, 2027 | Study area & ordered trace | Phase 2+ (new) | M5: Study-then-solve loop complete |
| Sprint 6 | Feb 15 – Feb 26, 2027 | Hardening, beta & launch | Release | **M6: MVP released** |

```
Nov 2026          Dec 2026              Jan 2027              Feb 2027
|--S0--|--S1--|--S2--|::break::|--S3--|--S4--|--S5--|--S6--|
 09    23     07     21        04     18     01     15    26 ★ MVP
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
4. **Mini-Validation**, three interaction types:
   - **Big-O selection**: pick the time or space complexity.
   - **Trace-first-step**: tap the node, cell or element the algorithm visits or processes first.
   - **Trace-order** (new): tap the nodes, cells or elements in the order the algorithm visits them (for example BFS or DFS order, binary-search probes, an in-order traversal). Taps are numbered, the last tap can be undone, and the verdict is shown per position.
5. **Content**: **50 hardcoded scenarios**, 10 for each of the 5 domains (Graphs & Routing, Dynamic Programming, Trees & Tries, Sorting & Searching, Hashing & Heaps).
6. **Session engine**: daily session made of due reviews plus new scenarios, with a session summary.
7. **Spaced repetition**: SM-2-style scheduler for each scenario and concept.
8. **Leveling**: XP per answer, level thresholds, level-up feedback.
9. **Daily streaks**: streak counter, local-day rollover, one streak freeze.
10. **Stats screen**: accuracy per domain, weakest concepts, streak, level.
11. **Local persistence**: IndexedDB (Dexie) with a schema version and migrations.
12. **Data portability**: export and import progress as JSON. This protects users while there is no cloud sync.
13. **Privacy-friendly analytics**, optional and a stretch goal (E4-08). Events are queued offline and flushed when back online. The PRD's "sync when back online" is reduced to this for the MVP.
14. **Study area** (new): a fourth tab with the Patterns Handbook bundled offline. A library grouped by the handbook's parts, a chapter reader (prose, highlighted C#, tables, diagrams), reading progress, and **Practice this pattern** from any chapter that has scenarios.
15. **Study then solve** (new): every question and check has a **Study** button that opens the linked handbook section in a sheet, without losing the current answer. Answering after studying still counts: it earns half the match XP and the scenario comes back the next day (§4.4). Every explanation also links to its handbook section.

### 2.3 Out of scope (after the MVP)

- User accounts, authentication, cross-device cloud sync.
- Leaderboards, social or sharing features.
- Content CMS or authoring UI. Content is a versioned JSON file in the repo.
- Procedurally generated scenarios. The "scenario generator" in the MVP **selects and shuffles** authored scenarios and does not create new ones.
- Push notifications for streak reminders (possibly a stretch goal in Sprint 6).
- Practice a single domain from Home (E3-09). It is superseded in the MVP by **Practice this pattern** in the Study area (E6-09).
- Notes, highlights or bookmarks in the Study area, and code samples in languages other than C# and pseudocode.
- Pseudocode for the remaining ~270 handbook code blocks (problem walkthroughs). The MVP covers the linked sections and chapter templates (E6-10).
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
    study/        # Study tab: library, chapter reader, StudySheet
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
    study.lock.json   # pinned patterns-handbook version (§4.6)
scripts/
  study/build.ts      # handbook → public/study/*.json (§4.6)
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
  study: StudyRef[];          // 1–2 handbook sections that teach this scenario (new)
  tags: string[];
}

type Validation =
  | { type: 'bigO'; question: string; choices: string[]; answer: string; measure?: 'time' | 'space' }
  | { type: 'traceFirstStep'; question: string;
      visual: GraphVisual | ArrayVisual | TreeVisual; answerTargetId: string }
  | { type: 'traceOrder'; question: string;           // new
      visual: GraphVisual | ArrayVisual | TreeVisual;
      algorithm: 'bfs' | 'dfs' | 'dijkstra' | 'binarySearch' | 'inorder' | 'preorder' | 'postorder' | 'topoKahn';
      tieBreak: 'alphabetical' | 'authored';          // stated in the question text
      givenPrefix: number;                            // leading targets pre-filled (usually 1: the start)
      answer: string[] };                             // full expected sequence of target ids

interface StudyRef {
  sectionId: string;          // e.g. "29.2" — stable id produced by the handbook build (§4.6)
  label?: string;             // optional override for the link text
}
```

Content CI rules added for the new fields:
- Every `study.sectionId` exists in the current handbook bundle.
- `traceOrder`: the CI **runs the named algorithm** on the visual with the stated tie-break and fails unless the result equals `answer` (no ambiguous orders). `answer` has 3–8 entries and the question text states the tie-break rule.

### 4.3 Local data model (IndexedDB via Dexie)

| Store | Key | Fields |
|---|---|---|
| `reviews` | `scenarioId` | `easiness`, `intervalDays`, `repetitions`, `dueAt`, `lapses`, `lastResult` |
| `attempts` | auto-increment | `scenarioId`, `concept`, `domain`, `correct`, `validationResults`, `studied`, `durationMs`, `timestamp` |
| `profile` | `'me'` | `xp`, `level`, `streakCount`, `longestStreak`, `lastActiveLocalDate`, `freezesAvailable`, `settings` |
| `eventQueue` | auto-increment | analytics events waiting to be flushed when online |
| `reading` (new) | `chapterId` | `lastSectionId`, `sectionsRead[]`, `scrollPct`, `updatedAt` |
| `meta` | key | `schemaVersion`, `contentVersion`, `installedAt` |

LocalStorage holds only tiny UI preferences such as theme. All game state lives in IndexedDB.

### 4.4 Core algorithms

**Spaced repetition (SM-2 variant)**
- Map each answer to a quality score `q` (0–5). Wrong match = 1. Correct match but a failed validation = 3. Everything correct = 4. Everything correct and fast (< 15 s) = 5.
- `q < 3` → `repetitions = 0`, `interval = 1 day`, `lapses++`.
- Otherwise the interval goes 1 → 3 → `round(prev × easiness)`, and `easiness = max(1.3, EF + 0.1 − (5−q)(0.08 + (5−q)·0.02))`.
- **Studied first** (the user opened Study before Check): `q` is capped at 3, so a correct answer comes back the next day instead of jumping to 3 days. A wrong answer after studying is still `q = 1`.
- Concept weakness = rolling accuracy of the last 5 attempts for that concept. It feeds new-scenario selection.

**Daily session composition**
- 10 items by default: due reviews first, oldest first, capped at 7. The rest are new scenarios, weighted toward weak domains and unlocked difficulty.
- If nothing is due and nothing is new, run a practice session that does not affect the SRS.

**XP & levels**
- Correct match +10 XP (**+5 when studied first**), each correct validation +5 XP, first-try bonus +5 (not when studied first), session completion +20.
- A `traceOrder` validation passes only when every position is right. The explanation reports "k of n in place" so a near miss is visible, but there is no partial XP.
- Level threshold: `xpForLevel(n) = 50 × n × (n + 1)` (L1 = 100, L2 = 300, L3 = 600, …).
- Difficulty-2 scenarios unlock at Level 3, difficulty-3 at Level 6.

**Streaks**
- A day counts when ≥ 1 session is completed, using the device's local calendar day.
- Missing exactly one day while a freeze is available uses up the freeze and keeps the streak. Users earn 1 freeze every 7-day streak, holding at most 2.
- Rollover logic must handle timezone changes and the device clock moving backwards (never award a streak twice for the same day).

### 4.5 Offline strategy

- **Precache** the app shell, JS/CSS bundles, fonts, icons and `scenarios.v1.json` at install time.
- **Study bundle:** the per-chapter handbook files (§4.6) are precached in the background after the first session, so they never compete with the first load. Until then a chapter is fetched on demand and cached.
- **Runtime:** stale-while-revalidate for static assets. There are no runtime API calls in the MVP except the optional analytics flush.
- **Updates:** a "New version available — tap to refresh" toast. The app never interrupts an active session.
- **Analytics:** events are written to `eventQueue` and flushed on `online` or `visibilitychange` events, in batches with retry and backoff.

### 4.6 Study content pipeline (new)

The Study area is generated from [`armanithiago/patterns-handbook`](https://github.com/armanithiago/patterns-handbook) (`content/programming-patterns-handbook.md`, ~579 KB of Markdown, 16,209 lines, 333 C# code blocks, 116 Mermaid diagrams).

1. **Pin a version.** The app repo pins a handbook commit or tag (`study.lock.json`). Updating it is a normal PR, so content changes are reviewed and versioned like scenarios.
2. **Parse and normalize.** `scripts/study/build.ts` reads the Markdown and splits it into chapters and sections. The handbook's heading levels are not uniform: some chapters are `#` headings, others are `##` headings under `# Stage N` wrappers, and some sections are `##` while others (Chapter 29) are `###`. The parser identifies chapters by the `Chapter N:` pattern and sections by the `N.M` number, whatever the heading level, and drops the `Stage` wrappers. Appendices become chapters A–D.
3. **Stable ids.** Chapters get `ch13`; sections get their number (`13.3`). Scenario `study.sectionId` values point at these, and the content CI fails on a missing id.
4. **Pair pseudocode.** Each C# block can be followed by a ```` ```pseudo ```` block in the handbook. The parser pairs the two into one code block with a **Pseudocode | C#** switch (design system §7.24); pseudocode is the default. Unpaired C# blocks still ship, and the build prints the coverage (paired / total).
5. **Render at build time.** Markdown becomes HTML with `marked`; C# and pseudocode are highlighted with `highlight.js` into token classes that map to the design-system syntax colors; tables keep a scroll wrapper. **Mermaid is pre-rendered to SVG** in CI (`@mermaid-js/mermaid-cli`), then post-processed so strokes and text use `currentColor` and the design tokens, so diagrams follow both themes and need no runtime library. Emoji in headings are stripped.
6. **Output.** `public/study/index.json` (parts, chapters, section titles, word counts, domain mapping) plus one `public/study/ch-XX.json` per chapter. Budget: ≤ 400 KB gzipped for the whole bundle. Nothing of it is in the initial JS bundle.
7. **Domain mapping.** A small hand-maintained table maps chapters to the five app domains (for example Ch. 13, 14, 15, 27, 29 → Graphs; Ch. 22 → DP), so library rows show domain dots and **Practice this pattern** knows which scenarios to pull.
8. **Snapshot tests** on a few chapters catch handbook format changes before they reach users.

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
| ~~E3-09~~ | ~~As a user, I can practice a single domain on demand~~ — moved to v1.1, superseded by E6-09 | — | — |
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
| E4-08 | Add an offline analytics event queue and flush on reconnect (opt-in). **Stretch**: if it misses Sprint 4 it moves to v1.1 and the Settings row is hidden | S | 3 |

### Epic E6 — Study Area & Ordered Trace (Sprint 5, new)
| ID | Story | Pri | SP |
|---|---|---|---|
| E6-01 | Build the handbook pipeline: pin version, parse and normalize headings, stable ids, Markdown → HTML, C# highlighting, per-chapter JSON (§4.6) | M | 5 |
| E6-02 | Pre-render the 116 Mermaid diagrams to themed SVG in CI | M | 3 |
| E6-03 | As a user, I see a Study tab with the handbook library grouped by part, domain dots, reading progress and "Continue reading" | M | 3 |
| E6-04 | As a user, I read a chapter: section chips, prose, code with the Pseudocode/C# switch, tables, diagrams; my position is remembered | M | 6 |
| E6-05 | As a user, I can open **Study** mid-question in a sheet and come back to the same answer; studied answers are graded as in §4.4 | M | 3 |
| E6-06 | Content: link all 50 scenarios to 1–2 handbook sections, with the CI id check | M | 2 |
| E6-07 | **Mini-Validation: Trace-order**: numbered taps, undo, per-position verdict, list-view alternative; reuses TraceCanvas (E3-11) | M | 3 |
| E6-08 | Content: add a trace-order validation to 10 scenarios, with the CI "run the algorithm" uniqueness check | M | 2 |
| E6-10 | Content: pseudocode twins in the handbook for every section linked by a scenario plus each chapter's template code (~60 of the 333 C# blocks), following the conventions in design system §7.24. **Written by the handbook author** in `patterns-handbook`; Dev C reviews | M | 3 |
| E6-09 | As a user, I can start **Practice this pattern** from a chapter (concept-filtered practice that doesn't change review dates) | S | 2 |

### Epic E5 — Hardening & Launch (Sprint 6)
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

**Total MVP (Must + Should): about 181 SP** (149 before + 32 for E6). E6-10 (3 SP) is written by the handbook author, outside the developers' capacity, so the developer total is about 178 SP against a capacity of about 7 × 24 = 168 SP. The plan therefore depends on two stretch items and one cut line:
- **Stretch:** E4-08 (analytics queue, 3) and E3-08 (resume session, 3) in Sprint 4. If they miss, E4-08 goes to v1.1 and E3-08 moves to Sprint 6.
- **Could:** E5-09 (streak reminder, 3) is the first thing cut.
- **Cut line if Sprint 4 velocity is below 24:** E6-09 (Practice this pattern, 2) moves to v1.1, and E5-06 onboarding shrinks to one screen plus the coach mark (saves 2).

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

*E4-08 (analytics queue, 3 SP) and E3-08 (resume session, 3 SP) are stretch goals in this sprint. If they miss, E4-08 moves to v1.1 and E3-08 to Sprint 6.*

**Exit criteria / demo:**
- Unit tests show that SM-2 intervals follow the spec for a table of answer sequences.
- Simulated dates (a mocked clock) show the streak increments, the freeze is used, the streak resets after 2 missed days, and a backwards clock change does not double-count.
- Answering a concept wrong makes it come back the next day.

**Milestone:** **M4: Core loop feature complete.** The code freeze for new features moves to the end of Sprint 5.

---

### Sprint 5: Study Area & Ordered Trace (new)
**Dates:** Mon 2027-02-01 → Fri 2027-02-12
**Sprint goal:** *"When I don't know the answer, I can study the pattern from my handbook without leaving the question, then solve it; and I can prove I know an algorithm by tapping its visit order."*

| Story | SP | Owner |
|---|---|---|
| E6-01 Handbook pipeline | 5 | Dev A |
| E6-02 Mermaid → themed SVG | 3 | Dev A |
| E6-03 Study library | 3 | Dev B |
| E6-04 Chapter reader + code switch | 6 | Dev B |
| E6-05 Study sheet + studied grading | 3 | Dev C |
| E6-06 Link 50 scenarios to sections | 2 | Dev C |
| E6-07 Trace-order validation | 3 | Dev C + Dev B |
| E6-08 Trace-order content (10 scenarios) | 2 | Dev C |
| **Total (developers)** | **27** | |
| E6-10 Pseudocode twins (~60 blocks) | 3 | Handbook author, reviewed by Dev C |

*E6-10 can start any time after Sprint 0 (it only needs the conventions), so the core blocks are ready before the pipeline lands. Developers are planned 3 SP over capacity: E6-01 starts in week 1 of Sprint 4 as a spike if Sprint 4 has slack. E6-09 (Practice this pattern) moves to Sprint 6.*

**Exit criteria / demo:**
- Airplane mode: open the Study tab, read Chapter 13 with its diagram and code, switch the code between Pseudocode and C# (the choice sticks everywhere), then tap **Practice this pattern**.
- In a session, tap **Study**, read the section, go back: the selection is kept, the verdict shows "Studied", +5 XP, and the scenario is due tomorrow.
- A trace-order check (BFS from the start node) shows numbered taps, Undo works, and a wrong order shows which positions were right. The list view gives the same result with a screen reader.
- Content CI fails if a `study.sectionId` is missing or a `traceOrder` answer doesn't match the algorithm's real output.

**Milestone:** **M5: Study-then-solve loop complete. Feature freeze.**

---

### Sprint 6: Hardening, Beta & Launch
**Dates:** Mon 2027-02-15 → Fri 2027-02-26
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
| E6-09 Practice this pattern | 2 | Dev C |
| **Total** | **26** | |

*E6-09 is the first item cut if the sprint runs late (cut line in §5).*

**Week-by-week:**
- **Week 1 (Feb 15–19):** E2E suite (now including Study and trace-order flows), export and import, onboarding, then deploy `v1.0.0-rc.1` and **start the closed beta on Wed Feb 17**.
- **Week 2 (Feb 22–26):** beta feedback triage (fix P0/P1 issues only), accessibility fixes, regression run, then **release `v1.0.0` on Thu Feb 25**. Fri Feb 26 is the review, retro and buffer day.

**Milestone:** **M6: MVP released (Fri 2027-02-26).**

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
- [ ] The Study tab works in airplane mode: library, every chapter, diagrams and code.
- [ ] Every scenario links to an existing handbook section, and every trace-order answer passes the CI algorithm check.
- [ ] The handbook bundle is ≤ 400 KB gzipped and is not part of the initial JS bundle.
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
| R9 | Handbook format drift breaks the study pipeline (headings already vary between `#`, `##` and `###`) | Medium | Medium | Parse by `Chapter N:` and `N.M` patterns, not by level; pin a handbook version; snapshot tests; CI fails loudly instead of shipping a broken chapter |
| R10 | The 116 Mermaid diagrams render badly in dark mode or on a 360 px screen | Medium | Low | Build-time SVG with token colors, horizontal scroll inside the figure, a text fallback (the diagram's source table or caption) if rendering fails |
| R11 | Ambiguous trace-order answers (several valid BFS/DFS orders) | Medium | High | Every question states its tie-break; the content CI runs the algorithm and rejects ambiguous graphs |
| R12 | Plan is ~10 SP over developer capacity after adding the Study area | Medium | Medium | Stretch items and the cut line in §5; re-plan at the Sprint 4 review with real velocity |

---

## 9. Quality & Testing Strategy

| Layer | Tooling | What |
|---|---|---|
| Static | TypeScript strict, ESLint, Prettier | Every commit |
| Content | zod schema + custom rules (exactly one correct option, 3–4 options, Big-O answer is in the choices, trace target exists in the visual, trace-order answer equals the algorithm's output, study section ids exist) | CI on every PR touching `content/` or `study.lock.json` |
| Study build | Snapshot tests on parsed chapters; SVG diagram count matches the Mermaid block count | CI on every handbook version bump |
| Unit | Vitest | `srs`, `xp`, `streak`, `session composer`, `content` with ≥ 80% coverage |
| Component | Testing Library | Option selection, validation components, feedback |
| E2E | Playwright (mobile viewport, offline emulation) | First run, full session, offline session, update flow, export/import |
| Perf / PWA | Lighthouse CI | Budgets enforced on `main` |
| Accessibility | axe-core + manual VoiceOver/TalkBack | Sprint 3, Sprint 5 (reader, trace-order) and Sprint 6 |
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
- Study use: share of questions answered after studying, and accuracy on the next exposure of a studied scenario vs one that wasn't studied.

---

## 11. Post-MVP Roadmap (v1.1+)

1. Accounts plus cloud sync of progress (e.g., Supabase), building on the existing `eventQueue` and repository layer.
2. More content (100+ scenarios) and new domains (string algorithms, union-find, bloom filters, rate limiting).
3. Procedural scenario variations (parameterized constraints).
4. Push reminders, weekly recap.
5. Localization (pt-BR first).
6. Leaderboards and shareable streak cards.
7. Practice a single domain from Home (E3-09), notes and highlights in the Study area, and multi-language code samples.

---

## 12. Open Questions

| # | Question | Owner | Needed by |
|---|---|---|---|
| Q1 | Final team member names and role assignments | PO | Sprint 0 planning (Nov 9) |
| Q2 | Which hosting provider and domain name? | Dev A | End of Sprint 0 |
| Q3 | Analytics provider (Plausible, Umami, or none) for opt-in events | PO | Sprint 4 planning (Jan 18) |
| Q4 | Who are the beta testers (target 10–20 engineers)? | PO | Sprint 4 end (Jan 29) |
| Q5 | Is a visual brand or logo needed for the MVP, or is a placeholder fine? | Designer | Sprint 0 end |
| Q6 | Which handbook version (tag or commit) is pinned for v1.0? *Resolved in part: the handbook is the product owner's own work, so it can be bundled. Adding a LICENSE file to `patterns-handbook` is still recommended so the in-app credit has something to point to.* | PO | Sprint 5 planning (Feb 1) |
| Q7 | ~~C# only, or also pseudocode?~~ **Resolved: pseudocode twins, default in the app, with a Pseudocode \| C# switch (E6-10, design system §7.24).** | — | — |
