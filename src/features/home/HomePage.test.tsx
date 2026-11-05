import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { idleSession } from "@/domain/session/types";
import { useSessionStore } from "@/stores/session";
import { initialProfile, useProfileStore } from "@/stores/profile";
import { HomeHeader } from "./HomeHeader";
import { HomePage } from "./HomePage";

function setProfile(patch: Partial<typeof initialProfile>) {
  act(() => {
    useProfileStore.setState({ ...initialProfile, ...patch });
  });
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div data-testid="header">
                <HomeHeader />
              </div>
              <HomePage />
            </>
          }
        />
        <Route path="/session" element={<p>session route</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const realActions = {
  start: useSessionStore.getState().start,
};

beforeEach(() => {
  setProfile({ hydrated: true });
  act(() => useSessionStore.setState({ ...idleSession, ...realActions }));
});
afterEach(() => vi.useRealTimers());

describe("Home: first run", () => {
  it("reads the first-session copy and a level-1 empty XP bar", () => {
    renderHome();
    expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument();
    expect(screen.getByText("Your first session · 10 new scenarios · ~5 min")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("0/100 XP")).toBeInTheDocument();
  });

  it("header: flame style none with 0, and Level 1", () => {
    renderHome();
    const header = within(screen.getByTestId("header"));
    expect(header.getByRole("img", { name: /No active streak/ })).toHaveAttribute("data-state", "none");
    expect(header.getByRole("img", { name: "Level 1" })).toHaveTextContent("L1");
  });

  it("has an enabled Start session button", () => {
    renderHome();
    expect(screen.getByRole("button", { name: "Start session" })).not.toHaveAttribute("aria-disabled");
  });
});

describe("Home: normal", () => {
  it("shows level, XP progress, streak and the daily session card", () => {
    setProfile({ hydrated: true, xp: 420, streakCount: 12, streakDoneToday: true, freezesAvailable: 1 });
    renderHome();
    expect(screen.getByText("Level 3")).toBeInTheDocument();
    expect(screen.getByText("420/600 XP")).toBeInTheDocument();
    expect(screen.getByText("180 XP to Level 4")).toBeInTheDocument();
    expect(screen.queryByText(/first session/)).toBeNull();
    expect(screen.getByText("Daily session")).toBeInTheDocument();
    const header = within(screen.getByTestId("header"));
    expect(
      header.getByRole("img", { name: "12-day streak, today complete, 1 freeze available" }),
    ).toBeInTheDocument();
    expect(header.getByRole("img", { name: "Level 3" })).toBeInTheDocument();
  });

  it("does not warn about storage", () => {
    renderHome();
    expect(screen.queryByTestId("storage-blocked")).toBeNull();
  });
});

describe("Home: loading", () => {
  it("renders the CTA at once but aria-disabled, with a reason", () => {
    setProfile({ hydrated: false });
    renderHome();
    const cta = screen.getByRole("button", { name: "Start session" });
    expect(cta).toHaveAttribute("aria-disabled", "true");
    expect(cta).toHaveAccessibleDescription("Loading your progress");
    expect(screen.getByRole("heading", { name: "Today" }).closest("[aria-busy]")).toHaveAttribute("aria-busy", "true");
  });

  it("shows no data before hydration (no fake zeros) and hides placeholders from AT", () => {
    setProfile({ hydrated: false });
    renderHome();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText("Your first session · 10 new scenarios · ~5 min")).toBeNull();
    expect(screen.getByTestId("level-card").querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("paints the shimmer only after 150 ms, then swaps to data once hydrated (held for 300 ms)", () => {
    vi.useFakeTimers();
    setProfile({ hydrated: false });
    renderHome();
    const shimmer = () => document.querySelectorAll("[data-state='loading']").length;
    expect(shimmer()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(shimmer()).toBeGreaterThan(0);

    setProfile({ hydrated: true });
    expect(screen.queryByRole("progressbar")).toBeNull(); // still holding the skeleton
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start session" })).not.toHaveAttribute("aria-disabled");
  });

  it("a fast load never paints a skeleton", () => {
    vi.useFakeTimers();
    setProfile({ hydrated: false });
    renderHome();
    act(() => {
      vi.advanceTimersByTime(50);
    });
    setProfile({ hydrated: true });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.querySelectorAll("[data-state='loading']").length).toBe(0);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});

describe("Home: storage blocked", () => {
  it("shows the tinted warning card with the exact copy", () => {
    setProfile({ hydrated: true, storageBlocked: true });
    renderHome();
    const card = screen.getByTestId("storage-blocked");
    expect(card).toHaveAttribute("data-tone", "warning");
    expect(card).toHaveTextContent(
      "This browser mode can't save progress. You can play; nothing is kept after you close the app.",
    );
    // The app still works: CTA enabled.
    expect(screen.getByRole("button", { name: "Start session" })).not.toHaveAttribute("aria-disabled");
  });
});

describe("Home: start flow", () => {
  const question = { kind: "question", selectedOptionId: null, checked: false } as const;

  it("shows a loading state while start() resolves, then opens /session", async () => {
    let finish: () => void = () => {};
    useSessionStore.setState({
      start: () =>
        new Promise<void>((resolve) => {
          finish = () => {
            useSessionStore.setState({ step: question });
            resolve();
          };
        }),
    });
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: "Start session" }));
    const cta = screen.getByRole("button", { name: "Start session" });
    expect(cta).toHaveAttribute("aria-busy", "true");
    expect(cta).toHaveAttribute("aria-disabled", "true");
    await act(async () => finish());
    expect(await screen.findByText("session route")).toBeInTheDocument();
  });

  it("resumes a running session without calling start() again", async () => {
    const start = vi.fn(async () => {});
    useSessionStore.setState({ start, step: question });
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: "Start session" }));
    expect(await screen.findByText("session route")).toBeInTheDocument();
    expect(start).not.toHaveBeenCalled();
  });

  it("shows the load error EmptyState with a primary Reload when the store reports loadError", async () => {
    useSessionStore.setState({
      start: async () => {
        useSessionStore.setState({ loadError: "boom" } as never);
      },
    });
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: "Start session" }));
    expect(await screen.findByText("Couldn't load scenarios. Reload to try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toHaveAttribute("data-variant", "primary");
    expect(screen.queryByRole("button", { name: "Start session" })).toBeNull();
    useSessionStore.setState({ loadError: undefined } as never);
  });

  it("treats a rejected start() as a load failure", async () => {
    useSessionStore.setState({
      start: async () => {
        throw new Error("nope");
      },
    });
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: "Start session" }));
    expect(await screen.findByRole("button", { name: "Reload" })).toBeInTheDocument();
  });
});
