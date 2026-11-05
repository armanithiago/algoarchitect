# src/content: scenarios

- `scenarios.v1.json` is validated by `npm test` (`content.test.ts`, which reuses `src/domain/content/validate.ts`). Run it after every edit. Read its failure message: it names the scenario and the rule.
- Rules the validator enforces: option label ≤ 28 characters; prompt ≤ 280; 3-4 options, exactly one correct; Big-O choices in ascending growth order with the answer among them; trace visuals pre-laid-out in 320×240, nodes ≥ 52 units apart and ≥ 26 from the edge; every `traceOrder` answer must equal the real algorithm's output (`runAlgorithm.ts`); the question states the tie-break.
- Rules it cannot enforce, so you must: real-world framing (not puzzles); distractors that are tempting and whose `rationale` teaches; facts double-checked (complexities, worst vs average, preconditions); one best answer; no duplicate concept in the same domain.
- Binary-search questions state `lo = 0, hi = last index`.
- A new `concept` slug needs a display name in `src/ui/lib/concept.ts` (`CONCEPT_NAMES`); a test fails without it.
- `study.sectionId` must be a real section number in the `patterns-handbook` repo (for example `29.2`).
- Parallel authors write `src/content/drafts/<name>.json` (gate: `drafts.test.ts`), then the orchestrator merges. Never hardcode scenario counts or ids in tests: pick fixtures by id.
