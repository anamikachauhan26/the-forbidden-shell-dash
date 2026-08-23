import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { setSessionCookie } from '@/lib/session'

export async function POST(request: Request) {
  let body: { prn?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const prn = typeof body.prn === 'string' ? body.prn : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 32) : null

  if (!/^\d{9}$/.test(prn)) {
    return NextResponse.json({ error: 'Invalid PRN' }, { status: 400 })
  }

  try {
    db.prepare('INSERT INTO players (prn, name) VALUES (?, ?)').run(prn, name || null)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'SQLITE_CONSTRAINT_PRIMARYKEY'
    ) {
      return NextResponse.json({ error: 'PRN already registered' }, { status: 409 })
    }
    throw err
  }

  const res = NextResponse.json({ ok: true, prn, name }, { status: 201 })
  setSessionCookie(res, prn)
  return res
}
