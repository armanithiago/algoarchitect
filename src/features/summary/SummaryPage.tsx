import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CircleCheck, CircleX, ChevronDown, ChevronUp } from "lucide-react";
import { levelProgress } from "@/domain/xp/levels";
import { useProfileStore } from "@/stores/profile";
import { useSessionStore } from "@/stores/session";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { IconProvider } from "@/ui/components/Icon";
import { ProgressRing } from "@/ui/components/ProgressRing";
import { XPBar } from "@/ui/components/XPBar";
import { conceptName, formatDuration } from "@/ui/lib/concept";
import { cx } from "@/ui/lib/cx";
import { DOMAINS } from "@/ui/lib/domain";

const VISIBLE_CONCEPTS = 5;

/**
 * Session summary (design system §8.8). Facts, no praise; one action (Done). The streak block and the "next review"
 * line arrive with Sprint 4 (streak, spaced repetition) and are deliberately absent.
 */
export function SummaryPage() {
  const navigate = useNavigate();
  const summary = useSessionStore((s) => s.summary);
  const xp = useProfileStore((s) => s.xp);
  const [expanded, setExpanded] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [summary]);

  if (!summary) return <Navigate to="/" replace />;

  const progress = levelProgress(xp);
  const rows = expanded ? summary.results : summary.results.slice(0, VISIBLE_CONCEPTS);
  const hidden = summary.results.length - VISIBLE_CONCEPTS;
  const count = `${summary.total} ${summary.total === 1 ? "scenario" : "scenarios"} · ${formatDuration(summary.durationMs)}`;

  const done = () => {
    navigate("/", { replace: true });
    useSessionStore.getState().reset();
  };

  return (
    <IconProvider>
      <div className="flex h-dvh min-h-dvh flex-col bg-canvas">
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="px-gutter mx-auto flex max-w-content flex-col gap-6 pb-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
            <div className="flex flex-col gap-1">
              <h1 ref={headingRef} tabIndex={-1} className="text-title-1 text-fg outline-none">
                Session complete
              </h1>
              <p className="text-caption tabular-nums text-fg-muted">{count}</p>
              {summary.practice ? <p className="text-caption text-fg-muted">Practice {"·"} reviews unchanged</p> : null}
            </div>

            <div className="grid grid-cols-[auto_1fr] items-stretch gap-3">
              <Card className="items-center justify-center" data-testid="ring-card">
                <ProgressRing
                  value={summary.correct}
                  max={summary.total}
                  size={96}
                  centerLabel={`${summary.correct}/${summary.total}`}
                  caption="correct"
                  label={`${summary.correct} of ${summary.total} correct`}
                />
              </Card>
              <Card className="justify-center gap-2 px-4 py-3" data-testid="xp-card">
                <span className="text-title-3 tabular-nums text-fg">+{summary.xpEarned} XP</span>
                <span className="text-caption text-fg-muted">Level {progress.level}</span>
                <XPBar
                  size="sm"
                  level={progress.level}
                  xp={xp}
                  xpIntoLevel={progress.xpIntoLevel}
                  levelSpan={progress.levelSpan}
                  nextLevelAt={progress.nextLevelAt}
                />
              </Card>
            </div>

            {summary.results.length > 0 ? (
              <section aria-labelledby="concepts-label" className="flex flex-col">
                <h2 id="concepts-label" className="pb-1 text-overline uppercase text-fg-muted">
                  Concepts
                </h2>
                <ul className="flex flex-col">
                  {rows.map((r, i) => {
                    const Icon = r.correct ? CircleCheck : CircleX;
                    return (
                      <li
                        key={`${r.scenarioId}-${i}`}
                        data-result={r.correct ? "correct" : "missed"}
                        className="flex min-h-12 items-center gap-3 py-2 text-body text-fg"
                      >
                        <Icon
                          aria-hidden="true"
                          size={20}
                          className={cx("shrink-0", r.correct ? "text-success-fg" : "text-error-fg")}
                        />
                        <span aria-hidden="true" className={cx("size-2 shrink-0 rounded-full", DOMAINS[r.domain].dot)} />
                        <span>
                          {conceptName(r.concept)}
                          <span className="sr-only">
                            , {DOMAINS[r.domain].label}, {r.correct ? "correct" : "missed"}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {hidden > 0 ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                    className="flex min-h-12 items-center justify-between gap-2 rounded-md text-body-sm text-fg-secondary"
                  >
                    {expanded ? "Show fewer" : `… ${hidden} more`}
                    {expanded ? <ChevronUp aria-hidden="true" size={20} /> : <ChevronDown aria-hidden="true" size={20} />}
                  </button>
                ) : null}
              </section>
            ) : null}
          </div>
        </main>

        <div className="px-gutter shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <div className="mx-auto max-w-content">
            <Button size="lg" onClick={done}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </IconProvider>
  );
}
