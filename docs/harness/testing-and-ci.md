# Testing and CI

## Commands
- `npm run check`: typecheck, lint, test, build. Stops at the first failure. Run before every push.
- `npm test`: Vitest (jsdom, fake IndexedDB). Includes the **content check**.
- CI (`.github/workflows/ci.yml`) runs on every PR: job `verify` (lint, typecheck, test, build, Lighthouse), then job `review` (agent code reviewer). Both must be green to merge.

## Test rules
- Test behavior, not implementation. Logic: table-driven; cover illegal transitions and edges. UI: assert roles, names and states with Testing Library.
- **No fixed sleeps.** Wait on something deterministic (`flushAttemptWrites()`, fake timers, `findBy*`). A test that passes locally and fails in CI is a bug in the test: fix its timing, never retry it into green.
- Never rely on random data: inject the rng/clock. Pick fixtures by id, not by position or count in the content bundle.
- Never skip, `.only`, or delete a failing test to get green.
- A bug fix comes with a test that fails without the fix.

## What to verify by type of change
| Change | Also verify |
|---|---|
| Logic / state | Unit tests; illegal transitions; XP awarded once |
| UI | At 360×740 in dark and light: thumb rule (primary actions at y ≥ 444 px), no horizontal scroll at 320 and 360, keyboard-only path with visible focus, reduced motion |
| Content | `npm test` content check; read every scenario's facts yourself |
| Offline / PWA | `node scripts/verify-offline.mjs` against `vite preview` |
| Saved data | Reload and confirm the data is still there; migrations keep old rows |
Tools: Playwright and Chromium are preinstalled in agent sandboxes (`require('playwright')`, `chromium.launch()`); keep scratch scripts outside the repo.

## When CI is red
Read the failing step's log first (do not guess). Reproduce locally with the same command. Fix the cause. If you believe the failure is flaky, prove it (run it repeatedly), then fix the test's wait, not the assertion.

## Reviewer job
Needs the repository secret `ANTHROPIC_API_KEY`. Without it the job prints a warning and skips, so CI stays green but **no review happens**. The reviewer is read-only and follows `.claude/agents/code-reviewer.md`.
