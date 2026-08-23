import fs from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
  }

  let body: { confirm?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (body.confirm !== 'RESET') {
    return NextResponse.json(
      { error: 'Confirmation failed. Send { "confirm": "RESET" } to wipe all student data.' },
      { status: 400 },
    )
  }

  const progressDeleted = db.prepare('DELETE FROM progress').run().changes
  const playersDeleted = db.prepare('DELETE FROM players').run().changes

  const entry = {
    action: 'admin_reset',
    at: new Date().toISOString(),
    players_deleted: playersDeleted,
    progress_deleted: progressDeleted,
  }
  try {
    const logPath = path.join(process.cwd(), 'data', 'admin-reset.log')
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n', 'utf8')
  } catch (err) {
    console.error('Failed to write admin reset log:', err)
  }

  return NextResponse.json({
    ok: true,
    playersDeleted,
    progressDeleted,
    message: `Cleared ${playersDeleted} player(s) and ${progressDeleted} progress row(s). Flag hashes preserved.`,
  })
}
