import { NextResponse } from 'next/server'
import { checkAdminCredentials, ADMIN_SESSION_COOKIE, ADMIN_SESSION_TOKEN } from '@/lib/admin-auth'

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!checkAdminCredentials(body.username, body.password)) {
    return NextResponse.json({ error: 'ACCESS DENIED — invalid credentials.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4,
  })
  return res
}
