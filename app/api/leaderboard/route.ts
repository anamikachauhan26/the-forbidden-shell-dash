import { NextResponse } from 'next/server'
import { getAllPlayerStats } from '@/lib/stats'

export const dynamic = 'force-dynamic'

const CACHE_MS = 3000
let cache: { at: number; body: string } | null = null

export async function GET() {
  const now = Date.now()
  if (!cache || now - cache.at > CACHE_MS) {
    const data = getAllPlayerStats().map((r) => ({
      prn: r.prn,
      levels_solved: r.levels_solved,
      last_solve_at: r.last_solve_at,
    }))
    cache = { at: now, body: JSON.stringify({ data, updatedAt: new Date(now).toISOString() }) }
  }
  return new NextResponse(cache.body, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
