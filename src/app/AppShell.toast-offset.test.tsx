import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "./AppShell";

describe("AppShell toast offset", () => {
  it("lifts toasts above the tab bar while mounted and clears it on unmount", () => {
    const { unmount } = render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(document.documentElement.style.getPropertyValue("--toast-offset-bottom")).toBe("var(--size-tabbar)");
    unmount();
    expect(document.documentElement.style.getPropertyValue("--toast-offset-bottom")).toBe("");
  });
});
