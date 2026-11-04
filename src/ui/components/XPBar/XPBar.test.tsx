import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LevelBadge } from "./LevelBadge";
import { XPBar } from "./XPBar";

const props = { level: 3, xp: 420, xpIntoLevel: 120, levelSpan: 300, nextLevelAt: 600 };

describe("XPBar", () => {
  it("exposes a progressbar with value, max and text", () => {
    render(<XPBar {...props} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "120");
    expect(bar).toHaveAttribute("aria-valuemax", "300");
    expect(bar).toHaveAttribute("aria-valuetext", "420 of 600 XP, 180 to level 4");
  });

  it("shows the md labels from the design system", () => {
    render(<XPBar {...props} />);
    expect(screen.getByText("Level 3")).toBeInTheDocument();
    expect(screen.getByText("420/600 XP")).toBeInTheDocument();
    expect(screen.getByText("180 XP to Level 4")).toBeInTheDocument();
  });

  it("fills proportionally and clamps", () => {
    const { rerender } = render(<XPBar {...props} />);
    const fill = () => screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill().style.width).toBe("40%");
    rerender(<XPBar {...props} xpIntoLevel={999} />);
    expect(fill().style.width).toBe("100%");
  });

  it("sm is a thin bar without labels", () => {
    render(<XPBar {...props} size="sm" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-size", "sm");
    expect(screen.queryByText("Level 3")).toBeNull();
  });

  it("first run reads 0 of 100", () => {
    render(<XPBar level={1} xp={0} xpIntoLevel={0} levelSpan={100} nextLevelAt={100} />);
    expect(screen.getByText("0/100 XP")).toBeInTheDocument();
    expect(screen.getByText("100 XP to Level 2")).toBeInTheDocument();
  });
});

describe("LevelBadge", () => {
  it("is named 'Level 3' and shows L3", () => {
    render(<LevelBadge level={3} />);
    expect(screen.getByRole("img", { name: "Level 3" })).toHaveTextContent("L3");
  });
});
