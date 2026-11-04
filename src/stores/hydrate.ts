/**
 * CONTRACT: called once at startup by src/app/providers.tsx.
 * Agent C implements: open the database, load the profile into the stores, set `hydrated: true`.
 * It must never throw: if IndexedDB is unavailable, set `storageBlocked: true` and `hydrated: true`.
 */
import { useProfileStore } from "./profile";

// STUB: Agent C replaces this.
export async function hydrateStores(): Promise<void> {
  useProfileStore.setState({ hydrated: true });
}
