/**
 * MIGRATIONS. The ordered list of schema versions of the `algoarchitect` database.
 *
 * HOW TO ADD THE NEXT ONE (e.g. v2)
 *  1. Create `v2.ts` exporting a `Migration` with `version: 2`, the `stores` that are new or whose
 *     indexes change, and, only if existing rows need new fields, an `upgrade(tx)` that ADDS or
 *     BACKFILLS fields (`tx.table("x").toCollection().modify(...)`).
 *  2. Append it to `migrations` below. Never edit, reorder or remove an earlier entry: devices in the
 *     field are at any old version and upgrade through every step in order.
 *  3. Add a test like the v2 example in `src/data/db.test.ts`: build a database at the previous version
 *     with realistic user data, open it with the new list, assert every old row survived.
 *  4. Update the row types in `../types.ts` (new fields optional or backfilled).
 *
 * RULE: migrations never destroy user data. No dropping a store, no deleting rows, no overwriting a
 * field with a lossy value. Prefer additive changes; if a shape must change, copy into the new field and
 * keep the old one until a later, explicitly reviewed release (risks R3/R4).
 */
import type { Migration } from "./types";
import { v1 } from "./v1";

export const migrations: readonly Migration[] = [v1];

export const CURRENT_SCHEMA_VERSION = migrations[migrations.length - 1]!.version;
