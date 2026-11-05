# src/domain: pure logic

- Pure TypeScript. **No** React, Zustand, Dexie, DOM or browser APIs. Do not call `Date.now()` or `Math.random()` inside logic: take the clock or the rng as an argument so tests are deterministic.
- State machines never throw. An invalid transition returns the **same state object**, so callers can detect a no-op.
- `session/types.ts` is the contract between this logic and the UI. Change it only when the task says so, and update both sides in the same PR.
- Tests: table-driven, cover illegal transitions. Aim for 90 %+ statements on new logic.
- Business rules live in `docs/harness/business-rules.md`. If you change a rule (XP, grading, session flow), update that doc in the same PR.
