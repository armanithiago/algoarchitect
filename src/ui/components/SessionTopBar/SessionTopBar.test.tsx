import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SessionProgress } from "./SessionProgress";
import { SessionTopBar } from "./SessionTopBar";

describe("SessionProgress", () => {
  it("has progressbar semantics and marks done / current / upcoming segments", () => {
    const { container } = render(<SessionProgress current={4} total={10} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "10");
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuetext", "Scenario 4 of 10");
    const segs = Array.from(container.querySelectorAll("[data-segment]")).map((s) => s.getAttribute("data-segment"));
    expect(segs).toEqual([...Array(3).fill("done"), "current", ...Array(6).fill("upcoming")]);
  });

  it("clamps out-of-range values", () => {
    render(<SessionProgress current={0} total={3} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  });
});

describe("SessionTopBar", () => {
  it("shows the counter and an End session icon button", async () => {
    const onClose = vi.fn();
    render(<SessionTopBar current={4} total={10} onClose={onClose} />);
    expect(screen.getByText("4 / 10")).toBeInTheDocument();
    const x = screen.getByRole("button", { name: "End session" });
    expect(x).toHaveAttribute("data-size", "icon");
    await userEvent.click(x);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the Offline indicator only when offline", () => {
    const { rerender } = render(<SessionTopBar current={1} total={10} onClose={() => {}} />);
    expect(screen.queryByRole("img", { name: "Offline" })).toBeNull();
    rerender(<SessionTopBar current={1} total={10} onClose={() => {}} offline />);
    expect(screen.getByRole("img", { name: "Offline" })).toBeInTheDocument();
  });
});
