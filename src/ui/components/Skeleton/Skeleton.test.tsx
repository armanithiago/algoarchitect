import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive tech and shimmers when visible", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveAttribute("data-state", "loading");
    expect(el.className).toContain("motion-ok:animate-shimmer");
    expect(el.className).toContain("h-4");
  });

  it("keeps its box but paints nothing during the grace period", () => {
    const { container } = render(<Skeleton visible={false} className="h-4 w-20" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("data-state", "pending");
    expect(el.className).toContain("bg-transparent");
    expect(el.className).not.toContain("animate-shimmer");
  });
});
