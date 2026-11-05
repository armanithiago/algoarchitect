import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FeedbackSheet, type FeedbackSheetProps } from "./FeedbackSheet";

const base: FeedbackSheetProps = {
  open: true,
  correct: true,
  xp: 10,
  answerLabel: "Consistent hashing",
  explanation: "Adding or removing a node remaps only about 1/n of the keys.",
  complexity: { time: "O(log n)", space: "O(n)" },
  others: [
    { id: "a", keyLabel: "A", label: "Modulo hashing", rationale: "Changing n remaps almost every key.", isPick: false },
    { id: "d", keyLabel: "D", label: "Min-heap by node load", rationale: "Balances load, not placement.", isPick: false },
  ],
  last: false,
  onNext: () => {},
};

describe("FeedbackSheet", () => {
  it("correct header: icon, heading, XP chip; the heading is the dialog's name and takes focus", () => {
    render(<FeedbackSheet {...base} />);
    const dialog = screen.getByRole("dialog", { name: "Correct" });
    expect(within(dialog).getByText("+10 XP")).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "Correct" })).toHaveFocus();
    expect(within(dialog).getByRole("heading", { name: "Why Consistent hashing wins" })).toBeInTheDocument();
  });

  it("renders Time and Space with real notation and spoken names", () => {
    render(<FeedbackSheet {...base} complexity={{ time: "O((V + E) log V)", space: "O(n^2)" }} />);
    expect(screen.getByText("O of V plus E, log V")).toBeInTheDocument();
    expect(screen.getByText("O of n squared")).toBeInTheDocument();
    expect(document.querySelector("sup")).toHaveTextContent("2");
  });

  it("omits the complexity row when the scenario has none", () => {
    render(<FeedbackSheet {...base} complexity={undefined} />);
    expect(screen.queryByText("Time")).toBeNull();
  });

  it("wrong: Not quite, no XP chip, the user's pick first with Your pick", () => {
    render(
      <FeedbackSheet
        {...base}
        correct={false}
        xp={0}
        others={[{ ...base.others[1]!, isPick: true }, base.others[0]!]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Not quite" })).toBeInTheDocument();
    expect(screen.queryByText(/XP/)).toBeNull();
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("D Min-heap by node load · Your pick");
    expect(rows[1]).not.toHaveTextContent("Your pick");
  });

  it("the others disclosure is open by default and toggles", async () => {
    const user = userEvent.setup();
    render(<FeedbackSheet {...base} />);
    const toggle = screen.getByRole("button", { name: "Why the others lose" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Changing n remaps almost every key.")).toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Changing n remaps almost every key.")).toBeNull();
  });

  it("only renders 'Your checks' and a summary line when validations are given", () => {
    const { rerender } = render(<FeedbackSheet {...base} />);
    expect(screen.queryByText("Your checks")).toBeNull();
    rerender(
      <FeedbackSheet
        {...base}
        summaryLine="1 of 1 check passed"
        checks={[{ label: "Big-O: O(log n)", passed: true }]}
      />,
    );
    expect(screen.getByText("1 of 1 check passed")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your checks" })).toBeInTheDocument();
  });

  it("footer is the only exit: Next scenario / See summary, Esc maps to it, scrim does nothing", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const { rerender } = render(<FeedbackSheet {...base} onNext={onNext} />);
    await user.click(document.querySelector("[data-scrim]") as HTMLElement);
    expect(onNext).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(onNext).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Next scenario" }));
    expect(onNext).toHaveBeenCalledTimes(2);
    rerender(<FeedbackSheet {...base} last onNext={onNext} />);
    expect(screen.getByRole("button", { name: "See summary" })).toBeInTheDocument();
  });

  it("returns focus to the element returnFocus names", () => {
    const target = document.createElement("h1");
    target.tabIndex = -1;
    document.body.appendChild(target);
    const { rerender } = render(<FeedbackSheet {...base} returnFocus={() => target} />);
    rerender(<FeedbackSheet {...base} open={false} returnFocus={() => target} />);
    expect(target).toHaveFocus();
    target.remove();
  });
});
