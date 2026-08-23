import { LeaderboardTable, Shell } from '@/components/terminal-ui'

export default function LeaderboardPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-xs text-amber-300">[ PUBLIC FEED // LIVE ]</p>
        <h1 className="text-2xl font-bold text-primary">Operator leaderboard</h1>
        <p className="mt-2 text-xs text-muted">Ranked by levels solved, then earliest last solve.</p>
        <p className="mt-1 text-xs text-muted/60">auto-refreshes every 7s</p>
        <div className="mt-8"><LeaderboardTable pollMs={7000} /></div>
      </div>
    </Shell>
  )
}
