import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BottomTabBar } from "./BottomTabBar";

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomTabBar />
    </MemoryRouter>,
  );
}

describe("BottomTabBar", () => {
  it("is a labelled nav with exactly four links in order", () => {
    renderAt("/");
    const nav = screen.getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Play", "Study", "Stats", "Settings"]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/", "/study", "/stats", "/settings"]);
    expect(within(nav).queryByRole("tablist")).toBeNull();
  });

  it.each([
    ["/", "Play"],
    ["/study", "Study"],
    ["/stats", "Stats"],
    ["/settings", "Settings"],
  ])("marks only the active page with aria-current at %s", (path, label) => {
    renderAt(path);
    const current = screen.getAllByRole("link").filter((l) => l.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent(label);
  });

  it("is opaque (surface background, no blur or transparency)", () => {
    renderAt("/");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.className).toContain("bg-surface");
    expect(nav.className).not.toMatch(/blur|backdrop|\/\d+/);
    expect(nav.className).toContain("env(safe-area-inset-bottom");
  });

  it("each tab column is at least 48 px tall (64 px bar)", () => {
    renderAt("/");
    expect(screen.getByRole("navigation", { name: "Main" }).firstElementChild?.className).toContain("h-16");
  });
});
