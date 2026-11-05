import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { OptionGroup } from "./OptionGroup";
import { OptionTile, optionTileName, type OptionTileState } from "./OptionTile";

describe("OptionTile", () => {
  const states: OptionTileState[] = ["default", "selected", "correct", "incorrect", "dimmed"];

  it.each(states)("exposes data-state=%s and a 2 px border in every state", (state) => {
    render(<OptionTile keyLabel="A" label="Consistent hashing" state={state} />);
    const el = screen.getByRole("radio");
    expect(el).toHaveAttribute("data-state", state);
    expect(el).toHaveClass("border-2");
  });

  it("dashed border only for the wrong pick", () => {
    render(
      <>
        <OptionTile keyLabel="A" label="One" state="incorrect" />
        <OptionTile keyLabel="B" label="Two" state="correct" />
      </>,
    );
    expect(screen.getByRole("radio", { name: /One/ })).toHaveClass("border-dashed");
    expect(screen.getByRole("radio", { name: /Two/ })).not.toHaveClass("border-dashed");
  });

  it("builds the accessible names from §7.2", () => {
    expect(optionTileName("Consistent hashing", "correct", true)).toBe("Consistent hashing, best fit, your pick");
    expect(optionTileName("Consistent hashing", "correct", false)).toBe("Consistent hashing, best fit");
    expect(optionTileName("Min-heap by node load", "incorrect", true)).toBe("Min-heap by node load, your pick, incorrect");
    expect(optionTileName("Plain", "dimmed", false)).toBe("Plain");
  });

  it("shows captions and a state icon only after Check", () => {
    const { rerender } = render(<OptionTile keyLabel="B" label="Consistent hashing" state="selected" />);
    expect(screen.getByRole("radio").querySelector("svg")).toBeNull();
    rerender(<OptionTile keyLabel="B" label="Consistent hashing" state="correct" picked />);
    expect(screen.getByRole("radio")).toHaveTextContent("Best fit · your pick");
    expect(screen.getByRole("radio").querySelector("svg")).not.toBeNull();
  });

  it("read-only states ignore taps and are aria-disabled", async () => {
    const onSelect = vi.fn();
    render(<OptionTile keyLabel="A" label="Dimmed" state="dimmed" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("radio"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("radio")).toHaveAttribute("aria-disabled", "true");
  });
});

function Harness({ verdict = false }: { verdict?: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <>
      <p id="q">Which approach fits best?</p>
      <OptionGroup
        labelledBy="q"
        options={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Bravo" },
          { id: "c", label: "Charlie" },
        ]}
        selectedId={sel}
        verdict={verdict ? { correctId: "c", pickedId: "a" } : null}
        onSelect={setSel}
      />
    </>
  );
}

describe("OptionGroup", () => {
  it("is a labelled radiogroup with one tab stop", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Which approach fits best?" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(screen.getAllByRole("radio").every((r) => r.getAttribute("aria-checked") === "false")).toBe(true);
  });

  it("arrows move focus and selection and wrap; Home and End jump", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getAllByRole("radio")[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Bravo" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Bravo" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "Charlie" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveFocus();
  });

  it("Space selects the focused tile; tapping the selected tile keeps it selected", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "Alpha" }));
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveAttribute("aria-checked", "true");
  });

  it("after Check the pick keeps the tab stop and arrows no longer change the selection", async () => {
    const user = userEvent.setup();
    render(<Harness verdict />);
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("data-state"))).toEqual(["incorrect", "dimmed", "correct"]);
    expect(radios.map((r) => r.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    radios[0]!.focus();
    await user.keyboard("{ArrowDown}");
    expect(radios[1]).toHaveFocus();
    expect(radios.map((r) => r.getAttribute("data-state"))).toEqual(["incorrect", "dimmed", "correct"]);
  });
});
