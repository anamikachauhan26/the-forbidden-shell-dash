import type { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'session'

export function setSessionCookie(res: NextResponse, prn: string) {
  res.cookies.set(SESSION_COOKIE, prn, {
    httpOnly: true,
    sameSite: 'lax',
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
  let prn: string
  try {
    prn = decodeURIComponent(match[1]).trim()
  } catch {
    return null
  }
  // Reject prefix collisions (e.g. a 10-digit value must not auth as its
  // first 9 digits) by validating the whole cookie value.
  return /^\d{9}$/.test(prn) ? prn : null
}

export function getPlayer(prn: string): { prn: string; name: string | null } | undefined {
  return db.prepare('SELECT prn, name FROM players WHERE prn = ?').get(prn) as
    | { prn: string; name: string | null }
    | undefined
}
