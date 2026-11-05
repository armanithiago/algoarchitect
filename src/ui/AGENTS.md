# src/ui: tokens and components

- **Tokens only.** No hex/rgb/oklch, no Tailwind default palette (it is removed, so `bg-blue-500` fails). Use semantic classes: `bg-surface-raised`, `text-fg-muted`, `border-line-subtle`, `rounded-md`, `text-title-2`, `px-gutter`.
- **Reuse first.** Existing components are in `src/ui/components/`. Search before creating one. Components are presentational: props in, events out. They do not read stores or data. Screens in `src/features/` wire the stores.
- State goes in `data-state` (default, selected, correct, incorrect, dimmed). Disabled uses `aria-disabled`, so the control stays focusable.
- Touch targets at least 48×48 px (primary button 56). Visible focus ring. Never use color alone: pair it with an icon and a border style (solid = right, dashed = wrong).
- Thumb rule at 360×740: primary actions start at y ≥ 444 px. The AnswerDock is at most 296 px tall. No horizontal scroll at 320 or 360 px.
- Motion only under `motion-ok:`; honor reduced motion.
- Copy: sentence case, no exclamation marks, no emoji.
- Exact specs: `docs/AlgoArchitect_UI_Design_System.md` §7 (one component per subsection). Read only the part you need.
