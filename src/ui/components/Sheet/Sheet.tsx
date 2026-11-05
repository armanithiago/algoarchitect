import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cx } from "@/ui/lib/cx";

export interface SheetProps {
  open: boolean;
  /** `alertdialog` for destructive confirmations. */
  role?: "dialog" | "alertdialog";
  /** Id of the heading element rendered inside `children`. Focus moves to it on open unless `[data-autofocus]` exists. */
  labelledBy: string;
  describedBy?: string;
  /** Esc. Omit to ignore Esc. FeedbackSheet maps it to Next scenario, ConfirmSheet to Cancel. */
  onEscape?: () => void;
  /** Scrim tap. Omit to ignore it (FeedbackSheet never closes on a scrim tap). */
  onScrimClick?: () => void;
  /** Where focus goes when the sheet closes. Defaults to the element that was focused when it opened. */
  returnFocus?: () => HTMLElement | null | undefined;
  /** Sticky footer (the sheet's action buttons). */
  footer?: ReactNode;
  /** Fades the body into the footer when the body can scroll. */
  footerFade?: boolean;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** React 18 has no `inert` prop type; the attribute passes through as a string. */
const INERT_WHEN = (on: boolean): Record<string, string | undefined> => ({ inert: on ? "" : undefined });

/** Newest last. Only the topmost sheet reacts to Esc. */
const stack: symbol[] = [];

/** Makes every other child of <body> `inert` and returns an undo that restores only what it changed. */
function inertOthers(except: HTMLElement): () => void {
  const changed: HTMLElement[] = [];
  for (const el of Array.from(document.body.children)) {
    if (!(el instanceof HTMLElement) || el === except || el.hasAttribute("inert")) continue;
    if (el.tagName === "SCRIPT") continue;
    el.setAttribute("inert", "");
    changed.push(el);
  }
  return () => changed.forEach((el) => el.removeAttribute("inert"));
}

/**
 * Modal bottom sheet (design system §7.8, §7.16): scrim, `aria-modal`, focus trap, background `inert`.
 * Below `md` it docks to the bottom edge; at `md` and up it is a centered dialog (max width 30 rem, `radius-xl`).
 * Enter: `translateY(100%) -> 0` over 320 ms; exit 220 ms. Reduced motion: opacity fade only, instant exit.
 * While exiting, the last rendered content stays on screen so the sheet does not change as the step behind it does.
 */
export function Sheet({
  open,
  role = "dialog",
  labelledBy,
  describedBy,
  onEscape,
  onScrimClick,
  returnFocus,
  footer,
  footerFade = false,
  children,
}: SheetProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<symbol>(Symbol("sheet"));
  const handlers = useRef({ onEscape, returnFocus });
  const instanceId = useId();

  // Content and footer as last rendered while open (derive-state-in-render pattern).
  const [snapshot, setSnapshot] = useState({ children, footer });
  if (open && (snapshot.children !== children || snapshot.footer !== footer)) setSnapshot({ children, footer });

  const [mounted, setMounted] = useState(open);
  const [exiting, setExiting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMounted(true);
      setExiting(false);
    } else if (reduced) {
      setMounted(false);
    } else {
      setExiting(true);
    }
  }

  useEffect(() => {
    handlers.current = { onEscape, returnFocus };
  });

  // Unmount after the exit animation (the delay equals --duration-base).
  useEffect(() => {
    if (!exiting) return;
    const t = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, 220);
    return () => window.clearTimeout(t);
  }, [exiting]);

  // Focus management, inert background, Esc. Cleanup runs when the sheet starts closing.
  useEffect(() => {
    const root = rootRef.current;
    if (!open || !mounted || !root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const restoreInert = inertOthers(root);
    const me = idRef.current;
    stack.push(me);

    const dialog = dialogRef.current;
    const target =
      dialog?.querySelector<HTMLElement>("[data-autofocus]") ?? document.getElementById(labelledBy) ?? dialog;
    if (target && target !== dialog && !target.matches(FOCUSABLE)) target.setAttribute("tabindex", "-1");
    target?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || stack[stack.length - 1] !== me) return;
      const fn = handlers.current.onEscape;
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      const i = stack.indexOf(me);
      if (i >= 0) stack.splice(i, 1);
      restoreInert();
      const back = handlers.current.returnFocus?.() ?? previous;
      if (back && back.isConnected) back.focus({ preventScroll: true });
    };
  }, [open, mounted, labelledBy]);

  const trapTab = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !dialog.contains(active) || active === dialog || active?.getAttribute("tabindex") === "-1")) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !dialog.contains(active) || active === dialog)) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={rootRef}
      data-sheet=""
      data-state={exiting ? "closing" : "open"}
      aria-hidden={exiting ? true : undefined}
      {...INERT_WHEN(exiting)}
      className={cx(
        "fixed inset-0 z-(--z-overlay) flex flex-col justify-end md:items-center md:justify-center md:p-6",
        exiting && "pointer-events-none",
      )}
    >
      <div
        aria-hidden="true"
        data-scrim=""
        onClick={onScrimClick}
        className={cx(
          "absolute inset-0 bg-(--scrim)",
          exiting ? "opacity-0 transition-opacity duration-(--duration-base)" : "animate-fade-in",
        )}
      />
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        data-sheet-id={instanceId}
        tabIndex={-1}
        onKeyDown={trapTab}
        className={cx(
          "relative mx-auto flex max-h-[85dvh] w-full max-w-content flex-col rounded-t-xl bg-surface shadow-3 outline-none md:rounded-xl",
          exiting
            ? "motion-ok:animate-sheet-out"
            : "animate-fade-in motion-ok:animate-sheet-in",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{snapshot.children}</div>
        {snapshot.footer ? (
          <div
            className={cx(
              "relative shrink-0 bg-surface px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6",
              footerFade &&
                "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-4 before:bg-linear-to-t before:from-surface before:to-transparent",
            )}
          >
            {snapshot.footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
