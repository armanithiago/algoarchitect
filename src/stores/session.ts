/**
 * CONTRACT: `useSessionStore` implements `SessionStore` from src/domain/session/types.ts.
 * STUB: Agent L replaces the body (pure machine in src/domain/session/, selector, loader, attempt recording,
 * XP award) and keeps the exported name and the types. Agent U builds the screens against this API.
 */
import { create } from "zustand";
import { idleSession, type SessionStore } from "@/domain/session/types";

export const useSessionStore = create<SessionStore>()((set) => ({
  ...idleSession,
  start: async () => {},
  select: () => {},
  check: () => {},
  continueFromVerdict: () => {},
  nextScenario: () => {},
  end: () => {},
  reset: () => set({ ...idleSession }),
}));
