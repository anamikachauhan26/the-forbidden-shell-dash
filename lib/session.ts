import { createHmac, timingSafeEqual } from 'crypto'
import type { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'session'

function sign(prn: string): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET is not set')
  return createHmac('sha256', secret).update(prn).digest('hex')
}

export function setSessionCookie(res: NextResponse, prn: string) {
  res.cookies.set(SESSION_COOKIE, `${prn}.${sign(prn)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export function getPrnFromRequest(request: Request): string | null {
  const header = request.headers.get('cookie') || ''
  const match = header.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`))
  if (!match) return null
  let raw: string
  try {
    raw = decodeURIComponent(match[1]).trim()
  } catch {
    return null
  }
  const [prn, sig] = raw.split('.')
  if (!prn || !sig || !/^\d{9}$/.test(prn)) return null
  const expected = sign(prn)
  if (sig.length !== expected.length) return null
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? prn : null
}

export function getPlayer(prn: string): { prn: string; name: string | null } | undefined {
  return db.prepare('SELECT prn, name FROM players WHERE prn = ?').get(prn) as
    | { prn: string; name: string | null }
    | undefined
}
