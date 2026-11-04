import { useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HomeHeader } from "@/features/home/HomeHeader";
import { useOfflineBanner } from "@/hooks/useOfflineBanner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { BottomTabBar } from "@/ui/components/BottomTabBar";
import { IconProvider } from "@/ui/components/Icon";
import { OfflineBanner } from "@/ui/components/OfflineBanner";
import { TopBar } from "@/ui/components/TopBar";

/** Title per route. Home has none: its TopBar shows the streak and level instead. */
const TITLES: Record<string, string> = {
  "/study": "Study",
  "/stats": "Stats",
  "/settings": "Settings",
};

/**
 * App scaffold (design system §4.7): TopBar, scrolling content, BottomTabBar.
 * The shell fills the dynamic viewport; only the content region scrolls, so the tab bar never moves.
 * The OfflineBanner sits under the TopBar on every tab and is dismissible for the session.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const title = TITLES[pathname];
  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef<HTMLElement>(null);
  const online = useOnlineStatus();
  const banner = useOfflineBanner(online);

  // A new tab starts at the top.
  useLayoutEffect(() => {
    scroller.current?.scrollTo?.(0, 0);
  }, [pathname]);

  return (
    <IconProvider>
      <div className="flex h-dvh min-h-dvh flex-col bg-canvas">
        <TopBar title={title} scrolled={scrolled}>
          {title ? null : <HomeHeader />}
        </TopBar>

        <div className="px-gutter shrink-0">
          <div className="mx-auto max-w-content">
            <OfflineBanner mode={banner.mode} onDismiss={banner.dismiss} />
          </div>
        </div>

        <main
          ref={scroller}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
          className="min-h-0 flex-1 touch-manipulation overflow-y-auto overscroll-y-contain"
        >
          <div className="px-gutter mx-auto flex min-h-full max-w-content flex-col">
            <Outlet />
          </div>
        </main>

        <BottomTabBar />
      </div>
    </IconProvider>
  );
}
