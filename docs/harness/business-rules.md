# Business rules

Status marks: **built** = in the code today. **planned** = decided, not built (source: sprint plan §4.4).

## Session flow (built)
`question → verdict → validation(s) → explanation → next → summary`. A session has 10 scenarios (`SESSION_SIZE`). The selector picks scenarios with no repeats, spread across domains, and shuffles the options per session. The progress bar advances per scenario, not per validation. Ending early keeps the answers given so far.

## Validations (built)
After the scenario match, each scenario has 1-2 checks. Right/wrong is graded by `src/domain/session/validation.ts` (the only place).
- `bigO`: the chosen complexity must equal the answer.
- `traceFirstStep`: the tapped node or cell must equal `answerTargetId`.
- `traceOrder`: every position must match; there is no partial credit. The explanation reports "k of n in place".
Choices in a Big-O check are always shown in ascending order of growth, never shuffled.

## XP and levels (built)
- +10 for a correct scenario match, +5 for each correct validation, +20 completion bonus.
- No completion bonus when the session is ended early.
- XP is added to the profile exactly once, when the summary is reached.
- Level `n` starts at `50·n·(n−1)` XP (L1 0-99, L2 100-299, L3 300-599).

## Saved data (built)
- Everything stays on the device. IndexedDB `algoarchitect`: `profile`, `attempts`, `reviews`, `eventQueue`, `reading`, `meta`.
- One `attempts` row per answered scenario, written at Check, updated as each validation is checked (`validationResults`).
- If IndexedDB is unavailable the app still works in memory and the Home screen shows a warning.
- UI preferences live in `localStorage` under `aa.*` (`aa.theme`, `aa.reduceMotion`, `aa.coachSeen`, `aa.traceView`).
- Migrations never delete data.

## Content (built)
50 scenarios, 10 per domain (graphs, dp, trees, sorting, hashing), difficulty mix 4 easy / 4 medium / 2 hard per domain. Authoring rules: `src/content/AGENTS.md`.

## Not built yet (planned, Sprint 4+)
- Spaced repetition (SM-2 style per scenario); wrong answers return the next day; due reviews fill up to 7 of the 10 slots.
- Daily streak: a day counts when a session is completed (local calendar day); one freeze earned per 7-day streak (max 2); never count a day twice, handle clock changes.
- Difficulty tiers unlock by level (D2 at level 3, D3 at level 6); Stats screen; level-up screen.
- Study area and "studied first" grading (Sprint 5). Export/import and reset (Sprint 6).
When you build one of these, move it up to **built** in the same PR.
