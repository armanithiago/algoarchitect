# AlgoArchitect

Mobile-first, offline-first PWA that trains software engineers to match real-world architecture scenarios to the right algorithm or data structure.

- Product and plan: [`docs/AlgoArchitect_MVP_Sprint_Plan.md`](docs/AlgoArchitect_MVP_Sprint_Plan.md)
- UI source of truth: [`docs/AlgoArchitect_UI_Design_System.md`](docs/AlgoArchitect_UI_Design_System.md)
- Interactive mock-up (static, hardcoded): [`demo/index.html`](demo/index.html)

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck && npm run lint && npm test && npm run build
```

Stack: React 18 · Vite · TypeScript (strict) · Tailwind CSS 4 (design tokens only) · Zustand · Dexie (IndexedDB) · vite-plugin-pwa · Vitest.

## Layout

```
src/app/        shell, router, providers
src/features/   one folder per screen area (home, study, stats, settings, …)
src/ui/         design tokens, fonts, shared components
src/domain/     pure TypeScript game logic (no React)
src/data/       IndexedDB schema and repositories
src/stores/     Zustand stores (hydrated from IndexedDB)
src/pwa/        service worker registration and update UI
```

Rules: colors, sizes, radii, shadows and durations come from the design tokens only (design system §10.7).
