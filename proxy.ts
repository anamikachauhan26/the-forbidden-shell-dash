import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TOKEN, safeEqual } from '@/lib/admin-auth'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the admin login endpoints through.
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const authed = typeof token === 'string' && safeEqual(token, ADMIN_SESSION_TOKEN)

  if (pathname.startsWith('/api/admin/')) {
    if (!authed) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // /admin/* pages: redirect to the admin login page when unauthenticated.
  if (!authed) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
