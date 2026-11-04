import { Toast } from "./Toast";
import { useToastStore } from "./useToastStore";

/**
 * Renders the single current toast, column-width, 8 px above the BottomTabBar area.
 * The tab bar (or any layout) can set `--toast-offset-bottom` on :root; it falls back to 0 before the tab bar exists.
 */
export function ToastHost() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);
  if (!current) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-(--z-toast) flex justify-center px-4 sm:px-6"
      style={{ bottom: "calc(var(--toast-offset-bottom, 0px) + env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
    >
      <div className="w-full max-w-content">
        <Toast
          key={current.id}
          variant={current.variant}
          message={current.message}
          actionLabel={current.actionLabel}
          onAction={() => {
            current.onAction?.();
            dismiss(current.id);
          }}
          onDismiss={() => {
            current.onDismiss?.();
            dismiss(current.id);
          }}
        />
      </div>
    </div>
  );
}
