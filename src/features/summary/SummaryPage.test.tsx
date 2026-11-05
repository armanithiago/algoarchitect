import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ItemResult, SessionSummary } from "@/domain/session/types";
import { idleSession } from "@/domain/session/types";
import { initialProfile, useProfileStore } from "@/stores/profile";
import { useSessionStore } from "@/stores/session";
import { SummaryPage } from "./SummaryPage";

const result = (n: number, correct: boolean, over: Partial<ItemResult> = {}): ItemResult => ({
  scenarioId: `graphs-00${n}`,
  concept: n === 1 ? "consistent-hashing" : "bfs",
  domain: n === 1 ? "hashing" : "graphs",
  pickedOptionId: "a",
  correct,
  xp: correct ? 10 : 0,
  validations: [],
  durationMs: 5000,
  ...over,
});

function summary(over: Partial<SessionSummary> = {}): SessionSummary {
  const results = [result(1, true), result(2, false), result(3, true)];
  return {
    total: 3,
    correct: 2,
    xpEarned: 40,
    durationMs: 278_000,
    results,
    practice: false,
    endedEarly: false,
    ...over,
  };
}

function renderSummary() {
  return render(
    <MemoryRouter initialEntries={["/summary"]}>
      <Routes>
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/" element={<p>home route</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useProfileStore.setState({ ...initialProfile, hydrated: true, xp: 140 });
  useSessionStore.setState({ ...idleSession, step: { kind: "summary" }, summary: summary() });
});
afterEach(() => useSessionStore.setState({ ...idleSession }));

describe("SummaryPage", () => {
  it("redirects Home when there is no summary", () => {
    useSessionStore.setState({ summary: null });
    renderSummary();
    expect(screen.getByText("home route")).toBeInTheDocument();
  });

  it("reads Session complete, count and duration, with focus on the heading", () => {
    renderSummary();
    const h = screen.getByRole("heading", { level: 1, name: "Session complete" });
    expect(h).toHaveFocus();
    expect(screen.getByText("3 scenarios · 4 min 38 s")).toBeInTheDocument();
    expect(screen.queryByText(/Practice/)).toBeNull();
  });

  it("shows the ring value, XP earned and level progress from the profile XP", () => {
    renderSummary();
    expect(screen.getByText("2/3")).toBeInTheDocument();
    expect(screen.getByText("2 of 3 correct")).toBeInTheDocument();
    expect(screen.getByText("+40 XP")).toBeInTheDocument();
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", { name: "Level 2 progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemax", "200");
  });

  it("lists concepts with result icon, domain dot and spoken result", () => {
    renderSummary();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Consistent hashing, Hashing & Heaps, correct");
    expect(items[1]).toHaveTextContent("Breadth-first search, Graphs & Routing, missed");
    expect(items[1]).toHaveAttribute("data-result", "missed");
    expect(items[1]!.querySelector("svg")).not.toBeNull();
    expect(items[1]!.querySelector('span[aria-hidden="true"].rounded-full')).not.toBeNull();
  });

  it("does not fake a streak block or a next-review line (Sprint 4)", () => {
    renderSummary();
    expect(screen.queryByText(/streak/i)).toBeNull();
    expect(screen.queryByText(/next review/i)).toBeNull();
    expect(screen.queryByText(/due/i)).toBeNull();
  });

  it("practice sessions say reviews are unchanged", () => {
    useSessionStore.setState({ summary: summary({ practice: true }) });
    renderSummary();
    expect(screen.getByText("Practice · reviews unchanged")).toBeInTheDocument();
  });

  it("collapses long concept lists behind a disclosure", async () => {
    const many = Array.from({ length: 8 }, (_, i) => result(i + 1, i % 2 === 0, { scenarioId: `graphs-00${i}` }));
    useSessionStore.setState({ summary: summary({ total: 8, correct: 4, results: many }) });
    renderSummary();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    const more = screen.getByRole("button", { name: /3 more/ });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(more);
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
  });

  it("Done resets the session and returns Home", async () => {
    renderSummary();
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(await screen.findByText("home route")).toBeInTheDocument();
    expect(useSessionStore.getState().summary).toBeNull();
    expect(useSessionStore.getState().step.kind).toBe("idle");
  });

  it("handles a session ended with no answers", () => {
    act(() => useSessionStore.setState({ summary: summary({ total: 0, correct: 0, results: [], xpEarned: 0 }) }));
    renderSummary();
    expect(screen.getByText("0/0")).toBeInTheDocument();
    expect(screen.queryByText("Concepts")).toBeNull();
    expect(within(document.body).getByRole("button", { name: "Done" })).toBeInTheDocument();
  });
});
