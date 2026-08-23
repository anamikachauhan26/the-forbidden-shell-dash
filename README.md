# THE FORBIDDEN SHELL

A 15-level capture-the-flag (CTF) challenge built as a terminal-themed dashboard. Players register, log in with their PRN, hunt for flags hidden across the app, and submit them to climb the leaderboard.

Built with **Next.js (App Router)**, **React 19**, **Tailwind CSS v4**, and **shadcn/ui**-style components.

## Features

- Terminal-style UI ("The Forbidden Shell") with glowing CRT aesthetics
- PRN-only identity (9-digit student roll number) — no passwords by design
- Registration & login backed by SQLite (better-sqlite3, WAL mode)
- Strict sequential flag submission (level N unlocks only after level N-1)
- Flags stored as SHA-256 hashes only — plaintext answer key never ships with the app
- Rate limiting: 10 submissions/min per PRN, 1 req/s on the leaderboard endpoint
- Live leaderboard (auto-polls every 7s) + Vercel Analytics integration

## Project Structure

```
app/
  page.tsx              # Landing page
  register/             # Registration page
  login/                # Login page
  dashboard/            # Player dashboard (live progress)
  leaderboard/          # Leaderboard page (auto-refresh)
  api/
    register/route.ts   # POST - register a player, sets session cookie
    login/route.ts      # POST - login via PRN, sets session cookie
    submit-flag/route.ts# POST - sequential flag submission (rate limited)
    progress/route.ts   # GET  - solved levels for logged-in player
    leaderboard/route.ts# GET  - public leaderboard (full PRNs)
components/             # UI components (terminal-ui, shadcn)
lib/
  db.ts                 # SQLite singleton (WAL mode) + schema
  session.ts            # Cookie session helpers
scripts/
  seed-flags.ts         # One-time: seed SHA-256 hashes from flags.md
  reset-db.ts           # Wipe players/progress, keeps flag hashes
data/                   # SQLite database (gitignored)
```

## Database Setup

The app uses SQLite via better-sqlite3. The DB file is created automatically at `./data/tfs.db` on first run (override with `TFS_DB_PATH`, see `.env.example`).

Seed the flag hashes once before the session:

```bash
node scripts/seed-flags.ts path/to/flag.md
# or place the answer key at ./flags.md and run:
node scripts/seed-flags.ts
```

> **Security:** the plaintext flags file is gitignored — only SHA-256 hashes ever enter the database or git history.

Reset players/progress between test runs (flags are preserved):

```bash
node scripts/reset-db.ts
```

## Getting Started

### Prerequisites

- **Node.js** 18.18 or later (tested on Node 24)
- **pnpm** package manager

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

### Install dependencies

```bash
pnpm install
```

> Note: pnpm may warn about an ignored build script (`msw`). This is safe to ignore — it's a dev-only testing library and not required to run the app.

### Run the development server

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> If `pnpm dev` fails due to the dependency verification step, run Next.js directly:
>
> ```bash
> npx next dev
> ```

### Production build

```bash
pnpm build
pnpm start
```

## How to Play

1. Open the app at `http://localhost:3000`
2. **[ REGISTER ]** with your 9-digit PRN to create a player profile
3. **[ LOGIN ]** with the same PRN
4. Solve level N to unlock level N+1 — flags follow the `TFS{...}` format
5. Submit captured flags and climb the **[ LEADERBOARD ]** (ties broken by earliest last solve)

## API Summary

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/api/register` | POST | — | 409 if PRN exists; sets httpOnly session cookie |
| `/api/login` | POST | — | 404 if PRN unknown; sets session cookie |
| `/api/progress` | GET | cookie | Solved levels + next level for the player |
| `/api/submit-flag` | POST | cookie | Sequential enforcement; SHA-256 compare; 10 req/min per PRN (429 + Retry-After) |
| `/api/leaderboard` | GET | public | Full PRNs, sorted solved DESC then earliest last-solve ASC; 1 req/s per IP |
