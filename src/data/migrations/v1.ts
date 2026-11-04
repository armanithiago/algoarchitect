import type { Migration } from "./types";

/** Initial schema (sprint plan §4.3). Only indexed fields are listed; other fields are free-form. */
export const v1: Migration = {
  version: 1,
  description: "Initial stores: reviews, attempts, profile, eventQueue, reading, meta",
  stores: {
    reviews: "scenarioId",
    attempts: "++id, scenarioId, concept, domain, timestamp",
    profile: "id",
    eventQueue: "++id",
    reading: "chapterId",
    meta: "key",
  },
};
