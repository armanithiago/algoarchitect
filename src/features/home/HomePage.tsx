import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, TriangleAlert } from "lucide-react";
import { levelProgress } from "@/domain/xp/levels";
import { useSkeleton } from "@/hooks/useSkeleton";
import { useProfileStore } from "@/stores/profile";
import { useSessionStore } from "@/stores/session";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { EmptyState } from "@/ui/components/EmptyState";
import { Skeleton } from "@/ui/components/Skeleton";
import { XPBar } from "@/ui/components/XPBar";

const STORAGE_BLOCKED_COPY =
  "This browser mode can't save progress. You can play; nothing is kept after you close the app.";

/** Non-breaking spaces keep each segment whole, so the line only wraps at the dots. Reads as one sentence. */
const FIRST_SESSION_COPY = "Your\u00a0first\u00a0session\u00a0· 10\u00a0new\u00a0scenarios\u00a0· ~5\u00a0min";

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const LOAD_ERROR_COPY = "Couldn't load scenarios. Reload to try again.";

/** The session store may report a scenario-loading failure as `loadError` (set by the real store). */
const selectLoadError = (s: object): boolean => Boolean((s as { loadError?: unknown }).loadError);

export function HomePage() {
  const hydrated = useProfileStore((s) => s.hydrated);
  const storageBlocked = useProfileStore((s) => s.storageBlocked);
  const xp = useProfileStore((s) => s.xp);
  const streakCount = useProfileStore((s) => s.streakCount);
  const { showSkeleton, painted } = useSkeleton(!hydrated);
  const navigate = useNavigate();
  const storeLoadError = useSessionStore(selectLoadError);
  const [starting, setStarting] = useState(false);
  const [startFailed, setStartFailed] = useState(false);
  const loadFailed = startFailed || storeLoadError;

  async function handleStartSession(): Promise<void> {
    if (starting) return;
    // Leaving mid-session and coming back resumes it: the state lives in the store.
    const kind = useSessionStore.getState().step.kind;
    if (kind === "question" || kind === "feedback") {
      navigate("/session");
      return;
    }
    setStarting(true);
    setStartFailed(false);
    try {
      await useSessionStore.getState().start();
    } catch {
      setStartFailed(true);
    }
    setStarting(false);
    const after = useSessionStore.getState();
    if (selectLoadError(after) || after.step.kind === "idle") {
      setStartFailed(true);
      return;
    }
    navigate("/session");
  }

  const firstRun = xp === 0 && streakCount === 0;
  const progress = levelProgress(xp);

  return (
    <div className="flex flex-1 flex-col" aria-busy={!hydrated ? true : undefined}>
      <div className="flex flex-col gap-6 pb-6 pt-1">
        <div>
          <p className="text-caption text-fg-muted short:hidden">{todayLabel()}</p>
          <h1 className="text-title-1 text-fg">Today</h1>
        </div>

        {storageBlocked ? (
          <Card variant="tinted" tone="warning" data-testid="storage-blocked" className="flex-row items-start">
            <TriangleAlert size={20} className="mt-0.5 shrink-0 text-warning-fg" aria-hidden="true" />
            <p className="text-body-sm text-fg">{STORAGE_BLOCKED_COPY}</p>
          </Card>
        ) : null}

        <Card data-testid="level-card">
          {showSkeleton ? (
            <div className="flex flex-col gap-3" aria-hidden="true">
              <div className="flex items-center justify-between gap-3">
                <Skeleton visible={painted} className="h-6 w-24" />
                <Skeleton visible={painted} className="h-4 w-20" />
              </div>
              <Skeleton visible={painted} className="h-2 rounded-full" />
              <Skeleton visible={painted} className="h-4 w-28" />
            </div>
          ) : (
            <XPBar
              level={progress.level}
              xp={xp}
              xpIntoLevel={progress.xpIntoLevel}
              levelSpan={progress.levelSpan}
              nextLevelAt={progress.nextLevelAt}
            />
          )}
        </Card>

        <Card data-testid="today-card">
          {showSkeleton ? (
            <div className="flex flex-col gap-3" aria-hidden="true">
              <Skeleton visible={painted} className="h-4 w-28" />
              <Skeleton visible={painted} className="h-6 w-full" />
            </div>
          ) : firstRun ? (
            <p className="text-title-3 text-fg">{FIRST_SESSION_COPY}</p>
          ) : (
            // TODO(E4-07): "N reviews due · M new" and the domain mix (DomainBadge dot) come from the SRS queue.
            <>
              <p className="text-caption text-fg-muted">Daily session</p>
              <p className="text-title-3 text-fg">~5 min</p>
            </>
          )}
        </Card>
      </div>

      {loadFailed ? (
        <div className="sticky bottom-0 mt-auto bg-canvas py-2" data-testid="load-error">
          <EmptyState title={LOAD_ERROR_COPY} className="py-4" />
          <Button size="lg" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      ) : (
        /* Pinned in the thumb zone, directly above the tab bar. Renders at once so nothing jumps. */
        <div className="sticky bottom-0 mt-auto bg-canvas py-2">
          <Button
            size="lg"
            disabled={!hydrated}
            loading={starting}
            aria-describedby={hydrated ? undefined : "start-hint"}
            leadingIcon={<Play size={20} aria-hidden="true" />}
            onClick={() => void handleStartSession()}
          >
            Start session
          </Button>
          {hydrated ? null : (
            <span id="start-hint" className="sr-only">
              Loading your progress
            </span>
          )}
        </div>
      )}
    </div>
  );
}
