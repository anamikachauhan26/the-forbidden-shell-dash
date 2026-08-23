import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const dbPath = process.env.TFS_DB_PATH || path.join(process.cwd(), 'data', 'tfs.db')

function openDb(): Database.Database {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')
  db.pragma('synchronous = NORMAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      prn        TEXT PRIMARY KEY CHECK (length(prn) = 9 AND prn NOT GLOB '*[^0-9]*'),
      name       TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE TABLE IF NOT EXISTS flags (
      level     INTEGER PRIMARY KEY CHECK (level BETWEEN 1 AND 15),
      flag_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress (
      prn       TEXT NOT NULL REFERENCES players(prn),
      level     INTEGER NOT NULL CHECK (level BETWEEN 1 AND 15),
      solved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      PRIMARY KEY (prn, level)
    );
  `)

  return db
}

declare global {
  // eslint-disable-next-line no-var
  var __tfsDb: Database.Database | undefined
}

export const db: Database.Database = globalThis.__tfsDb ?? openDb()

if (process.env.NODE_ENV !== 'production') globalThis.__tfsDb = db

export const DB_PATH = dbPath
