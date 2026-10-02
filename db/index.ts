import { Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

type Database = NeonDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { bbDb?: Database };

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Lazily create the pooled Neon client so builds without a database still succeed. */
export function getDb(): Database {
  if (globalForDb.bbDb) return globalForDb.bbDb;

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });
  globalForDb.bbDb = db;
  return db;
}

export { schema };
