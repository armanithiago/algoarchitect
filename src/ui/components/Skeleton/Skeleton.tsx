import type { HTMLAttributes } from "react";
import { cx } from "@/ui/lib/cx";

/**
 * Shimmering placeholder block. Only for IndexedDB hydration (design system §7.20).
 * Give it the real element's size and radius via `className` so nothing shifts when data arrives.
 * `visible={false}` keeps the box (and so the layout) but paints nothing: used for the 150 ms grace period.
 */
export function Skeleton({
  visible = true,
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { visible?: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-state={visible ? "loading" : "pending"}
      className={cx(
        "block rounded-xs",
        visible
          ? "bg-linear-to-r from-surface-hover via-surface-pressed to-surface-hover bg-size-[200%_100%] motion-ok:animate-shimmer"
          : "bg-transparent",
        className,
      )}
      {...rest}
    />
  );
}
