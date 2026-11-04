# AlgoArchitect — UI Design System

> Version 1.0 · 2026-11-04 · Status: proposed for Sprint 0 (E1-03 design tokens, E1-04 wireframes)
> Scope: every MVP screen in *AlgoArchitect_MVP_Sprint_Plan.md* · Stack: React 18 + Vite + TypeScript, Tailwind CSS 4.3, Zustand, Dexie, `vite-plugin-pwa`
> This document is the single source of truth for UI. If code and this document disagree, the code is wrong or this document needs a PR. Nothing ships with a colour, size, radius, shadow or duration that is not defined here.

---

## Contents

0. [Decisions at a glance](#0-decisions-at-a-glance)
1. [Principles, personality and voice](#1-principles-personality-and-voice)
2. [Color](#2-color)
3. [Typography](#3-typography)
4. [Spacing, grid and layout](#4-spacing-grid-and-layout)
5. [Elevation, radius, borders, icons, illustration](#5-elevation-radius-borders-icons-illustration)
6. [Motion and haptics](#6-motion-and-haptics)
7. [Components](#7-components)
8. [Screens and wireframes](#8-screens-and-wireframes)
9. [Accessibility checklist](#9-accessibility-checklist)
10. [Implementation](#10-implementation)
11. [Design QA checklist and references](#11-design-qa-checklist-and-references)

---

## 0. Decisions at a glance

| Area | Decision | Why (short) |
|---|---|---|
| Default theme | **Dark**, with a full light theme and a "System" option | Commute use in trains, tunnels and at night; developer audience expects dark |
| Neutral | Cool slate `gray` 1–12, hue 264 in OKLCH, chroma ≤ 0.017 | A slightly blue grey reads as "tool", not "game" |
| Accent | **Blueprint blue** `#3e69e9` (`oklch(56.5% 0.200 266)`), the same solid in both themes | Architecture and blueprint metaphor; white text passes at 4.77:1; far from the green and red verdict hues |
| Verdict colors | Success `green` (hue 158), error `red` (hue 25), always paired with an icon, a border style and text | WCAG 1.4.1; the tinted backgrounds are nearly identical for deuteranopes (ΔE 0.5–1.7), so color can never be the only cue |
| Domain colors | Graphs → cyan, DP → violet, Trees → lime, Sorting → orange, Hashing → pink | Lightness tuned to maximise separation under protan, deutan and tritan simulation |
| UI font | **Inter 4.1** variable, latin subset, 47.1 KiB | Tabular figures, dev-tool standard, x-height matches the mono font |
| Code / Big-O font | **JetBrains Mono 2.211** variable, latin subset, 39.5 KiB | Dotted zero, tailed `l`, distinct `1`, so `O(1)` never reads as `O(l)` |
| Icons | **Lucide** (`lucide-react` 1.x, ISC), 1.75 px stroke, 16/20/24 px | One outline style, tree-shakable, `aria-hidden` by default in v1 |
| Grid | 4 px base, 16 px side gutter, content column max **30 rem (480 px)** | One layout that scales from 360 px phones to desktop |
| Touch | **48 × 48 px minimum** for every target, 56 px for the primary button | Sprint DoD (≥ 48), Material 48 dp, and above Apple's 44 pt |
| Thumb rule | Every primary action starts below **60 % of viewport height** on the 360 × 740 reference viewport | The PRD's "bottom 40 %" target, made measurable |
| Interaction | **Select, then Check**, always on one full-width button in one place | Commute jolts must not create wrong answers; one thumb spot |
| Motion | 80–320 ms UI motion, 480–800 ms for progress and celebration, everything has a reduced-motion fallback | Fast and functional; celebrate only at the end |
| Haptics | `navigator.vibrate` on Android only, feature-detected, off-switch in Settings | WebKit has never shipped the Vibration API |
| Tailwind | **v4.3** CSS-first `@theme`; the default palette is removed (`--color-*: initial`) | Only design-system tokens can compile |
| Home-screen name | `short_name: "AlgoArch"` (see §10.6 for the "Archly" trade-off) | Keeps the product name recognisable under the icon |

---

## 1. Principles, personality and voice

### 1.1 Design principles

1. **One thumb, one spot.** Every forward action (Check, Continue, Next scenario, Done) is the same full-width 56 px button, pinned to the same place at the bottom of the screen. A whole session can be played without moving the thumb more than a few millimetres. When a choice is needed, the choices sit directly above that button.
2. **Calm by default, loud on purpose.** Neutral surfaces cover at least 90 % of every screen. Color is a signal with one job: accent means action or selection, green and red mean a verdict, a domain hue means "which topic". There is never more than one accent-filled element on a screen.
3. **Never color alone.** Each state is shown with an icon, a shape and words as well as a color: a check badge, a solid border and "Best fit" for correct; an x badge, a dashed border and "Your pick" for wrong. This is required (WCAG 1.4.1), and our simulation in §2.9 shows why: the green and red tinted backgrounds are indistinguishable for deuteranopes.
4. **Offline is a normal state, not an error.** The app is local-first. We never show a network spinner. "Offline" uses neutral styling, never warning colors, and the copy says that everything still works.
5. **Respect the engineer.** Precise notation in a real code font, honest trade-offs in every explanation, dense but legible layouts. No mascots, no confetti, no exclamation marks, no fake urgency. Levels are numbers, not titles.
6. **Reward progress, never punish absence.** Streak freezes are earned and applied automatically. A lost streak is reported plainly, and the longest streak stays on the record. Nothing nags, and there are no notifications in the MVP.

### 1.2 Brand personality

AlgoArchitect sounds like **the senior engineer you liked pairing with**: precise, calm, quietly confident and brief, and happy to tell you *why*.

| It is | It is not |
|---|---|
| Precise: "remaps ~1/n of keys" | Vague: "way better!" |
| Calm: "Not quite." | Dramatic: "Oops! Wrong!" |
| Peer-to-peer: "you", plain verbs | Cute: mascots, puns, emoji |
| Encouraging through facts: "3 of 4 checks passed" | Manipulative: "Don't lose your streak!!" |
| A polished tool (Linear, Raycast, Primer) | A children's quiz game |

### 1.3 Voice and tone rules

- Sentence case everywhere, including buttons and titles. Use ALL CAPS only for the `overline` section labels, which are uppercased by CSS (the source text stays in sentence case).
- **No exclamation marks and no emoji**, including level-up and streak copy.
- Buttons are verbs of one or two words: *Check*, *Continue*, *Start session*, *Export progress*. They are never "OK" or "Yes".
- Numbers are numerals, with tabular figures in counters: "12 days", "+10 XP", "4 / 10".
- Complexity is always set as code: `O(n log n)`, never "n log n time" in prose.
- Address the user as "you". Avoid "we" except in privacy copy ("We never see your answers").
- Errors say what happened, what was kept, and what to do next, in that order.
- Length limits: button ≤ 20 characters, toast ≤ 2 lines (about 70 characters), verdict detail ≤ 1 line on a 360 px screen (about 40 characters), option label ≤ 28 characters (see §7.2).

### 1.4 Tone by moment

| Moment | Copy (use as written) | Notes |
|---|---|---|
| Correct match | **Correct** · "Consistent hashing is the fit." · `+10 XP` | Short. The explanation does the teaching |
| Wrong match | **Not quite** · "Best fit: Consistent hashing." | Name the right answer immediately; never "Wrong!" |
| Correct check | **Correct** · "`O(log n)` per lookup." | |
| Wrong check | **Not quite** · "It's `O(log n)`: binary search on the ring." | |
| All checks passed | "2 of 2 checks passed" | Facts, not praise |
| Session complete | **Session complete** · "8 of 10 correct · 4 min 38 s" | |
| Streak extended | "Day 13. Streak extended." | |
| Freeze used | "Freeze used. Your 12-day streak is safe. 0 freezes left." | Reassure first |
| Freeze earned | "7 days in a row. You earned a freeze (2 max)." | |
| Streak lost | "Streak reset. Longest run: 21 days. Finish a session to start a new one." | Neutral styling, never red; the record is kept |
| Level-up | **Level 3** · "Difficulty 2 scenarios are now in your rotation." | Says what changed |
| Offline | "Offline. Everything works; progress is saved on this device." | Neutral banner |
| Back online | "Back online." | Shown for 2 s, then gone |
| Update ready | "Update ready." · action **Refresh** | Never during a session |
| Nothing due | **All caught up** · "Practice keeps you sharp and doesn't change review dates." | |
| Empty stats | **No stats yet** · "Finish one session and accuracy per domain shows up here." | |
| Export done | "Progress exported: algoarchitect-2026-11-04.json" | |
| Import invalid | "That file isn't an AlgoArchitect export. Nothing was changed." | |
| Import confirm | **Replace current progress?** · "Your current XP, streak and reviews will be overwritten by the file." | |
| Storage blocked | "This browser mode can't save progress. You can play; nothing is kept after you close the app." | `warning` styling |
| End session | **End this session?** · "Your 4 answers are saved. Finish a session to count today's streak." | |
| Reset | **Reset all progress?** · "XP, level, streak, reviews and history on this device are erased. This can't be undone." | |

### 1.5 Game-element guardrails (non-manipulative habit loop)

These rules are part of the system. A PR that breaks one needs PO sign-off.

1. **No variable rewards.** XP is deterministic and shown only as earned feedback (`+10 XP`). There are no loot boxes, spins or random bonuses.
2. **No visible timers.** The SM-2 "fast answer" quality bonus (< 15 s) is invisible. There is no countdown, no stopwatch and no "speed bonus!" text. This also keeps us clear of WCAG 2.2.1 (Timing Adjustable).
3. **Streaks are forgiving and private.** A freeze is applied automatically. One is earned per 7-day streak, up to 2, and freezes are never sold. The longest streak is always shown next to a reset.
4. **No guilt or loss framing.** Never write "You're about to lose…". Never show streak loss in red. There are no "come back" interstitials.
5. **Sessions end.** The summary has one action, *Done*. There is no "one more?" upsell. Practice mode is available from Home but never pushed.
6. **Celebrate milestones, not every tap.** Every answer gets a verdict. Only a level-up gets a celebration screen, and it is shown after the summary, never mid-session.
7. **No notifications in the MVP.** If E5-09 ships, reminders are opt-in, at most one a day, at a time the user picks, and the copy is neutral.

Rationale: designs built on loss aversion keep engagement up in the short term but cause anxiety and churn. Current practice recommends forgiveness mechanics (freezes, grace days), transparent rules and recovery paths ([Smashing Magazine, 2026](https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/); [UX Magazine](https://uxmag.com/articles/gamification-or-manipulation-understanding-the-ethics-of-engagement-loops)).

---

## 2. Color

### 2.1 Approach

- **Generated in OKLCH.** OKLCH lightness tracks *perceived* lightness, so a step means the same visual distance in every hue, and contrast is predictable when you change hue ([Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl); [Ottosson, OKLab](https://bottosson.github.io/posts/oklab/)). Each step was defined as (L, C) at a fixed hue, gamut-mapped into sRGB by reducing chroma only, rounded to 8-bit hex, then converted back to OKLCH. The OKLCH strings below round-trip to exactly the listed hex. Linear made the same move from HSL to LCH so that generated themes keep consistent contrast ([Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)).
- **The 12-step scale** follows the step roles of [Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale): 1–2 backgrounds, 3–5 component fills, 6–8 borders, 9–10 solids, 11–12 text. Two deliberate deviations: for `gray`, step 10 is our muted-text step (tuned to ≥ 4.5:1) rather than a hovered solid; for `blue`, step 10 is the *pressed* solid and is darker than 9 in both themes, so white text always passes.
- **Three tiers** ([Primer](https://primer.style/product/primitives/token-names/) calls them base → functional → component):
  1. **Primitives** (`--gray-1`…`--gray-12`, `--blue-9`, `--cyan-11`, …). Raw values, redefined per theme. **Never used in components.**
  2. **Semantic** (`--canvas`, `--surface-raised`, `--fg-muted`, `--accent`, `--success-subtle`, `--graphs-fg`, …). They describe a role. Components and Tailwind utilities use only these.
  3. **Component** mappings (§7). They say which semantic tokens a component uses, for example "OptionTile selected border = `--accent`". They are documented in tables rather than created as hundreds of CSS variables.
- **sRGB only** for the MVP. Every value is inside the sRGB gamut, so hex and OKLCH render identically. A P3 boost of step 9 is a post-MVP option.
- **Dark first.** The dark theme was designed first. Light is a full theme, not an inversion: surfaces become white and elevation comes from shadow instead of lightness.

### 2.2 Neutral scale: `gray` (12 steps)

| Step | Role | Dark hex | Dark OKLCH | Light hex | Light OKLCH |
|---|---|---|---|---|---|
| `gray-1` | canvas | `#0f1013` | `oklch(17.3% 0.006 271)` | `#f6f7f9` | `oklch(97.6% 0.003 264.5)` |
| `gray-2` | surface (dark) / hover (light) | `#15171b` | `oklch(20.4% 0.009 264.4)` | `#f0f2f4` | `oklch(96% 0.003 247.9)` |
| `gray-3` | surface-raised (dark) / pressed+track (light) | `#1d1f24` | `oklch(23.9% 0.010 268.3)` | `#eaecef` | `oklch(94.2% 0.005 258.3)` |
| `gray-4` | hover + track (dark) | `#23262c` | `oklch(26.8% 0.012 264.4)` | `#e3e6eb` | `oklch(92.4% 0.008 260.7)` |
| `gray-5` | pressed (dark) | `#2a2e35` | `oklch(30% 0.014 261.7)` | `#dde0e5` | `oklch(90.6% 0.008 260.7)` |
| `gray-6` | line-subtle | `#33373e` | `oklch(33.6% 0.013 261.7)` | `#d4d7dd` | `oklch(87.9% 0.009 264.5)` |
| `gray-7` | line | `#434851` | `oklch(40% 0.017 262.3)` | `#c5c9d0` | `oklch(83.5% 0.011 261.8)` |
| `gray-8` | line-strong (3:1) | `#676c75` | `oklch(53% 0.015 262.3)` | `#8b8f98` | `oklch(65% 0.014 266.6)` |
| `gray-9` | fg-disabled | `#7c8089` | `oklch(59.9% 0.014 266.6)` | `#777c85` | `oklch(58.5% 0.015 262.4)` |
| `gray-10` | fg-muted (4.5:1) | `#9a9fa7` | `oklch(70.1% 0.013 259.8)` | `#636871` | `oklch(51.6% 0.015 262.3)` |
| `gray-11` | fg-secondary (7:1) | `#babec4` | `oklch(80% 0.010 258.3)` | `#484d57` | `oklch(41.9% 0.018 264.4)` |
| `gray-12` | fg | `#eff0f3` | `oklch(95.5% 0.004 271.4)` | `#171b21` | `oklch(22.1% 0.013 258.4)` |

### 2.3 Accent scale: `blue` "Blueprint" (12 steps)

Steps 9 and 10 are identical in both themes, so the primary button looks the same in dark and light. Unlisted roles (`-`) are available for future use and are **not** exposed as semantic tokens.

| Step | Role | Dark hex | Dark OKLCH | Light hex | Light OKLCH |
|---|---|---|---|---|---|
| `blue-1` | - | `#0e121d` | `oklch(18.4% 0.024 268.7)` | `#fbfcff` | `oklch(99.1% 0.004 271.4)` |
| `blue-2` | - | `#12192a` | `oklch(21.6% 0.035 266.4)` | `#f4f8ff` | `oklch(97.8% 0.010 261.8)` |
| `blue-3` | accent-subtle (selected bg) | `#152347` | `oklch(26.6% 0.070 265.9)` | `#e8efff` | `oklch(95.2% 0.023 266.9)` |
| `blue-4` | selected + hover | `#182a5a` | `oklch(30% 0.089 265.8)` | `#dce7ff` | `oklch(92.7% 0.035 266)` |
| `blue-5` | selected + pressed | `#1e336d` | `oklch(33.9% 0.104 266)` | `#cfdeff` | `oklch(90% 0.048 266)` |
| `blue-6` | - | `#263e81` | `oklch(38.4% 0.117 266.2)` | `#bed2ff` | `oklch(86.4% 0.066 266.2)` |
| `blue-7` | accent-line | `#314e9c` | `oklch(44.5% 0.132 265.9)` | `#a4c0ff` | `oklch(81% 0.095 265.8)` |
| `blue-8` | - | `#3d61c4` | `oklch(52.1% 0.160 266)` | `#7ea4ff` | `oklch(73% 0.139 265.9)` |
| `blue-9` | accent (solid, CTA) | `#3e69e9` | `oklch(56.5% 0.200 266)` | `#3e69e9` | `oklch(56.5% 0.200 266)` |
| `blue-10` | accent-pressed | `#335cdb` | `oklch(52.4% 0.200 266)` | `#335cdb` | `oklch(52.4% 0.200 266)` |
| `blue-11` | accent-fg (dark: focus) | `#9fbdff` | `oklch(80.1% 0.100 265.4)` | `#3158cf` | `oklch(50.6% 0.189 265.9)` |
| `blue-12` | high-contrast accent text | `#e0eaff` | `oklch(93.6% 0.030 265.3)` | `#132764` | `oklch(29.9% 0.111 266)` |

### 2.4 Semantic hues: success, error, warning

Only the steps that semantic tokens use are defined.

| Primitive | Used as | Dark hex | Dark OKLCH | Light hex | Light OKLCH |
|---|---|---|---|---|---|
| `green-3` | `success-subtle` | `#092d1b` | `oklch(26.6% 0.053 157.6)` | `#e3f4e9` | `oklch(95.2% 0.023 157.6)` |
| `green-6` | `success-line` | `#065131` | `oklch(38.4% 0.087 158)` | `#b2dfc4` | `oklch(86.4% 0.060 158.5)` |
| `green-9` | `success` | `#37c080` | `oklch(72% 0.150 158.2)` | `#129d63` | `oklch(61.47% 0.140 157.9)` |
| `green-11` | `success-fg` | `#63d99b` | `oklch(80.1% 0.140 158)` | `#14764a` | `oklch(50.1% 0.111 157.7)` |
| `red-3` | `error-subtle` | `#401614` | `oklch(26.6% 0.066 25.3)` | `#ffe9e7` | `oklch(95.1% 0.024 23.8)` |
| `red-6` | `error-line` | `#732524` | `oklch(38.4% 0.110 24.6)` | `#ffc1bb` | `oklch(86.5% 0.072 25)` |
| `red-9` | `error` | `#d22d33` | `oklch(56.5% 0.200 24.9)` | `#cb242d` | `oklch(54.55% 0.200 24.9)` |
| `red-10` | `error-pressed` | `#c31a26` | `oklch(52.41% 0.1995 25.13)` | `#bc0b20` | `oklch(50.42% 0.200 25)` |
| `red-11` | `error-fg` | `#f7958d` | `oklch(77% 0.119 25.2)` | `#be222a` | `oklch(52% 0.190 24.9)` |
| `amber-3` | `warning-subtle` | `#342103` | `oklch(26.5% 0.052 74.8)` | `#f9edde` | `oklch(95.2% 0.024 73.6)` |
| `amber-6` | `warning-line` | `#5d3c00` | `oklch(38.5% 0.082 74.3)` | `#eccda4` | `oklch(86.4% 0.064 74.5)` |
| `amber-9` | `warning` | `#f9ad26` | `oklch(80.1% 0.160 75.2)` | `#f9ad26` | `oklch(80.1% 0.160 75.2)` |
| `amber-11` | `warning-fg` | `#f5b75b` | `oklch(81.9% 0.130 74.9)` | `#8d5e00` | `oklch(52% 0.110 75.1)` |

### 2.5 Domain hues

Each domain has four tokens: `--{domain}` (solid: bars, dots, rings), `--{domain}-subtle` (chip background), `--{domain}-line` (chip border, optional) and `--{domain}-fg` (chip text and icon). The token prefixes are the `Domain` keys from the content schema (`graphs | dp | trees | sorting | hashing`).

| Domain | Token prefix | Icon (Lucide) | Solid dark / light | Subtle dark / light | Line dark / light | Fg dark / light |
|---|---|---|---|---|---|---|
| Graphs & Routing | `--graphs` | `route` | `#12b0d4` / `#0092b1` | `#072a33` / `#e3f2f8` | `#014c5d` / `#b1dbe9` | `#63d1f2` / `#006f87` |
| Dynamic Programming | `--dp` | `grid-3x3` | `#a76ef8` / `#7a31ca` | `#2b1c42` / `#f2ecff` | `#4e3177` / `#dac8ff` | `#ccb1fe` / `#773ac1` |
| Trees & Tries | `--trees` | `network` | `#94d53c` / `#619500` | `#1c2a0a` / `#eaf3e2` | `#334d0e` / `#c5dcb0` | `#a4dc65` / `#496d16` |
| Sorting & Searching | `--sorting` | `arrow-down-wide-narrow` | `#e36b00` / `#a94e00` | `#3c1b07` / `#ffeae0` | `#6c3004` / `#fac6a9` | `#ffa571` / `#a54b00` |
| Hashing & Heaps | `--hashing` | `hash` | `#ff70bb` / `#cd2e8b` | `#3c162a` / `#ffe8f2` | `#6c254c` / `#fabfda` | `#f7a3cb` / `#ab2974` |

Primitive values:

| Primitive | Used as | Dark hex | Dark OKLCH | Light hex | Light OKLCH |
|---|---|---|---|---|---|
| `cyan-3` | `graphs-subtle`, `freeze-subtle` | `#072a33` | `oklch(26.5% 0.042 218.7)` | `#e3f2f8` | `oklch(95.2% 0.018 223.6)` |
| `cyan-6` | `graphs-line` | `#014c5d` | `oklch(38.52% 0.0695 219.48)` | `#b1dbe9` | `oklch(86.6% 0.048 220.1)` |
| `cyan-9` | `graphs` | `#12b0d4` | `oklch(70.1% 0.125 219.8)` | `#0092b1` | `oklch(61% 0.111 219.9)` |
| `cyan-11` | `graphs-fg`, `freeze` | `#63d1f2` | `oklch(80.9% 0.110 220.4)` | `#006f87` | `oklch(50.1% 0.091 219.7)` |
| `violet-3` | `dp-subtle` | `#2b1c42` | `oklch(26.6% 0.070 299.9)` | `#f2ecff` | `oklch(95.3% 0.026 300.3)` |
| `violet-6` | `dp-line` | `#4e3177` | `oklch(38.4% 0.116 300.1)` | `#dac8ff` | `oklch(86.6% 0.077 299.8)` |
| `violet-9` | `dp` | `#a76ef8` | `oklch(66.1% 0.200 300)` | `#7a31ca` | `oklch(50% 0.219 300)` |
| `violet-11` | `dp-fg` | `#ccb1fe` | `oklch(81.1% 0.110 300.1)` | `#773ac1` | `oklch(50% 0.199 299.8)` |
| `lime-3` | `trees-subtle` | `#1c2a0a` | `oklch(26.4% 0.056 129.5)` | `#eaf3e2` | `oklch(95.3% 0.024 129.9)` |
| `lime-6` | `trees-line` | `#334d0e` | `oklch(38.5% 0.093 129.8)` | `#c5dcb0` | `oklch(86.6% 0.064 130.2)` |
| `lime-9` | `trees` | `#94d53c` | `oklch(80.1% 0.191 130)` | `#619500` | `oklch(60.95% 0.164 130)` |
| `lime-11` | `trees-fg` | `#a4dc65` | `oklch(83.1% 0.161 130.2)` | `#496d16` | `oklch(49% 0.120 130)` |
| `orange-3` | `sorting-subtle`, `streak-subtle` | `#3c1b07` | `oklch(26.6% 0.060 49)` | `#ffeae0` | `oklch(95.1% 0.027 47.2)` |
| `orange-6` | `sorting-line` | `#6c3004` | `oklch(38.5% 0.099 49.5)` | `#fac6a9` | `oklch(86.5% 0.071 50.6)` |
| `orange-9` | `sorting`, `streak` | `#e36b00` | `oklch(66.09% 0.1743 50.17)` | `#a94e00` | `oklch(53% 0.140 50.2)` |
| `orange-11` | `sorting-fg` | `#ffa571` | `oklch(80.1% 0.126 50.2)` | `#a54b00` | `oklch(52% 0.138 49.7)` |
| `pink-3` | `hashing-subtle` | `#3c162a` | `oklch(26.6% 0.066 349.7)` | `#ffe8f2` | `oklch(95.2% 0.028 349.5)` |
| `pink-6` | `hashing-line` | `#6c254c` | `oklch(38.4% 0.111 349.5)` | `#fabfda` | `oklch(86.5% 0.076 349.6)` |
| `pink-9` | `hashing` | `#ff70bb` | `oklch(73.9% 0.191 350.1)` | `#cd2e8b` | `oklch(58% 0.210 350.1)` |
| `pink-11` | `hashing-fg` | `#f7a3cb` | `oklch(80.9% 0.111 349.8)` | `#ab2974` | `oklch(51% 0.179 350.2)` |

Shared primitives, by design: the streak flame uses `orange-9` and `orange-3` (like Sorting), and the freeze uses `cyan-11` and `cyan-3` (like Graphs). They never share a meaning, because a domain is always shown with its text label and icon and the flame and snowflake are always icons.

### 2.6 Semantic tokens (both themes)

| Token | Dark → primitive | Dark hex | Light → primitive | Light hex |
|---|---|---|---|---|
| **Surfaces** | | | | |
| `--canvas` | `gray-1` | `#0f1013` | `gray-1` | `#f6f7f9` |
| `--surface` | `gray-2` | `#15171b` | `white` | `#ffffff` |
| `--surface-raised` | `gray-3` | `#1d1f24` | `white` | `#ffffff` |
| `--surface-hover` | `gray-4` | `#23262c` | `gray-2` | `#f0f2f4` |
| `--surface-pressed` | `gray-5` | `#2a2e35` | `gray-3` | `#eaecef` |
| `--track` | `gray-4` | `#23262c` | `gray-3` | `#eaecef` |
| **Lines (borders, dividers)** | | | | |
| `--line-subtle` | `gray-6` | `#33373e` | `gray-6` | `#d4d7dd` |
| `--line` | `gray-7` | `#434851` | `gray-7` | `#c5c9d0` |
| `--line-strong` | `gray-8` | `#676c75` | `gray-8` | `#8b8f98` |
| **Text and icons** | | | | |
| `--fg` | `gray-12` | `#eff0f3` | `gray-12` | `#171b21` |
| `--fg-secondary` | `gray-11` | `#babec4` | `gray-11` | `#484d57` |
| `--fg-muted` | `gray-10` | `#9a9fa7` | `gray-10` | `#636871` |
| `--fg-disabled` | `gray-9` | `#7c8089` | `gray-9` | `#777c85` |
| **Accent (brand, primary action, selection)** | | | | |
| `--accent` | `blue-9` | `#3e69e9` | `blue-9` | `#3e69e9` |
| `--accent-pressed` | `blue-10` | `#335cdb` | `blue-10` | `#335cdb` |
| `--accent-subtle` | `blue-3` | `#152347` | `blue-3` | `#e8efff` |
| `--accent-line` | `blue-7` | `#314e9c` | `blue-7` | `#a4c0ff` |
| `--accent-fg` | `blue-11` | `#9fbdff` | `blue-11` | `#3158cf` |
| `--on-accent` | `white` | `#ffffff` | `white` | `#ffffff` |
| `--focus` | `blue-11` | `#9fbdff` | `blue-9` | `#3e69e9` |
| **Success (correct)** | | | | |
| `--success` | `green-9` | `#37c080` | `green-9` | `#129d63` |
| `--success-subtle` | `green-3` | `#092d1b` | `green-3` | `#e3f4e9` |
| `--success-line` | `green-6` | `#065131` | `green-6` | `#b2dfc4` |
| `--success-fg` | `green-11` | `#63d99b` | `green-11` | `#14764a` |
| `--on-success` | `gray-1` | `#0f1013` | `gray-12` | `#171b21` |
| **Error (wrong, destructive)** | | | | |
| `--error` | `red-9` | `#d22d33` | `red-9` | `#cb242d` |
| `--error-pressed` | `red-10` | `#c31a26` | `red-10` | `#bc0b20` |
| `--error-subtle` | `red-3` | `#401614` | `red-3` | `#ffe9e7` |
| `--error-line` | `red-6` | `#732524` | `red-6` | `#ffc1bb` |
| `--error-fg` | `red-11` | `#f7958d` | `red-11` | `#be222a` |
| `--on-error` | `white` | `#ffffff` | `white` | `#ffffff` |
| **Warning** | | | | |
| `--warning` | `amber-9` | `#f9ad26` | `amber-9` | `#f9ad26` |
| `--warning-subtle` | `amber-3` | `#342103` | `amber-3` | `#f9edde` |
| `--warning-line` | `amber-6` | `#5d3c00` | `amber-6` | `#eccda4` |
| `--warning-fg` | `amber-11` | `#f5b75b` | `amber-11` | `#8d5e00` |
| `--on-warning` | `gray-1` | `#0f1013` | `gray-12` | `#171b21` |
| **Game** | | | | |
| `--streak` | `orange-9` | `#e36b00` | `orange-9` | `#a94e00` |
| `--streak-subtle` | `orange-3` | `#3c1b07` | `orange-3` | `#ffeae0` |
| `--freeze` | `cyan-11` | `#63d1f2` | `cyan-11` | `#006f87` |
| `--freeze-subtle` | `cyan-3` | `#072a33` | `cyan-3` | `#e3f2f8` |
| **Aliases** | | | | |
| `--info` | = `--accent` | `#3e69e9` | = `--accent` | `#3e69e9` |
| `--info-subtle` | = `--accent-subtle` | `#152347` | = `--accent-subtle` | `#e8efff` |
| `--info-line` | = `--accent-line` | `#314e9c` | = `--accent-line` | `#a4c0ff` |
| `--info-fg` | = `--accent-fg` | `#9fbdff` | = `--accent-fg` | `#3158cf` |
| `--xp` | = `--accent` | `#3e69e9` | = `--accent` | `#3e69e9` |

Extra tokens not in the color scales (defined in §10.2):

| Token | Dark | Light | Use |
|---|---|---|---|
| `--scrim` | `rgb(0 0 0 / 0.64)` | `rgb(23 27 33 / 0.40)` | Behind sheets and dialogs |
| `--elev-1` | `none` | `0 1px 2px rgb(23 27 33 / 0.06)` | Cards, tiles |
| `--elev-2` | `inset 0 1px 0 rgb(255 255 255 / 0.04), 0 2px 8px rgb(0 0 0 / 0.40)` | `0 1px 2px rgb(23 27 33 / 0.06), 0 4px 12px rgb(23 27 33 / 0.08)` | Toasts, selected segment, popovers |
| `--elev-3` | `inset 0 1px 0 rgb(255 255 255 / 0.05), 0 -8px 32px rgb(0 0 0 / 0.55)` | `0 -8px 32px rgb(23 27 33 / 0.16)` | Bottom sheets, dialogs |

### 2.7 Usage rules

- **Accent (`--accent`, `--accent-fg`, `--accent-subtle`)** is only for: the primary button, the selected state (tile, chip, segment, node), links and ghost buttons, the active tab, XP and level progress, and focus (dark theme). It is never used for decoration or illustration fills, apart from one accent element per illustration (§5.5).
- **Success and error** are only for verdicts (tile, node, verdict strip, sheet header). Error is also the destructive button and the danger row. **Never** use green or red in Stats to mean good or bad accuracy: bars use domain colors, and weakness is expressed as a ranked list.
- **Warning** is only for real risk to data: storage blocked, an import that will overwrite progress, a failed export. Offline is not a warning, and neither is a lost streak.
- **Domain hues** are only for domain identity: the DomainBadge, domain dots, Stats bars and onboarding illustrations. TraceCanvas uses neutral tokens plus state colors only, so a pink "Hashing" node can never be mistaken for a "wrong" node.
- **Text hierarchy:** `--fg` for titles and reading text, `--fg-secondary` for supporting copy, `--fg-muted` for metadata only (see the APCA note in §2.8). `--fg-disabled` is for disabled controls only, which are exempt from contrast rules (WCAG 1.4.3); it still measures 3.7–4.8:1 against the surfaces it sits on.
- **Lines:** `--line-subtle` for dividers and card edges (decorative), `--line` for component edges that help grouping, and `--line-strong` (≥ 3:1 on `--canvas`, `--surface` and `--surface-raised`) whenever the border is the only thing that shows where a control is: toggle track, TraceCanvas node outline.
- **Disabled states use tokens, not opacity.** Opacity makes contrast unpredictable on tinted backgrounds.
- **Primitives are banned outside `src/ui/tokens/`.** CI enforces this (§10.7).

### 2.8 Contrast (computed)

Method: WCAG 2.x relative luminance with sRGB linearisation (threshold 0.04045). APCA Lc was computed with APCA-W3 0.0.98G-4g constants and is shown as an absolute value. Every pair was computed from the final hex values above with a small script outside the repo. **WCAG 2.2 AA (≥ 4.5:1 text, ≥ 3:1 UI and graphics) is the pass criterion**, matching the sprint DoD. APCA is a secondary check, because it is not part of WCAG 2.2 ([APCA introduction](https://github.com/Myndex/apca-introduction); [ARC Bronze thresholds](https://a11yreadtech.github.io/ARC/tests/bronze-simple-mode)).

**Text pairs (need ≥ 4.5:1).** Worst case: 4.77:1.

| Foreground | Background | Use | Dark ratio | Dark APCA Lc | Light ratio | Light APCA Lc | Min |
|---|---|---|---|---|---|---|---|
| `fg` | `canvas` | Body text, titles | 16.69:1 | 98 | 16.12:1 | 99 | 4.5:1 pass |
| `fg` | `surface` | Card text | 15.75:1 | 97 | 17.28:1 | 104 | 4.5:1 pass |
| `fg` | `surface-raised` | OptionTile label | 14.47:1 | 96 | 17.28:1 | 104 | 4.5:1 pass |
| `fg-secondary` | `canvas` | Scenario prompt meta, secondary copy | 10.19:1 | 67 | 7.92:1 | 84 | 4.5:1 pass |
| `fg-secondary` | `surface-raised` | Tile secondary line | 8.83:1 | 65 | 8.49:1 | 89 | 4.5:1 pass |
| `fg-muted` | `canvas` | Captions, timestamps | 7.15:1 | 50 | 5.23:1 | 73 | 4.5:1 pass |
| `fg-muted` | `surface` | Card captions | 6.74:1 | 49 | 5.60:1 | 78 | 4.5:1 pass |
| `fg-muted` | `surface-raised` | Captions on tiles | 6.20:1 | 48 | 5.60:1 | 78 | 4.5:1 pass |
| `fg-muted` | `surface-hover` | Caption on pressed/hover row | 5.70:1 | 47 | 4.99:1 | 70 | 4.5:1 pass |
| `accent-fg` | `canvas` | Links, ghost buttons | 10.14:1 | 67 | 5.72:1 | 75 | 4.5:1 pass |
| `accent-fg` | `accent-subtle` | Selected tile key badge | 8.21:1 | 64 | 5.32:1 | 70 | 4.5:1 pass |
| `fg` | `accent-subtle` | Selected tile label | 13.52:1 | 95 | 15.00:1 | 95 | 4.5:1 pass |
| `on-accent` | `accent` | Primary button label | 4.77:1 | 78 | 4.77:1 | 78 | 4.5:1 pass |
| `on-accent` | `accent-pressed` | Primary button, pressed | 5.68:1 | 83 | 5.68:1 | 83 | 4.5:1 pass |
| `success-fg` | `success-subtle` | Verdict text, correct tile badge | 8.50:1 | 67 | 4.94:1 | 69 | 4.5:1 pass |
| `success-fg` | `surface-raised` | Check icon on tile | 9.37:1 | 69 | 5.65:1 | 78 | 4.5:1 pass |
| `fg` | `success-subtle` | Correct tile label | 13.14:1 | 95 | 15.13:1 | 95 | 4.5:1 pass |
| `error-fg` | `error-subtle` | Verdict text, wrong tile badge | 7.18:1 | 57 | 5.23:1 | 68 | 4.5:1 pass |
| `error-fg` | `surface-raised` | X icon on tile | 7.57:1 | 58 | 6.08:1 | 79 | 4.5:1 pass |
| `fg` | `error-subtle` | Wrong tile label | 13.72:1 | 95 | 14.86:1 | 94 | 4.5:1 pass |
| `on-error` | `error` | Destructive button label | 5.04:1 | 79 | 5.48:1 | 81 | 4.5:1 pass |
| `on-error` | `error-pressed` | Destructive button, pressed | 6.01:1 | 83 | 6.55:1 | 85 | 4.5:1 pass |
| `warning-fg` | `warning-subtle` | Warning banner text | 8.65:1 | 67 | 4.87:1 | 68 | 4.5:1 pass |
| `on-warning` | `warning` | Warning badge label | 10.00:1 | 67 | 9.08:1 | 66 | 4.5:1 pass |
| `freeze` | `surface` | Freeze count | 10.20:1 | 70 | 5.80:1 | 78 | 4.5:1 pass |
| `graphs-fg` | `graphs-subtle` | Graphs & Routing chip | 8.60:1 | 67 | 5.06:1 | 69 | 4.5:1 pass |
| `dp-fg` | `dp-subtle` | Dynamic Programming chip | 8.38:1 | 65 | 5.77:1 | 72 | 4.5:1 pass |
| `trees-fg` | `trees-subtle` | Trees & Tries chip | 9.39:1 | 72 | 5.29:1 | 71 | 4.5:1 pass |
| `sorting-fg` | `sorting-subtle` | Sorting & Searching chip | 8.04:1 | 63 | 5.02:1 | 68 | 4.5:1 pass |
| `hashing-fg` | `hashing-subtle` | Hashing & Heaps chip | 8.25:1 | 64 | 5.48:1 | 70 | 4.5:1 pass |

**Non-text pairs: UI components, state indicators and graphics (need ≥ 3:1, WCAG 1.4.11).** Worst case: 3.02:1.

| Foreground | Background | Use | Dark ratio | Dark APCA Lc | Light ratio | Light APCA Lc | Min |
|---|---|---|---|---|---|---|---|
| `line-strong` | `surface` | Toggle track, node outline, input border | 3.40:1 | 24 | 3.24:1 | 60 | 3:1 pass |
| `line-strong` | `canvas` | Node outline on canvas | 3.60:1 | 25 | 3.02:1 | 55 | 3:1 pass |
| `focus` | `canvas` | Focus ring | 10.14:1 | 67 | 4.45:1 | 68 | 3:1 pass |
| `focus` | `surface-raised` | Focus ring on tile | 8.79:1 | 65 | 4.77:1 | 73 | 3:1 pass |
| `accent` | `canvas` | Selected border (outer edge) | 3.99:1 | 29 | 4.45:1 | 68 | 3:1 pass |
| `accent` | `accent-subtle` | Selected border (inner edge) | 3.23:1 | 26 | 4.14:1 | 63 | 3:1 pass |
| `success` | `success-subtle` | Correct border / node ring | 6.43:1 | 53 | 3.05:1 | 53 | 3:1 pass |
| `success` | `canvas` | Correct node ring on canvas | 8.17:1 | 56 | 3.25:1 | 57 | 3:1 pass |
| `error` | `error-subtle` | Wrong border / node ring | 3.10:1 | 26 | 4.72:1 | 65 | 3:1 pass |
| `error` | `canvas` | Wrong node ring on canvas | 3.77:1 | 28 | 5.12:1 | 71 | 3:1 pass |
| `xp` | `track` | XPBar fill vs track | 3.18:1 | 26 | 4.03:1 | 61 | 3:1 pass |
| `streak` | `surface` | Streak flame icon | 5.44:1 | 41 | 5.56:1 | 77 | 3:1 pass |
| `graphs` | `surface` | Graphs & Routing bar / dot | 7.00:1 | 51 | 3.65:1 | 64 | 3:1 pass |
| `dp` | `surface` | Dynamic Programming bar / dot | 5.32:1 | 40 | 6.73:1 | 82 | 3:1 pass |
| `trees` | `surface` | Trees & Tries bar / dot | 10.12:1 | 69 | 3.62:1 | 63 | 3:1 pass |
| `sorting` | `surface` | Sorting & Searching bar / dot | 5.44:1 | 41 | 5.56:1 | 77 | 3:1 pass |
| `hashing` | `surface` | Hashing & Heaps bar / dot | 7.08:1 | 52 | 4.82:1 | 72 | 3:1 pass |
| `graphs` | `track` | Graphs & Routing bar vs track | 5.91:1 | 49 | 3.09:1 | 52 | 3:1 pass |
| `dp` | `track` | Dynamic Programming bar vs track | 4.50:1 | 38 | 5.69:1 | 71 | 3:1 pass |
| `trees` | `track` | Trees & Tries bar vs track | 8.55:1 | 67 | 3.06:1 | 52 | 3:1 pass |
| `sorting` | `track` | Sorting & Searching bar vs track | 4.60:1 | 39 | 4.70:1 | 66 | 3:1 pass |
| `hashing` | `track` | Hashing & Heaps bar vs track | 5.98:1 | 50 | 4.07:1 | 61 | 3:1 pass |

**Decorative edges (no requirement; listed so nobody relies on them):**

| Foreground | Background | Use | Dark ratio | Dark APCA Lc | Light ratio | Light APCA Lc | Min |
|---|---|---|---|---|---|---|---|
| `line` | `surface` | Card border (decorative) | 1.95:1 | 10 | 1.66:1 | 29 | decorative, no minimum |
| `line-subtle` | `surface` | Divider (decorative) | 1.50:1 | 0 | 1.44:1 | 21 | decorative, no minimum |

**Rules derived from APCA.** APCA penalises small light-on-dark text more than WCAG 2 does. In dark mode `--fg-muted` reaches only Lc 47–50 (WCAG 5.7–7.2:1). So:
- Reading text (scenario prompt, explanation, rationale) must use `--fg` (Lc ≥ 95) or `--fg-secondary` (Lc ≥ 65). Never use `--fg-muted` for it.
- `--fg-muted` is only for metadata of 13 px / weight 500 or larger (captions, counters, timestamps), and only where the information is also available elsewhere or is non-essential.
- Text on `--accent` (Lc 78) and `--error` (Lc 79–81) meets the APCA body-text level at 16 px / 600, which is how buttons are set.

### 2.9 Color-blind strategy

Simulated with the Machado, Oliveira & Fernandes (2009) model at full severity, in linear RGB. ΔE is Euclidean distance in OKLab × 100. Below about 5, colors are hard to tell apart; below about 2, they are effectively the same.

| Pair | Theme | Normal | Protanopia | Deuteranopia | Tritanopia |
|---|---|---|---|---|---|
| `success` vs `error` | dark | 35.7 | 30.0 | 14.8 | 38.5 |
| `success-subtle` vs `error-subtle` | dark | 10.9 | 4.6 | 1.7 | 13.1 |
| closest domain pair | dark | 18.3 (dp/hashing) | 7.8 (graphs/hashing) | 9.0 (graphs/hashing) | 7.0 (sorting/hashing) |
| `success` vs `error` | light | 32.1 | 21.3 | 7.7 | 34.0 |
| `success-subtle` vs `error-subtle` | light | 4.4 | 1.8 | 0.5 | 4.7 |
| closest domain pair | light | 19.2 (sorting/hashing) | 11.6 (dp/hashing) | 6.3 (graphs/hashing) | 6.6 (graphs/trees) |

What this means:
- The **solid** success and error colors stay distinguishable for all three deficiencies, mostly through lightness: green is lighter than red in both themes.
- The **tinted backgrounds** (`*-subtle`) are nearly identical for protan and deutan viewers. A correct tile and a wrong tile **must** differ in shape and text.
- Domain colors stay at ΔE ≥ 6.3 from each other under every simulation (the closest pairs are listed above). They are always shown with an icon and a label anyway.

**Required encoding for every right/wrong surface:**

| Channel | Correct | Wrong (your pick) | Selected (before Check) |
|---|---|---|---|
| Icon | `circle-check` | `circle-x` | none; the key badge fills instead |
| Shape | 2 px **solid** border | 2 px **dashed** border (CSS `border-style: dashed`; SVG `stroke-dasharray: 4 3`) | 2 px solid border plus a filled key badge |
| Text | "Best fit" / "Correct" | "Your pick" / "Not quite" | "Selected" (screen reader) |
| Color | `--success` border, `--success-subtle` fill, `--success-fg` icon and text | `--error` border, `--error-subtle` fill, `--error-fg` icon and text | `--accent` border, `--accent-subtle` fill |
| Haptic (Android) | 1 short pulse | 2 pulses | none |
| Screen reader | "Correct. Consistent hashing." | "Not quite. Your pick: Min-heap. Best fit: Consistent hashing." | "Consistent hashing, selected, 2 of 4" |

TraceCanvas nodes follow the same encoding: solid ring plus check badge for correct, dashed ring plus x badge for wrong.

---

## 3. Typography

### 3.1 Families

| Role | Family | Version / package | File (latin, variable `wght`) | Size | License |
|---|---|---|---|---|---|
| UI text | **Inter** | Inter 4.1 (font version 4.001) via `@fontsource-variable/inter@5.3.0` | `inter-latin-wght-normal.woff2`, axis 100–900 | 48,256 B (47.1 KiB) | SIL OFL 1.1 |
| Code, Big-O, node labels | **JetBrains Mono** | JetBrains Mono 2.211 via `@fontsource-variable/jetbrains-mono@5.3.0` | `jetbrains-mono-latin-wght-normal.woff2`, axis 100–800 | 40,404 B (39.5 KiB) | SIL OFL 1.1 |
| **Total precached** | | | | **86.6 KiB** | |

Why this pair:
- **Matched metrics.** Inter's x-height is 0.546 em (1118/2048) and JetBrains Mono's is 0.550 em (550/1000). Cap heights are 0.728 and 0.730 em. Measured from the font files, the two are within 1 %, so `O(n log n)` sits inline in Inter text at the same font size with no `size-adjust` hacks.
- **Disambiguation where it matters.** In Inter, `I`, `l` and `1` are nearly identical (Inter's alternate glyphs are not in the Fontsource subset). JetBrains Mono has a dotted zero, a tailed `l` and a flagged `1`, so `O(1)`, `O(l)` and `0`/`O` can't be confused. All notation is therefore set in mono.
- **Tabular figures.** Inter's `tnum` feature is in the subset, so counters, XP and timers don't jitter.
- **Familiar to the audience.** Inter is the default UI face of the developer tools we want to sit next to (Linear, Raycast), and JetBrains Mono is a code-editor face.
- **Future-proof.** The latin subset already covers Portuguese, the first localisation on the roadmap (`ã`, `ç`, `õ`, `é`).

Alternatives considered:
- **Geist + Geist Mono 1.9** (OFL). 51.3 KiB in total, 35 KiB lighter, with a slashed zero. Rejected because it has a strong Vercel brand association and its x-height (0.530 em) is less generous at 13–15 px. It is the fallback choice if the precache budget ever gets tight.
- **IBM Plex Sans + Plex Mono** (OFL). Distinctive but wider (≈ 101 % of Arial width vs Inter's 107 %, at a smaller x-height of 0.516 em). Its corporate IBM tone fits less well.

### 3.2 Font stacks

```css
--font-sans: "Inter Variable", "Inter Fallback", ui-sans-serif, system-ui, -apple-system,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "JetBrains Mono Variable", ui-monospace, "SF Mono", SFMono-Regular, Menlo,
             Consolas, "Roboto Mono", monospace;
```

`"Inter Fallback"` is a local Arial or Helvetica with metric overrides, computed from the actual Inter file (a frequency-weighted average advance width vs Helvetica/Arial metrics). It removes most layout shift on the very first visit, before the font is in the cache:

```css
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial"), local("Helvetica Neue"), local("Helvetica");
  size-adjust: 107.32%;
  ascent-override: 90.27%;
  descent-override: 22.48%;
  line-gap-override: 0%;
}
```

### 3.3 Type scale (mobile first; the same at every breakpoint)

All sizes are in `rem`, so the scale follows the user's browser font size. Letter-spacing follows Inter's dynamic metrics (tracking = −0.0223 + 0.185·e^(−0.1745·size)), rounded.

| Token | Size / line height | Weight | Tracking | Family | Use |
|---|---|---|---|---|---|
| `display` | 32 / 36 px (2 / 2.25 rem) | 700 | −0.022 em | sans | Level-up number, Summary hero |
| `title-1` | 24 / 30 px | 700 | −0.019 em | sans | Screen titles ("Today", "Session complete"), onboarding headlines |
| `title-2` | 20 / 26 px | 600 | −0.017 em | sans | Scenario title, sheet title, TopBar title |
| `title-3` | 17 / 24 px | 600 | −0.013 em | sans | Card titles, validation question, large button label |
| `body-lg` | 17 / 26 px | 400 | −0.013 em | sans | Scenario prompt (the main reading text) |
| `body` | 16 / 24 px | 400 (tile label 500) | −0.011 em | sans | Explanations, option labels, list rows, md button label (600) |
| `body-sm` | 14 / 20 px | 400 | −0.006 em | sans | Rationale, secondary copy, toasts, sm button label (600) |
| `caption` | 13 / 18 px | 500 | −0.003 em | sans | Metadata, counters, chip text, helper text |
| `overline` | 12 / 16 px | 600 | +0.04 em, uppercase | sans | Settings section labels only |
| `tab` | 12 / 16 px | 600 | 0 | sans | BottomTabBar labels |
| `mono-lg` | 18 / 24 px | 500 | 0 | mono | BigOPicker choices |
| `mono` | 15 / 22 px | 500 | 0 | mono | Inline complexity and code in explanations |
| `mono-node` | 14 / 20 px | 600 | 0 | mono | TraceCanvas node and cell labels |
| `mono-sm` | 12 / 16 px | 500 | 0 | mono | Edge weights, array indices |

Rules:
- **Weights:** 400, 500, 600 and 700 only. **No italics** anywhere. No italic files are shipped (that saves about 92 KiB), and `font-synthesis: none` stops the browser faking them. Content uses **bold** for emphasis.
- **Minimum size is 12 px**, and 12 px is only allowed for `overline`, `tab` and `mono-sm`. Reading text is at least 16 px.
- **Tabular figures** (`tabular-nums`) on every number that changes: XP, counters, timers, percentages, streak counts.
- **Line length:** the 480 px column limits reading text to about 60 characters at `body-lg`.
- **Headings** use `text-wrap: balance`. Paragraphs use `text-wrap: pretty`. Hyphenation is never used.
- **Never truncate answers or explanations.** Truncation (`…`) is allowed only for user-visible file names.

### 3.4 Big-O and code notation

**Authoring (content JSON):** ASCII only. The `Complexity` renderer turns it into typography.

| Authored | Renders as | Spoken (screen reader) |
|---|---|---|
| `O(1)` | O(1) | "O of 1" |
| `O(log n)` | O(log n) | "O of log n" |
| `O(n log n)` | O(n log n) | "O of n log n" |
| `O(n^2)` | O(n<sup>2</sup>) | "O of n squared" |
| `O(n^3)` / `O(n^k)` | O(n<sup>3</sup>) / O(n<sup>k</sup>) | "n cubed" / "n to the k" |
| `O(2^n)` | O(2<sup>n</sup>) | "O of 2 to the n" |
| `O(n!)` | O(n!) | "O of n factorial" |
| `O(V + E)` | O(V + E) | "O of V plus E" |
| `O((V + E) log V)` | O((V + E) log V) | "O of V plus E, log V" |
| `O(n*m)` | O(n·m) | "O of n times m" |
| `O(sqrt n)` | O(√n) | "O of square root of n" |

Rules:
- Validation regex for the content CI check: `^O\((?:[A-Za-z0-9 +*^!()]|sqrt|log)+\)$`. Use one space around `+` and between factors (`n log n`) and no spaces inside parentheses. `log` is lowercase with no base. Variables are `n m k V E W h L`.
- Rendering: mono, `font-variant-ligatures: none` (JetBrains Mono ligatures would turn `<=` or `->` into single glyphs), `white-space: nowrap` (a complexity never wraps), weight 500.
- Exponents use `<sup>` styled as `font-size: 0.7em; position: relative; top: -0.45em; line-height: 0`, so the line box doesn't grow. Do not use Unicode superscripts: `ⁿ` is in neither font.
- `√` (U+221A) is not in the JetBrains Mono latin subset and renders from the system mono fallback. That is acceptable because it is rare. If content starts using `≤`, `→` or `√` often, build a custom subset from upstream JetBrains Mono 2.304, which has these glyphs (§3.5).
- Accessible name: render `<span aria-hidden="true">` for the visual plus a visually hidden spoken string. **Never** rely on `aria-label` on a bare `<span>`.
- Inline in prose: a complexity is mono, the same size as the surrounding text, in `--fg`, with no background. *Code identifiers* (`hash(key) % n`) are mono on `--surface-hover` with `radius-xs` and 4 px horizontal padding.
- The letter is always uppercase Latin `O`, never a zero. The dotted zero in JetBrains Mono keeps them apart.

### 3.5 Loading fonts (offline-first)

1. **Vendor two files** into `public/fonts/`, with the version in the name, and commit them together with their OFL license texts:
   - `public/fonts/inter-4.1-latin-wght.woff2` (copied from `@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`)
   - `public/fonts/jetbrains-mono-2.211-latin-wght.woff2` (from `@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2`)
   - `public/fonts/OFL-Inter.txt`, `public/fonts/OFL-JetBrainsMono.txt`

   Why not `import "@fontsource-variable/inter"`? Its CSS declares seven subsets. Vite would emit every file, and Workbox's `**/*.woff2` glob would precache about 213 KiB for Inter alone instead of 47 KiB.
2. **Declare them** in `src/ui/fonts/fonts.css`:

```css
@font-face {
  font-family: "Inter Variable";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/inter-4.1-latin-wght.woff2") format("woff2-variations");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
                 U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
                 U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "JetBrains Mono Variable";
  font-style: normal;
  font-weight: 100 800;
  font-display: swap;
  src: url("/fonts/jetbrains-mono-2.211-latin-wght.woff2") format("woff2-variations");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
                 U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
                 U+2212, U+2215, U+FEFF, U+FFFD;
}
/* + the "Inter Fallback" face from §3.2 */
```

3. **Preload only Inter** (it is above the fold on every screen). Mono first appears inside a session.

```html
<link rel="preload" href="/fonts/inter-4.1-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
```

4. **Precache** both files. `vite-plugin-pwa`'s Workbox `globPatterns` must include `woff2` (§10.6). After install, fonts are served from Cache Storage in airplane mode, so `font-display: swap` only matters on the very first online visit, and the metric-matched fallback keeps that shift small.
5. **Updating** means bumping the npm package, re-copying the files and changing the version in the file name (that is the cache bust). Verify with DevTools → Application → Cache Storage.
6. **Optional, if math glyphs are needed:** subset upstream JetBrains Mono 2.304 yourself:

```bash
pyftsubset "JetBrainsMono[wght].ttf" --flavor=woff2 \
  --unicodes="U+0000-00FF,U+2000-206F,U+2190-2193,U+2212,U+221A,U+221E,U+2248,U+2260,U+2264-2265,U+2308-230B" \
  --layout-features="kern,ccmp,locl,mark,mkmk" \
  --output-file="public/fonts/jetbrains-mono-2.304-aa-wght.woff2"
```

### 3.6 Dynamic type and zoom

- Never set `maximum-scale` or `user-scalable=no` (WCAG 1.4.4).
- Set `-webkit-text-size-adjust: 100%` so iOS doesn't inflate text in landscape. The user's own zoom still works.
- All type, spacing and control heights are in `rem`, so a larger default font size grows the layout proportionally. Fixed `px` values are allowed only for borders (1–2 px), focus outlines (2 px), and SVG strokes.
- Test at 200 % text and at 320 CSS px width (WCAG 1.4.10 Reflow). The AnswerDock may then grow past the 40 % line. That is the correct trade-off: accessibility beats the thumb rule.

---

## 4. Spacing, grid and layout

### 4.1 Spacing scale (4 px base)

Tailwind's default `--spacing: 0.25rem` gives one unit = 4 px. **Only these steps are allowed:**

| Token (Tailwind) | px | Typical use |
|---|---|---|
| `0.5` | 2 | Hairline offsets, badge nudges |
| `1` | 4 | Icon-to-text in chips, AnswerDock top padding |
| `2` | 8 | Gap between OptionTiles, between stacked buttons, icon-to-label in buttons |
| `3` | 12 | Tile vertical padding, card inner gaps, dock bottom padding |
| `4` | 16 | **Side gutter**, card padding, tile horizontal padding |
| `5` | 20 | Large button horizontal padding |
| `6` | 24 | Gap between sections, sheet padding |
| `8` | 32 | Gap before a screen's primary block |
| `10` | 40 | Large empty-state spacing |
| `12` | 48 | Minimum target size (as a size, not a gap) |
| `14` | 56 | Primary button and TopBar height |
| `16` | 64 | BottomTabBar height |

### 4.2 Layout tokens

| Token | Value | Notes |
|---|---|---|
| `--gutter` | 1rem (16 px) | Side padding at < 480 px; 24 px at ≥ `sm` |
| `--content-max` (`max-w-content`) | 30rem (480 px) | All screens, centered |
| `--size-topbar` | 3.5rem (56 px) + `safe-area-inset-top` | TopBar and SessionTopBar |
| `--size-tabbar` | 4rem (64 px) + `safe-area-inset-bottom` | BottomTabBar |
| `--size-control-sm` | 2.5rem (40 px) visual, 48 px hit | Toast action, List toggle |
| `--size-control-md` | 3rem (48 px) | Default button, OptionTile minimum, segmented control, list rows (48–56) |
| `--size-control-lg` | 3.5rem (56 px) | Primary forward action |
| Section gap | 24 px | Between cards and sections |
| Stack gap | 8 px (controls) / 12 px (card content) | |

### 4.3 Breakpoints and maximum width

| Name | Min width | Layout |
|---|---|---|
| base | 0 (designed at **360**, must reflow at 320) | Single column, 16 px gutters, bottom tab bar, bottom sheets |
| `sm` | 30rem (480 px) | The column stops growing at 480 px and is centered. Gutters 24 px. Large phones in landscape, small tablets |
| `md` | 48rem (768 px) | Same column. Sheets and confirmations become **centered dialogs** (max width 30rem, `radius-xl` on all corners). The tab bar keeps its background full width, with its items constrained to the column |
| `lg` | 64rem (1024 px) | As `md`, plus a visible keyboard-shortcut hint (1–4 to choose, Enter to check or continue) |
| `short` (height) | `max-height: 40rem` (640 px) | TopBar 48 px, Home date caption hidden, scenario title uses `title-3`, OptionTile gap 4 px |

Orientation is **not locked** (WCAG 1.3.4). In landscape the column stays centered, the content scrolls and the AnswerDock stays pinned.

### 4.4 Safe areas and PWA viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

- Use `viewport-fit=cover` so the app draws behind the notch and the home indicator, then pad with `env()`. Without it, iOS standalone apps don't draw behind the gesture bar ([WebKit bug 236445](https://bugs.webkit.org/show_bug.cgi?id=236445)).
- **TopBar:** `padding-top: env(safe-area-inset-top)`. **BottomTabBar:** `padding-bottom: env(safe-area-inset-bottom)`. **AnswerDock and sheet footers:** `padding-bottom: max(0.75rem, env(safe-area-inset-bottom))`. **Landscape:** side padding `max(var(--gutter), env(safe-area-inset-left|right))`.
- Shells use `min-height: 100dvh` (dynamic viewport units), never `100vh`.
- Session screens set `overscroll-behavior-y: contain` on the scroll container, so pull-to-refresh can't fire mid-answer in browser mode.
- All interactive elements set `touch-action: manipulation`. This is essential: Check and Continue are tapped in the same spot within a second, and iOS would otherwise read the two taps as a double-tap zoom. Pinch zoom keeps working.
- iOS status bar: `apple-mobile-web-app-status-bar-style: black-translucent` (white status text over our dark canvas). In the **light theme in iOS standalone mode**, white status text would sit on `#f6f7f9`. We paint a status-bar strip of height `env(safe-area-inset-top)` in `--gray-12`. This is a known trade-off, because the style can't change after launch.
- **Safari 26 note:** iOS 26 Safari ignores `<meta name="theme-color">` and tints its bars from the `body` background color or from fixed-position elements ([Ben Frain](https://benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements/); [WebKit bug 305546](https://bugs.webkit.org/show_bug.cgi?id=305546)). So `html` and `body` always have `background: var(--canvas)`, and the fixed TopBar uses `--canvas` too.

### 4.5 Thumb-zone map and the 40 % rule

One-handed use is the most common grip (49 % of observed touches, 67 % of them with the right thumb). Accuracy and comfort are best in the lower middle of the screen and worst at the top and in the corners ([Hoober, UXmatters 2013](https://uxmatters.com/mt/archives/2013/11/design-for-fingers-and-thumbs-instead-of-touch.php); [A List Apart](https://alistapart.com/article/how-we-hold-our-gadgets); [Smashing, The Thumb Zone](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/)). Hoober has since warned against treating a single heat map as universal, so we design for both hands with full-width controls.

```
        360 px viewport (right thumb, one-handed)
 y px ┌────────────────────────────────────┐
    0 │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ░ hard: reach or regrip
      │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
      │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│     → display only: titles, status, [X] close
   92 │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
      │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
      │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
  185 │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
      │░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
      │░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
  278 │░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  ▒ stretch: reading, canvas, secondary taps
      │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
      │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
  370 │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█████████████████│
      │▒▒▒▒▒▒▒▒▒▒▒▒████████████████████████│
      │▒▒▒▒▒▒▒▒████████████████████████████│
  444 ├┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┤ ← 60 % line: primary actions start below here
  462 │▒▒▒▒████████████████████████████████│
      │▒███████████████████████████████████│
      │████████████████████████████████████│
  555 │████████████████████████████████████│  █ natural: options, Check/Continue, tabs
      │████████████████████████████████████│
      │███████████████████████████▒▒▒▒▒▒▒▒▒│
  648 │██████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
      │███████████████████▒▒▒▒▒▒▒░░░░░░░░░░│
      │██████████████████▒▒▒▒▒░░░░░░░░░░░░░│
  740 └────────────────────────────────────┘
        Left-handed grip mirrors the map; full-width, centered
        controls work for both hands, so we never rely on a corner.
```

**The rule (testable):** on the reference viewport **360 × 740 CSS px**, the top edge of every primary action is at y ≥ 444 px (≥ 60 % of the viewport height). Primary actions are the OptionTiles, BigOPicker choices, Check, Continue, Next scenario, Done, Start session and the tab bar. A dev overlay (`?debug=zones`) draws the line (§10.7).

**One documented exception: TraceCanvas.** The canvas is bottom-anchored directly above the dock, but it needs about 228 px of height to keep 48 px targets apart. So at 360 × 740 its top row of nodes can sit up to about 30 px above the line, still in the lower part of the stretch zone. The Check button stays in the natural zone. This is accepted. Don't shrink the canvas to "fix" it, because that breaks the target-size rule.

**AnswerDock budget at 360 × 740 (the worst case: four options):**

| Part | px |
|---|---|
| Dock top padding | 4 |
| 4 × OptionTile (48 px min) | 192 |
| 3 × gap (8 px) | 24 |
| Gap to button | 8 |
| Check button | 56 |
| Bottom padding (`max(12 px, safe-area)`) | 12 |
| **Total** | **296 = exactly 40 % of 740** |

With an iPhone home indicator (34 px inset on an 852 px viewport) the total is 318 px, which is 37 %. The budget assumes single-line labels, which the content rules (≤ 28 characters) guarantee. Larger text sizes make the dock grow upwards. That is allowed.

**What goes where:**

| Zone | Allowed | Not allowed |
|---|---|---|
| Top (░) | Titles, status (streak, level, progress), the `[X]` session close (deliberately hard to reach, then confirmed) | Primary actions, anything tapped often |
| Middle (▒) | Reading content, TraceCanvas upper half, secondary actions (List toggle, disclosure) | The forward action |
| Bottom (█) | OptionTiles, BigOPicker, Check / Continue / Done, Start session, BottomTabBar, toasts, sheets' action buttons | Destructive buttons in the default spot (see ConfirmSheet ordering) |

### 4.6 Touch targets

- **Minimum 48 × 48 CSS px** for every target (sprint DoD). That is above WCAG 2.2 SC 2.5.8 (24 × 24, AA) and Apple's 44 pt, and matches Material's 48 dp (about 9 mm) ([W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); [EZUD summary](https://ezud.com/touch-target-sizes-mobile-accessibility/)).
- **56 px** for the primary forward button. It is the most-tapped target and sits near the bottom edge, where accuracy drops.
- **Spacing:** at least 8 px between separate targets. Contiguous cells in an array (§7.4) may abut, because each cell is itself at least 48 px.
- **The hit area may be bigger than the visual.** Small visuals (a 20 px icon, a 34 px node) get an invisible 48 px hit area (the `hit-target` utility, §10.3). Hit areas must not overlap. Where they would, the content must be laid out further apart (CI rule for trace visuals).
- **Edges:** keep targets at least 8 px away from the screen edge, and use the full width rather than corners.
- Pressed feedback appears within one frame (pressed token plus `scale(0.98)`), so people see that their tap registered ([Hoober's heuristic: people only tap what they can see react](https://addyosmani.com/blog/touch-friendly-design/)).

### 4.7 Screen scaffolds and layers

```
AppShell (Home, Stats, Settings)          SessionShell (Question, Validation, Feedback)
┌───────────────────────────┐             ┌───────────────────────────┐
│ TopBar          56 + inset│             │ SessionTopBar   56 + inset│
├───────────────────────────┤             ├───────────────────────────┤
│                           │             │ Stage (scrolls,           │
│ Content (scrolls)         │             │ overscroll: contain)      │
│                           │             ├┄┄┄┄┄┄ 16 px fade ┄┄┄┄┄┄┄┄┄┤
│ [primary CTA, in flow,    │             │ AnswerDock (fixed bottom) │
│  pinned above tab bar]    │             │ options + primary button  │
├───────────────────────────┤             │ pb: max(12px, inset)      │
│ BottomTabBar    64 + inset│             └───────────────────────────┘
└───────────────────────────┘             No tab bar during a session.
```

| Layer | `z-index` token | Value |
|---|---|---|
| Content | `--z-base` | 0 |
| Sticky TopBar, AnswerDock | `--z-sticky` | 10 |
| BottomTabBar | `--z-nav` | 20 |
| Toasts | `--z-toast` | 40 |
| Scrim + sheets / dialogs | `--z-overlay` | 50 |
| Coach mark | `--z-coach` | 60 |

---

## 5. Elevation, radius, borders, icons, illustration

### 5.1 Elevation

Dark theme: elevation means lighter surfaces plus a 1 px top highlight. Light theme: elevation means white surfaces plus shadow.

| Level | Used by | Dark | Light |
|---|---|---|---|
| 0 · canvas | Page | `--canvas` | `--canvas` |
| 1 · surface | Cards, BottomTabBar, StatTile | `--surface` + 1 px `--line-subtle`, `--elev-1` (none) | white + 1 px `--line-subtle` + `--elev-1` |
| 1 · raised | OptionTile, BigOPicker choice, TraceCanvas nodes' container | `--surface-raised` + 2 px `--line-subtle` | white + 2 px `--line-subtle` + `--elev-1` |
| 2 · floating | Toast, selected segment | `--surface-raised` + 1 px `--line` + `--elev-2` | white + 1 px `--line-subtle` + `--elev-2` |
| 3 · overlay | FeedbackSheet, ConfirmSheet, Dialog | `--surface` + `--elev-3` over `--scrim` | white + `--elev-3` over `--scrim` |

### 5.2 Radius

| Token | Value | Use |
|---|---|---|
| `radius-xs` | 4 px | Inline code, skeleton text lines |
| `radius-sm` | 8 px | Key badge, small buttons, node-label pills |
| `radius-md` | 12 px | Buttons, OptionTile, BigOPicker choice, segmented control, toggles' row focus |
| `radius-lg` | 16 px | Cards, TraceCanvas frame, toasts, banners |
| `radius-xl` | 24 px | Top corners of bottom sheets; all corners of dialogs (≥ `md`) |
| `radius-full` | 9999 px | Chips, badges, progress bars, toggle track, tab pill |

Nesting rule: inner radius = outer radius − inset, rounded down to a token, and never larger than the outer radius. Example: the 24 px key badge sits 12 px inside a `radius-md` tile, so it uses `radius-sm` (8 px).

### 5.3 Borders

- Width: **1 px** for cards, rows, toasts and banners. **2 px** for interactive choice surfaces (OptionTile, BigOPicker choice), *always*, even at rest (at rest the color is `--line-subtle`), so state changes never shift the layout.
- Style carries meaning: **solid** = default, selected or correct; **dashed** = the wrong pick (CSS `border-style: dashed` on tiles, `stroke-dasharray: 4 3` on SVG nodes). Dashed is used nowhere else, apart from blueprint illustrations, which are not interactive.
- The focus ring is not a border: it is `outline: 2px solid var(--focus); outline-offset: 2px`, so it never fights with state borders.

### 5.4 Iconography: Lucide

**Set:** [Lucide](https://lucide.dev) via `lucide-react@^1` (ISC license; 1.x supports React 16.5–19, with peers checked on npm). One outline style on a 24 px grid. Why not Phosphor: its six weights invite inconsistency, and we want exactly one weight. Lucide is the community default in the React/Tailwind ecosystem. Lucide v1 sets `aria-hidden="true"` automatically unless you pass an `aria-*` prop or a `title`, and v1 removed the brand icons ([v1 notes](https://newreleases.io/project/npm/lucide-react/release/1.0.1)).

| Size | Stroke | Use |
|---|---|---|
| 16 px | 1.75 px (absolute) | Inside chips, captions, verdict caption |
| 20 px | 1.75 px | Buttons, list rows, toasts, banners, OptionTile state icon |
| 24 px | 1.75 px | Tab bar, TopBar, verdict header, FeedbackSheet header |
| 32 px | 1.5 px | Empty states and feature callouts |

Set the defaults once:

```tsx
import { LucideProvider } from "lucide-react";
<LucideProvider size={20} strokeWidth={1.75} absoluteStrokeWidth>{children}</LucideProvider>
```

Icons are always `currentColor` and take their color from the text token of their container. Never mix in filled, duotone, emoji or third-party icons. The one exception is the StreakFlame "done today" state, which sets `fill="currentColor"` on Lucide `flame`.

**Icon map (the only icons used in the MVP):**

| Concept | Lucide name | | Concept | Lucide name |
|---|---|---|---|---|
| Play tab, Start session | `play` | | Graphs & Routing | `route` |
| Stats tab | `chart-column` | | Dynamic Programming | `grid-3x3` |
| Settings tab | `settings` | | Trees & Tries | `network` |
| Close session | `x` | | Sorting & Searching | `arrow-down-wide-narrow` |
| Back | `chevron-left` | | Hashing & Heaps | `hash` |
| Navigate row | `chevron-right` | | Time measure | `timer` |
| Correct | `circle-check` | | Space measure | `memory-stick` |
| Wrong | `circle-x` | | List view (trace) | `list` |
| Streak | `flame` | | Graph view (trace) | `waypoints` |
| Freeze | `snowflake` | | Unlock | `lock-open` |
| Offline | `wifi-off` | | Export / Import | `download` / `upload` |
| Update | `refresh-cw` | | Reset progress | `trash-2` |
| Info | `info` | | Warning | `triangle-alert` |
| Error | `circle-alert` | | Loading | `loader-circle` |
| Theme: dark / light / system | `moon` / `sun` / `monitor-smartphone` | | Privacy | `shield-check` |
| Haptics | `vibrate` | | Licenses | `file-text` |
| Disclosure | `chevron-down` / `chevron-up` | | Resume | `history` |

### 5.5 Illustration and empty-state style: "blueprint line art"

- **The same vocabulary as the product:** nodes (circles with r 6–10), edges, array cells, dashed construction lines, and a faint grid. No people, mascots, 3D or gradients.
- **Strokes** of 1.5 px: structure in `--line-strong`, construction lines dashed in `--line`, the grid in `--line-subtle`. Optionally **one** accent element (`--accent`) and **one** domain hue per illustration.
- Inline SVG using tokens via `currentColor` or CSS variables, so both themes work automatically. Sizes: 120 × 96 px (empty states), up to 296 × 160 px (onboarding). Always `aria-hidden="true"`; the text carries the meaning.
- Motion: an optional 480 ms stroke draw-in on onboarding only. Static under reduced motion.

### 5.6 Data display

- Bars are 8 px tall with `radius-full`, the value in text beside them, no gridlines and no legends (direct labels).
- Rings have a 10 px stroke on a 96 px ring (8 px on 64 px) with a round cap, start at 12 o'clock and run clockwise.
- Small samples are not drawn: under 5 answers a domain shows "Not enough data" instead of a misleading bar.

---

## 6. Motion and haptics

### 6.1 Principles

1. **Motion explains a change.** Something entered, something moved, something was confirmed. It is never decorative.
2. **Fast.** UI feedback takes ≤ 220 ms. Overlays enter in 320 ms and exit faster (220 ms). Only progress fills and the level-up celebration go past 400 ms.
3. **Interruptible.** Animations never block input, except the 350 ms input guard on a freshly relabelled button (§7.1).
4. **Reduced motion is designed, not deleted.** Spatial motion (slide, scale, sweep) becomes an opacity crossfade of ≤ 150 ms, or an instant change. Color and opacity transitions stay ([web.dev](https://web.dev/articles/prefers-reduced-motion)).

### 6.2 Tokens

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 80 ms | Press feedback (background, scale) |
| `--duration-fast` | 150 ms | Color changes, selection, toggle thumb, exits of small elements |
| `--duration-base` | 220 ms | Verdict reveal, toasts, step transitions, scrim |
| `--duration-slow` | 320 ms | Sheet enter |
| `--duration-slower` | 480 ms | XP and progress fill, ring fill, number count-up |
| `--duration-celebrate` | 800 ms | Level-up sequence (total) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | On-screen changes and fills |
| `--ease-enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Elements entering (sheets, toasts, verdict) |
| `--ease-exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Elements leaving |
| `--ease-overshoot` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebration only: check badge pop, LevelBadge |

The enter, exit and standard curves follow Material 3's emphasized decelerate, emphasized accelerate and standard curves ([M3 motion tokens](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)). The JS mirror lives in `src/ui/tokens/motion.ts`.

### 6.3 Interaction catalog

| Interaction | Animation | Duration / easing | Reduced motion | Haptic (Android) |
|---|---|---|---|---|
| Press any button, tile or row | background → pressed token, `scale(0.98)` | instant / standard | color only, no scale | none |
| Select OptionTile / choice / node | border, fill and key badge color change | fast / standard | same (color is allowed) | none |
| Check → correct | check icon `pop-in` (scale 0.6 → 1), verdict strip `rise-in` (8 px + fade), XP chip `rise-in` delayed 60 ms | base / overshoot (icon), enter (strip) | icons and strip fade in, 100 ms | `[12]` |
| Check → wrong | dashed border and x icon fade in (no shake), correct tile reveals as above | base / enter | fade, 100 ms | `[24, 60, 24]` |
| Step change (question → validation → next) | outgoing content fades and moves 12 px left; incoming moves from 12 px right | exit fast / enter base | crossfade 150 ms | none |
| SessionProgress segment | fill | base / standard | instant | none |
| FeedbackSheet open / close | scrim fade; sheet `translateY(100%) → 0` | slow / enter; close base / exit | fade 150 ms, no translate | none |
| Toast in / out | `rise-in` / fade | base / enter; fast / exit | fade | none |
| XPBar gain | width tween, then the number counts up (tabular) | slower / standard | final values, no tween | none |
| Streak extended (Summary) | flame goes from outline to filled with a 1 → 1.12 → 1 pulse; count crossfades | slow / overshoot | state swap, no pulse | `[15, 40, 15]` |
| Level-up | badge `pop-in`, then a ring sweep (`stroke-dashoffset`), then title and body rise in, staggered 80 ms | celebrate total | static badge plus 150 ms fade | `[20, 50, 20, 50, 40]` |
| Toggle | thumb translate, track color | fast / standard | instant thumb, color fade | none |
| Skeleton | shimmer | 1.2 s linear, infinite | static `--surface-hover` | none |
| Spinner (`loader-circle`) | rotate | 0.8 s linear, infinite | 1.6 s rotation plus the visible text "Working…" | none |
| Tab switch | none (instant); the active pill color fades | fast | same | none |

No confetti, particles, screen shake, parallax or autoplaying loops.

### 6.4 Reduced motion: implementation

- **The sources** are the OS setting `prefers-reduced-motion: reduce` **or** the in-app Settings toggle "Reduce motion". JS writes the combined result to `<html data-motion="reduce|full">` and listens for `change` on the media query.
- In CSS, spatial animations are written only under the `motion-ok:` custom variant (§10.3), which matches when neither source asks for reduced motion. Base styles stay static.
- Safety net in `semantic.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { scroll-behavior: auto !important; }
}
[data-motion="reduce"] *, [data-motion="reduce"] ::before, [data-motion="reduce"] ::after {
  animation-duration: 1ms !important; animation-iteration-count: 1 !important;
}
```

- JS-driven motion (count-ups, ring sweeps) reads `useReducedMotion()` and jumps to the end state.

### 6.5 Haptics

- **Android Chrome only.** The Vibration API is implemented only in Blink, and WebKit has never shipped it, so it is unavailable in every iOS browser ([W3C implementation report](https://w3c.github.io/vibration/reports/implementation.html)). No iOS workarounds: the hidden-switch hack is unofficial and was limited by iOS 18.4.
- **Detection:** `const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;`. When it is false, the Settings "Haptics" row is **hidden**, not disabled.
- **Default on** where supported. It can be turned off in Settings. Haptics are independent of reduced motion.
- **Only call it inside a user-activation path** (the Check tap, the Done tap), which Chrome requires.
- **Patterns** (ms): `correct [12]`, `wrong [24, 60, 24]`, `streakExtended [15, 40, 15]`, `levelUp [20, 50, 20, 50, 40]`. There is no haptic on selection, navigation or errors, to avoid buzz fatigue.

```ts
// src/ui/hooks/useHaptics.ts
const PATTERNS = { correct: [12], wrong: [24, 60, 24], streakExtended: [15, 40, 15], levelUp: [20, 50, 20, 50, 40] } as const;
export function haptic(kind: keyof typeof PATTERNS, enabled: boolean) {
  if (!enabled || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(PATTERNS[kind]);
}
```

- **Sound:** none in the MVP. People commute in public.

---

## 7. Components

### 7.0 Conventions for every component

- **Tokens only.** Every color, radius, shadow, duration and type style below is a token from §2–§6. In Tailwind that means `bg-surface-raised`, `text-fg-muted`, `border-line-subtle`, `rounded-md`, `shadow-2`, `text-body` and `duration-(--duration-fast)`.
- **State model.** The visual state is set with `data-state` (and ARIA), not with ad-hoc class names: `data-state="default|selected|correct|incorrect|dimmed"`. Disabled uses `aria-disabled="true"` (the control stays focusable, so screen-reader users can find it and learn why) plus `data-disabled`. Loading uses `aria-busy="true"`.
- **Pressed.** `active:` gives the pressed token plus `scale-[0.98]` under `motion-ok:` (80 ms). Hover styles apply only under `can-hover:` (fine pointers), so touch devices never get stuck hover states.
- **Focus.** The global `:focus-visible` gives `outline: 2px solid var(--focus); outline-offset: 2px`. Rows inside grouped lists use the inset variant (`outline-offset: -2px`). Never remove an outline without a replacement. Under forced colors the outline uses `Highlight`.
- **Input guard.** A button that changes meaning in place (Check → Continue) ignores activation for **350 ms** after the change, so a double tap can't skip the verdict.
- **Hit area.** At least 48 × 48 px for every target; use the `hit-target` utility when the visual is smaller.
- **Files.** `src/ui/components/<Name>/<Name>.tsx`, plus `<Name>.stories.tsx` (both themes, every state) and `<Name>.test.tsx` (a11y roles and states).

---

### 7.1 Button

**Anatomy.** `[leading icon 20] Label [trailing icon 20]` in a container with `radius-md`. The label is centered, gap 8 px.

**Variants.**

| Variant | Background | Label / icon | Border | Use |
|---|---|---|---|---|
| `primary` | `--accent` | `--on-accent` | none | The one forward action per screen |
| `secondary` | `--surface-raised` | `--fg` | 1 px `--line` | Alternatives: Cancel, Export a backup first |
| `ghost` | transparent | `--accent-fg` | none | Low emphasis: Skip, Practice one domain, toast action |
| `destructive` | `--error` | `--on-error` | none | Only inside a ConfirmSheet |

**Sizes.**

| Size | Height | Padding x | Label type | Icon | Notes |
|---|---|---|---|---|---|
| `lg` | 56 px | 20 px | `title-3` (17/24 600) | 20 | Full width in AnswerDock, sheets and Home |
| `md` | 48 px | 16 px | `body` 600 | 20 | Default |
| `sm` | 40 px visual, 48 px hit | 12 px | `body-sm` 600 | 16 | Toast actions, List toggle; never a primary action |
| `icon` | 48 × 48 px | 0 | n/a | 24 | `[X]`, back; needs `aria-label` |

**States.**

| State | primary | secondary | ghost | destructive |
|---|---|---|---|---|
| default | `--accent` | `--surface-raised`, `--line` | transparent | `--error` |
| hover (fine pointer) | `--accent-pressed` | `--surface-hover` | `--accent-subtle` | `--error-pressed` |
| pressed | `--accent-pressed` + scale 0.98 | `--surface-pressed` + scale 0.98 | `--accent-subtle` + scale 0.98 | `--error-pressed` + scale 0.98 |
| focus-visible | + focus ring | + focus ring | + focus ring | + focus ring |
| disabled (`aria-disabled`) | `--surface-hover` background, `--fg-disabled` text, no shadow; dashed 1 px `--line` for `lg` in the dock (so "not yet available" also has a shape) | `--surface` background, `--fg-disabled` text | `--fg-disabled` text | same as primary disabled |
| loading | label kept for width but visually hidden, `loader-circle` 20 px centered, `aria-busy="true"`; still focusable, activation ignored | same | same | same |

Selected, correct and incorrect don't apply to buttons.

**Accessibility.** Use a native `<button type="button">`. When disabled, the accessible description says why ("Select an answer first") through `aria-describedby`. Icon-only buttons need `aria-label`. The label must not change while focused, except the deliberate Check → Continue relabel, which keeps focus on the same element.

- **Do:** One `primary` per screen. Keep `lg` primaries full-width at the bottom. Write labels as verbs.
- **Don't:** Two primaries side by side. A destructive button outside a confirmation. All-caps labels. Icons without labels on primary actions.

---

### 7.2 OptionTile (core)

The answer choice in Scenario Matching. It is a radio in a radiogroup.

**Anatomy.**

```
┌──────────────────────────────────────────────┐  2 px border, radius-md, min-height 48
│ [B]  Consistent hashing                 [ic] │  key badge 24 · label body/500 · state icon 20
│      Best fit · your pick                    │  caption (only after Check, on involved tiles)
└──────────────────────────────────────────────┘
 padding 12 px vertical, 16 px left, 12 px right · gap 12 px
```

- **Key badge:** 24 × 24 px, `radius-sm`, `mono-sm` letters A–D in 600 weight. It lets the explanation refer to "Option B" and maps to the desktop keys 1–4.
- **Label:** `body` 500 in `--fg`. Content rule: **≤ 28 characters**, so it fits on one line at 360 px. The zod content check enforces this. It can wrap at large text sizes and is never truncated.
- **State icon:** a trailing 20 px icon, only after Check.
- **Caption:** `caption` 600, only after Check, only on the correct tile and the user's pick.

**States.**

| State | Background | Border (2 px) | Key badge | Label | Icon / caption |
|---|---|---|---|---|---|
| default | `--surface-raised` | `--line-subtle` solid | `--surface-hover` bg, `--fg-secondary` text | `--fg` | none |
| hover (fine pointer) | `--surface-hover` | `--line` | unchanged | `--fg` | none |
| pressed | `--surface-pressed`, scale 0.99 | `--line` | unchanged | `--fg` | none |
| focus-visible | unchanged + focus ring (offset 2 px) | unchanged | unchanged | | |
| **selected** | `--accent-subtle` | `--accent` solid | **filled** `--accent` bg, `--on-accent` text | `--fg` | none (SR: "selected") |
| disabled / dimmed (after Check, not involved) | `--surface` | `--line-subtle` | `--surface-hover`, `--fg-disabled` | `--fg-muted` | none |
| **correct** | `--success-subtle` | `--success` **solid** | filled `--success`, `--on-success` text | `--fg` | `circle-check` `--success-fg`; caption "Best fit" (+ " · your pick" if chosen) in `--success-fg` |
| **incorrect** (user's pick) | `--error-subtle` | `--error` **dashed** | filled `--error`, `--on-error` text | `--fg` | `circle-x` `--error-fg`; caption "Your pick" in `--error-fg` |
| loading | Skeleton tile (§7.20), same height | | | | |

**Behavior.**
- Tap selects. Tapping another tile moves the selection. Tapping the selected tile does nothing (it never deselects). The Check button commits.
- After Check the group becomes read-only. Involved tiles grow to two lines; the dock grows upward and the button doesn't move.
- Option order is shuffled per session (E3-05). The key letters follow the displayed order.
- Desktop: keys 1–4 select and Enter = Check / Continue.

**Accessibility.** The container has `role="radiogroup"` and `aria-labelledby` pointing to the question ("Which approach fits best?"). Each tile is `role="radio"` with `aria-checked` and uses a roving `tabindex`: arrow keys move focus and selection, Space selects. After Check every tile gets `aria-disabled="true"`, and the accessible names become "Consistent hashing, best fit, your pick" or "Min-heap by node load, your pick, incorrect". The verdict is announced by the AnswerDock live region (§7.5), not by the tiles.

- **Do:** Use 3–4 tiles, one line each, 8 px apart, anchored to the dock.
- **Don't:** Put the rationale on the tile (it belongs in feedback). Commit on tap. Use color as the only change for selected or verdict states. Animate tile height under reduced motion.

---

### 7.3 BigOPicker

**Anatomy.** A measure chip (`Time` with `timer`, or `Space` with `memory-stick`), shown when the content provides `measure`. That is an optional `measure: "time" | "space"` field to add to the `bigO` validation in the content schema (E1-05). Then a `title-3` question in the Stage, then a grid of choices in the AnswerDock.

```
┌─────────────────┐ ┌─────────────────┐   2 columns, gap 8 px, rows 48 px
│      O(1)       │ │    O(log n)     │   choice: radius-md, 2 px border, mono-lg 18/24 500
├─────────────────┤ ├─────────────────┤   centered text; state icon 16 px at left of the text
│      O(n)       │ │   O(n log n)    │
└─────────────────┘ └─────────────────┘
```

- **Choices** (from `validation.choices`) are 3–6 items, **always shown in ascending order of growth**: O(1) < O(log n) < O(sqrt n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!). Multi-variable forms such as `O(V + E)` go after the single-variable ones, in content order. We never shuffle: a fixed order reads like a number line and lowers scanning cost, and the position of the right answer still varies by question.
- **Layout:** 2 columns when every choice is ≤ 12 characters, otherwise 1 column (full width, left aligned).
- **States** are identical to OptionTile (§7.2): default, hover, pressed, focus, selected, dimmed, correct, incorrect. The key badge is replaced by the icon slot, and in the correct/incorrect states the 16 px check or x icon sits before the text.
- **Accessibility:** `role="radiogroup"` labelled by the question. Each choice is `role="radio"` whose accessible name is the *spoken* form ("O of n log n"). Arrow keys move in reading order (left→right, top→bottom).
- **Do:** keep the notation exactly as authored and rendered by `Complexity`. **Don't:** mix time and space choices in one picker, or use Unicode superscripts.

---

### 7.4 TraceCanvas

The user taps the first node, cell or element the algorithm visits. It has three layouts (graph, array, tree) and two views (canvas and list).

**Anatomy.**

```
┌ Card (radius-lg, --surface, 1 px --line-subtle, padding 12) ───────[≡ List]┐
│  SVG (aria-hidden): edges → edge labels → nodes → node labels → badges     │
│  Hit layer (HTML): one <button role="radio"> per target, 48 × 48 px,       │
│  absolutely positioned at the node centers (percent of the viewBox)        │
└────────────────────────────────────────────────────────────────────────────┘
Selection readout (caption, aria-live="polite"): "Selected: B" / "Tap a node"
```

**Coordinate system.** Content supplies pre-laid-out positions (sprint risk R2) in a **320 × 240 viewBox** for graphs and trees. At 360 px the canvas is 304 px wide (scale 0.95). Content rules, checked by the content CI:
- node centers ≥ **52 units** apart (≥ 48 CSS px at the smallest scale)
- nodes ≥ 26 units from the viewBox edge
- ≤ 8 nodes per graph; trees ≤ 4 levels and ≤ 6 nodes per level
- arrays ≤ 6 cells per row and ≤ 12 cells in total (7–12 wrap onto a 2nd row)
- every node has an `id` and a short `label` (≤ 3 characters); the optional `a11yLabel` overrides the generated description

**Visual specs.**

| Element | Spec |
|---|---|
| Graph / tree node | circle r 18 units (≈ 34 px), fill `--surface-raised`, stroke 1.5 px `--line-strong` (3.40:1 / 3.24:1 on surface) |
| Node label | `mono-node` (14/20 600) `--fg`, centered |
| Start node | double ring (an extra ring at r + 4, 1.5 px `--fg-secondary`), with the caption "start" (`mono-sm`, `--fg-muted`) underneath |
| Edge | 1.5 px `--line-strong`; directed edges get a 6 px arrowhead; the line ends at the node edge |
| Edge weight | `mono-sm` `--fg-secondary` on a `--surface` pill (`radius-sm`, padding 2/4) placed at the edge midpoint, so it stays legible over the line |
| Array cell | contiguous rects ≥ 48 × 48 px (304 / 6 = 50.7 px), 1 px `--line-strong` separators, fill `--surface-raised`, label `mono-node`; the index above in `mono-sm` `--fg-muted` |
| Tree | top-down, parent above children, straight edges; trie characters on the nodes |

**Node and cell states** (the same for graph, tree and array):

| State | Fill | Stroke | Badge (16 px, top-right) | Label |
|---|---|---|---|---|
| default | `--surface-raised` | 1.5 px `--line-strong` | none | `--fg` |
| pressed | `--surface-pressed` | 1.5 px `--line-strong` | none | `--fg` |
| focus-visible | unchanged + a focus ring drawn in SVG (r + 5, 2 px `--focus`), because `outline` on SVG is unreliable in Safari | | | |
| **selected** | `--accent-subtle` | **3 px** `--accent` | none | `--fg` |
| **correct** (target revealed) | `--success-subtle` | 3 px `--success` **solid** | `circle-check`: `--success` disc, `--on-success` glyph | `--fg` |
| **incorrect** (user's pick) | `--error-subtle` | 3 px `--error` **dashed 4/3** | `circle-x`: `--error` disc, `--on-error` glyph | `--fg` |
| dimmed (after Check) | `--surface` | 1.5 px `--line` | none | `--fg-muted` |

**Hit testing.** HTML buttons in an overlay, not SVG `<g>` elements. They get native focus, native semantics and CSS-pixel sizing (48 × 48 regardless of the SVG scale). The CI layout rule guarantees they don't overlap. Tap selects, then Check commits, exactly like OptionTile.

**List view (the non-visual alternative and fallback, E3-12, R2).** A ghost `sm` toggle "List" / "Graph" (`list` / `waypoints` icons) in the card header switches the canvas for a radiogroup of OptionTile-style rows with generated descriptions:
- graph: "B · neighbors: S (2), C (3)"
- array: "Index 4 · value 31"
- tree: "c · child of root · children: a, o"

The choice is remembered per user in `localStorage` (`aa.traceView`). Both views share one selection state, so switching views keeps the selection.

**Accessibility.** The canvas wrapper is `role="radiogroup"` with `aria-labelledby` = the question and `aria-describedby` = a visually hidden summary ("Weighted graph, 5 nodes. Start: S."). Each hit button is `role="radio"` with `aria-checked` and an accessible name from the same generator as the list view. Arrow keys move in authored order. After Check the names gain "correct" or "your pick, incorrect".

- **Do:** Keep the canvas directly above the dock (the thumb zone). Show weights. Use exactly one start marker.
- **Don't:** Auto-layout at runtime, pinch-zoom or pan the canvas, use domain colors on nodes, or commit on tap.

---

### 7.5 AnswerDock

The fixed bottom region of every session step. It holds the choices (OptionTiles or BigOPicker), an optional verdict strip and the primary button.

- **Layout:** padding `4px 16px max(12px, safe-area-inset-bottom)`, background `--canvas`, a 16 px gradient above it (`--canvas` 0 % → 100 %), so the Stage scrolls under it. Gaps: tiles 8, tile → button 8. The 40 % budget is in §4.5.
- **Verdict strip** (shown after Check, above the choices): a 24 px icon (`circle-check` in `--success-fg` / `circle-x` in `--error-fg`), a `title-3` verdict ("Correct" / "Not quite"), an XP chip on the right, and a one-line `body-sm` `--fg-secondary` detail. It is plain, with no background, so the screen stays calm.
- **Button:** `primary lg`, with the label `Check` (aria-disabled until something is selected) → `Continue` (after the verdict). It is the same element and keeps focus, with the 350 ms input guard.
- **Live region:** a visually hidden `aria-live="polite"` node announces "Correct. Consistent hashing. Plus 10 XP." or "Not quite. Your pick: Min-heap by node load. Best fit: Consistent hashing."

---

### 7.6 BottomTabBar

- **Tabs:** Play (`play`), Stats (`chart-column`), Settings (`settings`), at equal widths (≥ 120 px each at 360 px).
- **Size:** 64 px + `safe-area-inset-bottom`. Background `--surface`, top border 1 px `--line-subtle`, opaque (no blur).
- **Item:** icon 24 over a `tab` label, stacked, gap 4. The whole column is the target (≥ 120 × 64).
- **States:**

| State | Icon | Label | Indicator |
|---|---|---|---|
| inactive | `--fg-muted` | `--fg-muted` 600 | none |
| active | `--accent-fg` | `--fg` 600 | pill 56 × 32 px `radius-full` `--accent-subtle` behind the icon (the shape cue) |
| pressed | icon scale 0.92 | | |
| focus-visible | focus ring around the whole item (offset −2 px) | | |

- **Visibility:** Home, Stats and Settings only. Hidden in sessions, onboarding, Summary and Level-up.
- **Accessibility:** `<nav aria-label="Main">` containing links with `aria-current="page"`. It is not a `tablist`: these are pages. Labels are always visible.
- **Don't:** add a 4th tab, hide labels, put a badge counter on Play, or make the bar translucent (Safari 26 tints its chrome from fixed elements).

---

### 7.7 TopBar, SessionTopBar, SessionProgress

**TopBar (Home, Stats, Settings).** 56 px + top inset, background `--canvas` (it must match the body for Safari 26 tinting). It is display-only (§4.5).
- Home: StreakCounter at the left, LevelBadge at the right, no title.
- Stats and Settings: a `title-2` title at the left.
- When content scrolls under it, it gains a 1 px `--line-subtle` bottom border (no shadow).

**SessionTopBar.**

```
[X]   ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱   4 / 10
48px  SessionProgress (flex) gap 12   caption tabular --fg-muted
```

- `[X]` is an `icon` button (`x`, `aria-label="End session"`). It opens the "End this session?" ConfirmSheet. System Back (via a history entry) does the same.
- **SessionProgress:** N segments for N scenarios (default 10). Each is 4 px tall, `radius-full`, with gaps of 2 px. Done segments are `--fg-secondary`, the current one is `--accent`, upcoming ones are `--track`. Correctness is **not** shown here (calm by default; results live in the Summary). The bar advances once per scenario, not per validation step.
- **Accessibility:** `role="progressbar"`, `aria-valuemin=1`, `aria-valuemax=10`, `aria-valuenow=4`, `aria-valuetext="Scenario 4 of 10"`.
- **Offline indicator:** when offline, a 16 px `wifi-off` icon in `--fg-muted` sits before the counter, with `aria-label="Offline"`. No banner appears mid-session.

---

### 7.8 FeedbackSheet

Two variants share one header pattern.

| Variant | When | Container | Dismiss |
|---|---|---|---|
| `verdict` | After each Check | The AnswerDock's verdict strip (§7.5), not modal | Continue |
| `explanation` | After the last check of a scenario | A modal bottom sheet; ≥ `md` a centered dialog | **Next scenario** only (no swipe, no scrim tap) |

**Explanation sheet anatomy** (see the wireframe in §8.7):
1. **Header:** a 24 px verdict icon, a `title-2` verdict ("Correct" / "Not quite"), the XP chip at the right, and a `caption` summary ("2 of 2 checks passed").
2. **Why {answer} wins:** `title-3`, then the explanation in `body`, with `Complexity` chips for time and space (mono on `--surface-hover`, `radius-sm`).
3. **Why the others lose:** a disclosure, **open by default**. One row per other option: `circle-x` 16 in `--fg-muted` (neutral, because these were not the user's mistakes), the option label in `body-sm` 600 and the rationale in `body-sm` `--fg-secondary`. The user's own wrong pick is listed first, with `circle-x` in `--error-fg` and "Your pick".
4. **Your checks:** one row per validation, with icon and text: `circle-check` + "Big-O: O(log n)" or `circle-x` + "Trace first step: missed".
5. **Sticky footer:** a `primary lg` button, "Next scenario" ("See summary" on the last item).

**Sizing and tokens.** Width = the column. Height = content, capped at **85 dvh**; the body scrolls and the footer is sticky. Background `--surface`, top corners `radius-xl`, shadow `--elev-3` over `--scrim`. Padding 24/16. There is no drag handle: the sheet can't be dragged, and a handle would promise an interaction that doesn't exist.

**States.** Default only. The verdict colors appear only in the header icon and the verdict text, never as a full header fill. Loading isn't needed (the content is local).

**Accessibility.** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` = the verdict heading. On open, focus moves to the heading (`tabindex="-1"`). Focus is trapped. Esc = Next scenario on desktop. On close, focus moves to the first heading of the next step. Background content is `inert`.

**Do.** Explain the trade-offs. Show the correct answer even when the user was right. **Don't** auto-advance, put more than one action in the footer, or show the explanation before the validations (it would give away the Big-O answer).

---

### 7.9 Card

| Variant | Background | Border | Shadow | Use |
|---|---|---|---|---|
| `default` | `--surface` | 1 px `--line-subtle` | `--elev-1` | Today, Level, StatTile container, Settings groups |
| `interactive` | `--surface`; pressed `--surface-pressed`; hover `--surface-hover` | 1 px `--line-subtle` | `--elev-1` | Resume card, weakest-concept rows (whole card tappable, trailing `chevron-right`) |
| `tinted` | `--{tone}-subtle` (`freeze`, `warning`, `info`) | 1 px `--{tone}-line` | none | Notices: freeze used, storage blocked, install hint |
| `inset` | `--surface-hover` | none | none | Code identifiers, complexity chips, the OfflineBanner |

Padding 16, gap 12, `radius-lg`. The title is `title-3`, the meta line `caption` in `--fg-muted`. An interactive card is a single `<a>` or `<button>` with one accessible name. Don't nest interactive cards or put two buttons on an interactive card. Notices never use `--error-subtle`.

---

### 7.10 Chip and DomainBadge

**Chip** (non-interactive): 24 px tall, `radius-full`, padding 0 8 px, `caption` 600, optional 16 px leading icon, gap 4.

| Tone | Background | Text / icon | Example |
|---|---|---|---|
| `neutral` | `--surface-hover` | `--fg-secondary` | "Review", "D2", "Time" |
| `accent` / `xp` | `--accent-subtle` | `--accent-fg` | "+10 XP" (tabular) |
| `success` | `--success-subtle` | `--success-fg` | "Correct" (Summary) |
| `error` | `--error-subtle` | `--error-fg` | "Missed" (Summary) |
| `warning` | `--warning-subtle` | `--warning-fg` | "Not saved" |

**FilterChip** (interactive, used for the E3-09 domain picker): 40 px visual / 48 px hit. Default = neutral; selected = `--accent-subtle` with a 1.5 px `--accent` border and a leading `check` 16 icon. `role="checkbox"` or `radio`, depending on the picker.

**DomainBadge.** Always text plus icon. The color is only a third cue.

| Variant | Spec | Use |
|---|---|---|
| `subtle` | Chip with `--{domain}-subtle` bg, `--{domain}-fg` text and icon | Stage header ("Hashing") |
| `dot` | Neutral chip with an 8 px `--{domain}` dot and `--fg-secondary` text | Lists next to `circle-check` / `circle-x` result icons (Summary, Home mix), so a pink or orange dot never reads as a verdict |
| `icon` | 32 × 32 px `radius-sm` square, `--{domain}-subtle` bg, 20 px icon in `--{domain}-fg` | Stats rows |

Labels: short names in chips (Graphs, DP, Trees, Sorting, Hashing); full names in Stats (Graphs & Routing, …). Class names come from a static map in `src/ui/lib/domain.ts`. **Never** build them as `bg-${domain}-subtle`, because Tailwind can't detect dynamic class names.

---

### 7.11 XPBar and LevelBadge

**XPBar.**

| Size | Track | Fill | Labels |
|---|---|---|---|
| `md` | 8 px, `radius-full`, `--track` | `--xp` (accent), 3.18:1 / 4.03:1 vs track | Above: "Level 3" (`title-3`) at the left, "420/600 XP" (`caption`, tabular, `--fg-muted`) at the right. Below: "180 XP to Level 4" (`caption`) |
| `sm` | 4 px | `--xp` | Inline label only |

- Behavior: on gain, the fill tweens (`--duration-slower`) and the number counts up. On a level-up the bar fills to 100 %, then resets to the new level's span on the Level-up screen.
- Accessibility: `role="progressbar"` with `aria-valuenow` (XP into the level), `aria-valuemax` (the level span) and `aria-valuetext="420 of 600 XP, 180 to level 4"`. The XP math lives in `domain/xp`; the UI only displays values.

**LevelBadge.** A rounded square showing "L3" (tabular).

| Size | Box | Type | Style |
|---|---|---|---|
| `sm` | 32 × 32, `radius-sm` | `caption` 700 | `--accent-subtle` bg, 1 px `--accent-line`, `--accent-fg` text |
| `xl` | 96 × 96, `radius-lg` | `display` | same, plus a progress ring (4 px, `--accent`) that sweeps on level-up |

No shields, stars or trophies. Accessible name: "Level 3".

---

### 7.12 StreakCounter and StreakFlame

**StreakFlame** (Lucide `flame`, 20 px in the header, 24 px in Summary):

| State | Look | Non-color cue |
|---|---|---|
| `done` (today counted) | stroke and fill `--streak` | **filled** shape |
| `pending` (streak alive, not yet today) | stroke `--streak`, no fill | outline shape |
| `none` (0 days) | stroke `--fg-muted`, no fill | outline + muted |
| `frozen` (a freeze covered yesterday) | `pending` or `done` + a 12 px `snowflake` badge in `--freeze` at the bottom right | extra badge |

**StreakCounter:** flame + count (`title-3`, tabular, `--fg`), optionally followed by the freeze count (`snowflake` 16 in `--freeze` + count in `caption`, max 2). The accessible name is a single string: "12-day streak, today complete, 1 freeze available". It is display-only in the MVP (no tap target, so no hit area is needed).

**Do.** Show the longest streak next to any reset. **Don't** turn the flame red or grey it out to shame, or animate the flame on Home.

---

### 7.13 StatTile

A Card (`default`) in a 2-column grid with a 12 px gap and min height 96. The label (`caption` `--fg-muted`) is on top, the value (`title-1`, tabular, `--fg`) below, and the sub-line (`caption` `--fg-muted`, for example "best 21") under that. An optional 20 px icon in `--fg-muted` sits at the top right. It is non-interactive. The accessible text reads naturally ("Accuracy 78 %, last 30 days"). Never color the value green or red.

---

### 7.14 ProgressRing and DomainAccuracyBar

**ProgressRing.** Sizes 64 (stroke 8) and 96 (stroke 10). The track is `--track`, the fill `--accent` (overall) or `--{domain}`. Round cap, starts at 12 o'clock, clockwise. The center value is `title-2` tabular (`8/10` or `78%`), with an optional `caption` below. It fills over `--duration-slower` with `--ease-standard` (none under reduced motion). The SVG is `aria-hidden`; a visually hidden sibling says "8 of 10 correct".

**DomainAccuracyBar** (Stats; there are always 5 rows in the schema order Graphs → DP → Trees → Sorting → Hashing, a fixed order for spatial memory):

```
[icon]  Graphs & Routing                     84%     row: body 500 · value body 600 tabular
        ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆░░░░                   bar 8 px --graphs on --track
        24 answers                                    caption --fg-muted (optional)
```

When there are fewer than 5 answers, show "—" and "Not enough data (3 answers)" in `--fg-muted`, with no bar. The row is a list item whose name includes the value. The bar is `aria-hidden`.

---

### 7.15 Toast

**Anatomy.** `[icon 20] Message (body-sm 500, ≤ 2 lines) [action: ghost sm] [dismiss icon 48 hit]`. Background `--surface-raised`, 1 px `--line`, `radius-lg`, `--elev-2`, padding 12/16, min height 56.

| Variant | Icon | Duration | Role |
|---|---|---|---|
| `info` | `info` `--accent-fg` | 4 s | `status` (polite) |
| `success` | `circle-check` `--success-fg` | 4 s | `status` |
| `error` | `circle-alert` `--error-fg` | 6 s | `alert` |
| `update` | `refresh-cw` `--accent-fg` + **Refresh** action | persistent until acted on or dismissed | `status` |

- **Position:** bottom, 8 px above the BottomTabBar (or above the safe area when there is no tab bar), at column width. One toast at a time; others queue.
- **Timing:** auto-dismiss pauses on focus or hover. A toast that has an action never auto-dismisses.
- **Session rule:** `update` and `info` toasts are **queued during a session** and shown on Summary or Home.
- **Motion:** `rise-in` (`--duration-base`, `--ease-enter`); exit fades (`--duration-fast`).
- **Don't:** stack toasts, put destructive actions in one, or use a toast for verdicts.

---

### 7.16 ConfirmSheet and Dialog

On mobile (< `md`), confirmations are **bottom sheets**. At ≥ `md` they are centered dialogs (max width 30 rem, `radius-xl`).

**Anatomy.** An optional 40 px tinted icon disc, a `title-2` title, a `body` text in `--fg-secondary`, then the actions **stacked full width** (`lg`, gap 8).

**Ordering rule.** The **safe action (Cancel / Keep going) is always bottom-most**, in the most reachable spot, and gets initial focus. The confirming action sits directly above it. An optional third action ("Export a backup first") goes at the top. This deliberately departs from "one thumb spot": a destructive action must never be where the thumb lands by habit.

| Use | Confirm button | Body |
|---|---|---|
| Reset progress | `destructive`: "Reset progress" | "XP, level, streak, reviews and history on this device are erased. This can't be undone." + secondary "Export a backup first" |
| Import (replace) | `primary`: "Replace progress" | "Your current XP, streak and reviews will be overwritten by the file." |
| End session | `primary`: "End session" | "Your 4 answers are saved. Finish a session to count today's streak." |

**Accessibility.** `role="alertdialog"` for destructive actions, `role="dialog"` otherwise. `aria-labelledby` and `aria-describedby` are set. Focus is trapped, starts on Cancel and returns to the invoking control on close. Esc and a scrim tap both mean Cancel.

---

### 7.17 ListItem, SettingsRow, SegmentedControl

**ListItem / SettingsRow.** Min height 56 px (one line) or 72 px (with a description); padding 12/16. The leading icon is 20 px in `--fg-secondary`. The title is `body` 500 in `--fg`. The description is `body-sm` in `--fg-muted`. Rows are grouped in a `default` Card with 1 px `--line-subtle` dividers, inset 52 px when there is a leading icon. Section headers use `overline` in `--fg-muted` with 24 px above and 8 px below.

| Variant | Trailing | Behavior |
|---|---|---|
| `navigation` | `chevron-right` 20 `--fg-muted` | Opens a screen or sheet |
| `toggle` | Toggle (§7.18) | The whole row toggles; the row label is the switch label |
| `action` | none | Runs an action (Export, Import) |
| `danger` | none; title and icon in `--error-fg` | Opens a ConfirmSheet |
| `value` | text in `--fg-muted` (for example "v1.0.0") | Not interactive |

States: pressed = `--surface-pressed`; focus = inset ring; disabled = `--fg-disabled` text, `aria-disabled`.

**SegmentedControl** (theme picker): height 48, track `--surface-hover`, `radius-md`, 4 px inset. The selected segment is `--surface-raised` with `--elev-2` and `--fg` 600 text (with an icon). Unselected segments are `--fg-secondary` 500. It is a `role="radiogroup"` and arrow keys move. The selection animates under `motion-ok:` (`--duration-fast`). The default value is **Dark**.

---

### 7.18 Toggle

- **Track** 52 × 32, `radius-full`. **Thumb** 24 px (off) / 28 px (on), 2 px inset.
- **Off:** track `--surface-hover` with a 2 px `--line-strong` border, thumb `--fg-muted`, no icon.
- **On:** track `--accent`, thumb `--on-accent` with a 16 px `check` icon in `--accent`. The shape cues are the thumb position, the thumb size and the icon.
- **Disabled:** track `--surface-hover` with a 2 px `--line-subtle` border, thumb `--fg-disabled`.
- **Focus:** a ring on the row (inside a SettingsRow) or on the track (standalone).
- **Motion:** the thumb moves over `--duration-fast` with `--ease-standard`.
- **Accessibility:** `<button role="switch" aria-checked>` labelled by the row title. The hit area is the whole row (≥ 56 px tall).

---

### 7.19 EmptyState

The anatomy, from top to bottom: a blueprint illustration (120 × 96, `aria-hidden`), a `title-3` title, a `body-sm` body in `--fg-secondary` (≤ 2 lines), and one action. On a full screen, the block is **bottom-weighted**: content sits in the lower half and the action is a `primary lg` in the thumb zone. Inside a card it is centered and the action is `secondary md`.

| Where | Title | Body | Action |
|---|---|---|---|
| Stats (no data) | No stats yet | Finish one session and accuracy per domain shows up here. | Start session |
| Weakest concepts | No weak spots yet | Concepts you miss show up here, so you can see what to review. | none |
| Home (nothing due) | All caught up | Practice keeps you sharp and doesn't change review dates. | Start practice |

---

### 7.20 Skeleton

- **Only** for IndexedDB hydration. It appears after a **150 ms delay** (so fast loads never flash) and, once shown, stays at least 300 ms.
- **Shapes** mirror the real layout: text lines 12 or 16 px tall with `radius-xs`; blocks with the component's own radius. Base color `--surface-hover`; shimmer is a gradient to `--surface-pressed` (`--animate-shimmer`). Under reduced motion it is static.
- The container is `aria-busy="true"` and the skeletons are `aria-hidden="true"`.
- The primary CTA renders immediately (disabled until hydration finishes), so the layout never jumps under the thumb.

---

### 7.21 OfflineBanner

| Variant | Where | Spec |
|---|---|---|
| `banner` | Home, Stats, Settings, under the TopBar | An `inset` Card: `--surface-hover` bg, `radius-lg`, `wifi-off` 16 in `--fg-secondary`, `caption` text in `--fg-secondary`: "Offline. Everything works; progress is saved on this device." Dismiss `x` with a 48 px hit area; dismissed for the rest of the session |
| `indicator` | SessionTopBar | A 16 px `wifi-off` icon in `--fg-muted`, `aria-label="Offline"` |
| back online | Same place as the banner | "Back online." for 2 s, then it collapses (`--duration-base`) |

- **Not warning-colored** (principle 4).
- A `role="status"` region announces the change once.
- Driven by `navigator.onLine` plus `online` / `offline` events. It never blocks any UI, because nothing in the MVP needs the network.

---

### 7.22 Complexity (text primitive) and CoachMark

**Complexity.** `<Complexity value="O(n^2)" size="mono|mono-lg" />` parses the ASCII notation (§3.4) and renders mono with `<sup>`, ligatures off and `nowrap`, plus the spoken text for assistive tech. It is used by BigOPicker, FeedbackSheet and explanations. This is the only place notation is formatted.

**CoachMark** (first-session hint, E5-06): a small callout anchored above the AnswerDock. Background `--surface-raised`, 1 px `--accent-line`, `radius-lg`, `--elev-2`. The text is `body-sm`: "Tap the approach that fits best, then Check." It has a "Got it" ghost `sm` action and an 8 px arrow pointing down. It is shown once and the flag is stored in the profile settings. It doesn't block taps on the tiles, and it is announced politely, once.

---

## 8. Screens and wireframes

### 8.0 How to read the wireframes

- The frame is 38 characters wide, about **360 px**, at roughly 20 px per row. Full-screen frames are about 36 rows tall, about **740 px**.
- **The right-hand ruler** marks the zones: `░` top 25 % (hard), `▒` 25–60 % (stretch), `█` bottom 40 % (thumb zone). Every primary action must sit next to `█`.
- Stacked OptionTiles are drawn with shared borders to save rows. Real tiles are separate, with 8 px gaps.

| Glyph | Meaning | Glyph | Meaning |
|---|---|---|---|
| `┏━┓ ┃` | primary button (filled) | `┌┄┐ ┆` | disabled button (dashed outline) |
| `╔═╗ ║ ╞═╡` | selected or correct tile (2 px solid) | `┆ ┄` on a tile | wrong pick (2 px dashed) |
| `■B` | filled key badge | `( … )` | chip or badge |
| `◎` | start node | `◉` | selected node |
| `▆` / `░` | bar fill / track or fade | `▓` | scrim |
| `[X]` | `x` close | `[>]` | `play` |
| `[v]` / `[x]` | `circle-check` / `circle-x` | `[*]` / `[s]` | `flame` / `snowflake` |
| `[~] [+] [^] [=] [#]` | domain icons: route, grid-3x3, network, arrow-down-wide-narrow, hash | `[\|]` / `[o]` | `chart-column` / `settings` |
| `[≡]` | `list` | `[↓] [↑] [!] [↻]` | download, upload, trash-2 / alert, refresh-cw |

### 8.1 Session flow

```
  First launch ──▶ Onboarding 1 ──▶ 2 ──▶ 3 ──▶ “Start first session” ──┐
  Returning launch ─────────────────────────────────────────────────────┤
                            ┌───────────────────────────────────────────┘
                            ▼
  ┌──────────────────────────────────────────────────┐
  │ HOME                                  [idle]     │
  │ Start session · Resume session · Start practice  │
  └─────────────────────────┬────────────────────────┘
                            │ tap CTA  → session composed (due reviews + new)
                            ▼
  ┌──────────────────────────────────────────────────┐
  │ QUESTION: Scenario Matching           [question] │
  │ select OptionTile → Check                        │
  │ verdict strip in AnswerDock (+XP) → Continue     │
  └─────────────────────────┬────────────────────────┘
                            │ Continue
                            ▼
  ┌──────────────────────────────────────────────────┐
  │ MINI-VALIDATION i of n (n = 1–2)    [validation] │
  │ BigOPicker | TraceCanvas → select → Check        │
  │ verdict strip → Continue  (loops while i < n)    │
  └─────────────────────────┬────────────────────────┘
                            │ Continue after last check
                            ▼
  ┌──────────────────────────────────────────────────┐
  │ FEEDBACK: explanation sheet           [feedback] │
  │ why the answer wins · why the others lose        │
  │ your checks · item XP → Next scenario            │
  └─────────────────────────┬────────────────────────┘
                            │ Next scenario                    [next]
                            ├── items left? ── yes ──▶ QUESTION (next item)
                            │ no
                            ▼
  ┌──────────────────────────────────────────────────┐
  │ SESSION SUMMARY                       [summary]  │
  │ score ring · XP earned · streak · concepts       │
  │ → Done                                           │
  └─────────────────────────┬────────────────────────┘
                            │ Done
                            ├── level-up earned? ── yes ──▶ LEVEL-UP ── Continue ──┐
                            │ no                                                   │
                            ▼                                                      │
                          HOME ◀───────────────────────────────────────────────────┘

  Exits and interrupts
  [X] or system Back during any session step ──▶ ConfirmSheet “End this session?”
        ├─ Keep going ──▶ returns to the same step (state untouched)
        └─ End session ──▶ HOME (answers saved; Resume card offered, E3-08)
  App killed / backgrounded mid-session ──▶ next launch: HOME with Resume card
  Update available ──▶ toast is queued; shown on SUMMARY or HOME, never mid-session
  Level-up earned mid-session ──▶ queued; shown after SUMMARY (never interrupts)
```

State names in `[brackets]` are the session state machine from E3-02 (`idle → question → validation → feedback → next → summary`). The verdict after each Check is a sub-state shown inside the AnswerDock, not a separate screen. The explanation comes **after** the validations so it can't give away the Big-O answer.

### 8.2 Onboarding (E5-06): 3 screens

Components: step dots, a blueprint illustration, `title-1` and `body-lg` text, Button `ghost md` + `primary lg`. No tab bar. "Skip" or "Back" sits in the bottom row, never at the top.

**1 · Real systems, real algorithms**

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  ● ○ ○                               │░  step dots (display only)
│                                      │░
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │░
│     Ride-hailing ETA                 │░  illustration: blueprint style,
│     “Fastest route, live traffic”    │░  ≤ 160 px tall, line-subtle grid
│           │                          │░
│           ▼                          │░
│     ( [~] Dijkstra + binary heap )   │▒  DomainBadge look-alike
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │▒
│                                      │▒
│                                      │▒
│  Real systems,                       │▒  title-1 24/30 700
│  real algorithms.                    │▒
│                                      │▒
│  Each card is a feature request from │▒  body-lg 17/26 fg-secondary
│  production. Pick the approach a     │▒
│  senior engineer would ship.         │▒
│                                      │▒
│                                      │▒
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│      Skip      ┏━━━━━━━━━━━━━━━━━━┓  │█  ghost md | primary lg
│                ┃     Next  →      ┃  │█
│                ┗━━━━━━━━━━━━━━━━━━┛  │█
│                                      │█
│                                      │█
└──────────────────────────────────────┘
```

**2 · Prove it in ten seconds**

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  ○ ● ○                               │░
│                                      │░
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │░
│     (A)───4───(B)     ╔══════════╗   │░
│      │ ╲        │     ║O(n log n)║   │░
│      1   2      5     ╚══════════╝   │░
│      │     ╲    │     ┌──────────┐   │░
│     (C)───3───(D)     │  O(n^2)  │   │▒
│       ▲ tap           └──────────┘   │▒
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │▒
│                                      │▒
│  Prove it in                         │▒  title-1
│  ten seconds.                        │▒
│                                      │▒
│  After each pick, confirm it: choose │▒  body-lg
│  the Big-O, or tap the first node the│▒
│  algorithm visits.                   │▒
│                                      │▒
│                                      │▒
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│      Back      ┏━━━━━━━━━━━━━━━━━━┓  │█  Back replaces Skip from step 2
│                ┃     Next  →      ┃  │█
│                ┗━━━━━━━━━━━━━━━━━━┛  │█
│                                      │█
│                                      │█
└──────────────────────────────────────┘
```

**3 · Built for the commute**

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  ○ ○ ●                               │░
│                                      │░
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │░
│     [wifi-off]   [timer]   [*]       │░
│      offline      5 min   streak     │░
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │░
│                                      │░
│  Built for the commute.              │▒  title-1
│                                      │▒
│  Five minutes, one thumb, no signal  │▒  body-lg
│  needed. Reviews come back right     │▒
│  before you would forget them.       │▒
│                                      │▒
│  Progress stays on this device.      │▒  caption fg-muted + Export hint
│  Export a backup in Settings.        │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │█
│ ┃       Start first session        ┃ │█
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │█
│               Back                   │█  ghost md, 48 px tall
│                                      │█
│                                      │█
└──────────────────────────────────────┘
```

States and notes:
- Swiping left or right also moves between steps, as a convenience. The buttons are the accessible path.
- Screen 3's CTA starts the first session directly. The first question shows the CoachMark (§7.22).
- On screen 3, `navigator.storage.persist()` is requested silently (risk R3). If it is denied on iOS, Home later shows the install hint card.
- Offline: no change (onboarding is precached).

### 8.3 Home (E2-06, E4-07)

Components: TopBar (StreakCounter, LevelBadge), Card + XPBar, Card "Daily session" + DomainBadge `dot`, Button `primary lg`, Button `ghost md`, BottomTabBar.

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  [*] 12   [s] 1               ( L3 ) │░  StreakCounter · freeze · LevelBadge
│                                      │░
│  Wed, Nov 4                          │░  caption fg-muted
│  Today                               │░  title-1
│                                      │░
│  ┌────────────────────────────────┐  │░
│  │ Level 3             420/600 XP │  │░  Card > XPBar (md)
│  │ ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆░░░░░░░░░░ │  │▒
│  │ 180 XP to Level 4              │  │▒  caption fg-muted
│  └────────────────────────────────┘  │▒
│                                      │▒
│  ┌────────────────────────────────┐  │▒
│  │ Daily session          ~5 min  │  │▒  Card (Today)
│  │                                │  │▒
│  │ 7 reviews due · 3 new          │  │▒  title-3
│  │                                │  │▒
│  │ ● Graphs 3  ● DP 2  ● Trees 2  │  │▒  DomainBadge dot variant
│  │ ● Sorting 2  ● Hashing 1       │  │▒
│  └────────────────────────────────┘  │▒
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │█  Button primary lg, full width
│ ┃        [>] Start session         ┃ │█
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │█
│          Practice one domain         │█  Button ghost md (E3-09, Could)
│                                      │█
│──────────────────────────────────────│█  BottomTabBar 64 px + safe area
│    [>]          [|]          [o]     │█
│    Play        Stats     Settings    │█
│                                      │█
└──────────────────────────────────────┘
```

**States.**

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │  Resume (E3-08): replaces Today card
│ │ Resume session         4 / 10    │ │
│ │ Started 8:12 · ~3 min left       │ │
│ └──────────────────────────────────┘ │
│                                      │  CTA → “Resume session”; ghost → “Start over”
│                                      │
│ ┌──────────────────────────────────┐ │  Freeze used: freeze-subtle bg
│ │ [s] Freeze used. Your 12-day     │ │
│ │ streak is safe. 0 freezes left.  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │  Streak reset: neutral Card, no red
│ │ Streak reset. Longest run: 21    │ │
│ │ days. Finish a session to start  │ │
│ │ a new one.                       │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │  Nothing due: practice mode
│ │ All caught up                    │ │
│ │ Practice keeps you sharp and     │ │
│ │ doesn't change review dates.     │ │
│ └──────────────────────────────────┘ │
│                                      │  CTA → “Start practice”
│                                      │
│ ┌──────────────────────────────────┐ │  Storage unavailable: warning-subtle
│ │ [!] This browser mode can't save │ │
│ │ progress. You can play; nothing  │ │
│ │ is kept after you close the app. │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │  iOS Safari, not installed (dismissible)
│ │ Install for offline use: tap     │ │
│ │ Share, then Add to Home Screen.  │ │
│ └──────────────────────────────[X]─┘ │
└──────────────────────────────────────┘
```

| State | What changes |
|---|---|
| First run | Today card reads "Your first session · 10 new scenarios · ~5 min"; the flame is `none` and shows "0"; LevelBadge shows L1 |
| Normal | "7 reviews due · 3 new" (E4-07). The count comes from the SRS queue |
| Resume available (E3-08) | The Resume card replaces the Today card; CTA "Resume session"; ghost "Start over" (opens a ConfirmSheet) |
| Nothing due, nothing new | "All caught up" card; CTA "Start practice" (practice doesn't change the SRS) |
| Freeze used / streak reset / freeze earned | A one-time notice card above the Today card, dismissed on the next session start |
| Loading (hydration > 150 ms) | Skeleton (below); the CTA is visible but disabled |
| Offline | OfflineBanner under the header (§8.13); everything else unchanged |
| Storage unavailable | A `tinted warning` card; sessions still work in memory |
| iOS, not installed | A dismissible install-hint card at the bottom of the content |

```
┌──────────────────────────────────────┐
│  ▒▒▒▒ ▒▒                    ▒▒▒▒▒    │  Skeleton: header values
│                                      │
│  ▒▒▒▒▒▒▒▒▒                           │
│  ┌────────────────────────────────┐  │
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒         ▒▒▒▒▒▒▒   │  │  card shape preserved (no layout shift)
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   │  │
│  └────────────────────────────────┘  │
│                                      │  CTA renders at once; enabled after hydration
└──────────────────────────────────────┘
```

### 8.4 Session · Scenario Matching (E3-03)

Components: SessionTopBar + SessionProgress, DomainBadge `subtle`, Chip `neutral`, Stage text, AnswerDock (OptionTile × 4, Button `primary lg`).

**Default (nothing selected):**

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  [X]  ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱   4 / 10  │░  SessionTopBar: close · progress · count
│                                      │░
│  ( [#] Hashing )   Review · D2       │░  DomainBadge subtle · caption
│                                      │░
│  Cache cluster resizing              │░  title-2 20/26 600
│                                      │░
│  Your CDN shards 40M cache keys      │░  body-lg 17/26 fg (scrolls)
│  across 12 nodes. Nodes join and     │░
│  leave during traffic spikes. Map    │▒
│  keys to nodes so that the fewest    │▒
│  keys move when the pool changes.    │▒
│                                      │▒
│  Which approach fits best?           │▒  body 16/600 fg-secondary
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │▒  16 px fade: content scrolls under dock
│ ┌──────────────────────────────────┐ │█  AnswerDock (fixed bottom)
│ │ A  Modulo hashing (key % n)      │ │█  OptionTile ×4, 48 px min, 8 px gap
│ ├──────────────────────────────────┤ │█
│ │ B  Consistent hashing            │ │█
│ ├──────────────────────────────────┤ │█
│ │ C  Sorted array + binary search  │ │█
│ ├──────────────────────────────────┤ │█
│ │ D  Min-heap by node load         │ │█
│ └──────────────────────────────────┘ │█
│                                      │█
│ ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐ │█  Button primary lg, aria-disabled until a pick
│ ┆              Check               ┆ │█
│ └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘ │█
│                                      │█  padding = max(12 px, safe-area-inset-bottom)
└──────────────────────────────────────┘
```

**Selected:**

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │ A  Modulo hashing (key % n)      │ │
│ ╞══════════════════════════════════╡ │
│ ║ ■B Consistent hashing            ║ │  selected: accent-subtle bg, 2 px accent
│ ╞══════════════════════════════════╡ │  border, key badge filled (shape cue)
│ │ C  Sorted array + binary search  │ │
│ ├──────────────────────────────────┤ │
│ │ D  Min-heap by node load         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │  enabled
│ ┃              Check               ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└──────────────────────────────────────┘
```

**After Check, correct:**

```
┌──────────────────────────────────────┐
│ [v] Correct            ( +10 XP )    │  verdict strip: success-fg, role=status
│     Consistent hashing is the fit.   │  body-sm fg-secondary
│ ┌──────────────────────────────────┐ │
│ │ A  Modulo hashing (key % n)      │ │  dimmed: fg-muted
│ ╞══════════════════════════════════╡ │
│ ║ ■B Consistent hashing        [v] ║ │  correct: success-subtle, 2 px solid
│ ║    Best fit · your pick          ║ │  success border, check icon + caption
│ ╞══════════════════════════════════╡ │
│ │ C  Sorted array + binary search  │ │
│ ├──────────────────────────────────┤ │
│ │ D  Min-heap by node load         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │  same button, relabelled (focus kept)
│ ┃             Continue             ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└──────────────────────────────────────┘
```

**After Check, wrong:**

```
┌──────────────────────────────────────┐
│ [x] Not quite                        │  verdict strip: error-fg
│     Best fit: Consistent hashing.    │  names the right answer immediately
│ ┌──────────────────────────────────┐ │
│ │ A  Modulo hashing (key % n)      │ │
│ ╞══════════════════════════════════╡ │
│ ║ B  Consistent hashing        [v] ║ │  correct: solid border + check
│ ║    Best fit                      ║ │  caption 13/600 success-fg
│ ╞══════════════════════════════════╡ │
│ │ C  Sorted array + binary search  │ │
│ ├┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┤ │
│ ┆ ■D Min-heap by node load     [x] ┆ │  wrong pick: error-subtle, 2 px DASHED
│ ┆    Your pick                     ┆ │  error border, x icon + caption
│ └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘ │  involved tiles grow to 2 lines; dock grows up
│                                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃             Continue             ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└──────────────────────────────────────┘
```

Notes:
- The Stage scrolls; the AnswerDock never does. Long prompts (> 6 lines at 360 px) scroll under the 16 px fade. Content guideline: prompts ≤ 280 characters.
- First session only: a CoachMark above the dock says "Tap the approach that fits best, then Check."
- Interrupted (app backgrounded): the state is persisted after every Check, so returning resumes on the same step.
- Offline: only the `wifi-off` indicator in the SessionTopBar.

### 8.5 Mini-validation · Big-O picker (E3-10)

Components: SessionTopBar, Chip (`Time` / `Space`), `title-3` question, BigOPicker in the AnswerDock, Button.

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  [X]  ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱   4 / 10  │░  progress advances per scenario, not step
│                                      │░
│  Check 1 of 1 · ( Time )             │░  caption · Chip neutral (measure)
│                                      │░
│  Consistent hashing: lookup cost for │░  title-3 17/24 600
│  one key with n nodes on the ring    │░
│  (sorted ring, binary search)?       │░
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │█
│                                      │█
│  ┌───────────────┐ ┌───────────────┐ │█  BigOPicker: 2 cols, 48 px rows,
│  │     O(1)      │ │   O(log n)    │ │█  JetBrains Mono 18/24 500,
│  ├───────────────┤ ├───────────────┤ │█  ascending growth order, never shuffled
│  │     O(n)      │ │  O(n log n)   │ │█
│  ├───────────────┤ ├───────────────┤ │█
│  │    O(n^2)     │ │    O(2^n)     │ │█
│  └───────────────┘ └───────────────┘ │█  ^ renders as superscript
│                                      │█
│ ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐ │█
│ ┆              Check               ┆ │█
│ └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘ │█
│                                      │█
└──────────────────────────────────────┘
```

Notes: choices are in ascending order of growth (never shuffled); `^` renders as a superscript; with long choices (> 12 characters) the grid becomes one column, which still fits the budget with up to 4 choices. The verdict strip and the correct/incorrect states are the same as in §8.4.

### 8.6 Mini-validation · Trace first step (E3-11, E3-12)

Components: SessionTopBar, `title-3` question, TraceCanvas (graph, array or tree) with the List toggle, a selection readout, Button.

**Graph** (Dijkstra from S; the answer is B, the shortest edge, 2):

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  [X]  ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱   6 / 10  │░  scenario 6: Ride-hailing ETA (Graphs)
│                                      │░
│  Check 1 of 1 · Trace                │░  caption
│                                      │░
│  Dijkstra from S. Which node is      │░  title-3
│  finalized first after S?            │░
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│                                      │▒
│  ┌────────────────────────[≡] List┐  │▒  TraceCanvas card (bottom-anchored)
│  │                                │  │▒  List toggle = non-visual alternative
│  │   ◎S ─────7───── (A)           │  │▒  start node: double ring + “start”
│  │   │ ╲             │            │  │▒
│  │   2   4           1            │  │█  edge weights on canvas-colored pills
│  │   │     ╲         │            │  │█
│  │  (B)──3──(C)───2──(D)          │  │█  nodes r 18; 48 px HTML hit targets
│  │                                │  │█
│  │  start                         │  │█
│  └────────────────────────────────┘  │█
│  Tap a node · nothing selected       │█  selection readout (aria-live polite)
│                                      │█
│ ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐ │█
│ ┆              Check               ┆ │█
│ └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘ │█
│                                      │█
└──────────────────────────────────────┘
```

**Node states:**

```
┌──────────────────────────────────────┐
│   (A)      ◉B       (C)      ×D      │  default · selected · correct · wrong
│   r18     3 px     solid    dashed   │  stroke
│  1.5 px  accent   success   error    │  color token
│   none    halo      [v]      [x]     │  badge (non-color cue)
└──────────────────────────────────────┘
```

**Array** (binary search; the first probe is index 4 of 0–9):

```
┌──────────────────────────────────────┐
│  Binary search for 42. First index   │  array: contiguous cells, ≤ 6 per row
│  probed?                             │
│                                      │
│    0     1     2     3     4     5   │  index labels: mono 12 fg-muted
│ ┌─────┬─────┬─────┬─────┬─────┬─────┐│
│ │  3  │  9  │ 17  │ 25  │ 31  │ 42  ││  cells ≥ 48 × 48 CSS px
│ └─────┴─────┴─────┴─────┴─────┴─────┘│
│    6     7     8     9               │  7–12 elements wrap to a 2nd row
│ ┌─────┬─────┬─────┬─────┐            │
│ │ 57  │ 63  │ 71  │ 88  │            │
│ └─────┴─────┴─────┴─────┘            │
└──────────────────────────────────────┘
```

**Tree / trie:**

```
┌──────────────────────────────────────┐
│  Trie lookup for “car”: first node   │  tree: top-down, ≤ 4 levels,
│  visited after the root?             │
│                                      │
│                 (•)                  │  root (start style)
│               ╱  │  ╲                │
│            (c)  (d)  (t)             │
│            ╱ ╲         ╲             │
│         (a) (o)       (o)            │  ≥ 52 viewBox units between centers
│         ╱                            │
│       (r)                            │
└──────────────────────────────────────┘
```

Notes:
- The canvas is bottom-anchored directly above the dock, so most targets sit inside the thumb zone at 360 × 740. The question stays at the top and the empty space between them absorbs different canvas heights.
- **List view** replaces the canvas with OptionTile-style rows ("B · neighbors: S (2), C (3)"). It is the screen-reader-friendly path and the fallback for risk R2.
- Error state (invalid visual data at runtime; this should be impossible after the content CI check): the List view is shown automatically, and an `analytics` event is queued.

### 8.7 Feedback / explanation (E3-04)

Components: FeedbackSheet `explanation`, Chip `xp`, Complexity chips, disclosure, Button `primary lg` (sticky).

```
┌──────────────────────────────────────┐  zone
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░  scrim over session (no tap-to-dismiss)
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│╭────────────────────────────────────╮│░
││ [v] Correct              ( +15 XP )││░  FeedbackSheet explanation · title-2
││ 1 of 1 check passed                ││░
│├────────────────────────────────────┤│░
││ Why consistent hashing wins        ││░  title-3
││ Adding or removing a node remaps   ││░  body 16/24
││ only ~1/n of the keys, so caches   ││▒
││ stay warm during resizes.          ││▒
││                                    ││▒
││ Lookup  O(log n)   Space  O(n)     ││▒  Complexity chips (mono)
││                                    ││▒
││ Why the others lose            [^] ││▒  disclosure, open by default
││ [x] A Modulo hashing               ││▒  label 15/600
││     Changing n remaps almost every ││▒  rationale body-sm fg-secondary
││     key; cold cache after resize.  ││▒
││ [x] C Sorted array + binary search ││▒
││     Finds keys fast but does not   ││▒
││     solve remapping on its own.    ││▒
││ [x] D Min-heap by node load        ││█
││     Balances load, not placement.  ││█
││                                    ││█
││ Your checks                        ││█  label
││ [v] Big-O: O(log n)                ││█  icon + text per validation
││                                    ││█
││░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░││█  body scrolls; footer is sticky
│├────────────────────────────────────┤│█
││ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ││█  sticky footer: primary lg
││ ┃          Next scenario         ┃ ││█
││ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ││█
││                                    ││█
│╰────────────────────────────────────╯│█
└──────────────────────────────────────┘
```

Notes: there is no drag-to-dismiss and no scrim tap, and the footer button is the only exit. On the last scenario it reads "See summary". In the "Not quite" variant the header icon is `circle-x` in `--error-fg`, and "Why the others lose" starts with the user's pick, marked "Your pick".

### 8.8 Session summary (E3-07)

Components: `title-1`, ProgressRing, StatTile, XPBar `sm`, StreakFlame, ListItem rows with result icons and DomainBadge `dot`, Button `primary lg`.

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  Session complete                    │░  title-1 (no close button: flow ends here)
│  10 scenarios · 4 min 38 s           │░  caption fg-muted, tabular
│                                      │░
│  ┌──────────┐  ┌───────────────────┐ │░
│  │  ╭────╮  │  │ +145 XP           │ │░  ProgressRing 96 · StatTile
│  │  │8/10│  │  │ Level 3 ▆▆▆▆▆▆░░░ │ │░  XPBar sm
│  │  ╰────╯  │  ├───────────────────┤ │░
│  │ correct  │  │ [*] Day 13        │ │░  StreakFlame fills (today done)
│  └──────────┘  │ Streak extended   │ │▒
│                └───────────────────┘ │▒
│                                      │▒
│  Concepts                            │▒  section label
│  [v] ● Consistent hashing            │▒  ListItem: result icon + domain dot
│  [v] ● Dijkstra                      │▒
│  [x] ● Edit distance       due tmrw  │▒  wrong → resurfaces tomorrow (SRS)
│  [v] ● Trie                          │▒
│  [v] ● Quickselect                   │▒
│  … 5 more                       [v]  │▒  disclosure
│                                      │▒
│  Next review: 3 due tomorrow         │▒  caption
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │█  → Level-up (if earned) → Home
│ ┃               Done               ┃ │█
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │█
│                                      │█
│                                      │█
└──────────────────────────────────────┘
```

States:
- A **practice** session shows "Practice · reviews unchanged" and no streak block.
- **Queued toasts** (an update) appear here, above the Done button.
- **Freeze earned** adds a line under the streak: "7 days in a row. You earned a freeze."
- If the streak didn't change (a second session today), the streak block reads "Today already counted."

### 8.9 Level-up (E4-03)

Components: LevelBadge `xl`, `display`, `body-lg`, Card (unlock), XPBar, Button `primary lg`.

```
┌──────────────────────────────────────┐  zone
│                                      │░
│                                      │░
│                                      │░
│                                      │░
│              ╭────────╮              │░
│              │        │              │░  LevelBadge xl 96 px
│              │   L3   │              │░  pop-in + ring sweep (celebrate 800 ms)
│              │        │              │░
│              ╰────────╯              │░
│                                      │▒
│               Level 3                │▒  display 32/36 700, centered
│                                      │▒
│   Difficulty 2 scenarios are now in  │▒  body-lg fg-secondary
│   your rotation.                     │▒
│                                      │▒
│   ┌──────────────────────────────┐   │▒
│   │ [lock-open] Difficulty 2     │   │▒  Card: what changed
│   │ 20 scenarios unlocked        │   │▒
│   └──────────────────────────────┘   │▒
│                                      │▒
│   ▆░░░░░░░░░░░░░░░░░░   310/600 XP   │▒  XPBar shows the new level span
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│                                      │█
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │█
│ ┃             Continue             ┃ │█
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │█
│                                      │█
│                                      │█
└──────────────────────────────────────┘
```

Shown only after Summary → Done, when a threshold was crossed. Multi-level jumps show the highest level reached. The unlock card appears only at Levels 3 and 6 (difficulty tiers, E4-04); at other levels it is omitted. Reduced motion: a static badge with a 150 ms fade.

*XP numbers in the wireframes assume `xpForLevel(n)` is the cumulative XP needed to leave level n (Level 1 = 0–99, Level 2 = 100–299, Level 3 = 300–599, Level 4 = 600–999). Dev C should confirm this reading of sprint §4.4 when E4-03 starts. The UI only displays what `domain/xp` returns.*

### 8.10 Stats (E4-06)

Components: TopBar, Card + LevelBadge + XPBar, StatTile × 2–4, DomainAccuracyBar × 5, ListItem (weakest concepts), BottomTabBar.

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  Stats                               │░  TopBar title (title-2)
│                                      │░
│  ┌────────────────────────────────┐  │░
│  │ ( L3 ) Level 3      420/600 XP │  │░  LevelBadge + XPBar
│  │ ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆░░░░░░░░░░  │  │░
│  └────────────────────────────────┘  │░
│  ┌───────────────┐ ┌──────────────┐  │░
│  │ Accuracy      │ │ Streak       │  │▒  StatTile 2-col grid
│  │ 78%           │ │ 12 days      │  │▒
│  │ last 30 days  │ │ best 21      │  │▒
│  └───────────────┘ └──────────────┘  │▒
│                                      │▒
│  Accuracy by domain                  │▒  section label
│  [~] Graphs & Routing         84%    │▒  DomainAccuracyBar ×5, fixed order
│      ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆░░░░     │▒
│  [+] Dynamic Programming      61%    │▒
│      ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆░░░░░░░░░░     │▒
│  [^] Trees & Tries            80%    │▒
│      ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆░░░░░     │▒
│  [=] Sorting & Searching      92%    │█
│      ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆░░     │█
│  [#] Hashing & Heaps          —      │█  < 5 answers: “Not enough data”
│      Not enough data (3 answers)     │█
│                                      │█
│  Weakest concepts                    │█  section label (scroll continues)
│  ● Edit distance          2/5   >    │█  ListItem: domain dot · last-5 score
│  ● Knapsack 0/1           3/5   >    │█
│                                      │█
│──────────────────────────────────────│█  BottomTabBar (Stats active)
│    [>]          [|]          [o]     │█
│    Play        Stats     Settings    │█
│                                      │█
└──────────────────────────────────────┘
```

**Empty state** (no attempts yet):

```
┌──────────────────────────────────────┐
│                                      │
│            ┌ ─ ─ ─ ─ ─ ┐             │  EmptyState illustration (blueprint)
│              ▆  ▃  ▅                 │
│            └ ─ ─ ─ ─ ─ ┘             │
│        No stats yet                  │  title-3
│   Finish one session and accuracy    │  body-sm fg-secondary
│   per domain shows up here.          │
│                                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │  primary lg, in thumb zone
│ ┃          Start session           ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└──────────────────────────────────────┘
```

Notes: Stats is read-only, so its content may sit in any zone. Accuracy is the last 30 days. Weakest concepts = the lowest rolling accuracy over the last 5 attempts (sprint §4.4), at most 5 rows. Loading uses a skeleton of the same shapes. Offline: banner only.

### 8.11 Settings (E5-01, E5-02, E4-08)

Components: TopBar, `overline` section labels, Card groups of SettingsRow (toggle, navigation, action, danger, value), SegmentedControl, BottomTabBar.

```
┌──────────────────────────────────────┐  zone
│                                      │░
│  Settings                            │░  TopBar title
│                                      │░
│  APPEARANCE                          │░  section label 12/16 600 +0.04em
│  ┌────────────────────────────────┐  │░
│  │ Theme                          │  │░  SettingsRow + SegmentedControl
│  │ ┌────────┬─────────┬─────────┐ │  │░  48 px, role=radiogroup
│  │ │ ■Dark  │  Light  │ System  │ │  │░
│  │ └────────┴─────────┴─────────┘ │  │░
│  ├────────────────────────────────┤  │▒
│  │ Reduce motion            ( ○)  │  │▒  Toggle (default: follows OS)
│  ├────────────────────────────────┤  │▒
│  │ Haptics                  (● )  │  │▒  Android only; row hidden on iOS
│  └────────────────────────────────┘  │▒
│  PRIVACY                             │▒  section label
│  ┌────────────────────────────────┐  │▒
│  │ Share anonymous usage    ( ○)  │  │▒  off by default (opt-in)
│  │ Queued offline, sent later.    │  │▒
│  ├────────────────────────────────┤  │▒
│  │ What we collect              > │  │▒  navigation row → sheet
│  └────────────────────────────────┘  │▒
│  DATA                                │█  section label
│  ┌────────────────────────────────┐  │█
│  │ [↓] Export progress (JSON)     │  │█  action rows
│  ├────────────────────────────────┤  │█
│  │ [↑] Import progress            │  │█
│  ├────────────────────────────────┤  │█
│  │ [!] Reset progress             │  │█  danger row: error-fg → ConfirmSheet
│  └────────────────────────────────┘  │█
│  v1.0.0 · content v1 · Licenses >    │█  About (caption); scroll end
│                                      │█
│──────────────────────────────────────│█
│    [>]          [|]          [o]     │█
│    Play        Stats     Settings    │█
│                                      │█
└──────────────────────────────────────┘
```

**Reset confirmation:**

```
┌──────────────────────────────────────┐  zone
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░  scrim: tap = Cancel
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▒
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▒
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▒
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▒
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▒
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▒
│╭────────────────────────────────────╮│▒
││  [!]                               ││▒  ConfirmSheet (role=alertdialog)
││  Reset all progress?               ││▒  title-2
││                                    ││▒
││  XP, level, streak, reviews and    ││▒  body fg-secondary
││  history on this device are erased.││▒
││  This can't be undone.             ││█
││                                    ││█
││  ┌──────────────────────────────┐  ││█  secondary lg
││  │ [↓] Export a backup first    │  ││█
││  └──────────────────────────────┘  ││█
││  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ││█  destructive lg (error)
││  ┃       Reset progress         ┃  ││█
││  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ││█
││  ┌──────────────────────────────┐  ││█  Cancel: secondary lg, BOTTOM-MOST,
││  │           Cancel             │  ││█  initial focus (safe default)
││  └──────────────────────────────┘  ││█
││                                    ││█
│╰────────────────────────────────────╯│█
└──────────────────────────────────────┘
```

Notes:
- **Export** downloads `algoarchitect-YYYY-MM-DD.json` and confirms with a success toast. The file uses the user's local date.
- **Import** opens the file picker. A valid file opens the "Replace current progress?" ConfirmSheet (primary "Replace progress"). An invalid file gives an error toast: "That file isn't an AlgoArchitect export. Nothing was changed."
- **Reset** opens the ConfirmSheet above. After reset the app goes back to onboarding screen 1.
- The **Haptics** row is hidden when `navigator.vibrate` is missing (iOS).
- **What we collect** opens a sheet with the privacy note. Analytics stay off until the user opts in (release checklist).
- **Licenses** lists Inter (OFL 1.1), JetBrains Mono (OFL 1.1) and Lucide (ISC).

### 8.12 End-session confirmation

```
┌──────────────────────────────────────┐
│  End this session?                   │  ConfirmSheet, opened from [X]
│  Your 4 answers are saved. Finish a  │  body fg-secondary
│  session to count today's streak.    │
│                                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │  primary lg (not destructive: no data lost)
│ ┃           End session            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ ┌──────────────────────────────────┐ │  secondary lg, bottom-most
│ │            Keep going            │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 8.13 System states: offline and update

**OfflineBanner** (Home, Stats, Settings):

```
┌──────────────────────────────────────┐
│  [*] 12   [s] 1               ( L3 ) │  Home header
│ ┌──────────────────────────────────┐ │
│ │ [wifi-off] Offline. Everything   │ │  OfflineBanner: neutral, NOT warning;
│ │ works; progress is on this device│ │  surface-hover bg, caption 13/18
│ └──────────────────────────────[X]─┘ │  dismiss: 48 px hit area
└──────────────────────────────────────┘
```

**Update-available toast** (E2-07; never during a session):

```
┌──────────────────────────────────────┐
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ [↻] Update ready.       Refresh  │ │  Toast (update): persistent,
│ └──────────────────────────────────┘ │  action = ghost sm accent-fg
│                                      │  sits 8 px above BottomTabBar
│──────────────────────────────────────│
│    [>]          [|]          [o]     │
│    Play        Stats     Settings    │
│                                      │
└──────────────────────────────────────┘
```

| System state | Behavior |
|---|---|
| Offline at launch | The app loads from the precache, and the banner appears after 1 s if it is still offline (to avoid flashes) |
| Goes offline mid-session | Only the indicator icon; no banner, no toast |
| Back online | "Back online." for 2 s; the analytics queue flushes silently |
| Update downloaded | Toast queued; shown on Home or Summary; **Refresh** calls `updateSW(true)`; dismissing keeps the old version until the next launch |
| Service worker failed to install | Nothing is shown to the user; it is logged. The app still works online |
| Content load failure (corrupt cache) | A full-screen EmptyState: "Couldn't load scenarios. Reload to try again." with a primary "Reload" button |

---

## 9. Accessibility checklist

**Semantics and names**
- [ ] Every control is a native element (`button`, `a`, `input`) or has the correct ARIA role (`radio`, `switch`, `progressbar`, `dialog`, `alertdialog`).
- [ ] Choice groups (OptionTile, BigOPicker, TraceCanvas, SegmentedControl) are `role="radiogroup"` and labelled by their question.
- [ ] Icon-only buttons have `aria-label`. Decorative icons and illustrations are `aria-hidden` (Lucide v1 does this by default).
- [ ] Complexity renders its spoken form ("O of n log n") as the accessible text.
- [ ] Domain is announced by name, never by color.
- [ ] Page titles update per screen (`document.title = "Question 4 of 10 · AlgoArchitect"`). `<html lang="en">`.

**Focus and keyboard**
- [ ] A visible focus ring on everything focusable: 2 px `--focus`, 2 px offset, ≥ 3:1 (4.45–10.14:1 measured).
- [ ] Focus order follows reading order: TopBar → Stage → choices → primary button.
- [ ] Sheets and dialogs move focus in, trap it, return it on close, and make the background `inert`.
- [ ] Focus is never hidden behind the AnswerDock or BottomTabBar (WCAG 2.4.11): scroll containers set `scroll-padding-bottom` to the dock or tab-bar height.
- [ ] Desktop shortcuts: 1–4 / arrow keys to choose, Enter to Check / Continue, Esc to Cancel or Next.

**Screen readers**
- [ ] Verdicts are announced through the AnswerDock polite live region, exactly once.
- [ ] Toasts: `status` (polite); errors: `alert`.
- [ ] Selection changes in TraceCanvas are announced by the readout ("Selected: B").
- [ ] Tested with VoiceOver (iOS Safari) and TalkBack (Android Chrome) on a full session (sprint §9: Sprint 3 and Sprint 5).

**TraceCanvas non-visual alternative (E3-12)**
- [ ] The List view toggle is always visible and remembered.
- [ ] Hit buttons have generated names (neighbors, weights, index and value, parent and children).
- [ ] The graph summary is in `aria-describedby`.
- [ ] Correct and incorrect are announced in text, not only drawn.

**Targets and ergonomics**
- [ ] Every target is ≥ 48 × 48 CSS px with ≥ 8 px between separate targets.
- [ ] Primary actions are below the 60 % line at 360 × 740 (`?debug=zones`).
- [ ] No action needs a gesture (swipe, long press, drag). Every swipe has a button equivalent (WCAG 2.5.1, 2.5.7).
- [ ] `touch-action: manipulation` on controls (no double-tap zoom between Check and Continue).

**Color and contrast**
- [ ] Text ≥ 4.5:1; UI, state indicators and graphics ≥ 3:1. Use the tables in §2.8, and add rows when new pairs appear.
- [ ] Every state uses icon + shape + text, never color alone (§2.9).
- [ ] Both themes are checked. Forced colors (Windows High Contrast) still show focus and selection (the `Highlight` outline; borders use `CanvasText` under `forced-colors`).

**Text, zoom and reflow**
- [ ] 200 % text size: no clipping or overlap, and labels wrap instead of truncating.
- [ ] 320 CSS px width: no horizontal scrolling (WCAG 1.4.10).
- [ ] No `maximum-scale` or `user-scalable=no`. Orientation isn't locked (WCAG 1.3.4).

**Motion, time and haptics**
- [ ] Reduced motion (OS setting or in-app) replaces spatial motion with fades. Nothing loops except loading indicators.
- [ ] No time limits or countdowns (WCAG 2.2.1). The speed bonus is invisible.
- [ ] Haptics are optional, never the only feedback, and absent on iOS without breaking anything.

---

## 10. Implementation

### 10.1 Naming conventions

**Tokens**

| Tier | Pattern | Examples | Where |
|---|---|---|---|
| 1 · primitive | `--{hue}-{step}` | `--gray-7`, `--blue-9`, `--lime-11` | `src/ui/tokens/primitives.css` only |
| 2 · semantic color | `--{role}[-{variant}]` | `--canvas`, `--surface-raised`, `--fg-muted`, `--accent-pressed`, `--error-subtle`, `--graphs-fg` | `semantic.css`; exposed to Tailwind as `--color-{role}` |
| 2 · elevation | `--elev-{1..3}` → Tailwind `shadow-{1..3}` | | |
| Type | `--text-{name}` (+ `--line-height`, `--letter-spacing`, `--font-weight`) | `text-title-2`, `text-mono-lg` | `theme.css` |
| Radius | `--radius-{xs,sm,md,lg,xl,full}` | `rounded-lg` | `theme.css` |
| Motion | `--duration-{instant,fast,base,slow,slower,celebrate}`, `--ease-{standard,enter,exit,overshoot}` | `duration-(--duration-fast) ease-standard` | `semantic.css` / `theme.css` |
| Layout | `--size-{topbar,tabbar,control-sm,control-md,control-lg}`, `--gutter`, `--z-{layer}` | `h-(--size-control-lg)` | `semantic.css` |

Semantic suffixes have one meaning everywhere: `-subtle` = tinted background, `-line` = border, `-fg` = text or icon on neutral or subtle backgrounds, `on-{x}` = text on the `{x}` solid, `-pressed` = the pressed solid.

**Components**
- PascalCase names and files: `OptionTile.tsx` exports `OptionTile`. Hooks are `useX`. Utilities are camelCase.
- Props: `variant` (visual family), `size` (`sm|md|lg|xl`), `tone` (semantic color: `neutral|accent|success|error|warning|freeze`), `state` (`default|selected|correct|incorrect|dimmed`), and booleans `disabled`, `loading`.
- Styling state goes through `data-state` / `aria-*` selectors (`data-[state=selected]:border-accent`), never through conditional class soup.
- Domain-keyed classes come from a static map (`src/ui/lib/domain.ts`), so Tailwind can see every class name.
- Story names: `Components/OptionTile/States`, with a theme toolbar that switches `data-theme` on the story root.

### 10.2 CSS custom properties (both themes, ready to paste)

`src/ui/tokens/primitives.css`. Generated values; edit through the palette script, never by hand.

```css
/* Tier 1 — primitives. NEVER reference these outside src/ui/tokens/. */
:root,
[data-theme="dark"] {
  /* gray 1-12 */
  --gray-1: oklch(17.3% 0.006 271); /* #0f1013 */
  --gray-2: oklch(20.4% 0.009 264.4); /* #15171b */
  --gray-3: oklch(23.9% 0.010 268.3); /* #1d1f24 */
  --gray-4: oklch(26.8% 0.012 264.4); /* #23262c */
  --gray-5: oklch(30% 0.014 261.7); /* #2a2e35 */
  --gray-6: oklch(33.6% 0.013 261.7); /* #33373e */
  --gray-7: oklch(40% 0.017 262.3); /* #434851 */
  --gray-8: oklch(53% 0.015 262.3); /* #676c75 */
  --gray-9: oklch(59.9% 0.014 266.6); /* #7c8089 */
  --gray-10: oklch(70.1% 0.013 259.8); /* #9a9fa7 */
  --gray-11: oklch(80% 0.010 258.3); /* #babec4 */
  --gray-12: oklch(95.5% 0.004 271.4); /* #eff0f3 */
  /* blue 1-12 */
  --blue-1: oklch(18.4% 0.024 268.7); /* #0e121d */
  --blue-2: oklch(21.6% 0.035 266.4); /* #12192a */
  --blue-3: oklch(26.6% 0.070 265.9); /* #152347 */
  --blue-4: oklch(30% 0.089 265.8); /* #182a5a */
  --blue-5: oklch(33.9% 0.104 266); /* #1e336d */
  --blue-6: oklch(38.4% 0.117 266.2); /* #263e81 */
  --blue-7: oklch(44.5% 0.132 265.9); /* #314e9c */
  --blue-8: oklch(52.1% 0.160 266); /* #3d61c4 */
  --blue-9: oklch(56.5% 0.200 266); /* #3e69e9 */
  --blue-10: oklch(52.4% 0.200 266); /* #335cdb */
  --blue-11: oklch(80.1% 0.100 265.4); /* #9fbdff */
  --blue-12: oklch(93.6% 0.030 265.3); /* #e0eaff */
  /* green */
  --green-3: oklch(26.6% 0.053 157.6); /* #092d1b */
  --green-6: oklch(38.4% 0.087 158); /* #065131 */
  --green-9: oklch(72% 0.150 158.2); /* #37c080 */
  --green-11: oklch(80.1% 0.140 158); /* #63d99b */
  /* red */
  --red-3: oklch(26.6% 0.066 25.3); /* #401614 */
  --red-6: oklch(38.4% 0.110 24.6); /* #732524 */
  --red-9: oklch(56.5% 0.200 24.9); /* #d22d33 */
  --red-10: oklch(52.41% 0.1995 25.13); /* #c31a26 */
  --red-11: oklch(77% 0.119 25.2); /* #f7958d */
  /* amber */
  --amber-3: oklch(26.5% 0.052 74.8); /* #342103 */
  --amber-6: oklch(38.5% 0.082 74.3); /* #5d3c00 */
  --amber-9: oklch(80.1% 0.160 75.2); /* #f9ad26 */
  --amber-11: oklch(81.9% 0.130 74.9); /* #f5b75b */
  /* cyan */
  --cyan-3: oklch(26.5% 0.042 218.7); /* #072a33 */
  --cyan-6: oklch(38.52% 0.0695 219.48); /* #014c5d */
  --cyan-9: oklch(70.1% 0.125 219.8); /* #12b0d4 */
  --cyan-11: oklch(80.9% 0.110 220.4); /* #63d1f2 */
  /* violet */
  --violet-3: oklch(26.6% 0.070 299.9); /* #2b1c42 */
  --violet-6: oklch(38.4% 0.116 300.1); /* #4e3177 */
  --violet-9: oklch(66.1% 0.200 300); /* #a76ef8 */
  --violet-11: oklch(81.1% 0.110 300.1); /* #ccb1fe */
  /* lime */
  --lime-3: oklch(26.4% 0.056 129.5); /* #1c2a0a */
  --lime-6: oklch(38.5% 0.093 129.8); /* #334d0e */
  --lime-9: oklch(80.1% 0.191 130); /* #94d53c */
  --lime-11: oklch(83.1% 0.161 130.2); /* #a4dc65 */
  /* orange */
  --orange-3: oklch(26.6% 0.060 49); /* #3c1b07 */
  --orange-6: oklch(38.5% 0.099 49.5); /* #6c3004 */
  --orange-9: oklch(66.09% 0.1743 50.17); /* #e36b00 */
  --orange-11: oklch(80.1% 0.126 50.2); /* #ffa571 */
  /* pink */
  --pink-3: oklch(26.6% 0.066 349.7); /* #3c162a */
  --pink-6: oklch(38.4% 0.111 349.5); /* #6c254c */
  --pink-9: oklch(73.9% 0.191 350.1); /* #ff70bb */
  --pink-11: oklch(80.9% 0.111 349.8); /* #f7a3cb */
}

[data-theme="light"] {
  /* gray 1-12 */
  --gray-1: oklch(97.6% 0.003 264.5); /* #f6f7f9 */
  --gray-2: oklch(96% 0.003 247.9); /* #f0f2f4 */
  --gray-3: oklch(94.2% 0.005 258.3); /* #eaecef */
  --gray-4: oklch(92.4% 0.008 260.7); /* #e3e6eb */
  --gray-5: oklch(90.6% 0.008 260.7); /* #dde0e5 */
  --gray-6: oklch(87.9% 0.009 264.5); /* #d4d7dd */
  --gray-7: oklch(83.5% 0.011 261.8); /* #c5c9d0 */
  --gray-8: oklch(65% 0.014 266.6); /* #8b8f98 */
  --gray-9: oklch(58.5% 0.015 262.4); /* #777c85 */
  --gray-10: oklch(51.6% 0.015 262.3); /* #636871 */
  --gray-11: oklch(41.9% 0.018 264.4); /* #484d57 */
  --gray-12: oklch(22.1% 0.013 258.4); /* #171b21 */
  /* blue 1-12 */
  --blue-1: oklch(99.1% 0.004 271.4); /* #fbfcff */
  --blue-2: oklch(97.8% 0.010 261.8); /* #f4f8ff */
  --blue-3: oklch(95.2% 0.023 266.9); /* #e8efff */
  --blue-4: oklch(92.7% 0.035 266); /* #dce7ff */
  --blue-5: oklch(90% 0.048 266); /* #cfdeff */
  --blue-6: oklch(86.4% 0.066 266.2); /* #bed2ff */
  --blue-7: oklch(81% 0.095 265.8); /* #a4c0ff */
  --blue-8: oklch(73% 0.139 265.9); /* #7ea4ff */
  --blue-9: oklch(56.5% 0.200 266); /* #3e69e9 */
  --blue-10: oklch(52.4% 0.200 266); /* #335cdb */
  --blue-11: oklch(50.6% 0.189 265.9); /* #3158cf */
  --blue-12: oklch(29.9% 0.111 266); /* #132764 */
  /* green */
  --green-3: oklch(95.2% 0.023 157.6); /* #e3f4e9 */
  --green-6: oklch(86.4% 0.060 158.5); /* #b2dfc4 */
  --green-9: oklch(61.47% 0.140 157.9); /* #129d63 */
  --green-11: oklch(50.1% 0.111 157.7); /* #14764a */
  /* red */
  --red-3: oklch(95.1% 0.024 23.8); /* #ffe9e7 */
  --red-6: oklch(86.5% 0.072 25); /* #ffc1bb */
  --red-9: oklch(54.55% 0.200 24.9); /* #cb242d */
  --red-10: oklch(50.42% 0.200 25); /* #bc0b20 */
  --red-11: oklch(52% 0.190 24.9); /* #be222a */
  /* amber */
  --amber-3: oklch(95.2% 0.024 73.6); /* #f9edde */
  --amber-6: oklch(86.4% 0.064 74.5); /* #eccda4 */
  --amber-9: oklch(80.1% 0.160 75.2); /* #f9ad26 */
  --amber-11: oklch(52% 0.110 75.1); /* #8d5e00 */
  /* cyan */
  --cyan-3: oklch(95.2% 0.018 223.6); /* #e3f2f8 */
  --cyan-6: oklch(86.6% 0.048 220.1); /* #b1dbe9 */
  --cyan-9: oklch(61% 0.111 219.9); /* #0092b1 */
  --cyan-11: oklch(50.1% 0.091 219.7); /* #006f87 */
  /* violet */
  --violet-3: oklch(95.3% 0.026 300.3); /* #f2ecff */
  --violet-6: oklch(86.6% 0.077 299.8); /* #dac8ff */
  --violet-9: oklch(50% 0.219 300); /* #7a31ca */
  --violet-11: oklch(50% 0.199 299.8); /* #773ac1 */
  /* lime */
  --lime-3: oklch(95.3% 0.024 129.9); /* #eaf3e2 */
  --lime-6: oklch(86.6% 0.064 130.2); /* #c5dcb0 */
  --lime-9: oklch(60.95% 0.164 130); /* #619500 */
  --lime-11: oklch(49% 0.120 130); /* #496d16 */
  /* orange */
  --orange-3: oklch(95.1% 0.027 47.2); /* #ffeae0 */
  --orange-6: oklch(86.5% 0.071 50.6); /* #fac6a9 */
  --orange-9: oklch(53% 0.140 50.2); /* #a94e00 */
  --orange-11: oklch(52% 0.138 49.7); /* #a54b00 */
  /* pink */
  --pink-3: oklch(95.2% 0.028 349.5); /* #ffe8f2 */
  --pink-6: oklch(86.5% 0.076 349.6); /* #fabfda */
  --pink-9: oklch(58% 0.210 350.1); /* #cd2e8b */
  --pink-11: oklch(51% 0.179 350.2); /* #ab2974 */
}
```

`src/ui/tokens/semantic.css`:

```css
/* Tier 2 — semantic tokens. Components and Tailwind utilities use only these.
   Declared on [data-theme] so a subtree (e.g. a Storybook story) can switch theme. */
:root,
[data-theme="dark"] {
  color-scheme: dark;
  /* Surfaces */
  --canvas: var(--gray-1);
  --surface: var(--gray-2);
  --surface-raised: var(--gray-3);
  --surface-hover: var(--gray-4);
  --surface-pressed: var(--gray-5);
  --track: var(--gray-4);
  /* Lines (borders, dividers) */
  --line-subtle: var(--gray-6);
  --line: var(--gray-7);
  --line-strong: var(--gray-8);
  /* Text and icons */
  --fg: var(--gray-12);
  --fg-secondary: var(--gray-11);
  --fg-muted: var(--gray-10);
  --fg-disabled: var(--gray-9);
  /* Accent (brand, primary action, selection) */
  --accent: var(--blue-9);
  --accent-pressed: var(--blue-10);
  --accent-subtle: var(--blue-3);
  --accent-line: var(--blue-7);
  --accent-fg: var(--blue-11);
  --on-accent: #ffffff;
  --focus: var(--blue-11);
  /* Success (correct) */
  --success: var(--green-9);
  --success-subtle: var(--green-3);
  --success-line: var(--green-6);
  --success-fg: var(--green-11);
  --on-success: var(--gray-1);
  /* Error (wrong, destructive) */
  --error: var(--red-9);
  --error-pressed: var(--red-10);
  --error-subtle: var(--red-3);
  --error-line: var(--red-6);
  --error-fg: var(--red-11);
  --on-error: #ffffff;
  /* Warning */
  --warning: var(--amber-9);
  --warning-subtle: var(--amber-3);
  --warning-line: var(--amber-6);
  --warning-fg: var(--amber-11);
  --on-warning: var(--gray-1);
  /* Game */
  --streak: var(--orange-9);
  --streak-subtle: var(--orange-3);
  --freeze: var(--cyan-11);
  --freeze-subtle: var(--cyan-3);
  /* Aliases */
  --info: var(--accent);
  --info-subtle: var(--accent-subtle);
  --info-line: var(--accent-line);
  --info-fg: var(--accent-fg);
  --xp: var(--accent);
  /* Domains */
  --graphs: var(--cyan-9); --graphs-subtle: var(--cyan-3); --graphs-line: var(--cyan-6); --graphs-fg: var(--cyan-11);
  --dp: var(--violet-9); --dp-subtle: var(--violet-3); --dp-line: var(--violet-6); --dp-fg: var(--violet-11);
  --trees: var(--lime-9); --trees-subtle: var(--lime-3); --trees-line: var(--lime-6); --trees-fg: var(--lime-11);
  --sorting: var(--orange-9); --sorting-subtle: var(--orange-3); --sorting-line: var(--orange-6); --sorting-fg: var(--orange-11);
  --hashing: var(--pink-9); --hashing-subtle: var(--pink-3); --hashing-line: var(--pink-6); --hashing-fg: var(--pink-11);
  /* Elevation & overlay */
  --scrim: rgb(0 0 0 / 0.64);
  --elev-1: none;
  --elev-2: inset 0 1px 0 rgb(255 255 255 / 0.04), 0 2px 8px rgb(0 0 0 / 0.40);
  --elev-3: inset 0 1px 0 rgb(255 255 255 / 0.05), 0 -8px 32px rgb(0 0 0 / 0.55);
}

[data-theme="light"] {
  color-scheme: light;
  /* Surfaces */
  --canvas: var(--gray-1);
  --surface: #ffffff;
  --surface-raised: #ffffff;
  --surface-hover: var(--gray-2);
  --surface-pressed: var(--gray-3);
  --track: var(--gray-3);
  /* Lines (borders, dividers) */
  --line-subtle: var(--gray-6);
  --line: var(--gray-7);
  --line-strong: var(--gray-8);
  /* Text and icons */
  --fg: var(--gray-12);
  --fg-secondary: var(--gray-11);
  --fg-muted: var(--gray-10);
  --fg-disabled: var(--gray-9);
  /* Accent (brand, primary action, selection) */
  --accent: var(--blue-9);
  --accent-pressed: var(--blue-10);
  --accent-subtle: var(--blue-3);
  --accent-line: var(--blue-7);
  --accent-fg: var(--blue-11);
  --on-accent: #ffffff;
  --focus: var(--blue-9);
  /* Success (correct) */
  --success: var(--green-9);
  --success-subtle: var(--green-3);
  --success-line: var(--green-6);
  --success-fg: var(--green-11);
  --on-success: var(--gray-12);
  /* Error (wrong, destructive) */
  --error: var(--red-9);
  --error-pressed: var(--red-10);
  --error-subtle: var(--red-3);
  --error-line: var(--red-6);
  --error-fg: var(--red-11);
  --on-error: #ffffff;
  /* Warning */
  --warning: var(--amber-9);
  --warning-subtle: var(--amber-3);
  --warning-line: var(--amber-6);
  --warning-fg: var(--amber-11);
  --on-warning: var(--gray-12);
  /* Game */
  --streak: var(--orange-9);
  --streak-subtle: var(--orange-3);
  --freeze: var(--cyan-11);
  --freeze-subtle: var(--cyan-3);
  /* Aliases */
  --info: var(--accent);
  --info-subtle: var(--accent-subtle);
  --info-line: var(--accent-line);
  --info-fg: var(--accent-fg);
  --xp: var(--accent);
  /* Domains */
  --graphs: var(--cyan-9); --graphs-subtle: var(--cyan-3); --graphs-line: var(--cyan-6); --graphs-fg: var(--cyan-11);
  --dp: var(--violet-9); --dp-subtle: var(--violet-3); --dp-line: var(--violet-6); --dp-fg: var(--violet-11);
  --trees: var(--lime-9); --trees-subtle: var(--lime-3); --trees-line: var(--lime-6); --trees-fg: var(--lime-11);
  --sorting: var(--orange-9); --sorting-subtle: var(--orange-3); --sorting-line: var(--orange-6); --sorting-fg: var(--orange-11);
  --hashing: var(--pink-9); --hashing-subtle: var(--pink-3); --hashing-line: var(--pink-6); --hashing-fg: var(--pink-11);
  /* Elevation & overlay */
  --scrim: rgb(23 27 33 / 0.40);
  --elev-1: 0 1px 2px rgb(23 27 33 / 0.06);
  --elev-2: 0 1px 2px rgb(23 27 33 / 0.06), 0 4px 12px rgb(23 27 33 / 0.08);
  --elev-3: 0 -8px 32px rgb(23 27 33 / 0.16);
}

/* Theme-agnostic tokens */
:root {
  /* Motion */
  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-base: 220ms;
  --duration-slow: 320ms;
  --duration-slower: 480ms;
  --duration-celebrate: 800ms;
  --input-guard: 350ms;

  /* Layout */
  --gutter: 1rem;
  --size-topbar: 3.5rem;
  --size-tabbar: 4rem;
  --size-control-sm: 2.5rem;
  --size-control-md: 3rem;
  --size-control-lg: 3.5rem;
  --size-hit: 3rem;

  /* Layers */
  --z-base: 0;
  --z-sticky: 10;
  --z-nav: 20;
  --z-toast: 40;
  --z-overlay: 50;
  --z-coach: 60;
}

@media (min-width: 30rem) {
  :root { --gutter: 1.5rem; }
}

/* Reduced-motion safety net (components still design their own fallbacks) */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { scroll-behavior: auto !important; }
}
[data-motion="reduce"] *,
[data-motion="reduce"] ::before,
[data-motion="reduce"] ::after {
  animation-duration: 1ms !important;
  animation-iteration-count: 1 !important;
}
```

Order matters: the `[data-theme="light"]` blocks must come **after** the `:root, [data-theme="dark"]` blocks. They have equal specificity, so the later block wins on `<html data-theme="light">`.

### 10.3 Tailwind CSS v4 setup

**Versions** (checked on npm, 2026-11-04): `tailwindcss` **4.3.4** (published 2026-11-02) and `@tailwindcss/vite` 4.3.4 (peer: Vite 5.2–8). Use `^4.3` and let the lockfile pin the exact version. v4 targets Safari 16.4+, Chrome 111+ and Firefox 128+, which matches the "latest 2 iOS versions" target ([Tailwind compatibility](https://tailwindcss.com/docs/compatibility)).

```ts
// vite.config.ts (excerpt)
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [react(), tailwindcss(), VitePWA({ /* §10.6 */ })] });
```

`src/ui/tokens/theme.css`, imported once from `src/main.tsx`:

```css
@import "tailwindcss";
@import "./primitives.css";
@import "./semantic.css";
@import "../fonts/fonts.css";

/* Variants */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
@custom-variant light (&:where([data-theme="light"], [data-theme="light"] *));
@custom-variant can-hover (@media (hover: hover) and (pointer: fine));
@custom-variant short (@media (max-height: 40rem));
@custom-variant motion-ok {
  @media (prefers-reduced-motion: no-preference) {
    &:where(:root:not([data-motion="reduce"]) *) { @slot; }
  }
}

/* Static theme values (non-color) */
@theme {
  /* Remove Tailwind defaults so only our tokens compile */
  --color-*: initial;
  --text-*: initial;
  --radius-*: initial;
  --shadow-*: initial;
  --breakpoint-*: initial;
  --ease-*: initial;
  --animate-*: initial;

  --font-sans: "Inter Variable", "Inter Fallback", ui-sans-serif, system-ui, -apple-system,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, "SF Mono", SFMono-Regular, Menlo,
    Consolas, "Roboto Mono", monospace;

  --text-display: 2rem;       --text-display--line-height: 2.25rem;  --text-display--letter-spacing: -0.022em; --text-display--font-weight: 700;
  --text-title-1: 1.5rem;     --text-title-1--line-height: 1.875rem; --text-title-1--letter-spacing: -0.019em; --text-title-1--font-weight: 700;
  --text-title-2: 1.25rem;    --text-title-2--line-height: 1.625rem; --text-title-2--letter-spacing: -0.017em; --text-title-2--font-weight: 600;
  --text-title-3: 1.0625rem;  --text-title-3--line-height: 1.5rem;   --text-title-3--letter-spacing: -0.013em; --text-title-3--font-weight: 600;
  --text-body-lg: 1.0625rem;  --text-body-lg--line-height: 1.625rem; --text-body-lg--letter-spacing: -0.013em;
  --text-body: 1rem;          --text-body--line-height: 1.5rem;      --text-body--letter-spacing: -0.011em;
  --text-body-sm: 0.875rem;   --text-body-sm--line-height: 1.25rem;  --text-body-sm--letter-spacing: -0.006em;
  --text-caption: 0.8125rem;  --text-caption--line-height: 1.125rem; --text-caption--letter-spacing: -0.003em; --text-caption--font-weight: 500;
  --text-overline: 0.75rem;   --text-overline--line-height: 1rem;    --text-overline--letter-spacing: 0.04em;  --text-overline--font-weight: 600;
  --text-tab: 0.75rem;        --text-tab--line-height: 1rem;         --text-tab--font-weight: 600;
  --text-mono-lg: 1.125rem;   --text-mono-lg--line-height: 1.5rem;   --text-mono-lg--font-weight: 500;
  --text-mono: 0.9375rem;     --text-mono--line-height: 1.375rem;    --text-mono--font-weight: 500;
  --text-mono-node: 0.875rem; --text-mono-node--line-height: 1.25rem; --text-mono-node--font-weight: 600;
  --text-mono-sm: 0.75rem;    --text-mono-sm--line-height: 1rem;     --text-mono-sm--font-weight: 500;

  --radius-xs: 0.25rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  --breakpoint-sm: 30rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --container-content: 30rem;

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-exit: cubic-bezier(0.3, 0, 0.8, 0.15);
  --ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);

  --animate-spin: spin 0.8s linear infinite;
  --animate-shimmer: shimmer 1.2s linear infinite;
  --animate-rise-in: rise-in var(--duration-base) var(--ease-enter) both;
  --animate-pop-in: pop-in var(--duration-base) var(--ease-overshoot) both;
  --animate-fade-in: fade-in var(--duration-fast) var(--ease-standard) both;
  --animate-sheet-in: sheet-in var(--duration-slow) var(--ease-enter) both;
  --animate-sheet-out: sheet-out var(--duration-base) var(--ease-exit) both;

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
  @keyframes rise-in { from { opacity: 0; transform: translateY(0.5rem); } to { opacity: 1; transform: none; } }
  @keyframes pop-in { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes sheet-out { from { transform: translateY(0); } to { transform: translateY(100%); } }
}

/* Theme-switching values: reference semantic variables (resolved per element) */
@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-surface-hover: var(--surface-hover);
  --color-surface-pressed: var(--surface-pressed);
  --color-track: var(--track);
  --color-line-subtle: var(--line-subtle);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-fg: var(--fg);
  --color-fg-secondary: var(--fg-secondary);
  --color-fg-muted: var(--fg-muted);
  --color-fg-disabled: var(--fg-disabled);
  --color-accent: var(--accent);
  --color-accent-pressed: var(--accent-pressed);
  --color-accent-subtle: var(--accent-subtle);
  --color-accent-line: var(--accent-line);
  --color-accent-fg: var(--accent-fg);
  --color-on-accent: var(--on-accent);
  --color-focus: var(--focus);
  --color-success: var(--success);
  --color-success-subtle: var(--success-subtle);
  --color-success-line: var(--success-line);
  --color-success-fg: var(--success-fg);
  --color-on-success: var(--on-success);
  --color-error: var(--error);
  --color-error-pressed: var(--error-pressed);
  --color-error-subtle: var(--error-subtle);
  --color-error-line: var(--error-line);
  --color-error-fg: var(--error-fg);
  --color-on-error: var(--on-error);
  --color-warning: var(--warning);
  --color-warning-subtle: var(--warning-subtle);
  --color-warning-line: var(--warning-line);
  --color-warning-fg: var(--warning-fg);
  --color-on-warning: var(--on-warning);
  --color-streak: var(--streak);
  --color-streak-subtle: var(--streak-subtle);
  --color-freeze: var(--freeze);
  --color-freeze-subtle: var(--freeze-subtle);
  --color-info: var(--info);
  --color-info-subtle: var(--info-subtle);
  --color-info-line: var(--info-line);
  --color-info-fg: var(--info-fg);
  --color-xp: var(--xp);
  --color-graphs: var(--graphs); --color-graphs-subtle: var(--graphs-subtle); --color-graphs-line: var(--graphs-line); --color-graphs-fg: var(--graphs-fg);
  --color-dp: var(--dp); --color-dp-subtle: var(--dp-subtle); --color-dp-line: var(--dp-line); --color-dp-fg: var(--dp-fg);
  --color-trees: var(--trees); --color-trees-subtle: var(--trees-subtle); --color-trees-line: var(--trees-line); --color-trees-fg: var(--trees-fg);
  --color-sorting: var(--sorting); --color-sorting-subtle: var(--sorting-subtle); --color-sorting-line: var(--sorting-line); --color-sorting-fg: var(--sorting-fg);
  --color-hashing: var(--hashing); --color-hashing-subtle: var(--hashing-subtle); --color-hashing-line: var(--hashing-line); --color-hashing-fg: var(--hashing-fg);
  --shadow-1: var(--elev-1);
  --shadow-2: var(--elev-2);
  --shadow-3: var(--elev-3);
}

/* Custom utilities */
@utility pt-safe { padding-top: env(safe-area-inset-top, 0px); }
@utility pb-safe { padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px)); }
@utility px-gutter {
  padding-left: max(var(--gutter), env(safe-area-inset-left, 0px));
  padding-right: max(var(--gutter), env(safe-area-inset-right, 0px));
}
@utility hit-target {
  position: relative;
  &::after {
    content: ""; position: absolute; left: 50%; top: 50%;
    width: max(100%, var(--size-hit)); height: max(100%, var(--size-hit));
    transform: translate(-50%, -50%);
  }
}
@utility notation {
  font-family: var(--font-mono);
  font-variant-ligatures: none;
  white-space: nowrap;
}
@utility focus-ring-inset { outline: 2px solid var(--focus); outline-offset: -2px; }

@layer base {
  html {
    background: var(--canvas);
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  body {
    min-height: 100dvh;
    background: var(--canvas);
    color: var(--fg);
    font-family: var(--font-sans);
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
    letter-spacing: var(--text-body--letter-spacing);
    font-synthesis: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
  }
  button, a, [role="button"], [role="radio"], [role="switch"], label { touch-action: manipulation; }
  :focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  ::selection { background: var(--accent-subtle); color: var(--fg); }
  h1, h2, h3 { text-wrap: balance; }
  p { text-wrap: pretty; }
  @media (forced-colors: active) {
    :focus-visible { outline-color: Highlight; }
  }
}
```

The resulting utilities: `bg-canvas`, `bg-surface-raised`, `text-fg-muted`, `border-line-subtle`, `bg-accent text-on-accent`, `bg-success-subtle text-success-fg`, `border-error`, `bg-graphs-subtle text-graphs-fg`, `text-title-2`, `font-mono text-mono-lg`, `rounded-md`, `shadow-2`, `max-w-content`, `ease-enter`, `animate-rise-in`, `duration-(--duration-fast)`, `motion-ok:animate-pop-in`, `can-hover:hover:bg-surface-hover`. Because the defaults are reset, `bg-blue-500` doesn't compile.

Example: OptionTile classes

```tsx
const tile =
  "flex min-h-(--size-control-md) w-full items-center gap-3 rounded-md border-2 border-line-subtle " +
  "bg-surface-raised py-3 pl-4 pr-3 text-left text-body font-medium text-fg shadow-1 " +
  "transition-colors duration-(--duration-fast) ease-standard " +
  "can-hover:hover:bg-surface-hover active:bg-surface-pressed motion-ok:active:scale-[0.99] " +
  "data-[state=selected]:border-accent data-[state=selected]:bg-accent-subtle " +
  "data-[state=correct]:border-success data-[state=correct]:bg-success-subtle " +
  "data-[state=incorrect]:border-dashed data-[state=incorrect]:border-error data-[state=incorrect]:bg-error-subtle " +
  "data-[state=dimmed]:bg-surface data-[state=dimmed]:text-fg-muted";
```

Note: the docs site (tailwindcss.com) couldn't be reached from the research environment. The syntax above follows the v4 CSS-first API (`@theme`, `@theme inline`, namespace resets with `initial`, `@custom-variant` with `@slot`, `@utility`, and the `--text-*--line-height` sub-properties). Verify it in the Sprint 0 spike (E1-03) with a Storybook build of Button and OptionTile.

### 10.4 Theme bootstrapping (no flash) and theme-color

Put this inline in the `<head>` of `index.html`, right after the `<meta name="theme-color">` tag (the script looks it up) and before the stylesheet. If a CSP is added later, allow it with a hash.

```html
<script>
  (function () {
    var d = document.documentElement, t = "dark", m = "full";
    try {
      var pref = localStorage.getItem("aa.theme") || "dark";           // "dark" | "light" | "system"
      t = pref === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : pref;
      var rm = localStorage.getItem("aa.reduceMotion");                 // "1" | "0" | null (= follow OS)
      m = rm === "1" || (rm === null && matchMedia("(prefers-reduced-motion: reduce)").matches) ? "reduce" : "full";
    } catch (e) {}
    d.dataset.theme = t; d.dataset.motion = m;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f6f7f9" : "#0f1013");
  })();
</script>
```

`useTheme()` updates `data-theme`, the `theme-color` meta tag and `localStorage` together, and re-resolves "system" on `prefers-color-scheme` changes. Only UI preferences live in `localStorage` (sprint §4.3).

### 10.5 Folder structure: `src/ui/`

```
src/ui/
  tokens/
    primitives.css        # tier 1 (generated; §10.2)
    semantic.css          # tier 2 + motion/layout/z tokens (§10.2)
    theme.css             # Tailwind entry: @import, @theme, @custom-variant, @utility, base (§10.3)
    motion.ts             # durations/easings/haptic patterns mirrored for JS
  fonts/
    fonts.css             # @font-face (Inter, JetBrains Mono, Inter Fallback)
  primitives/
    Complexity.tsx        # ASCII notation → mono + <sup> + spoken text
    VisuallyHidden.tsx
    IconProvider.tsx      # LucideProvider defaults
    Portal.tsx
  components/
    Button/               # Button.tsx · Button.stories.tsx · Button.test.tsx · index.ts
    OptionTile/
    BigOPicker/
    TraceCanvas/          # TraceCanvas.tsx · GraphLayer.tsx · ArrayLayer.tsx · TreeLayer.tsx
                          # HitLayer.tsx · TraceListView.tsx · describe.ts (a11y labels)
    AnswerDock/
    BottomTabBar/
    TopBar/               # TopBar.tsx · SessionTopBar.tsx · SessionProgress.tsx
    FeedbackSheet/
    Card/
    Chip/                 # Chip.tsx · FilterChip.tsx · DomainBadge.tsx
    XPBar/                # XPBar.tsx · LevelBadge.tsx
    Streak/               # StreakCounter.tsx · StreakFlame.tsx
    StatTile/
    Progress/             # ProgressRing.tsx · DomainAccuracyBar.tsx
    Toast/                # Toast.tsx · Toaster.tsx · toastQueue.ts (session-aware)
    Sheet/                # Sheet.tsx · ConfirmSheet.tsx · Dialog.tsx
    ListItem/             # ListItem.tsx · SettingsRow.tsx · SegmentedControl.tsx
    Toggle/
    EmptyState/
    Skeleton/
    OfflineBanner/
    CoachMark/
  layout/
    AppShell.tsx          # TopBar + content + BottomTabBar, safe areas
    SessionShell.tsx      # SessionTopBar + Stage + AnswerDock
    ThumbZoneOverlay.tsx  # dev-only, ?debug=zones
  hooks/
    useTheme.ts · useReducedMotion.ts · useHaptics.ts · useOnlineStatus.ts · useInputGuard.ts
  lib/
    cx.ts                 # class join
    domain.ts             # Domain → label, short label, Lucide icon, static class strings
    complexity.ts         # parse(), toSpeech(), growthRank() for BigOPicker ordering
  index.ts                # public exports only (features import from "@/ui")
```

`features/*` (sprint §4.1) import from `@/ui` only. `src/ui` never imports from `features/` or `domain/`.

### 10.6 PWA manifest, head tags and app icon

`vite.config.ts` → `VitePWA` (`vite-plugin-pwa` **2.0.0**: Workbox 7.4, Node ≥ 20.19):

```ts
VitePWA({
  registerType: "prompt",                       // E2-07: user chooses when to refresh
  includeAssets: ["fonts/*.woff2", "icons/*.png", "icons/*.svg"],
  workbox: { globPatterns: ["**/*.{js,css,html,svg,png,woff2,json}"], navigateFallback: "/index.html" },
  manifest: {
    name: "AlgoArchitect",
    short_name: "AlgoArch",
    description: "Match real architecture scenarios to the right algorithm. Five minutes, one thumb, offline.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0f1013",
    theme_color: "#0f1013",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-monochrome.svg", sizes: "any", type: "image/svg+xml", purpose: "monochrome" }
    ]
  }
})
```

- `theme_color` and `background_color` are both the dark canvas `#0f1013`, so the splash screen and title bar match the default theme. The light theme updates `<meta name="theme-color">` at runtime to `#f6f7f9`. That doesn't change the installed manifest, and it is ignored by Safari 26, which uses the `body` background instead.
- `start_url: "/"`: no query string, so the precached `index.html` matches offline.
- `orientation: "any"`: never lock it (WCAG 1.3.4).

`index.html` head:

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f1013">
<meta name="color-scheme" content="dark light">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AlgoArch">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/inter-4.1-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
<title>AlgoArchitect</title>
```

**Short name.** `AlgoArch` (8 characters) fits under the icon on iOS and Android without truncation, while "AlgoArchitect" (13) truncates on iOS. "Archly" is shorter and friendly, but it is a different word from the product name: users who install "AlgoArchitect" would look for that name on their home screen. "Archly" also means "slyly teasing" in English, which is off-voice for a calm peer. Use "Archly" only if the whole brand adopts it.

**App icon concept: "A as a graph".**

```
  ┌───────────────────────────┐   512 × 512, full-bleed --canvas (dark) background
  │  · · · · · · · · · · · ·  │   faint 64 px blueprint grid in --gray-3 (2 px)
  │  ·          ●          ·  │   apex node: --accent #3e69e9, r 34
  │  ·         ╱ ╲         ·  │   legs: 22 px edges in --gray-11 #babec4
  │  ·       ◦═════◦       ·  │   crossbar: --accent edge, two ring nodes
  │  ·      ╱       ╲      ·  │   (r 20, 8 px --blue-11 #9fbdff ring)
  │  ·     ●         ●     ·  │   base nodes: --gray-12 #eff0f3, r 28
  │  · · · · · · · · · · · ·  │   everything within the maskable safe zone
  └───────────────────────────┘   (circle r = 205 px, 80 % of the canvas)
```

The letter A is drawn as a three-node graph (a small DAG and a truss: algorithms and architecture), with the crossbar as the accent edge. Geometry on the 512 grid: apex (256, 128), base (152, 384) and (360, 384), crossbar nodes at 60 % down each leg, (193.6, 281.6) and (318.4, 281.6). The farthest point from the center is 180 px, inside the 205 px safe radius. Deliverables:
- `icon-maskable-512.png` (full bleed)
- `icon-512.png` / `icon-192.png` (the same art on a rounded-square tile, radius 112 / 42)
- `apple-touch-icon-180.png` (full bleed, no transparency; iOS rounds it)
- `favicon.svg` (the mark only, without the grid, `prefers-color-scheme` aware)
- `icon-monochrome.svg` (a single-color silhouette for Android themed icons)

Generate the PNGs with `@vite-pwa/assets-generator` from a single SVG source. **Wordmark:** "AlgoArchitect" in Inter 700, −0.02 em, `--fg`, with the mark at the left (cap height = 70 % of the mark height). This answers the sprint's open question Q5: no separate logo project is needed for the MVP.

### 10.7 Guardrails

- **No raw colors in components.** CI runs `rg -n "#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(" src --glob '!src/ui/tokens/**' --glob '!**/*.stories.tsx'`, and any match fails.
- **No arbitrary color utilities** such as `bg-[#…]` or `text-[oklch(…)]`. CI runs `rg -n "\b(bg|text|border|ring|fill|stroke)-\[(#|rgb|oklch|hsl)" src`.
- **The default palette is removed** (`--color-*: initial`), so `bg-blue-500` fails at build time.
- **Content CI** (sprint §9) adds: option label ≤ 28 characters, prompt ≤ 280, the complexity regex (§3.4), trace layout rules (§7.4), and 3–6 Big-O choices.
- **Dev overlay** `?debug=zones` (`ThumbZoneOverlay`): draws the 60 % line and 48 px target outlines on the current screen.
- **Storybook:** every component has a story for every state in both themes. The axe add-on runs in CI on those stories.
- **Visual check per PR:** screenshots at 360 × 740 (dark and light) and at 320 × 640 for any changed screen.

---

## 11. Design QA checklist and references

### 11.1 Design QA checklist (mapped to the sprint Definition of Done)

| DoD item (sprint §3.4) | Design QA checks | How to verify |
|---|---|---|
| Merged through a reviewed PR | Screenshots in the PR (dark + light, 360 × 740; 320 × 640 for layout changes); the component's Storybook states updated | PR template checkbox |
| Lint, type-check, tests pass | The token-guard greps (§10.7) pass; component tests cover roles, `aria-checked` / `aria-disabled` and `data-state` | CI |
| Works offline in airplane mode | No network spinners; the OfflineBanner shows and is neutral; fonts and icons render from the precache (DevTools → Cache Storage contains both `.woff2` files) | Airplane mode on a real device |
| One-handed: thumb zone, targets ≥ 48 × 48 | Primary actions below the 60 % line at 360 × 740; every target ≥ 48 px with ≥ 8 px spacing; Check and Continue in the same spot; no double-tap zoom | `?debug=zones`; tap-through on device |
| Accessibility: focus, contrast ≥ 4.5:1, SR labels | Focus ring visible on every control; only token pairs from §2.8 (add and compute new pairs); icon + shape + text on every state; spoken Big-O; TraceCanvas List view; live-region verdicts | axe (Storybook + Playwright), VoiceOver + TalkBack pass, keyboard pass |
| Lighthouse PWA pass, performance ≥ 90 | Fonts ≤ 90 KiB total and only Inter preloaded; no layout shift from state changes (2 px borders at rest, skeleton matches layout); motion uses `transform` / `opacity` only | Lighthouse CI budget (E2-09); release target Accessibility ≥ 95 |
| Preview deployed, PO accepted | Copy matches §1.4; the guardrails in §1.5 hold (no timers, no guilt copy, no visible speed bonus); reduced-motion pass done | PO review on the preview URL |

**Per screen, before you mark it done:** both themes · reduced motion on and off · 200 % text · 320 px width · offline · loading (throttled IndexedDB) · empty state · error state · iOS Safari standalone (status bar, home indicator) · Android Chrome standalone (haptics on and off).

**Story → spec map:** E1-03 → §2, §3, §7.1, §7.2, §7.6, §7.9 · E1-04 → §8 · E2-05 → §7.6 · E2-06 / E4-07 → §8.3 · E2-07 → §7.15, §8.13 · E2-08 → §7.21 · E3-03 → §7.2, §7.5, §8.4 · E3-04 → §7.8, §8.7 · E3-07 → §8.8 · E3-08 → §8.3 · E3-10 → §7.3, §8.5 · E3-11 / E3-12 → §7.4, §8.6, §9 · E4-03 → §7.11, §8.9 · E4-05 → §7.12 · E4-06 → §7.13–7.14, §8.10 · E5-01 / E5-02 → §7.16, §8.11 · E5-05 → §9 · E5-06 → §8.2, §7.22.

### 11.2 How the numbers were produced

- **Palette:** OKLCH → sRGB via OKLab (Ottosson), with chroma-only gamut mapping. All hex values are final; the OKLCH strings are verified to round-trip to the same hex.
- **Contrast:** WCAG 2.x relative luminance; APCA-W3 0.0.98G-4g; CVD simulation with Machado et al. (2009) at severity 1.0.
- **Font metrics, glyph coverage and file sizes:** measured from the Fontsource 5.3.0 files with fontTools. The JetBrains Mono 2.304 coverage was checked against the upstream build bundled in `@gitlab/fonts`.
- **Versions:** checked on the npm registry on 2026-11-04: `tailwindcss` 4.3.4, `lucide-react` 1.68.0 (peer React ≥ 16.5, < 20), `vite-plugin-pwa` 2.0.0, `@fontsource-variable/inter` 5.3.0 (Inter 4.1), `@fontsource-variable/jetbrains-mono` 5.3.0, `geist` 1.9.0.
- The generator scripts were run outside the repo. If the team wants to change a step, commit them as `scripts/tokens/` and regenerate §2 and §10.2 together.

### 11.3 References

**Ergonomics and touch**
- Steven Hoober, "Design for Fingers and Thumbs Instead of Touch", UXmatters, 2013: https://uxmatters.com/mt/archives/2013/11/design-for-fingers-and-thumbs-instead-of-touch.php
- Steven Hoober, "How We Hold Our Gadgets", A List Apart: https://alistapart.com/article/how-we-hold-our-gadgets
- Steven Hoober, UXmatters column archive (incl. "Design for Fingers, Touch, and People", parts 1–3, 2017): https://uxmatters.com/authors/archives/2012/04/steven_hoober.php
- Steven Hoober, *Touch Design for Mobile Interfaces*, Smashing: https://www.smashingmagazine.com/ebooks/touch-design-for-mobile-interfaces-ebook/
- Samantha Ingram, "The Thumb Zone: Designing for Mobile Users", Smashing Magazine, 2016: https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/
- Addy Osmani, "Modern Touch-Friendly Design": https://addyosmani.com/blog/touch-friendly-design/
- W3C, Understanding SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- EZUD, "Touch Target Sizes and Mobile Accessibility" (Apple 44 pt, Material 48 dp, WCAG 2.5.5/2.5.8): https://ezud.com/touch-target-sizes-mobile-accessibility/
- Apple Human Interface Guidelines, Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Material Design 3, Accessibility basics: https://m3.material.io/foundations/accessible-design/accessibility-basics

**Accessibility and contrast**
- W3C, What's New in WCAG 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- WebAIM, WCAG 2.2 overview: https://webaim.org/standards/wcag/wcag22
- TetraLogical, "What's new in WCAG 2.2": https://tetralogical.com/blog/2023/10/05/whats-new-wcag-2.2
- W3C, Understanding SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast
- APCA introduction (Myndex): https://github.com/Myndex/apca-introduction
- ARC Bronze Simple Mode (APCA thresholds): https://a11yreadtech.github.io/ARC/tests/bronze-simple-mode
- W3C WAI-ARIA APG, Radio Group pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- Machado, Oliveira & Fernandes, "A Physiologically-based Model for Simulation of Color Vision Deficiency", IEEE TVCG 15(6), 2009
- Okabe & Ito color-universal-design palette: https://jfly.uni-koeln.de/color/ (hex reference: https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference)

**Color systems**
- Björn Ottosson, "A perceptual color space for image processing" (OKLab): https://bottosson.github.io/posts/oklab/
- Evil Martians, "OKLCH in CSS: why we moved from RGB and HSL": https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
- Radix Colors, "Understanding the scale": https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- GitHub Primer, Token names: https://primer.style/product/primitives/token-names/ · Color overview: https://primer.style/foundations/color/overview
- Linear, "How we redesigned the Linear UI": https://linear.app/now/how-we-redesigned-the-linear-ui

**Typography and icons**
- Inter (rsms): https://rsms.me/inter/ · Inter 4.1 release notes: https://github.com/rsms/inter/releases
- JetBrains Mono: https://www.jetbrains.com/lp/mono/
- Fontsource (self-hosted packages): https://fontsource.org/fonts/inter · https://fontsource.org/fonts/jetbrains-mono
- Geist (alternative considered): https://vercel.com/font
- Lucide: https://lucide.dev · lucide-react 1.0.1 release notes: https://newreleases.io/project/npm/lucide-react/release/1.0.1
- Phosphor (alternative considered): https://phosphoricons.com

**Tailwind, PWA, platform**
- Tailwind CSS compatibility (Safari 16.4 / Chrome 111 / Firefox 128): https://tailwindcss.com/docs/compatibility · Theme variables: https://tailwindcss.com/docs/theme
- Tailwind CSS release notes (v4.2–v4.3): https://releasebot.io/updates/tailwind · npm: https://www.npmjs.com/package/tailwindcss
- vite-plugin-pwa: https://vite-pwa-org.netlify.app/ · https://www.npmjs.com/package/vite-plugin-pwa
- W3C Vibration API implementation report: https://w3c.github.io/vibration/reports/implementation.html
- Ben Frain, "iOS 26 Safari theme-color tab tinting with fixed position elements": https://benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements/
- WebKit bug 305546 (status-bar tint from fixed elements): https://bugs.webkit.org/show_bug.cgi?id=305546 · Apple Developer Forums thread 801239: https://developer.apple.com/forums/thread/801239
- WebKit bug 236445 (`viewport-fit=cover` in standalone): https://bugs.webkit.org/show_bug.cgi?id=236445
- "Make Your PWAs Look Handsome on iOS": https://itnext.io/make-your-pwas-look-handsome-on-ios-fd8fdfcd5777

**Motion**
- Material Design 3, Easing and duration tokens: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- web.dev, "prefers-reduced-motion: Sometimes less movement is more": https://web.dev/articles/prefers-reduced-motion

**Habit loops and ethics**
- Victor Ayomipo, "Designing A Streak System: The UX And Psychology Of Streaks", Smashing Magazine, Feb 2026: https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/
- UX Magazine, "Gamification or Manipulation? Understanding the Ethics of Engagement Loops": https://uxmag.com/articles/gamification-or-manipulation-understanding-the-ethics-of-engagement-loops
- Mind the Product, "Designing streaks for long-term user growth": https://www.mindtheproduct.com/designing-streaks-for-long-term-user-growth/

*Research notes:* several primary pages (w3.org, tailwindcss.com, jsdelivr) couldn't be fetched from the research environment, so their content was checked through search results and secondary summaries. Package versions and font data were checked directly against the npm registry and the font files. Hoober's 2013 grip figures (49 % one-handed, 67 % of those right thumb) are older than today's larger phones; treat them as a baseline, which is why this system uses full-width, center-weighted controls rather than optimising for one hand.
