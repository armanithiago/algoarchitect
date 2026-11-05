import { WifiOff, X } from "lucide-react";
import { Button } from "@/ui/components/Button";
import { SessionProgress } from "./SessionProgress";

export interface SessionTopBarProps {
  current: number;
  total: number;
  /** Opens the "End this session?" ConfirmSheet. */
  onClose: () => void;
  /** Shows the `wifi-off` indicator before the counter. No banner appears mid-session. */
  offline?: boolean;
}

/** `[X]  ▰▰▰▱▱▱  4 / 10`. The [X] sits in the hard-to-reach zone on purpose and is always confirmed (design system §7.7). */
export function SessionTopBar({ current, total, onClose, offline = false }: SessionTopBarProps) {
  return (
    <header
      data-state="default"
      className="pt-safe px-gutter flex min-h-[calc(var(--size-topbar)+env(safe-area-inset-top,0px))] shrink-0 items-center short:min-h-[calc(3rem+env(safe-area-inset-top,0px))]"
    >
      <div className="mx-auto flex w-full max-w-content items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="End session" onClick={onClose} className="-ml-3 text-fg-secondary!">
          <X size={24} aria-hidden="true" />
        </Button>
        <SessionProgress current={current} total={total} />
        <span className="inline-flex items-center gap-1.5 text-caption tabular-nums text-fg-muted">
          {offline ? <WifiOff role="img" aria-label="Offline" size={16} className="text-fg-muted" /> : null}
          <span>
            {current} / {total}
          </span>
        </span>
      </div>
    </header>
  );
}
