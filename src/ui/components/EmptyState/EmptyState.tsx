import { cx } from "@/ui/lib/cx";

export interface EmptyStateProps {
  title: string;
  body?: string;
  className?: string;
}

/** Text-only EmptyState (title-3 plus body-sm). The blueprint illustration and the action arrive with the screens that need them. */
export function EmptyState({ title, body, className }: EmptyStateProps) {
  return (
    <div data-state="default" className={cx("flex flex-col items-center gap-2 py-10 text-center", className)}>
      <h2 className="text-title-3 text-fg">{title}</h2>
      {body ? <p className="text-body-sm text-fg-secondary">{body}</p> : null}
    </div>
  );
}
