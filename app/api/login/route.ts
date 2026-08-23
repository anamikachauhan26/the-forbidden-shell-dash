import { NextResponse } from 'next/server'
import { getPlayer, setSessionCookie } from '@/lib/session'

export async function POST(request: Request) {
  let body: { prn?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const prn = typeof body.prn === 'string' ? body.prn : ''

  if (!/^\d{9}$/.test(prn)) {
    return NextResponse.json({ error: 'Invalid PRN' }, { status: 400 })
  }

  const player = getPlayer(prn)
  if (!player) {
    return NextResponse.json({ error: 'PRN not registered. Register first.' }, { status: 404 })
  }

  const res = NextResponse.json({ ok: true, prn, name: player.name })
  setSessionCookie(res, prn)
  return res
}
