import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAllPlayerStats } from '@/lib/stats'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
  }

  const stats = getAllPlayerStats()
  const students = stats.length
  const totalFlagsSubmitted = stats.reduce((sum, s) => sum + s.levels_solved, 0)

  return NextResponse.json({
    students,
    totalFlagsSubmitted,
    updatedAt: new Date().toISOString(),
  })
}
