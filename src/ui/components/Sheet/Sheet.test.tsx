import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmSheet } from "@/ui/components/ConfirmSheet";
import { Sheet } from "./Sheet";

function Demo({ onEscape, onScrimClick }: { onEscape?: () => void; onScrimClick?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Sheet
        open={open}
        labelledBy="h"
        onEscape={onEscape ? () => (onEscape(), setOpen(false)) : undefined}
        onScrimClick={onScrimClick ? () => (onScrimClick(), setOpen(false)) : undefined}
        footer={<button onClick={() => setOpen(false)}>Close</button>}
      >
        <h2 id="h">Heading</h2>
        <button>Inner</button>
      </Sheet>
    </>
  );
}

afterEach(() => vi.useRealTimers());

describe("Sheet", () => {
  it("is a modal dialog; focus moves to the heading, background goes inert, focus returns on close", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);
    const opener = screen.getByRole("button", { name: "Open" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Heading" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Heading" })).toHaveFocus();
    expect(container).toHaveAttribute("inert");
    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(container).not.toHaveAttribute("inert");
    expect(opener).toHaveFocus();
  });

  it("traps Tab and Shift+Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const inner = screen.getByRole("button", { name: "Inner" });
    const close = screen.getByRole("button", { name: "Close" });
    await user.tab();
    expect(inner).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab();
    expect(inner).toHaveFocus();
    await user.tab({ shift: true });
    expect(close).toHaveFocus();
  });

  it("Esc and scrim taps are ignored unless configured", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    await user.click(document.querySelector("[data-scrim]") as HTMLElement);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onEscape and onScrimClick when configured", async () => {
    const user = userEvent.setup();
    const esc = vi.fn();
    const scrim = vi.fn();
    render(<Demo onEscape={esc} onScrimClick={scrim} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    expect(esc).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(document.querySelector("[data-scrim]") as HTMLElement);
    expect(scrim).toHaveBeenCalledTimes(1);
  });

  it("keeps the sheet mounted for the exit animation, then removes it", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Sheet open labelledBy="h">
        <h2 id="h">Heading</h2>
      </Sheet>,
    );
    rerender(
      <Sheet open={false} labelledBy="h">
        <h2 id="h">Other</h2>
      </Sheet>,
    );
    const root = document.querySelector("[data-sheet]");
    expect(root).toHaveAttribute("data-state", "closing");
    expect(root).toHaveTextContent("Heading"); // last open content stays while it leaves
    act(() => {
      vi.advanceTimersByTime(230);
    });
    expect(document.querySelector("[data-sheet]")).toBeNull();
  });

  it("removes the sheet at once under reduced motion (data-motion=reduce)", () => {
    document.documentElement.dataset.motion = "reduce";
    const { rerender } = render(
      <Sheet open labelledBy="h">
        <h2 id="h">Heading</h2>
      </Sheet>,
    );
    rerender(
      <Sheet open={false} labelledBy="h">
        <h2 id="h">Heading</h2>
      </Sheet>,
    );
    expect(document.querySelector("[data-sheet]")).toBeNull();
    delete document.documentElement.dataset.motion;
  });

  it("uses fade for enter plus the slide only under motion-ok", () => {
    render(
      <Sheet open labelledBy="h">
        <h2 id="h">Heading</h2>
      </Sheet>,
    );
    const cls = screen.getByRole("dialog").className;
    expect(cls).toContain("animate-fade-in");
    expect(cls).toContain("motion-ok:animate-sheet-in");
  });
});

describe("ConfirmSheet", () => {
  function Confirm({ destructive = false }: { destructive?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Invoke</button>
        <ConfirmSheet
          open={open}
          destructive={destructive}
          title="End this session?"
          body="Your 4 answers are saved. Finish a session to count today's streak."
          confirmLabel="End session"
          cancelLabel="Keep going"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  }

  it("puts the safe action bottom-most and focuses it first; Esc and scrim cancel", async () => {
    const user = userEvent.setup();
    render(<Confirm />);
    const invoker = screen.getByRole("button", { name: "Invoke" });
    await user.click(invoker);
    const dialog = screen.getByRole("dialog", { name: "End this session?" });
    const buttons = within(dialog).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["End session", "Keep going"]);
    expect(buttons[1]).toHaveFocus();
    expect(buttons[0]).toHaveAttribute("data-variant", "primary");
    expect(buttons[1]).toHaveAttribute("data-variant", "secondary");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(invoker).toHaveFocus();

    await user.click(invoker);
    await user.click(document.querySelector("[data-scrim]") as HTMLElement);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("destructive makes an alertdialog with a destructive confirm button", async () => {
    const user = userEvent.setup();
    render(<Confirm destructive />);
    await user.click(screen.getByRole("button", { name: "Invoke" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "End session" })).toHaveAttribute("data-variant", "destructive");
  });
});
