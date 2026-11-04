import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type Ref } from "react";
import { cx } from "@/ui/lib/cx";

export type CardVariant = "default" | "tinted" | "inset";
export type CardTone = "freeze" | "warning" | "info";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  /** Only for `tinted`. Notices never use the error tone. */
  tone?: CardTone;
  as?: "div" | "section" | "article" | "aside";
}

const common = "flex flex-col gap-3 rounded-lg p-4";

const variants: Record<CardVariant, string> = {
  default: "bg-surface border border-line-subtle shadow-1",
  tinted: "",
  inset: "bg-surface-hover",
};

/** `freeze-line` token is missing from the token set (reported), so freeze uses line-subtle. Static class map: Tailwind can't detect names built from the tone at run time. */
const tones: Record<CardTone, string> = {
  freeze: "bg-freeze-subtle border border-line-subtle",
  warning: "bg-warning-subtle border border-warning-line",
  info: "bg-info-subtle border border-info-line",
};

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = "default", tone = "info", as = "div", className, ...rest },
  ref,
) {
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
      data-state="default"
      data-variant={variant}
      data-tone={variant === "tinted" ? tone : undefined}
      className={cx(common, variant === "tinted" ? tones[tone] : variants[variant], className)}
      {...rest}
    />
  );
});

/** Whole card is one button with one accessible name. Don't nest controls inside it. */
export const InteractiveCard = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function InteractiveCard({ className, type = "button", ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        data-state="default"
        data-variant="interactive"
        className={cx(
          common,
          "w-full bg-surface border border-line-subtle shadow-1 text-left",
          "transition-[background-color,transform] duration-(--duration-instant) ease-standard",
          "active:bg-surface-pressed can-hover:hover:bg-surface-hover motion-ok:active:scale-[0.98]",
          className,
        )}
        {...rest}
      />
    );
  },
);
