import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialProfile, useProfileStore } from "@/stores/profile";
import { useSessionStore } from "@/stores/session";
import { SessionPage } from "./SessionPage";
import { installFakeSession, makeItems, resetSession } from "./testing";

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

const tile = (name: RegExp | string) => screen.getByRole("radio", { name });

beforeEach(() => {
  window.localStorage.clear();
  useProfileStore.setState({ ...initialProfile, hydrated: true });
  installFakeSession(makeItems(3));
});
afterEach(() => {
  vi.useRealTimers();
  resetSession();
  document.body.removeAttribute("style");
});

describe("Session: question", () => {
  it("renders top bar, stage and the tiles in optionOrder with key letters", () => {
    installFakeSession(makeItems(3, ["d", "c", "b", "a"]));
    renderSession();
    expect(screen.getByRole("progressbar", { name: "Session progress" })).toHaveAttribute("aria-valuetext", "Scenario 1 of 3");
    expect(screen.getByRole("heading", { level: 1, name: "Cache cluster resizing" })).toBeInTheDocument();
    expect(screen.getByText(/New · D2/)).toBeInTheDocument();
    const radios = within(screen.getByRole("radiogroup", { name: "Which approach fits best?" })).getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-label"))).toEqual([
      "Min-heap by node load",
      "Sorted array + binary search",
      "Consistent hashing",
      "Modulo hashing (key % n)",
    ]);
    expect(radios.map((r) => r.textContent?.[0])).toEqual(["A", "B", "C", "D"]);
  });

  it("Check is aria-disabled with a reason until a tile is selected, then enables", async () => {
    const user = userEvent.setup();
    renderSession();
    const check = screen.getByRole("button", { name: "Check" });
    expect(check).toHaveAttribute("aria-disabled", "true");
    expect(check).toHaveAccessibleDescription("Select an answer first");
    await user.click(check);
    expect(useSessionStore.getState().step).toMatchObject({ checked: false });
    await user.click(tile("Consistent hashing"));
    expect(tile("Consistent hashing")).toHaveAttribute("aria-checked", "true");
    expect(tile("Consistent hashing")).toHaveAttribute("data-state", "selected");
    expect(screen.getByRole("button", { name: "Check" })).not.toHaveAttribute("aria-disabled");
  });

  it("uses a roving tabindex and arrow keys move focus and selection", async () => {
    const user = userEvent.setup();
    renderSession();
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1"]);
    radios[0]!.focus();
    await user.keyboard("{ArrowDown}");
    expect(radios[1]).toHaveFocus();
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios.map((r) => r.getAttribute("tabindex"))).toEqual(["-1", "0", "-1", "-1"]);
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(radios[3]).toHaveFocus();
    expect(radios[3]).toHaveAttribute("aria-checked", "true");
  });

  it("desktop keys 1-4 select and Enter checks", async () => {
    const user = userEvent.setup();
    renderSession();
    await user.keyboard("2");
    expect(tile("Consistent hashing")).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Enter}");
    expect(useSessionStore.getState().step).toMatchObject({ kind: "question", checked: true });
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("shows the CoachMark once and remembers dismissal in localStorage", async () => {
    const user = userEvent.setup();
    const { unmount } = renderSession();
    expect(screen.getByText("Tap the approach that fits best, then Check.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByText("Tap the approach that fits best, then Check.")).toBeNull();
    expect(window.localStorage.getItem("aa.coachSeen")).toBe("1");
    unmount();
    installFakeSession(makeItems(3));
    renderSession();
    expect(screen.queryByText("Tap the approach that fits best, then Check.")).toBeNull();
  });

  it("still renders when localStorage throws", () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    renderSession();
    expect(screen.getByText("Tap the approach that fits best, then Check.")).toBeInTheDocument();
    get.mockRestore();
  });
});

describe("Session: verdict", () => {
  it("correct: strip, solid success tile, dimmed rest, live region, Continue keeps focus", async () => {
    const user = userEvent.setup();
    renderSession();
    await user.click(tile("Consistent hashing"));
    const check = screen.getByRole("button", { name: "Check" });
    check.focus();
    await user.click(check);

    const strip = screen.getByRole("status");
    expect(strip).toHaveTextContent("Correct");
    expect(strip).toHaveTextContent("+10 XP");
    expect(strip).toHaveTextContent("Consistent hashing is the fit.");

    const best = tile("Consistent hashing, best fit, your pick");
    expect(best).toHaveAttribute("data-state", "correct");
    expect(best).toHaveTextContent("Best fit · your pick");
    expect(tile("Modulo hashing (key % n)")).toHaveAttribute("data-state", "dimmed");
    expect(tile("Modulo hashing (key % n)")).toHaveAttribute("aria-disabled", "true");

    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("Correct. Consistent hashing. Plus 10 XP.");

    const cont = screen.getByRole("button", { name: "Continue" });
    expect(cont).toBe(check); // same element, relabelled in place
    expect(cont).toHaveFocus();
  });

  it("wrong: dashed pick with icon + caption, correct tile named, never color alone", async () => {
    const user = userEvent.setup();
    renderSession();
    await user.click(tile("Min-heap by node load"));
    await user.click(screen.getByRole("button", { name: "Check" }));

    expect(screen.getByRole("status")).toHaveTextContent("Not quite");
    expect(screen.getByRole("status")).toHaveTextContent("Best fit: Consistent hashing.");
    const wrong = tile("Min-heap by node load, your pick, incorrect");
    expect(wrong).toHaveAttribute("data-state", "incorrect");
    expect(wrong).toHaveTextContent("Your pick");
    expect(wrong.className).toContain("border-dashed");
    expect(wrong.querySelector("svg")).not.toBeNull();
    const best = tile("Consistent hashing, best fit");
    expect(best).toHaveTextContent("Best fit");
    expect(best.className).not.toContain("border-dashed");
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Not quite. Your pick: Min-heap by node load. Best fit: Consistent hashing.",
    );
  });

  it("makes the group read-only after Check", async () => {
    const user = userEvent.setup();
    renderSession();
    await user.click(tile("Consistent hashing"));
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(tile("Modulo hashing (key % n)"));
    expect(useSessionStore.getState().step).toMatchObject({ selectedOptionId: "b" });
  });

  it("ignores Continue for 350 ms after Check (input guard)", () => {
    vi.useFakeTimers();
    renderSession();
    fireEvent.click(tile("Consistent hashing"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(useSessionStore.getState().step.kind).toBe("question");
    act(() => {
      vi.advanceTimersByTime(349);
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(useSessionStore.getState().step.kind).toBe("question");
    act(() => {
      vi.advanceTimersByTime(2);
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(useSessionStore.getState().step.kind).toBe("feedback");
  });

  it("vibrates [12] for a correct answer", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    renderSession();
    fireEvent.click(tile("Consistent hashing"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(vibrate).toHaveBeenCalledWith([12]);
    Reflect.deleteProperty(navigator, "vibrate");
  });

  it("vibrates [12] / [24,60,24] when supported and haptics are on, and not when off", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    renderSession();
    fireEvent.click(tile("Min-heap by node load"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(vibrate).toHaveBeenCalledWith([24, 60, 24]);

    vibrate.mockClear();
    act(() => useProfileStore.setState({ settings: { ...initialProfile.settings, haptics: false } }));
    act(() => installFakeSession(makeItems(3)));
    fireEvent.click(tile("Consistent hashing"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(vibrate).not.toHaveBeenCalled();
    Reflect.deleteProperty(navigator, "vibrate");
  });
});

describe("Session: explanation and ending", () => {
  async function toFeedback(pick: string) {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSession();
    await user.click(tile(pick));
    await user.click(screen.getByRole("button", { name: "Check" }));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    await user.click(screen.getByRole("button", { name: "Continue" }));
    return user;
  }

  it("opens the FeedbackSheet with a focused heading, explanation, complexity and the others (pick first)", async () => {
    await toFeedback("Min-heap by node load");
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const heading = within(dialog).getByRole("heading", { name: "Not quite" });
    expect(heading).toHaveFocus();
    expect(within(dialog).getByRole("heading", { name: "Why Consistent hashing wins" })).toBeInTheDocument();
    expect(within(dialog).getByText(/places nodes and keys on a ring/)).toBeInTheDocument();
    expect(within(dialog).getByText("O of log n")).toBeInTheDocument();
    expect(within(dialog).getByText("O of n")).toBeInTheDocument();
    const disclosure = within(dialog).getByRole("button", { name: "Why the others lose" });
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    const rows = within(dialog).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("D Min-heap by node load · Your pick");
    expect(within(dialog).queryByText("+10 XP")).toBeNull();
    // Background is inert while the modal is open.
    expect(document.getElementById("root") ?? document.body.firstElementChild).toHaveAttribute("inert");
  });

  it("shows +10 XP when correct, has no scrim dismissal, Esc = Next scenario, focus lands on the next title", async () => {
    const user = await toFeedback("Consistent hashing");
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Correct" })).toBeInTheDocument();
    expect(within(dialog).getByText("+10 XP")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Next scenario" })).toBeInTheDocument();

    const scrim = document.querySelector("[data-scrim]") as HTMLElement;
    await user.click(scrim);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(useSessionStore.getState().step.kind).toBe("feedback");

    await user.keyboard("{Escape}");
    expect(useSessionStore.getState()).toMatchObject({ index: 1, step: { kind: "question" } });
    expect(screen.getByRole("heading", { level: 1, name: "Ride-hailing ETA" })).toHaveFocus();
    expect(document.body.firstElementChild).not.toHaveAttribute("inert");
  });

  it("the last scenario reads See summary and navigates to /summary", async () => {
    installFakeSession(makeItems(1));
    const user = await toFeedback("Consistent hashing");
    await user.click(screen.getByRole("button", { name: "See summary" }));
    expect(await screen.findByText("summary route")).toBeInTheDocument();
  });

  it("[X] opens the ConfirmSheet with Keep going focused; Keep going changes nothing", async () => {
    const user = userEvent.setup();
    renderSession();
    await user.click(tile("Consistent hashing"));
    const before = useSessionStore.getState().step;
    await user.click(screen.getByRole("button", { name: "End session" }));
    const dialog = screen.getByRole("dialog", { name: "End this session?" });
    expect(dialog).toHaveAccessibleDescription("Your 0 answers are saved. Finish a session to count today's streak.");
    const buttons = within(dialog).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["End session", "Keep going"]);
    expect(within(dialog).getByRole("button", { name: "Keep going" })).toHaveFocus();
    await user.click(within(dialog).getByRole("button", { name: "Keep going" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useSessionStore.getState().step).toEqual(before);
    expect(screen.getByRole("button", { name: "End session" })).toHaveFocus();
  });

  it("Esc cancels the ConfirmSheet; End session calls end() and goes to the summary", async () => {
    const user = userEvent.setup();
    renderSession();
    await user.click(screen.getByRole("button", { name: "End session" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: "End session" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "End session" }));
    expect(useSessionStore.getState().step.kind).toBe("summary");
    expect(await screen.findByText("summary route")).toBeInTheDocument();
  });

  it("redirects Home when there is no session (reload on /session)", () => {
    resetSession();
    renderSession();
    expect(screen.getByText("home route")).toBeInTheDocument();
  });
});
