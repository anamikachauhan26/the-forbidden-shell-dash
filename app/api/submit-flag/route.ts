import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/db'
import { getPrnFromRequest, getPlayer } from '@/lib/session'

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

type Bucket = { tokens: number; last: number }
declare global {
  // eslint-disable-next-line no-var
  var __tfsBuckets: Map<string, Bucket> | undefined
}
const buckets = globalThis.__tfsBuckets ?? new Map<string, Bucket>()
globalThis.__tfsBuckets = buckets

function rateLimit(prn: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const refillPerMs = RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS
  const bucket = buckets.get(prn) ?? { tokens: RATE_LIMIT_MAX, last: now }
  bucket.tokens = Math.min(RATE_LIMIT_MAX, bucket.tokens + (now - bucket.last) * refillPerMs)
  bucket.last = now

  if (bucket.tokens < 1) {
    buckets.set(prn, bucket)
    return { ok: false, retryAfter: Math.ceil((1 - bucket.tokens) / refillPerMs / 1000) }
  }

  bucket.tokens -= 1
  buckets.set(prn, bucket)
  if (buckets.size > 5000) {
    for (const [key, b] of buckets) if (now - b.last > 60_000) buckets.delete(key)
  }
  return { ok: true, retryAfter: 0 }
}

export async function POST(request: Request) {
  const prn = getPrnFromRequest(request)
  if (!prn || !getPlayer(prn)) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const limit = rateLimit(prn)
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many submissions. Retry in ${limit.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: { level?: unknown; flag?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const level = typeof body.level === 'number' ? Math.trunc(body.level) : NaN
  const flag = typeof body.flag === 'string' ? body.flag.trim() : ''

  if (!Number.isInteger(level) || level < 1 || level > 30 || !flag) {
    return NextResponse.json({ error: 'Invalid submission. Provide a level (1-30) and flag.' }, { status: 400 })
  }

  const solvedRows = db
    .prepare('SELECT level FROM progress WHERE prn = ?')
    .all(prn) as { level: number }[]
  const solved = new Set(solvedRows.map((r) => r.level))
  const solvedCount = solved.size

  if (solved.has(level)) {
    return NextResponse.json({ error: 'Level already solved.' }, { status: 400 })
  }

  if (level !== solvedCount + 1) {
    return NextResponse.json(
      { error: `Level locked. Solve level ${solvedCount + 1} first.` },
      { status: 400 },
    )
  }

  const row = db.prepare('SELECT flag_hash FROM flags WHERE level = ?').get(level) as
    | { flag_hash: string }
    | undefined

  if (!row) {
    return NextResponse.json({ error: 'Flag not seeded for this level.' }, { status: 400 })
  }

  const submittedHash = createHash('sha256').update(flag, 'utf8').digest()
  const expectedHash = Buffer.from(row.flag_hash, 'hex')

  if (submittedHash.length !== expectedHash.length || !timingSafeEqual(submittedHash, expectedHash)) {
    return NextResponse.json({ error: 'Incorrect flag.' }, { status: 400 })
  }

  try {
    db.prepare('INSERT INTO progress (prn, level) VALUES (?, ?)').run(prn, level)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      String((err as { code?: string }).code).startsWith('SQLITE_CONSTRAINT')
    ) {
      return NextResponse.json({ error: 'Level already solved.' }, { status: 400 })
    }
    throw err
  }

  return NextResponse.json({ ok: true, solved: level, nextLevel: Math.min(30, level + 1) })
}
