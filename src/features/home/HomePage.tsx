import { Play, TriangleAlert } from "lucide-react";
import { levelProgress } from "@/domain/xp/levels";
import { useSkeleton } from "@/hooks/useSkeleton";
import { useProfileStore } from "@/stores/profile";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Skeleton } from "@/ui/components/Skeleton";
import { XPBar } from "@/ui/components/XPBar";

const STORAGE_BLOCKED_COPY =
  "This browser mode can't save progress. You can play; nothing is kept after you close the app.";

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/**
 * TODO(Sprint 2): start a session (E3 session flow). Sessions don't exist yet, so this
 * intentionally does nothing. Do not invent a flow here.
 */
function handleStartSession(): void {
  // intentionally empty until Sprint 2
}

export function HomePage() {
  const hydrated = useProfileStore((s) => s.hydrated);
  const storageBlocked = useProfileStore((s) => s.storageBlocked);
  const xp = useProfileStore((s) => s.xp);
  const streakCount = useProfileStore((s) => s.streakCount);
  const { showSkeleton, painted } = useSkeleton(!hydrated);

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
            <p className="text-title-3 text-fg">Your first session · 10 new scenarios · ~5 min</p>
          ) : (
            // TODO(E4-07): "N reviews due · M new" and the domain mix (DomainBadge dot) come from the SRS queue.
            <>
              <p className="text-caption text-fg-muted">Daily session</p>
              <p className="text-title-3 text-fg">~5 min</p>
            </>
          )}
        </Card>
      </div>

      {/* Pinned in the thumb zone, directly above the tab bar. Renders at once so nothing jumps. */}
      <div className="sticky bottom-0 mt-auto bg-canvas py-2">
        <Button
          size="lg"
          disabled={!hydrated}
          aria-describedby={hydrated ? undefined : "start-hint"}
          leadingIcon={<Play size={20} aria-hidden="true" />}
          onClick={handleStartSession}
        >
          Start session
        </Button>
        {hydrated ? null : (
          <span id="start-hint" className="sr-only">
            Loading your progress
          </span>
        )}
      </div>
    </div>
  );
}
