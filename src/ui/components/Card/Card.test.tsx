import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card, InteractiveCard } from "./Card";

describe("Card", () => {
  it("renders the default variant with its data attributes", () => {
    render(<Card data-testid="c">Body</Card>);
    expect(screen.getByTestId("c")).toHaveAttribute("data-variant", "default");
    expect(screen.getByTestId("c")).toHaveAttribute("data-state", "default");
  });

  it("tinted carries the tone; inset has no border", () => {
    const { rerender } = render(
      <Card data-testid="c" variant="tinted" tone="warning">
        x
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("data-tone", "warning");
    expect(screen.getByTestId("c").className).toContain("bg-warning-subtle");
    rerender(
      <Card data-testid="c" variant="inset">
        x
      </Card>,
    );
    expect(screen.getByTestId("c").className).not.toContain("border");
  });

  it("interactive is a single button with one accessible name", () => {
    const onClick = vi.fn();
    render(<InteractiveCard onClick={onClick}>Resume session</InteractiveCard>);
    const card = screen.getByRole("button", { name: "Resume session" });
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalled();
    expect(card).toHaveAttribute("data-variant", "interactive");
  });
});
