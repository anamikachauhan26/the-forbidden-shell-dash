import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { db } from '@/lib/db'
import { getAllPlayerStats } from '@/lib/stats'
import { isAdminRequest } from '@/lib/admin-auth'

function timestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
  }

  const stats = getAllPlayerStats()

  const progressRows = db
    .prepare('SELECT prn, level, solved_at FROM progress ORDER BY prn, level')
    .all() as { prn: string; level: number; solved_at: string }[]

  const byPrn = new Map<string, Map<number, string>>()
  for (const row of progressRows) {
    let levels = byPrn.get(row.prn)
    if (!levels) { levels = new Map(); byPrn.set(row.prn, levels) }
    levels.set(row.level, row.solved_at)
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'The Forbidden Shell'
  const sheet = workbook.addWorksheet('Results')

  sheet.columns = [
    { header: 'PRN', key: 'prn', width: 14 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Levels Solved', key: 'levels_solved', width: 14 },
    { header: 'Last Solve At', key: 'last_solve_at', width: 28 },
    { header: 'Created At', key: 'created_at', width: 28 },
    ...Array.from({ length: 30 }, (_, i) => ({
      header: `Level ${i + 1}`,
      key: `level_${i + 1}`,
      width: 28,
    })),
  ]

  for (const stat of stats) {
    const levels = byPrn.get(stat.prn)
    const createdAt = (
      db.prepare('SELECT created_at FROM players WHERE prn = ?').get(stat.prn) as
        | { created_at: string }
        | undefined
    )?.created_at ?? null

    const row: Record<string, string | number | null> = {
      prn: stat.prn,
      name: stat.name,
      levels_solved: stat.levels_solved,
      last_solve_at: stat.last_solve_at,
      created_at: createdAt,
    }
    for (let i = 1; i <= 30; i++) {
      row[`level_${i}`] = levels?.get(i) ?? null
    }
    sheet.addRow(row)
  }

  sheet.getRow(1).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="forbidden-shell-results-${timestamp()}.xlsx"`,
    },
  })
}
