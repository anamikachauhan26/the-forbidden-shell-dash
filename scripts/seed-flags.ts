import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { db, DB_PATH } from '../lib/db.ts'

const LEVELS = 30

const fileArg = process.argv[2]
const candidates = [
  fileArg,
  path.join(process.cwd(), 'flags.md'),
].filter(Boolean) as string[]

const flagsFile = candidates.find((p) => fs.existsSync(p))

if (!flagsFile) {
  console.error(`ERROR: flags file not found.\nLooked in: ${candidates.join(', ')}`)
  console.error('Usage: node scripts/seed-flags.ts [path/to/flag.md]')
  process.exit(1)
}

if (!process.argv[2] && !/flag/i.test(path.basename(flagsFile))) {
  console.error(`ERROR: refusing to seed from suspiciously named file: ${flagsFile}`)
  process.exit(1)
}

const text = fs.readFileSync(flagsFile, 'utf8')
const flags: string[] = []
for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^\s*\|\s*(\d{1,2})\s*\|[^|]*\|\s*`(TFS\{[^}]+\})`/)
  if (!m) continue
  const level = Number(m[1])
  if (level !== flags.length + 1) continue
  flags.push(m[2])
}
if (new Set(flags).size !== flags.length) {
  console.error('ERROR: duplicate flags found in source file.')
  process.exit(1)
}

if (flags.length !== LEVELS) {
  console.error(`ERROR: expected ${LEVELS} flags in ${flagsFile}, found ${flags.length}.`)
  process.exit(1)
}

const insert = db.prepare(
  'INSERT OR REPLACE INTO flags (level, flag_hash) VALUES (?, ?)'
)

const seedAll = db.transaction(() => {
  for (let i = 0; i < LEVELS; i++) {
    const flag = flags[i]
    const hash = createHash('sha256').update(flag, 'utf8').digest('hex')
    insert.run(i + 1, hash)
    console.log(`level ${String(i + 1).padStart(2, '0')} -> ${hash}`)
  }
})

seedAll()

const count = db.prepare('SELECT COUNT(*) AS c FROM flags').get() as { c: number }
console.log(`\nSeeded ${count.c} flag hashes into ${DB_PATH}`)
console.log(`Source file (plaintext): ${flagsFile} — keep it out of git.`)
