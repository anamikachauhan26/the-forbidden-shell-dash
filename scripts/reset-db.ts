import { db, DB_PATH } from '../lib/db.ts'

db.prepare('DELETE FROM progress').run()
db.prepare("DELETE FROM players").run()

const players = db.prepare('SELECT COUNT(*) AS c FROM players').get() as { c: number }
const progress = db.prepare('SELECT COUNT(*) AS c FROM progress').get() as { c: number }
const flags = db.prepare('SELECT COUNT(*) AS c FROM flags').get() as { c: number }

console.log(`Reset complete for ${DB_PATH}`)
console.log(`players=${players.c} progress=${progress.c} flags=${flags.c} (flags preserved)`)
