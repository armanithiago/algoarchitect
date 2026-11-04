/** Debounced async saver with an explicit flush (for visibilitychange/pagehide). Framework-free. */
export interface DebouncedSaver {
  schedule: () => void;
  /** Runs a pending save now. Resolves when it is written. Never rejects. */
  flush: () => Promise<void>;
  cancel: () => void;
  readonly pending: boolean;
}

export function createDebouncedSaver(save: () => Promise<void>, delayMs = 150): DebouncedSaver {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let dirty = false;
  let inFlight: Promise<void> = Promise.resolve();

  const run = (): Promise<void> => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (!dirty) return inFlight;
    dirty = false;
    inFlight = inFlight.then(save).catch(() => undefined);
    return inFlight;
  };

  return {
    schedule() {
      dirty = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void run(), delayMs);
    },
    flush: run,
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      dirty = false;
    },
    get pending() {
      return dirty;
    },
  };
}
