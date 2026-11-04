import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StreakCounter } from "./StreakCounter";
import { StreakFlame } from "./StreakFlame";

describe("StreakCounter", () => {
  it("has one accessible name covering count, today and freezes", () => {
    render(<StreakCounter count={12} doneToday freezes={1} />);
    expect(
      screen.getByRole("img", { name: "12-day streak, today complete, 1 freeze available" }),
    ).toBeInTheDocument();
  });

  it("pending when the streak is alive but not counted today", () => {
    render(<StreakCounter count={12} doneToday={false} freezes={0} />);
    const counter = screen.getByRole("img", { name: "12-day streak, not yet today, 0 freezes available" });
    expect(counter).toHaveAttribute("data-state", "pending");
  });

  it("first run: flame style none, shows 0", () => {
    render(<StreakCounter count={0} doneToday={false} freezes={0} />);
    const counter = screen.getByRole("img", { name: "No active streak, 0 freezes available" });
    expect(counter).toHaveAttribute("data-state", "none");
    expect(counter).toHaveTextContent("0");
  });

  it("hides the freeze count when not provided", () => {
    render(<StreakCounter count={3} doneToday />);
    expect(screen.getByRole("img", { name: "3-day streak, today complete" })).toBeInTheDocument();
  });
});

describe("StreakFlame", () => {
  it("done is filled, pending and none are outlines", () => {
    const { container, rerender } = render(<StreakFlame state="done" />);
    expect(container.querySelector("svg")).toHaveAttribute("fill", "currentColor");
    rerender(<StreakFlame state="pending" />);
    expect(container.querySelector("svg")).toHaveAttribute("fill", "none");
    rerender(<StreakFlame state="none" />);
    expect(container.querySelector("svg")).toHaveAttribute("fill", "none");
    expect(container.firstElementChild?.className).toContain("text-fg-muted");
  });

  it("frozen adds a snowflake badge and is decorative", () => {
    const { container } = render(<StreakFlame state="pending" frozen />);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
