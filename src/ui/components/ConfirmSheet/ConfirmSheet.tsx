import { useId } from "react";
import { Button } from "@/ui/components/Button";
import { Sheet } from "@/ui/components/Sheet";

export interface ConfirmSheetProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  /** The safe action. Bottom-most and initially focused (design system §7.16). */
  cancelLabel: string;
  /** `destructive` makes the confirm button destructive and the sheet an `alertdialog`. */
  destructive?: boolean;
  onConfirm: () => void;
  /** Cancel button, Esc and a scrim tap all mean this. */
  onCancel: () => void;
}

/**
 * Confirmation bottom sheet (centered dialog from `md`). Actions are stacked full width and the SAFE action is
 * bottom-most, where the thumb lands by habit; the confirming action sits directly above it.
 */
export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const bodyId = `${uid}-body`;
  return (
    <Sheet
      open={open}
      role={destructive ? "alertdialog" : "dialog"}
      labelledBy={titleId}
      describedBy={bodyId}
      onEscape={onCancel}
      onScrimClick={onCancel}
      footer={
        <div className="flex flex-col gap-2 pt-2">
          <Button size="lg" variant={destructive ? "destructive" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button size="lg" variant="secondary" data-autofocus="" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      }
    >
      <div data-state="default" className="flex flex-col gap-2 px-4 pb-2 pt-6 sm:px-6">
        <h2 id={titleId} className="text-title-2 text-fg">
          {title}
        </h2>
        <p id={bodyId} className="text-body text-fg-secondary">
          {body}
        </p>
      </div>
    </Sheet>
  );
}
