import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfflineBanner } from "./OfflineBanner";

afterEach(() => vi.useRealTimers());

describe("OfflineBanner", () => {
  it("keeps an empty polite status region mounted while hidden", () => {
    render(<OfflineBanner mode="hidden" />);
    const region = screen.getByRole("status");
    expect(region.textContent).toBe("");
    expect(region).toHaveAttribute("data-state", "hidden");
    expect(screen.queryByText(/Offline\./)).toBeNull();
  });

  it("offline: neutral copy from the design system and a labelled dismiss button", () => {
    const onDismiss = vi.fn();
    render(<OfflineBanner mode="offline" onDismiss={onDismiss} />);
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("Offline. Everything works; progress is saved on this device.");
    // Never warning colors.
    expect(region.innerHTML).not.toMatch(/warning|error/);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismiss target is a 48 px hit area (hit-target utility on a 36 px visual)", () => {
    render(<OfflineBanner mode="offline" />);
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button.className).toContain("hit-target");
    expect(button.className).toContain("size-9");
  });

  it("back: says 'Back online.' without a dismiss button", () => {
    render(<OfflineBanner mode="back" />);
    expect(screen.getByRole("status")).toHaveTextContent("Back online.");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("collapses and unmounts its content after the transition", () => {
    vi.useFakeTimers();
    const { rerender } = render(<OfflineBanner mode="back" />);
    rerender(<OfflineBanner mode="hidden" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-state", "hidden");
    expect(screen.getByRole("status")).toHaveTextContent("Back online.");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole("status")).not.toHaveTextContent("Back online.");
  });
});
