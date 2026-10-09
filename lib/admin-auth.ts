// Server-only hardcoded admin credentials for the single invigilator/operator.
// Never imported from client components; never exposed via env or API.
export const ADMIN_USERNAME = 'TZadmin'
export const ADMIN_PASSWORD = 'TZadmin'

export const ADMIN_SESSION_COOKIE = 'admin_session'

// Static session token issued on successful admin login. The middleware and
// admin routes only ever compare against this value — the password itself
// never leaves this file.
export const ADMIN_SESSION_TOKEN = 'tfs-admin-7c4b9e21f6d8a350'

// Constant-time string compare in pure JS so this module stays Edge-runtime
// safe (proxy.ts imports it, and Edge cannot load node:crypto).
export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0)
  }
  return diff === 0
}

export function checkAdminCredentials(username: unknown, password: unknown): boolean {
  return (
    typeof username === 'string' &&
    typeof password === 'string' &&
    safeEqual(username, ADMIN_USERNAME) &&
    safeEqual(password, ADMIN_PASSWORD)
  )
}

export function getAdminSessionFromRequest(request: Request): string | null {
  const header = request.headers.get('cookie') || ''
  const match = header.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function isAdminRequest(request: Request): boolean {
  const token = getAdminSessionFromRequest(request)
  return !!token && safeEqual(token, ADMIN_SESSION_TOKEN)
}
