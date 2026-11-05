# Architecture

## Folder map
```
src/app/        shell, router, providers (wiring only)
src/features/   one folder per screen area: home, session, summary, study, stats, settings
src/ui/         design tokens, fonts, presentational components, small UI helpers (ui/lib)
src/hooks/      shared React hooks
src/stores/     Zustand stores: profile (hydrated from IndexedDB), session (wraps the domain machine)
src/domain/     pure TypeScript: session machine + selector + grading, content schema/validator, xp, dates
src/data/       Dexie database, versioned migrations, repositories
src/content/    scenarios.v1.json (lazy chunk) and drafts
src/pwa/        service worker registration, update toast host
public/         fonts, icons.   scripts/  icon generation, offline verification
```

## Layer rules (true today; keep them true)
- `domain` imports nothing from React, stores, data, ui, features or hooks. It is testable with plain Vitest.
- `ui/components` are presentational: props in, events out. They do not import stores or data. (`Toast` keeps its own small store inside its folder.)
- `features` wire stores to components. `stores` call `domain` and `data`. `data` knows nothing about React.
- Styling comes from tokens (`src/ui/tokens`), never raw values.

## Contracts (shared files: change only when the task says so)
- `src/domain/session/types.ts`: session state, steps, actions, answers, results.
- `src/stores/profile.ts`: profile shape the UI reads.
- `src/ui/components/TraceCanvas/types.ts`: props of the trace component.
- `src/domain/content/schema.ts`: scenario shape. Changing it means content, validator and UI change together.

## Key decisions (short, with the reason)
| Decision | Why |
|---|---|
| No backend; all progress on the device | Offline-first, no accounts, nothing to host. Export/import covers backup. |
| IndexedDB through Dexie; migrations are additive | Never lose a user's data. A migration must not drop or rewrite rows. |
| Zustand stores hydrate once at startup; writes are debounced and flushed on hide | Simple, fast, survives closing the app. |
| Scenarios are validated JSON in a lazy chunk | Keeps the first load small; bad content fails CI, not users. |
| Tokens-only styling (Tailwind v4 `@theme`, default palette removed) | One visual language; raw values fail the build. |
| Service worker precaches the shell, fonts, icons; `registerType: prompt` | Works fully offline; users choose when to update. |
| Contracts first for parallel work | Several agents can build against a shared type without waiting. |

## Adding something new
Prefer the existing pattern. Create a new layer, library or abstraction only if the feature cannot be built simply with what exists. When you do, add one row to the decisions table above in the same PR, with the reason.
