import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CoachMark } from "@/ui/components/CoachMark";
import { ProgressRing } from "@/ui/components/ProgressRing";
import { VerdictStrip } from "./VerdictStrip";

describe("VerdictStrip", () => {
  it("correct: status role, Correct, XP chip and detail", () => {
    render(<VerdictStrip correct xp={10} detail="Consistent hashing is the fit." />);
    const s = screen.getByRole("status");
    expect(s).toHaveAttribute("data-state", "correct");
    expect(s).toHaveTextContent("Correct");
    expect(s).toHaveTextContent("+10 XP");
    expect(s).toHaveTextContent("Consistent hashing is the fit.");
    expect(s.querySelector("svg")).not.toBeNull();
  });

  it("incorrect: Not quite, no XP chip", () => {
    render(<VerdictStrip correct={false} xp={0} detail="Best fit: Consistent hashing." />);
    const s = screen.getByRole("status");
    expect(s).toHaveAttribute("data-state", "incorrect");
    expect(s).toHaveTextContent("Not quite");
    expect(s).not.toHaveTextContent("XP");
  });

  it("silent keeps the role but turns off the live announcement", () => {
    render(<VerdictStrip silent correct detail="x" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "off");
  });
});

describe("CoachMark", () => {
  it("is a polite status with a Got it action", async () => {
    const onDismiss = vi.fn();
    render(<CoachMark onDismiss={onDismiss}>Tap the approach that fits best, then Check.</CoachMark>);
    expect(screen.getByRole("status")).toHaveTextContent("Tap the approach that fits best, then Check.");
    await userEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe("ProgressRing", () => {
  it("hides the SVG and speaks the value", () => {
    const { container } = render(
      <ProgressRing value={8} max={10} centerLabel="8/10" caption="correct" label="8 of 10 correct" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("8 of 10 correct")).toHaveClass("sr-only");
    expect(screen.getByText("8/10")).toHaveClass("tabular-nums");
  });

  it("uses the final offset at once under reduced motion", () => {
    document.documentElement.dataset.motion = "reduce";
    const { container } = render(<ProgressRing value={5} max={10} size={64} centerLabel="5/10" label="5 of 10 correct" />);
    const fill = container.querySelectorAll("circle")[1]!;
    const c = 2 * Math.PI * 28;
    expect(Number(fill.getAttribute("stroke-dashoffset"))).toBeCloseTo(c / 2, 3);
    delete document.documentElement.dataset.motion;
  });
});
