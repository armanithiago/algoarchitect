import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("renders a banner landmark with the title as h1", () => {
    render(<TopBar title="Stats" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Stats" })).toBeInTheDocument();
  });

  it("home variant renders children and no heading", () => {
    render(
      <TopBar>
        <span>streak</span>
        <span>level</span>
      </TopBar>,
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("streak")).toBeInTheDocument();
  });

  it("uses the canvas background, safe-area top padding and a line only when scrolled", () => {
    const { rerender } = render(<TopBar title="Settings" />);
    const bar = screen.getByRole("banner");
    expect(bar.className).toContain("bg-canvas");
    expect(bar.className).toContain("pt-safe");
    expect(bar).toHaveAttribute("data-state", "default");
    expect(bar.className).toContain("border-transparent");
    rerender(<TopBar title="Settings" scrolled />);
    expect(bar).toHaveAttribute("data-state", "scrolled");
    expect(bar.className).toContain("border-line-subtle");
  });
});
