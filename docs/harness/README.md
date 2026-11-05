# Harness index

The harness is the set of short documents agents load to do a task. Principle: **a map, not a manual**. `AGENTS.md` is the map; each doc here owns one subject; folder-level `AGENTS.md` files hold rules that only matter in that folder.

| Doc | Owns | Read it when |
|---|---|---|
| [architecture.md](architecture.md) | Folder map, layer rules, key decisions | adding code in a new place, or touching shared contracts |
| [business-rules.md](business-rules.md) | What the app does: session flow, XP, grading, saved data, planned rules | changing behavior, or unsure what is intended |
| [testing-and-ci.md](testing-and-ci.md) | Checks, CI, test rules, what to verify per change type | before you push; when CI is red |
| [workflow.md](workflow.md) | Task → PR → review → mergeable, templates | starting or finishing any task |

Folder rules (loaded automatically when you read files there): `src/domain/AGENTS.md`, `src/ui/AGENTS.md`, `src/content/AGENTS.md`. Each has a one-line `CLAUDE.md` (`@AGENTS.md`) next to it so Claude Code loads it too.

## Keeping it healthy
- One subject per doc, one owner doc per fact. Link, don't copy.
- Each doc stays under about 120 lines. If it grows, split by subject and add a row above.
- Every PR that changes a business rule, adds a feature or concept, or changes the architecture updates the matching doc in the same PR. The code reviewer checks this.
- Mark what is **built** and what is **planned**. Never describe planned behavior as if it exists.
- Not harness (do not copy into it): the product plan (`docs/AlgoArchitect_MVP_Sprint_Plan.md`) and the visual spec (`docs/AlgoArchitect_UI_Design_System.md`). Point to them.
