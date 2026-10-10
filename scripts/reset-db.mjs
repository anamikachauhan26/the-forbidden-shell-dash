// Wipe players + progress between test runs. Flag hashes are preserved.
// Runs with plain Node.js (no TypeScript runner required):
//   node scripts/reset-db.mjs
import { db, DB_PATH } from './db.mjs';

db.prepare('DELETE FROM progress').run();
db.prepare('DELETE FROM players').run();

const players = db.prepare('SELECT COUNT(*) AS c FROM players').get();
const progress = db.prepare('SELECT COUNT(*) AS c FROM progress').get();
const flags = db.prepare('SELECT COUNT(*) AS c FROM flags').get();

console.log(`Reset complete for ${DB_PATH}`);
console.log(`players=${players.c} progress=${progress.c} flags=${flags.c} (flags preserved)`);
