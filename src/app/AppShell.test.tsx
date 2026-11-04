import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "@/features/home/HomePage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { StatsPage } from "@/features/stats/StatsPage";
import { StudyPage } from "@/features/study/StudyPage";
import { initialProfile, useProfileStore } from "@/stores/profile";
import { AppShell } from "./AppShell";

function renderApp(path = "/") {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "study", element: <StudyPage /> },
          { path: "stats", element: <StatsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

function goOffline() {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  act(() => {
    window.dispatchEvent(new Event("offline"));
  });
}
function goOnline() {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  act(() => {
    window.dispatchEvent(new Event("online"));
  });
}

beforeEach(() => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  act(() => {
    useProfileStore.setState({ ...initialProfile, hydrated: true });
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("AppShell navigation", () => {
  it("has the TopBar, a main region and the four-tab nav", () => {
    renderApp();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link").map((l) => l.textContent)).toEqual([
      "Play",
      "Study",
      "Stats",
      "Settings",
    ]);
    expect(within(nav).getByRole("link", { name: "Play" })).toHaveAttribute("aria-current", "page");
  });

  it("main is the scroller with contained overscroll and the column is capped at 30rem", () => {
    renderApp();
    const main = screen.getByRole("main");
    expect(main.className).toContain("overflow-y-auto");
    expect(main.className).toContain("overscroll-y-contain");
    expect(main.className).toContain("touch-manipulation");
    expect(main.firstElementChild?.className).toContain("max-w-content");
  });

  it.each([
    ["Study", "/study"],
    ["Stats", "/stats"],
    ["Settings", "/settings"],
  ])("tapping %s navigates, titles the TopBar and moves aria-current", (label, path) => {
    renderApp();
    fireEvent.click(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: label }));
    expect(screen.getByRole("heading", { level: 1, name: label })).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    const current = screen.getAllByRole("link").filter((l) => l.getAttribute("aria-current") === "page");
    expect(current.map((l) => l.textContent)).toEqual([label]);
    expect(current[0]).toHaveAttribute("href", path);
  });

  it("deep link to /stats starts on Stats", () => {
    renderApp("/stats");
    expect(screen.getByRole("heading", { level: 1, name: "Stats" })).toBeInTheDocument();
  });
});

describe("AppShell offline indicator", () => {
  it("appears after 1 s offline, never before", () => {
    vi.useFakeTimers();
    renderApp();
    goOffline();
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.queryByText(/Offline\. Everything works/)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Offline. Everything works; progress is saved on this device.",
    );
  });

  it("shows 'Back online.' for 2 s when the connection returns, then collapses", () => {
    vi.useFakeTimers();
    renderApp();
    goOffline();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    goOnline();
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Back online.");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("status")).toHaveAttribute("data-state", "hidden");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByRole("status")).not.toHaveTextContent("Back online.");
  });

  it("is dismissible and stays dismissed when navigating between tabs", () => {
    vi.useFakeTimers();
    renderApp();
    goOffline();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByText(/Offline\. Everything works/)).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText(/Offline\. Everything works/)).toBeNull();
  });

  it("shows on every tab and the app keeps working offline", () => {
    vi.useFakeTimers();
    renderApp();
    goOffline();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    for (const tab of ["Study", "Stats", "Settings", "Play"]) {
      fireEvent.click(screen.getByRole("link", { name: tab }));
      expect(screen.getByRole("status")).toHaveTextContent("Offline.");
    }
    expect(screen.getByRole("button", { name: "Start session" })).toBeInTheDocument();
  });
});
