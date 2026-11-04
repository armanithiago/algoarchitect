import { Outlet } from "react-router-dom";

/** STUB: Agent B replaces this with the real shell (TopBar area + BottomTabBar, safe areas, OfflineBanner). */
export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col">
      <main className="flex-1 px-gutter pt-safe">
        <Outlet />
      </main>
    </div>
  );
}
