import { create } from "zustand";

export type ToastVariant = "info" | "success" | "error" | "update";

export interface ToastItem {
  /** Stable id: showing a toast with an id that is already current or queued replaces it (no duplicates). */
  id: string;
  variant: ToastVariant;
  message: string;
  /** Action button label (update variant defaults to "Refresh" in the component). */
  actionLabel?: string;
  onAction?: () => void;
  /** Called when the toast is dismissed by the user or by timeout (not when its action runs). */
  onDismiss?: () => void;
}

/** Design system §7.15: update and info toasts are queued during a session and shown on Summary or Home. */
export function isDeferrable(variant: ToastVariant): boolean {
  return variant === "update" || variant === "info";
}

interface ToastState {
  current: ToastItem | null;
  queue: ToastItem[];
  /** True during an active session. While true, update and info toasts wait in the queue. */
  suspended: boolean;
  show: (toast: ToastItem) => void;
  /** Dismiss the current toast (or the one with this id, wherever it is) and promote the next eligible one. */
  dismiss: (id?: string) => void;
  setSuspended: (suspended: boolean) => void;
  reset: () => void;
}

const canShow = (t: ToastItem, suspended: boolean) => !(suspended && isDeferrable(t.variant));

/** Take the first queued toast that may be shown now. */
function promote(queue: ToastItem[], suspended: boolean): { current: ToastItem | null; queue: ToastItem[] } {
  const i = queue.findIndex((t) => canShow(t, suspended));
  if (i === -1) return { current: null, queue };
  return { current: queue[i], queue: [...queue.slice(0, i), ...queue.slice(i + 1)] };
}

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  queue: [],
  suspended: false,
  show: (toast) =>
    set((s) => {
      const queue = s.queue.filter((t) => t.id !== toast.id);
      if (s.current?.id === toast.id) return { current: toast, queue };
      if (s.current === null && canShow(toast, s.suspended)) return { current: toast, queue };
      return { queue: [...queue, toast] };
    }),
  dismiss: (id) =>
    set((s) => {
      if (id !== undefined && s.current?.id !== id) return { queue: s.queue.filter((t) => t.id !== id) };
      return promote(s.queue, s.suspended);
    }),
  setSuspended: (suspended) =>
    set((s) => {
      if (suspended) {
        // Never leave a deferrable toast on screen once a session starts: push it back to the queue front.
        if (s.current && isDeferrable(s.current.variant)) return { suspended, current: null, queue: [s.current, ...s.queue] };
        return { suspended };
      }
      if (s.current) return { suspended };
      return { suspended, ...promote(s.queue, suspended) };
    }),
  reset: () => set({ current: null, queue: [], suspended: false }),
}));
