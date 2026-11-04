import { levelOf } from "@/domain/xp/levels";
import { useSkeleton } from "@/hooks/useSkeleton";
import { useProfileStore } from "@/stores/profile";
import { Skeleton } from "@/ui/components/Skeleton";
import { StreakCounter } from "@/ui/components/Streak";
import { LevelBadge } from "@/ui/components/XPBar";

/** Content of the Home TopBar: StreakCounter at the left, LevelBadge at the right, no title. */
export function HomeHeader() {
  const hydrated = useProfileStore((s) => s.hydrated);
  const xp = useProfileStore((s) => s.xp);
  const streakCount = useProfileStore((s) => s.streakCount);
  const streakDoneToday = useProfileStore((s) => s.streakDoneToday);
  const freezesAvailable = useProfileStore((s) => s.freezesAvailable);
  const { showSkeleton, painted } = useSkeleton(!hydrated);

  if (showSkeleton) {
    return (
      <>
        <Skeleton visible={painted} className="h-6 w-16" />
        <Skeleton visible={painted} className="size-8 rounded-sm" />
      </>
    );
  }

  return (
    <>
      <StreakCounter count={streakCount} doneToday={streakDoneToday} freezes={freezesAvailable} />
      <LevelBadge level={levelOf(xp)} />
    </>
  );
}
