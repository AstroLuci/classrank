import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "fs";
import path from "path";

let client: Client | null = null;
let ready: Promise<void> | null = null;

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (url) {
    return createClient({
      url,
      authToken: authToken || undefined,
    });
  }

  // Local/dev fallback: SQLite file on disk (no Turso account needed)
  const dataDir = path.join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  const filePath = path.join(dataDir, "classrank.db");
  return createClient({
    url: `file:${filePath}`,
  });
}

export function getDb(): Client {
  if (!client) {
    client = createDbClient();
  }
  return client;
}

export async function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const db = getDb();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS classes (
          code TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
    })();
  }
  await ready;
}
