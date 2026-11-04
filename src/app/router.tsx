import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { HomePage } from "@/features/home/HomePage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { StatsPage } from "@/features/stats/StatsPage";
import { SessionPage } from "@/features/session/SessionPage";
import { StudyPage } from "@/features/study/StudyPage";
import { SummaryPage } from "@/features/summary/SummaryPage";

export const router = createBrowserRouter([
  // Full-screen flows: no tab bar (design system §7.6).
  { path: "/session", element: <SessionPage /> },
  { path: "/summary", element: <SummaryPage /> },
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
]);
