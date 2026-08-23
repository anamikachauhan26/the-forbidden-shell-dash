import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPrnFromRequest, getPlayer } from '@/lib/session'

export async function GET(request: Request) {
  const prn = getPrnFromRequest(request)
  if (!prn || !getPlayer(prn)) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const rows = db
    .prepare('SELECT level FROM progress WHERE prn = ? ORDER BY level')
    .all(prn) as { level: number }[]

  const solvedLevels = rows.map((r) => r.level)

  return NextResponse.json({
    prn,
    name: getPlayer(prn)?.name ?? null,
    solvedLevels,
    solvedCount: solvedLevels.length,
    nextLevel: Math.min(15, solvedLevels.length + 1),
  })
}
