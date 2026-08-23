# THE FORBIDDEN SHELL

A 15-level capture-the-flag (CTF) challenge built as a terminal-themed dashboard. Players register, log in with their PRN, hunt for flags hidden across the app, and submit them to climb the leaderboard.

Built with **Next.js (App Router)**, **React 19**, **Tailwind CSS v4**, and **shadcn/ui**-style components.

## Features

- Terminal-style UI ("The Forbidden Shell") with glowing CRT aesthetics
- User registration & login (PRN-based, 9-digit validation)
- Flag submission API (`/api/submit-flag`)
- Live leaderboard (`/leaderboard`)
- Vercel Analytics integration

## Project Structure

```
app/
  page.tsx              # Landing page
  register/             # Registration page
  login/                # Login page
  dashboard/            # Player dashboard
  leaderboard/          # Leaderboard page
  api/
    register/route.ts   # POST - register a player
    login/route.ts      # POST - login via PRN
    submit-flag/route.ts# POST - submit a captured flag
    leaderboard/route.ts# GET  - leaderboard data
components/             # UI components (terminal-ui, shadcn)
lib/                    # Utilities
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
2. **[ REGISTER ]** with your details to create a player profile
3. **[ LOGIN ]** using your 9-digit PRN
4. Explore the app and find flags the system forgot to close
5. Submit captured flags and climb the **[ LEADERBOARD ]**
