import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { BigOPicker, bigOChoiceName, bigOColumns } from "./BigOPicker";

const SIX = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(2^n)"];

function Harness({
  choices = SIX,
  verdict = null,
}: {
  choices?: string[];
  verdict?: { correct: string; picked: string | null } | null;
}) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <>
      <h2 id="q">Lookup cost?</h2>
      <BigOPicker labelledBy="q" choices={choices} selected={sel} verdict={verdict} onSelect={setSel} />
    </>
  );
}

describe("BigOPicker", () => {
  it("is a labelled radiogroup; names use the spoken form; order is kept as given", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Lookup cost?" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("aria-label"))).toEqual([
      "O of 1",
      "O of log n",
      "O of n",
      "O of n log n",
      "O of n squared",
      "O of 2 to the n",
    ]);
  });

  it("renders real superscripts through Complexity", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "O of n squared" }).querySelector("sup")).toHaveTextContent("2");
  });

  it("uses 2 columns when every choice is at most 12 characters, otherwise 1", () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-columns", "2");
    expect(screen.getByRole("radiogroup")).toHaveClass("grid-cols-2");
    rerender(<Harness choices={["O(1)", "O(V + E)", "O((V + E) log V)"]} />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-columns", "1");
    expect(bigOColumns(["O(n log n)", "O(sqrt n)"])).toBe(2);
    expect(bigOColumns(["O(1)", "O(V + E) log V"])).toBe(1);
  });

  it("has 48 px rows, a 2 px border and one tab stop", () => {
    render(<Harness />);
    const radios = screen.getAllByRole("radio");
    expect(radios.every((r) => r.classList.contains("min-h-12") && r.classList.contains("border-2"))).toBe(true);
    expect(radios.map((r) => r.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1", "-1"]);
  });

  it("arrows move focus and selection in reading order, wrap; Home and End jump; Space selects", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "O of 1" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "O of log n" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "O of log n" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "O of n" })).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "O of 2 to the n" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "O of 1" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "O of 2 to the n" })).toHaveFocus();
  });

  it("moves the tab stop with the selection and keeps a tap on the selected choice selected", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("radio", { name: "O of n" }));
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("tabindex"))).toEqual(["-1", "-1", "0", "-1", "-1", "-1"]);
    await user.click(screen.getByRole("radio", { name: "O of n" }));
    expect(screen.getByRole("radio", { name: "O of n" })).toHaveAttribute("data-state", "selected");
  });

  it("shows correct / incorrect / dimmed after Check: icon, dashed wrong border, read-only, names", async () => {
    const user = userEvent.setup();
    render(<Harness verdict={{ correct: "O(log n)", picked: "O(n)" }} />);
    const ok = screen.getByRole("radio", { name: "O of log n, correct answer" });
    const bad = screen.getByRole("radio", { name: "O of n, your pick, incorrect" });
    const dim = screen.getByRole("radio", { name: "O of 1" });
    expect(ok).toHaveAttribute("data-state", "correct");
    expect(ok.querySelector("svg")).not.toBeNull();
    expect(ok).not.toHaveClass("border-dashed");
    expect(bad).toHaveAttribute("data-state", "incorrect");
    expect(bad).toHaveClass("border-dashed");
    expect(bad.querySelector("svg")).not.toBeNull();
    expect(bad).toHaveAttribute("aria-checked", "true");
    expect(dim).toHaveAttribute("data-state", "dimmed");
    expect(dim).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("radio").every((r) => r.classList.contains("border-2"))).toBe(true);
    // The pick keeps the tab stop; arrows move focus only.
    expect(bad).toHaveAttribute("tabindex", "0");
    bad.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "O of n log n" })).toHaveFocus();
    expect(bad).toHaveAttribute("data-state", "incorrect");
    await user.click(dim);
    expect(dim).toHaveAttribute("data-state", "dimmed");
  });

  it("names the right pick", () => {
    expect(bigOChoiceName("O(log n)", "correct", true)).toBe("O of log n, correct answer, your pick");
    expect(bigOChoiceName("O(n)", "default", false)).toBe("O of n");
  });
});
