// AUD-OPUS-5 probe for backend #649: run the real migration.sql / down.sql / pre-deploy SELECT on PGlite (Postgres WASM).
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const WT = '/home/user/workspace/wt/aud-opus5-649';
const DIR = `${WT}/prisma/migrations/20270224000000_build_week_day1_consultation_copy`;
const UP = readFileSync(`${DIR}/migration.sql`, 'utf8');
const DOWN = readFileSync(`${DIR}/down.sql`, 'utf8');
const ORIG = readFileSync(`${WT}/prisma/migrations/20260506020000_add_build_week/migration.sql`, 'utf8');
const SELECT = readFileSync('/home/user/workspace/ops/aud-opus5-112/649-predeploy-select.sql', 'utf8');
const SEED = JSON.parse(readFileSync(`${WT}/prisma/seed-build-week.json`, 'utf8'));
const create = ORIG.slice(ORIG.indexOf('CREATE TABLE IF NOT EXISTS "BuildWeekDay"'), ORIG.indexOf(');', ORIG.indexOf('CREATE TABLE IF NOT EXISTS "BuildWeekDay"')) + 2);
const inserts = ORIG.split('\n').filter((l) => l.startsWith('INSERT INTO "BuildWeekDay"')).join('\n');
const PM = `CREATE TABLE "_prisma_migrations" (id text primary key, migration_name text, finished_at timestamptz, rolled_back_at timestamptz);`;
const snap = async (db) => (await db.query(`SELECT day_number, title, focus_area, narrative, prompt_questions, action_items, expected_artifact FROM "BuildWeekDay" ORDER BY day_number`)).rows;
const sel = async (db, label) => console.log(label, JSON.stringify((await db.query(SELECT)).rows[0]));
const fresh = async () => { const db = new PGlite(); await db.exec(create + '\nCREATE UNIQUE INDEX ON "BuildWeekDay"("day_number");\n' + inserts + '\n' + PM); return db; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const db = await fresh();
const before = await snap(db);
await sel(db, 'SELECT before up:');
await db.exec(UP);
const after = await snap(db);
await sel(db, 'SELECT after up :');
// DB vs seed (all 7 days, every field)
const seedNorm = SEED.map((d) => ({ day_number: d.day_number, title: d.title, focus_area: d.focus_area, narrative: d.narrative, prompt_questions: d.prompt_questions, action_items: d.action_items, expected_artifact: d.expected_artifact }));
const dbNorm = after.map((r) => ({ ...r, action_items: r.action_items.map((i) => ({ title: i.title, description: i.description, time_estimate_min: i.time_estimate_min })) }));
console.log('db after up == seed (all days, all fields):', eq(dbNorm, seedNorm));
console.log('days 2-7 untouched by up:', eq(before.slice(1), after.slice(1)));
await db.exec(UP);
console.log('second up is a no-op:', eq(after, await snap(db)));
await db.exec(DOWN);
const restored = await snap(db);
console.log('down restores original exactly:', eq(before, restored));
const raw = (await db.query(`SELECT action_items::text t FROM "BuildWeekDay" WHERE day_number=1`)).rows[0].t;
const raw0 = await (async () => { const d2 = await fresh(); return (await d2.query(`SELECT action_items::text t FROM "BuildWeekDay" WHERE day_number=1`)).rows[0].t; })();
console.log('down action_items jsonb text byte-identical to original load:', raw === raw0);
await db.exec(DOWN);
console.log('second down is a no-op:', eq(restored, await snap(db)));

// Drift scenarios
for (const [label, sql] of [
  ['drift focus_area edited', `UPDATE "BuildWeekDay" SET focus_area='Diagnostic and Baseline' WHERE day_number=1`],
  ['drift item title edited', `UPDATE "BuildWeekDay" SET action_items = jsonb_set(action_items,'{0,title}','"Complete the 40-point diagnostic quiz"') WHERE day_number=1`],
  ['no Day 1 row', `DELETE FROM "BuildWeekDay" WHERE day_number=1`],
  ['already new copy (seed re-run)', null],
  ['drift: description still names diagnostic under a new title', `UPDATE "BuildWeekDay" SET action_items = jsonb_set(action_items,'{0,title}','"Finish the intake"') WHERE day_number=1`],
]) {
  const d = await fresh();
  if (sql) await d.exec(sql); else await d.exec(UP);
  await sel(d, `SELECT [${label}]:`);
  try { await d.exec(UP); const r = (await d.query(`SELECT focus_area, action_items->0->>'title' t, action_items->0->>'description' de FROM "BuildWeekDay" WHERE day_number=1`)).rows[0]; console.log(`  up [${label}]: OK`, JSON.stringify(r ?? null)); }
  catch (e) { console.log(`  up [${label}]: RAISED`, e.message); }
}
