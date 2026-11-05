import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Scenario } from "@/domain/content/schema";
import { initialProfile, useProfileStore } from "@/stores/profile";
import { useSessionStore } from "@/stores/session";
import { SessionPage } from "./SessionPage";
import { installFakeSession, resetSession, seedScenarios } from "./testing";

const byId = (id: string): Scenario => seedScenarios.find((s) => s.id === id)!;
const BIGO = byId("hashing-001"); // correct option b, Big-O time, answer O(log n)
const FIRST = byId("graphs-001"); // correct option b, first step B
const ORDER = byId("graphs-002"); // correct option a, order Y B D A E C, givenPrefix 1

function renderSession() {
  return render(
    <MemoryRouter initialEntries={["/session"]}>
      <Routes>
        <Route path="/session" element={<SessionPage />} />
        <Route path="/summary" element={<p>summary route</p>} />
        <Route path="/" element={<p>home route</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Starts on the scenario question, picks the right option, Check, Continue (guard waived with fake timers). */
async function toValidation(scenario: Scenario) {
  installFakeSession([
    { scenario, optionOrder: scenario.options.map((o) => o.id) },
    ...seedScenarios.slice(5, 7).map((s) => ({ scenario: s, optionOrder: s.options.map((o) => o.id) })),
  ]);
  const utils = renderSession();
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("radio", {
      name: scenario.options.find((o) => o.id === scenario.correctOptionId)!.label,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Check" }));
  act(() => {
    vi.advanceTimersByTime(400);
  });
  await user.click(screen.getByRole("button", { name: "Continue" }));
  return { ...utils, user };
}

const answer = (a: Parameters<ReturnType<typeof useSessionStore.getState>["setAnswer"]>[0]) =>
  act(() => useSessionStore.getState().setAnswer(a));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] }); // the 350 ms guard reads Date.now(); user-event keeps real timers
  window.localStorage.clear();
  useProfileStore.setState({ ...initialProfile, hydrated: true });
});
afterEach(() => {
  vi.useRealTimers();
  resetSession();
  document.body.removeAttribute("style");
});

describe("Validation: Big-O", () => {
  it("shows 'Check 1 of 1', the Time chip, the question as the heading and a 2-column picker in ascending order", async () => {
    await toValidation(BIGO);
    expect(screen.getByText(/Check 1 of 1/)).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /Consistent hashing: lookup cost/ })).toHaveFocus();
    const group = screen.getByRole("radiogroup", { name: /lookup cost/ });
    expect(group).toHaveAttribute("data-columns", "2");
    expect(
      within(group)
        .getAllByRole("radio")
        .map((r) => r.getAttribute("aria-label")),
    ).toEqual(["O of 1", "O of log n", "O of n", "O of n log n", "O of n squared", "O of 2 to the n"]);
    // The progress bar advances per scenario, not per validation.
    expect(screen.getByRole("progressbar", { name: "Session progress" })).toHaveAttribute(
      "aria-valuetext",
      "Scenario 1 of 3",
    );
  });

  it("uses the Space chip for space measures", async () => {
    await toValidation(byId("hashing-003"));
    expect(screen.getByText("Space")).toBeInTheDocument();
  });

  it("Check is aria-disabled with a reason until a choice is selected", async () => {
    const { user } = await toValidation(BIGO);
    const check = screen.getByRole("button", { name: "Check" });
    expect(check).toHaveAttribute("aria-disabled", "true");
    expect(check).toHaveAccessibleDescription("Select an answer first");
    await user.click(check);
    expect(useSessionStore.getState().step).toMatchObject({ kind: "validation", checked: false });
    await user.click(screen.getByRole("radio", { name: "O of n" }));
    expect(screen.getByRole("button", { name: "Check" })).not.toHaveAttribute("aria-disabled");
  });

  it("correct: 'Correct', the answer, +5 XP, correct tile; Continue keeps focus and honours the 350 ms guard", async () => {
    const { user } = await toValidation(BIGO);
    await user.click(screen.getByRole("radio", { name: "O of log n" }));
    const check = screen.getByRole("button", { name: "Check" });
    check.focus();
    fireEvent.click(check);
    const strip = screen.getByRole("status");
    expect(strip).toHaveTextContent("Correct");
    expect(strip).toHaveTextContent("O(log n)");
    expect(strip).toHaveTextContent("+5 XP");
    expect(screen.getByRole("radio", { name: "O of log n, correct answer, your pick" })).toHaveAttribute(
      "data-state",
      "correct",
    );
    const cont = screen.getByRole("button", { name: "Continue" });
    expect(cont).toBe(check);
    expect(cont).toHaveFocus();
    expect(document.querySelector("[aria-live='polite']")).toHaveTextContent(
      "Correct. O of log n. Plus 5 XP.",
    );
    fireEvent.click(cont);
    expect(useSessionStore.getState().step.kind).toBe("validation");
    act(() => {
      vi.advanceTimersByTime(351);
    });
    fireEvent.click(cont);
    expect(useSessionStore.getState().step.kind).toBe("feedback");
  });

  it("wrong: 'Not quite' with 'It's O(log n).', dashed pick, no XP", async () => {
    const { user } = await toValidation(BIGO);
    await user.click(screen.getByRole("radio", { name: "O of n" }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    const strip = screen.getByRole("status");
    expect(strip).toHaveTextContent("Not quite");
    expect(strip).toHaveTextContent("It's O(log n)");
    expect(strip).not.toHaveTextContent("XP");
    expect(screen.getByRole("radio", { name: "O of n, your pick, incorrect" })).toHaveClass("border-dashed");
    expect(screen.getByRole("radio", { name: "O of log n, correct answer" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "O of 1" })).toHaveAttribute("data-state", "dimmed");
  });

  it("desktop keys: 1-6 select, Enter checks, Enter continues", async () => {
    await toValidation(BIGO);
    fireEvent.keyDown(window, { key: "2" });
    expect(screen.getByRole("radio", { name: "O of log n" })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(window, { key: "6" });
    expect(screen.getByRole("radio", { name: "O of 2 to the n" })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(351);
    });
    fireEvent.keyDown(window, { key: "Enter" });
    expect(useSessionStore.getState().step.kind).toBe("feedback");
  });

  it("the explanation lists 'Your checks' with the Big-O row, a summary line and total XP", async () => {
    const { user } = await toValidation(BIGO);
    await user.click(screen.getByRole("radio", { name: "O of log n" }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    act(() => {
      vi.advanceTimersByTime(351);
    });
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("1 of 1 check passed")).toBeInTheDocument();
    expect(within(dialog).getByText("+15 XP")).toBeInTheDocument();
    const section = within(dialog).getByRole("heading", { name: "Your checks" }).closest("section")!;
    expect(section).toHaveTextContent("Big-O: O(log n)");
    expect(section.querySelector("li")).toHaveAttribute("data-passed");
  });
});

describe("Validation: trace first step", () => {
  it("renders the TraceCanvas (stub in this branch) instead of a picker", async () => {
    await toValidation(FIRST);
    expect(screen.getByText(/Check 1 of 1 · Trace/)).toBeInTheDocument();
    expect(document.querySelector("[data-stub='trace-canvas']")).not.toBeNull();
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });

  it("Check waits for a target; right: '{label} is the first step.'; wrong: 'The first step is {label}.'", async () => {
    const { user } = await toValidation(FIRST);
    const check = screen.getByRole("button", { name: "Check" });
    expect(check).toHaveAttribute("aria-disabled", "true");
    expect(check).toHaveAccessibleDescription("Tap a node first");
    answer({ type: "target", id: "A" });
    expect(screen.getByRole("button", { name: "Check" })).not.toHaveAttribute("aria-disabled");
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite");
    expect(screen.getByRole("status")).toHaveTextContent("The first step is B.");
  });

  it("right answer shows the first-step line and +5 XP", async () => {
    const { user } = await toValidation(FIRST);
    answer({ type: "target", id: "B" });
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status")).toHaveTextContent("B is the first step.");
    expect(screen.getByRole("status")).toHaveTextContent("+5 XP");
  });
});

describe("Validation: trace order", () => {
  it("starts with the given prefix; Check says 'Tap every node in order first' until complete", async () => {
    await toValidation(ORDER);
    expect(screen.getByText(/Check 1 of 1 · Order/)).toBeInTheDocument();
    expect(useSessionStore.getState().step).toMatchObject({ answer: { type: "order", ids: ["Y"] } });
    const check = screen.getByRole("button", { name: "Check" });
    expect(check).toHaveAttribute("aria-disabled", "true");
    expect(check).toHaveAccessibleDescription("Tap every node in order first");
    answer({ type: "order", ids: ["Y", "B", "D", "A", "E"] });
    expect(screen.getByRole("button", { name: "Check" })).toHaveAttribute("aria-disabled", "true");
    answer({ type: "order", ids: ["Y", "B", "D", "A", "E", "C"] });
    expect(screen.getByRole("button", { name: "Check" })).not.toHaveAttribute("aria-disabled");
  });

  it("Backspace removes the last tapped node but never the given prefix", async () => {
    await toValidation(ORDER);
    answer({ type: "order", ids: ["Y", "B", "D"] });
    fireEvent.keyDown(window, { key: "Backspace" });
    expect(useSessionStore.getState().step).toMatchObject({ answer: { ids: ["Y", "B"] } });
    fireEvent.keyDown(window, { key: "Backspace" });
    fireEvent.keyDown(window, { key: "Backspace" });
    expect(useSessionStore.getState().step).toMatchObject({ answer: { ids: ["Y"] } });
  });

  it("right: the sequence in mono; wrong: 'Order: Y B D A E C' (mono, at most 40 characters)", async () => {
    const { user } = await toValidation(ORDER);
    answer({ type: "order", ids: ["Y", "B", "A", "D", "E", "C"] });
    await user.click(screen.getByRole("button", { name: "Check" }));
    const strip = screen.getByRole("status");
    expect(strip).toHaveTextContent("Not quite");
    const seq = within(strip).getByText("Order: Y B D A E C");
    expect(seq).toHaveClass("text-mono");
    expect(seq.textContent!.length).toBeLessThanOrEqual(40);
    expect(strip).not.toHaveTextContent("XP");
  });

  it("right order shows 'Y → B → D → A → E → C' and +5 XP; the explanation says 'k of n in place' when wrong", async () => {
    const { user } = await toValidation(ORDER);
    answer({ type: "order", ids: ["Y", "B", "D", "A", "E", "C"] });
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status")).toHaveTextContent("Y → B → D → A → E → C");
    expect(screen.getByRole("status")).toHaveTextContent("+5 XP");
  });

  it("wrong order reports 'Trace order: 4 of 6 in place' in Your checks", async () => {
    const { user } = await toValidation(ORDER);
    answer({ type: "order", ids: ["Y", "B", "A", "D", "E", "C"] });
    await user.click(screen.getByRole("button", { name: "Check" }));
    act(() => {
      vi.advanceTimersByTime(351);
    });
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Trace order: 4 of 6 in place")).toBeInTheDocument();
    expect(within(dialog).getByText("0 of 1 check passed")).toBeInTheDocument();
  });
});

describe("Validation: two checks in a row", () => {
  it("'Check 1 of 2' then 'Check 2 of 2', focus on the new question, then the explanation with both rows", async () => {
    const two: Scenario = { ...BIGO, validations: [BIGO.validations[0]!, FIRST.validations[0]!] };
    const { user } = await toValidation(two);
    expect(screen.getByText(/Check 1 of 2/)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "O of log n" }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    act(() => {
      vi.advanceTimersByTime(351);
    });
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/Check 2 of 2 · Trace/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
    answer({ type: "target", id: "A" });
    await user.click(screen.getByRole("button", { name: "Check" }));
    act(() => {
      vi.advanceTimersByTime(351);
    });
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("1 of 2 checks passed")).toBeInTheDocument();
    expect(within(dialog).getByText("Trace first step: missed")).toBeInTheDocument();
    expect(within(dialog).getByText("+15 XP")).toBeInTheDocument();
  });
});
