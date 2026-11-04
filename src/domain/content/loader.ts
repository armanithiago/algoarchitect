/** Lazy content loader (E3-01). The bundle is a separate chunk; invalid content fails closed. */
import { checkBundle, formatIssues, type ContentIssue } from "./validate";
import type { Scenario } from "./schema";

export class ContentLoadError extends Error {
  readonly issues: ContentIssue[];
  constructor(message: string, issues: ContentIssue[] = []) {
    super(message);
    this.name = "ContentLoadError";
    this.issues = issues;
  }
}

let cache: Promise<Scenario[]> | null = null;

async function load(): Promise<Scenario[]> {
  let raw: unknown;
  try {
    const mod = await import("@/content/scenarios.v1.json");
    raw = (mod as { default?: unknown }).default ?? mod;
  } catch (e) {
    throw new ContentLoadError(`Could not load the scenario bundle: ${e instanceof Error ? e.message : String(e)}`);
  }
  const { issues, scenarios } = checkBundle(raw);
  if (issues.length > 0) {
    throw new ContentLoadError(`Scenario bundle is invalid:\n${formatIssues(issues)}`, issues);
  }
  return scenarios;
}

/** Validated scenarios, cached after the first success. Failures are not cached (a retry may succeed). */
export function loadScenarios(): Promise<Scenario[]> {
  if (!cache) {
    const p = load();
    cache = p;
    p.catch(() => {
      if (cache === p) cache = null;
    });
  }
  return cache;
}

export function resetContentCacheForTests(): void {
  cache = null;
}
