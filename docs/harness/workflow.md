# Workflow: task → PR → review → mergeable

One task = one new agent = one branch = one PR. The orchestrator (the lead agent or the human) writes the task brief, starts the agent, and merges. Dev agents do not start work without a brief.

## Roles
| Role | Does | Does not |
|---|---|---|
| Orchestrator | Writes the brief, picks the scope, starts agents, resolves conflicts, merges | Implement inside a dev agent's scope while it works |
| Dev agent | Implements the brief, opens the PR, fixes CI and review findings, updates harness docs | Touch files outside its scope, merge, change shared contracts |
| Code reviewer | Reads the diff against the brief and the rules, returns a verdict | Edit code. Review is read-only. |

## Steps for a dev agent
1. **Read** `AGENTS.md`, your brief, and only the docs the brief points to.
2. **Branch** from up-to-date `master`: `agent/<short-task-name>`. Use a worktree if other agents run in parallel.
3. **Implement the simplest version** that meets the acceptance criteria, inside your scope. Add tests with the change.
4. **Check**: `npm run check`. Fix until it passes.
5. **Open the PR** against `master` with the PR template. Title is a Conventional Commit. Put out-of-scope findings under "Noticed, not changed".
6. **Wait for CI**, then the agent reviewer. If your runtime supports PR event subscriptions, subscribe so you are woken by CI and review events; otherwise check the PR status.
7. **If CI is red**: read the log, reproduce locally, fix the cause, push. Never skip or weaken a check.
8. **If the reviewer requests changes**: fix every *blocker*. For a *should-fix*, fix it or reply with a one-line reason. Push. The review re-runs on each push.
9. **Harness**: if the change altered a business rule, added a feature or concept, or changed the architecture, update the matching doc in `docs/harness/` in this same PR (update the index row if you add a doc).
10. **Finish** only when the PR is **mergeable** (below). Then report: PR link, what changed, what you verified, what you could not verify.

Limit: after 3 review rounds on the same finding, stop and ask the orchestrator.

## Mergeable means all of
- CI job `verify` green (including the build).
- Review job green: verdict `approve`, no blocking findings.
- No unresolved blocking comment from a human.
- Branch up to date with `master`.
- Harness docs updated, or the PR says "harness: N/A".

## Merge policy
The orchestrator merges (squash) once the PR is mergeable. To let dev agents merge their own PRs, change this section and nothing else. Recommended repo setting: require the checks `verify` and `review` on `master`.

## Task brief template (the orchestrator fills this in)
```
Goal: one sentence, the user-visible or system outcome.
Scope (may edit): folders/files.
Out of scope (must not edit): shared contracts, other areas.
Acceptance criteria: observable, testable bullets.
Read first: AGENTS.md + the 1-3 harness docs / design sections that apply.
Verify: which checks beyond `npm run check` (see testing-and-ci.md).
Constraints: anything special (no new deps, keep API X stable).
```

## PR checklist (also in `.github/pull_request_template.md`)
Scope respected · simplest solution · tests added or changed · `npm run check` passes · harness updated or N/A · nothing unrelated changed.
