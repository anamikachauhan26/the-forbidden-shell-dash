import { NextResponse } from 'next/server'
import { getAllPlayerStats } from '@/lib/stats'

const MIN_INTERVAL_MS = 1000

type LastHit = { t: number }
declare global {
  // eslint-disable-next-line no-var
  var __tfsLbHits: Map<string, LastHit> | undefined
}
const hits = globalThis.__tfsLbHits ?? new Map<string, LastHit>()
globalThis.__tfsLbHits = hits

function ipRateLimit(ip: string): boolean {
  const now = Date.now()
  const hit = hits.get(ip)
  if (hit && now - hit.t < MIN_INTERVAL_MS) return false
  hits.set(ip, { t: now })
  if (hits.size > 5000) {
    for (const [key, h] of hits) if (now - h.t > 60_000) hits.delete(key)
  }
  return true
}

export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'

  if (!ipRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Slow down.' },
      { status: 429, headers: { 'Retry-After': '1' } },
    )
  }

  const data = getAllPlayerStats().map((r) => ({
    prn: r.prn,
    levels_solved: r.levels_solved,
    last_solve_at: r.last_solve_at,
  }))

  return NextResponse.json({ data, updatedAt: new Date().toISOString() })
}
