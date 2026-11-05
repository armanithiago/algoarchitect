# AlgoArchitect: agent guide

Offline-first, one-handed mobile PWA that trains engineers to match real-world scenarios to the right algorithm.
React 18 · Vite · TypeScript (strict) · Tailwind 4 (design tokens only) · Zustand · Dexie (IndexedDB). No backend.

## Commands
```bash
npm ci               # install (use the lockfile)
npm run dev          # local app
npm run check        # typecheck + lint + test + build, stops at the first failure. Run before every push.
```

## Working rules (read these every task)
1. **Stay in scope.** Do what the task says, in the folders the task names. If you notice something else, write it in the PR description. Do not fix it.
2. **Simplest thing that works.** No new abstraction, dependency, config option, or layer unless the task needs it. If the basic version works, ship it. A new architecture is allowed only when the feature needs it: justify it in one paragraph in the PR and update `docs/harness/architecture.md`.
3. **No rework.** Do not rename, reformat, move, or "clean up" code you were not asked to touch. Search for an existing component or helper before writing one.
4. **Verify before you claim.** Run `npm run check`. Say what you ran, what passed, and what you could not verify. Never write "works" without evidence.
5. **Never skip or weaken a check.** No disabled tests, lint-disables, or loosened types to get green. Fix the cause. No fixed `sleep` waits in tests.
6. **Escalate, don't guess.** If the task needs a change outside your scope (shared contracts, other people's files) or requirements conflict, stop and ask the orchestrator.

## Workflow (details: `docs/harness/workflow.md`)
Task → branch → implement → PR → CI (build) → agent code review → fix until green → update harness docs if needed → mergeable.
A task is finished only when its PR is **mergeable**: CI green, reviewer approved, no open blocking comments.

## Where to look (load only what your task needs)
| If your task is about... | Read |
|---|---|
| How the code is organized, layer rules, key decisions | `docs/harness/architecture.md` |
| What the app should do: XP, session flow, validations, saved data, planned rules | `docs/harness/business-rules.md` |
| Running checks, CI, writing tests, what to verify per change type | `docs/harness/testing-and-ci.md` |
| Task → PR → review → merge, PR and task-brief templates | `docs/harness/workflow.md` |
| Domain logic (`src/domain`), UI (`src/ui`), scenarios (`src/content`) | the `AGENTS.md` in that folder (loads when you work there) |
| Exact visual spec of a component or screen | `docs/AlgoArchitect_UI_Design_System.md`: use its contents list, read one section |
| Product scope and sprint history | `docs/AlgoArchitect_MVP_Sprint_Plan.md` (§1.0 progress first) |

Index of all harness docs: `docs/harness/README.md`.

## Conventions
- TypeScript strict, no `any`. Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`). End commits with the attribution lines your runtime gives you.
- Styling uses design tokens only: no raw colors, no Tailwind default palette (removed).
- UI strings: sentence case, calm tone, no exclamation marks, no emoji.
- A new dependency needs a reason in the PR. Prefer what the repo already has.

## Keep the harness current
If your change alters a business rule, adds a feature or concept, or changes the architecture, update the one matching doc in `docs/harness/` in the same PR. Keep docs short, and link instead of copying. If nothing like that changed, say "harness: N/A" in the PR.
