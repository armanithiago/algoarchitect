import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fixture, type TraceFixture } from "./fixtures";
import { describeTargets, nextValue, readoutText, treeStructure, type GraphVisual } from "./model";
import { TraceCanvas } from "./TraceCanvas";
import type { TraceView } from "./types";

interface HarnessProps {
  f: TraceFixture;
  initial?: string[];
  checked?: boolean;
  view?: TraceView;
  onChange?: (ids: string[]) => void;
}

function Harness({ f, initial, checked = false, view: startView = "canvas", onChange }: HarnessProps) {
  const order = f.type === "traceOrder";
  const [value, setValue] = useState<string[]>(initial ?? (order ? f.expected.slice(0, f.givenPrefix) : []));
  const [view, setView] = useState<TraceView>(startView);
  return (
    <>
      <h2 id="q">Question</h2>
      <TraceCanvas
        visual={f.visual}
        mode={order ? "order" : "first"}
        value={value}
        onChange={(ids) => {
          setValue(ids);
          onChange?.(ids);
        }}
        givenPrefix={f.givenPrefix}
        totalSteps={f.expected.length}
        checked={checked}
        expected={checked ? f.expected : null}
        labelledBy="q"
        view={view}
        onViewChange={setView}
      />
    </>
  );
}

const hit = (id: string) => document.querySelector<HTMLButtonElement>(`[data-trace-id="${id}"]`)!;
const readout = () => document.querySelector("[aria-live=polite]")!.textContent;

describe("TraceCanvas · first step", () => {
  const f = fixture("graphs-001"); // weighted graph, start S, answer B

  it("is a radiogroup labelled by the question, with a hidden summary", () => {
    render(<Harness f={f} />);
    const group = screen.getByRole("radiogroup", { name: "Question" });
    expect(group).toHaveAccessibleDescription("Weighted graph, 5 nodes. Start: S.");
    expect(within(group).getAllByRole("radio")).toHaveLength(5);
  });

  it("names every node from the generator (sorted neighbors, weights in parentheses)", () => {
    render(<Harness f={f} />);
    expect(screen.getByRole("radio", { name: "B · neighbors: C (3), S (2)" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "S · start · neighbors: A (7), B (2), C (4)" })).toBeInTheDocument();
  });

  it("selects, replaces, and keeps the selected one on a second tap", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness f={f} onChange={onChange} />);
    expect(readout()).toBe("Tap a node · nothing selected");
    await user.click(hit("B"));
    expect(onChange).toHaveBeenLastCalledWith(["B"]);
    expect(hit("B")).toHaveAttribute("aria-checked", "true");
    expect(readout()).toBe("Selected: B");
    await user.click(hit("C"));
    expect(onChange).toHaveBeenLastCalledWith(["C"]);
    expect(hit("B")).toHaveAttribute("aria-checked", "false");
    onChange.mockClear();
    await user.click(hit("C"));
    expect(onChange).not.toHaveBeenCalled();
    expect(hit("C")).toHaveAttribute("aria-checked", "true");
  });

  it("is controlled: it renders whatever value it is given and never changes it on its own", () => {
    const onChange = vi.fn();
    render(
      <TraceCanvas visual={f.visual} mode="first" value={["A"]} onChange={onChange} givenPrefix={0} totalSteps={1} checked={false} expected={null} labelledBy="q" view="canvas" onViewChange={() => {}} />,
    );
    expect(hit("A")).toHaveAttribute("aria-checked", "true");
    hit("B").click();
    expect(onChange).toHaveBeenCalledWith(["B"]);
    expect(hit("A")).toHaveAttribute("aria-checked", "true");
  });

  it("draws the start marker, weights and no Undo button", () => {
    render(<Harness f={f} />);
    expect(document.body.textContent).toContain("start");
    for (const w of ["7", "2", "4", "1", "3"]) expect(document.querySelector("[data-testid=trace-canvas-box] svg")!.textContent).toContain(w);
    expect(screen.queryByRole("button", { name: /undo/i })).toBeNull();
  });

  it("wrong pick after Check: expected is correct (solid), the pick is incorrect (dashed), the rest dimmed, read-only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness f={f} initial={["C"]} checked onChange={onChange} />);
    expect(hit("B")).toHaveAttribute("data-state", "correct");
    expect(hit("C")).toHaveAttribute("data-state", "incorrect");
    expect(hit("A")).toHaveAttribute("data-state", "dimmed");
    expect(hit("B").getAttribute("aria-label")).toMatch(/, correct$/);
    expect(hit("C").getAttribute("aria-label")).toMatch(/, your pick, incorrect$/);
    expect(hit("C")).toHaveAttribute("aria-disabled", "true");
    // SVG: the incorrect body is dashed 4/3, the correct one is solid.
    expect(document.querySelector('[data-node="C"] circle:not([r="9"]):not([r="8.5"])')).toBeTruthy();
    expect(document.querySelector('[data-node="C"] .\\[stroke-dasharray\\:4_3\\]')).toBeTruthy();
    expect(document.querySelector('[data-node="B"] .\\[stroke-dasharray\\:4_3\\]')).toBeNull();
    await user.click(hit("A"));
    expect(onChange).not.toHaveBeenCalled();
    expect(readout()).toBe("Selected: C · should be B");
  });

  it("right pick after Check is correct", () => {
    render(<Harness f={f} initial={["B"]} checked />);
    expect(hit("B")).toHaveAttribute("data-state", "correct");
    expect(hit("B")).toHaveAttribute("aria-checked", "true");
    expect(readout()).toBe("Selected: B · correct");
  });
});

describe("TraceCanvas · order mode", () => {
  const f = fixture("graphs-002"); // BFS from Y, answer Y B D A E C, givenPrefix 1

  it("is a group of toggle buttons; the start is locked as step 1", () => {
    render(<Harness f={f} />);
    expect(screen.getByRole("group", { name: "Question" })).toHaveAccessibleDescription(
      "Unweighted graph, 6 nodes. Start: Y. The first step is given. Tap nodes in visit order; tap the last one again to undo.",
    );
    expect(screen.queryByRole("radio")).toBeNull();
    expect(hit("Y")).toHaveAttribute("aria-pressed", "true");
    expect(hit("Y")).toHaveAttribute("aria-disabled", "true");
    expect(hit("Y").getAttribute("aria-label")).toMatch(/, step 1$/);
    expect(readout()).toBe("Order: Y · 1 of 6 · tap the next node");
  });

  it("appends in tap order, removes only the last user tap, ignores other numbered targets", async () => {
    const user = userEvent.setup();
    render(<Harness f={f} />);
    await user.click(hit("B"));
    await user.click(hit("A"));
    expect(readout()).toBe("Order: Y → B → A · 3 of 6 · tap the next node");
    expect(hit("A").getAttribute("aria-label")).toMatch(/, step 3$/);
    await user.click(hit("B")); // not the last: ignored
    await user.click(hit("Y")); // locked: ignored
    expect(readout()).toBe("Order: Y → B → A · 3 of 6 · tap the next node");
    await user.click(hit("A")); // last user tap: removed
    expect(readout()).toBe("Order: Y → B · 2 of 6 · tap the next node");
    expect(hit("A")).toHaveAttribute("aria-pressed", "false");
  });

  it("never lets the locked prefix be removed, and caps at totalSteps", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness f={f} onChange={onChange} />);
    for (const id of ["B", "D", "A", "E", "C"]) await user.click(hit(id));
    expect(readout()).toBe("Order: Y → B → D → A → E → C · 6 of 6");
    onChange.mockClear();
    expect(nextValue("order", f.expected, "Y", 1, 6)).toBeNull();
    // all six are numbered: only C (last) reacts
    await user.click(hit("A"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not exceed totalSteps even for an unselected target", () => {
    expect(nextValue("order", ["Y", "B"], "D", 1, 2)).toBeNull();
    expect(nextValue("order", ["Y", "B"], "D", 1, 3)).toEqual(["Y", "B", "D"]);
  });

  it("Undo appears after the first user tap and removes the last tap", async () => {
    const user = userEvent.setup();
    render(<Harness f={f} />);
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
    await user.click(hit("B"));
    await user.click(hit("D"));
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(readout()).toBe("Order: Y → B · 2 of 6 · tap the next node");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(readout()).toBe("Order: Y · 1 of 6 · tap the next node");
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
    expect(hit("B")).toHaveFocus(); // focus follows the removed target when Undo disappears
  });

  it("Backspace undoes when focus is inside, and never touches the prefix", async () => {
    const user = userEvent.setup();
    render(<Harness f={f} />);
    await user.click(hit("B"));
    await user.click(hit("D"));
    hit("D").focus();
    await user.keyboard("{Backspace}");
    expect(readout()).toBe("Order: Y → B · 2 of 6 · tap the next node");
    await user.keyboard("{Backspace}");
    await user.keyboard("{Backspace}");
    expect(readout()).toBe("Order: Y · 1 of 6 · tap the next node");
  });

  it("after Check: correct = solid with the user's number, wrong = dashed with the user's number, read-only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // user swapped D and B: Y D B A E C
    render(<Harness f={f} initial={["Y", "D", "B", "A", "E", "C"]} checked onChange={onChange} />);
    expect(hit("Y")).toHaveAttribute("data-state", "correct");
    expect(hit("D")).toHaveAttribute("data-state", "incorrect");
    expect(hit("B")).toHaveAttribute("data-state", "incorrect");
    expect(hit("A")).toHaveAttribute("data-state", "correct");
    expect(hit("D").getAttribute("aria-label")).toMatch(/, step 2, wrong position$/);
    expect(hit("A").getAttribute("aria-label")).toMatch(/, step 4, correct$/);
    expect(hit("A")).toHaveAttribute("aria-disabled", "true");
    expect(document.querySelector('[data-node="D"] g text')!.textContent).toBe("2");
    expect(readout()).toBe("Your order: Y → D → B → A → E → C · 6 of 6");
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
    await user.click(hit("C"));
    await user.keyboard("{Backspace}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("List view adds 'Should be k' on wrong rows only", async () => {
    const user = userEvent.setup();
    render(<Harness f={f} initial={["Y", "D", "B", "A", "E", "C"]} checked view="list" />);
    const d = hit("D");
    expect(d).toHaveTextContent("Should be 3");
    expect(hit("B")).toHaveTextContent("Should be 2");
    expect(hit("A")).not.toHaveTextContent("Should be");
    expect(d.getAttribute("aria-label")).toMatch(/, step 2, wrong position$/);
    await user.click(d);
    expect(readout()).toMatch(/^Your order:/);
  });

  it("directed graphs get arrowheads and use the node labels", () => {
    const g = fixture("graphs-003");
    render(<Harness f={g} />);
    expect(document.querySelectorAll("polygon")).toHaveLength(6);
    expect(screen.getByRole("button", { name: /^lib · neighbors: web, step|^lib · neighbors: web$/ })).toBeInTheDocument();
  });
});

describe("TraceCanvas · arrays", () => {
  it("wraps 9 cells onto a second row of 6-per-row grid, with index labels and value names", () => {
    const f = fixture("sorting-001");
    render(<Harness f={f} />);
    const cells = document.querySelectorAll("[data-array-cell]");
    expect(cells).toHaveLength(9);
    expect(document.querySelector("[data-cols]")).toHaveAttribute("data-cols", "6");
    expect(cells[4]!.textContent).toContain("4"); // index label
    expect(hit("c5")).toHaveAccessibleName("Index 5 · value 38");
    expect(hit("c4")).toHaveClass("h-12");
  });

  it("order mode on a 9-cell array: probes in order", async () => {
    const user = userEvent.setup();
    const f = fixture("sorting-001");
    render(<Harness f={f} initial={[]} />);
    // givenPrefix=1 in the content, but the screen decides what is pre-filled; here nothing is locked yet
    await user.click(hit("c4"));
    await user.click(hit("c1"));
    expect(readout()).toBe("Order: 31 → 9 · 2 of 4 · tap the next cell");
  });

  it("6-cell array in first mode, checked: expected cell correct with a check glyph, wrong pick dashed", () => {
    const f = fixture("sorting-002");
    render(<Harness f={f} initial={["r1"]} checked />);
    expect(hit("s1")).toHaveAttribute("data-state", "correct");
    expect(hit("r1")).toHaveAttribute("data-state", "incorrect");
    expect(hit("r1").querySelector(".border-dashed")).toBeTruthy();
    expect(hit("s1").querySelector(".border-dashed")).toBeNull();
    expect(hit("r1")).toHaveAccessibleName("Index 0 · value 8, your pick, incorrect");
    expect(document.querySelectorAll("[data-array-cell]")).toHaveLength(6);
  });
});

describe("TraceCanvas · trees", () => {
  it("derives root, parents and children (heap with labels different from ids)", () => {
    const f = fixture("hashing-002");
    const d = describeTargets(f.visual);
    expect(d.get("r")!.name).toBe("10 · root · children: 5, 8");
    expect(d.get("a")!.name).toBe("5 · child of root · children: 9, 6");
    expect(d.get("c")!.name).toBe("9 · child of 5 · children: none");
    expect(d.get("b")!.name).toBe("8 · child of root · children: 12");
  });

  it("falls back to the first node as root when there is no start", () => {
    const f = fixture("trees-002");
    const v: GraphVisual = { ...(f.visual as GraphVisual), start: undefined };
    expect(treeStructure(v).root).toBe("50");
    expect(describeTargets(v).get("50")!.name).toBe("50 · root · children: 30, 80");
  });

  it("BST in order mode: 7 nodes, summary names the root", () => {
    const f = fixture("trees-002");
    render(<Harness f={f} initial={[]} />);
    expect(screen.getByRole("group", { name: "Question" })).toHaveAccessibleDescription(/^Tree, 7 nodes\. Root: 50\./);
    expect(document.querySelectorAll("line")).toHaveLength(6);
  });

  it("readout helper formats first-mode verdicts with labels", () => {
    const f = fixture("hashing-002");
    expect(readoutText(f.visual, "first", ["a"], 1, true, ["b"])).toBe("Selected: 5 · should be 8");
  });
});

describe("TraceCanvas · views, keyboard and accessibility", () => {
  it("toggles between canvas and list and keeps the selection (it lives in value)", async () => {
    const user = userEvent.setup();
    render(<Harness f={fixture("graphs-002")} initial={["Y", "B"]} />);
    expect(screen.queryByTestId("trace-list")).toBeNull();
    await user.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByTestId("trace-list")).toBeInTheDocument();
    expect(hit("B")).toHaveAttribute("aria-pressed", "true");
    expect(hit("B")).toHaveTextContent("neighbors: A, E, Y");
    expect(hit("B").getAttribute("aria-label")).toBe("B · neighbors: A, E, Y, step 2");
    await user.click(hit("D"));
    await user.click(screen.getByRole("button", { name: "Graph" }));
    expect(screen.queryByTestId("trace-list")).toBeNull();
    expect(hit("D")).toHaveAttribute("aria-pressed", "true");
    expect(readout()).toBe("Order: Y → B → D · 3 of 6 · tap the next node");
  });

  it("list view in first mode behaves like the canvas (radio rows, replace, verdict icons)", async () => {
    const user = userEvent.setup();
    render(<Harness f={fixture("graphs-001")} view="list" />);
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    await user.click(hit("A"));
    await user.click(hit("B"));
    expect(hit("B")).toHaveAttribute("aria-checked", "true");
    expect(hit("A")).toHaveAttribute("aria-checked", "false");
    expect(hit("A")).toHaveTextContent("neighbors: D (1), S (7)");
  });

  it("arrow keys move focus in authored order (roving tabindex); Space selects", async () => {
    const user = userEvent.setup();
    render(<Harness f={fixture("graphs-001")} />);
    const ids = ["S", "A", "B", "C", "D"];
    expect(hit("S").tabIndex).toBe(0);
    expect(hit("A").tabIndex).toBe(-1);
    act(() => hit("S").focus());
    await user.keyboard("{ArrowRight}");
    expect(hit("A")).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(hit("C")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(hit("B")).toHaveFocus();
    await user.keyboard("{End}");
    expect(hit(ids[4]!)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(hit("S")).toHaveFocus(); // wraps
    await user.keyboard(" ");
    expect(hit("S")).toHaveAttribute("aria-checked", "true");
    expect(hit("S").tabIndex).toBe(0);
  });

  it("draws the focus ring in SVG (r + 5, 2 px) for keyboard focus, not as a CSS outline", async () => {
    const user = userEvent.setup();
    render(<Harness f={fixture("graphs-001")} />);
    expect(document.querySelector("[data-focus-ring]")).toBeNull();
    const matches = vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible" ? true : Element.prototype.matches.call(this, sel);
    });
    act(() => hit("S").focus());
    await user.keyboard("{ArrowRight}"); // A, not the start node
    const ring = document.querySelector("[data-focus-ring]")!;
    expect(ring.getAttribute("r")).toBe("23");
    expect(ring.closest("[data-node]")!.getAttribute("data-node")).toBe("A");
    matches.mockRestore();
  });

  it("hit buttons are real buttons positioned in percent of the viewBox and sized 48 px (class size-12)", () => {
    render(<Harness f={fixture("graphs-001")} />);
    const b = hit("S");
    expect(b.tagName).toBe("BUTTON");
    expect(b).toHaveClass("size-12");
    expect(b.style.left).toBe("15%");
    expect(b.style.top).toBe("23.333%");
    expect(document.querySelector("[data-testid=trace-canvas-box] svg")).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector("svg g[onclick]")).toBeNull();
  });

  it("the live readout is polite and the toggle is at least a ghost sm button", () => {
    render(<Harness f={fixture("graphs-001")} />);
    expect(document.querySelector("[aria-live=polite]")).toBeTruthy();
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("data-size", "sm");
  });
});
