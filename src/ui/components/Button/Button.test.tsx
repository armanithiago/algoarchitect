import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a native button with type=button and calls onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Start session</Button>);
    const button = screen.getByRole("button", { name: "Start session" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-state", "default");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled uses aria-disabled, stays focusable and ignores activation", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Check
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Check" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("data-state", "disabled");
    expect(button).toHaveAttribute("data-disabled");
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading sets aria-busy, keeps the label, stays focusable and ignores activation", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("data-state", "loading");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports every variant and size through data attributes", () => {
    const { rerender } = render(<Button variant="secondary" size="sm">A</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "secondary");
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
    rerender(<Button variant="destructive" size="lg">A</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
    rerender(<Button variant="ghost" size="icon" aria-label="Close" />);
    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute("data-size", "icon");
  });

  it("lg primary sizes to 56 px and disabled gets the dashed shape cue", () => {
    render(
      <Button size="lg" disabled>
        Start session
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-14");
    expect(button.className).toContain("border-dashed");
  });
});
