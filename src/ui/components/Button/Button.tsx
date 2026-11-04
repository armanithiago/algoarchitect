import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cx } from "@/ui/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "lg" | "md" | "sm" | "icon";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stays focusable (`aria-disabled`); activation is ignored. Pair with `aria-describedby` to say why. */
  disabled?: boolean;
  /** Label is kept for width but hidden; still focusable, activation ignored. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  type?: "button" | "submit";
}

const base =
  "relative inline-flex select-none items-center justify-center rounded-md " +
  "transition-[background-color,color,transform] duration-(--duration-instant) ease-standard";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent active:bg-accent-pressed can-hover:hover:bg-accent-pressed",
  secondary:
    "bg-surface-raised text-fg border border-line active:bg-surface-pressed can-hover:hover:bg-surface-hover",
  ghost: "bg-transparent text-accent-fg active:bg-accent-subtle can-hover:hover:bg-accent-subtle",
  destructive: "bg-error text-on-error active:bg-error-pressed can-hover:hover:bg-error-pressed",
};

/** Disabled looks (design system §7.1). Hover and pressed must not change them. */
const disabledVariants: Record<ButtonVariant, string> = {
  primary: "bg-surface-hover text-fg-disabled cursor-default",
  secondary: "bg-surface text-fg-disabled border border-line cursor-default",
  ghost: "bg-transparent text-fg-disabled cursor-default",
  destructive: "bg-surface-hover text-fg-disabled cursor-default",
};

const sizes: Record<ButtonSize, string> = {
  lg: "h-14 w-full px-5 text-title-3",
  md: "h-12 px-4 text-body font-semibold",
  sm: "h-10 px-3 text-body-sm font-semibold hit-target",
  icon: "size-12 p-0 text-fg-secondary",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    leadingIcon,
    trailingIcon,
    className,
    children,
    onClick,
    type = "button",
    ...rest
  },
  ref,
) {
  const inert = disabled || loading;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (inert) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      onClick={handleClick}
      aria-disabled={inert ? true : undefined}
      aria-busy={loading ? true : undefined}
      data-state={loading ? "loading" : disabled ? "disabled" : "default"}
      data-disabled={disabled ? "" : undefined}
      data-variant={variant}
      data-size={size}
      className={cx(
        base,
        sizes[size],
        disabled
          ? cx(
              disabledVariants[variant],
              variant === "primary" && size === "lg" && "border border-dashed border-line",
            )
          : cx(variants[variant], "motion-ok:active:scale-[0.98]"),
        className,
      )}
    >
      <span className={cx("inline-flex items-center justify-center gap-2", loading && "invisible")}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          size={20}
          className="absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 motion-ok:animate-spin"
        />
      ) : null}
    </button>
  );
});
