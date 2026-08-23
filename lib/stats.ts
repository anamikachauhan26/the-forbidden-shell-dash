import { db } from '@/lib/db'

export type PlayerStat = {
  prn: string
  name: string | null
  levels_solved: number
  last_solve_at: string | null
}

export function getAllPlayerStats(): PlayerStat[] {
  return db
    .prepare(
      `SELECT p.prn AS prn,
              p.name AS name,
              COUNT(x.level) AS levels_solved,
              MAX(x.solved_at) AS last_solve_at
       FROM players p
       LEFT JOIN progress x ON x.prn = p.prn
       GROUP BY p.prn
       ORDER BY levels_solved DESC, last_solve_at ASC`
    )
    .all() as PlayerStat[]
}
