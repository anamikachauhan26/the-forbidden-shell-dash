// Shared SQLite opener for the ops scripts (seed/reset).
// Plain Node.js — no TypeScript runner required:
//   node scripts/seed-flags.mjs path/to/flags.md
// Keep the schema in sync with lib/db.ts.
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export const DB_PATH =
  process.env.TFS_DB_PATH || path.join(process.cwd(), 'data', 'tfs.db');

export function openDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      prn        TEXT PRIMARY KEY CHECK (length(prn) = 9 AND prn NOT GLOB '*[^0-9]*'),
      name       TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE TABLE IF NOT EXISTS flags (
      level     INTEGER PRIMARY KEY CHECK (level BETWEEN 1 AND 30),
      flag_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress (
      prn       TEXT NOT NULL REFERENCES players(prn),
      level     INTEGER NOT NULL CHECK (level BETWEEN 1 AND 30),
      solved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      PRIMARY KEY (prn, level)
    );
  `);

  return db;
}

export const db = openDb();
