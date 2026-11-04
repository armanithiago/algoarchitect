import { useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, RefreshCw, X, type LucideIcon } from "lucide-react";
import type { ToastVariant } from "./useToastStore";

const VARIANTS: Record<ToastVariant, { icon: LucideIcon; iconClass: string; durationMs: number | null; role: "status" | "alert" }> = {
  info: { icon: Info, iconClass: "text-accent-fg", durationMs: 4000, role: "status" },
  success: { icon: CircleCheck, iconClass: "text-success-fg", durationMs: 4000, role: "status" },
  error: { icon: CircleAlert, iconClass: "text-error-fg", durationMs: 6000, role: "alert" },
  update: { icon: RefreshCw, iconClass: "text-accent-fg", durationMs: null, role: "status" },
};

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  /** Action label. The update variant defaults to "Refresh". */
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}

/**
 * Design system §7.15. Presentational plus its own auto-dismiss timer.
 * A toast with an action never auto-dismisses; the timer pauses while hovered or focused.
 */
export function Toast({ variant, message, actionLabel, onAction, onDismiss }: ToastProps) {
  const { icon: Icon, iconClass, durationMs, role } = VARIANTS[variant];
  const label = actionLabel ?? (variant === "update" ? "Refresh" : undefined);
  const autoDismiss = label ? null : durationMs;
  const [paused, setPaused] = useState(false);
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (autoDismiss === null || paused) return;
    const t = setTimeout(() => dismissRef.current(), autoDismiss);
    return () => clearTimeout(t);
  }, [autoDismiss, paused]);

  return (
    <div
      role={role}
      data-variant={variant}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="motion-ok:animate-rise-in pointer-events-auto flex min-h-14 w-full items-center gap-2 rounded-lg border border-line bg-surface-raised py-3 pl-4 pr-1 shadow-2"
    >
      <Icon aria-hidden="true" size={20} className={`shrink-0 ${iconClass}`} />
      <p className="min-w-0 flex-1 text-body-sm font-medium text-fg line-clamp-2">{message}</p>
      {label && (
        <button
          type="button"
          onClick={onAction}
          className="relative inline-flex h-10 shrink-0 items-center rounded-md px-3 text-body-sm font-semibold text-accent-fg after:absolute after:-inset-1 hover:bg-surface-hover active:bg-surface-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover active:bg-surface-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <X aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
