// Evidence-only runner: a new synthetic database on the existing loopback test cluster.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');

const root = '/tmp/tgp-op80-c1-build';
const evidence = '/home/user/workspace/operator80/execution/c1-migration';
const database = 'op80_c1_migration_20260917';
const expectedTree = '3c3d09cf95851fb91e66ed20fe770a1a8164845c';
const password = fs.readFileSync('/tmp/tgp-op80-postgres/password', 'utf8').trim();
const { Client } = require('/home/user/workspace/operator80/execution/c1-migration-tooling/node_modules/pg');
const config = { host: '127.0.0.1', port: 55480, user: 'op80_test', password };
const checks = [];
const admin = new Client({ ...config, database: 'postgres' });
let db;
let lock;
let prisma;
let migrationMs;
let plan;
let version;
const original = `${root}/prisma/migrations/20261222000000_add_extension_pair_codes/migration.sql`;
const migration = `${root}/prisma/migrations/20270116000000_add_pair_import_intent/migration.sql`;
const down = `${root}/prisma/migrations/20270116000000_add_pair_import_intent/down.sql`;
const tree = () => execFileSync('git', ['-C', root, 'write-tree'], { encoding: 'utf8' }).trim();
const sql = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => crypto.createHash('sha256').update(sql(file)).digest('hex');
const record = (name) => checks.push({ name, status: 'PASS' });
const requiredError = async (work, code) => {
  let caught;
  try { await work(); } catch (error) { caught = error; }
  assert.ok(caught, `Expected failure ${code}`);
  assert.equal(caught.code, code);
};
const policySnapshot = async () => {
  const policies = await db.query(`SELECT policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE schemaname='public' AND tablename='ExtensionPairCode'
    ORDER BY policyname`);
  const table = await db.query(`SELECT relrowsecurity, relforcerowsecurity FROM pg_class
    WHERE oid='"ExtensionPairCode"'::regclass`);
  return { policies: policies.rows, table: table.rows };
};

async function main() {
  assert.equal(tree(), expectedTree);
  assert.equal(process.env.NODE_ENV, 'test');
  fs.mkdirSync(evidence, { recursive: true });
  await admin.connect();
  assert.equal((await admin.query('SELECT host(inet_server_addr()) AS host')).rows[0].host, '127.0.0.1');
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [database]);
  assert.equal(exists.rowCount, 0, 'Refusing to reuse or overwrite an existing database');
  await admin.query(`CREATE DATABASE ${database}`);
  record('new loopback-only synthetic database, no existing database reused');
  db = new Client({ ...config, database });
  lock = new Client({ ...config, database });
  await db.connect();
  await lock.connect();
  version = (await db.query('SHOW server_version')).rows[0].server_version;
  // Minimal referenced User fixture, not the full application migration chain.
  await db.query(`CREATE TYPE "Role" AS ENUM ('student','coach','owner','sub_coach');
    CREATE TABLE "User" ("id" TEXT PRIMARY KEY, "role" "Role" NOT NULL,
      "deleted_at" TIMESTAMP(3));
    INSERT INTO "User" VALUES ('coach-a','coach',NULL),('coach-b','coach',NULL),
      ('owner-c','owner',NULL),('sub-d','sub_coach',NULL);`);
  await db.query(sql(original));
  await db.query(`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    GRANT SELECT,INSERT,UPDATE,DELETE ON "ExtensionPairCode" TO anon,authenticated,service_role;
    GRANT SELECT ON "User" TO service_role;
    INSERT INTO "ExtensionPairCode" (id,code,coach_id,chosen_platform,expires_at)
    SELECT 'legacy-'||n, lpad(n::text,6,'0'),'coach-a','synthetic',
      CURRENT_TIMESTAMP + interval '2 minutes' FROM generate_series(0,9999) n;`);
  const beforePolicy = await policySnapshot();
  assert.equal(beforePolicy.policies.length, 2);
  assert.deepEqual(beforePolicy.table, [{ relrowsecurity: true, relforcerowsecurity: true }]);
  record('original table migration applied with forced restrictive RLS');

  await lock.query('BEGIN; LOCK TABLE "ExtensionPairCode" IN ROW EXCLUSIVE MODE');
  await db.query("SET lock_timeout='200ms'");
  await requiredError(() => db.query(sql(migration)), '55P03');
  await lock.query('ROLLBACK');
  await db.query("SET lock_timeout='5s'");
  assert.equal((await db.query(`SELECT 1 FROM information_schema.columns
    WHERE table_name='ExtensionPairCode' AND column_name='import_intent_id'`)).rowCount, 0);
  record('migration correctly demonstrated writer-lock contention without partial column creation');

  const start = performance.now();
  await db.query(sql(migration));
  migrationMs = performance.now() - start;
  assert.deepEqual(await policySnapshot(), beforePolicy);
  record('up migration preserves exact existing RLS policy definitions and force flags');
  const legacy = await db.query(`SELECT count(*)::int AS total,
    count(import_intent_id)::int AS bound FROM "ExtensionPairCode"`);
  assert.deepEqual(legacy.rows, [{ total: 10000, bound: 0 }]);
  record('ten thousand legacy rows remain unbound, multiple NULLs allowed');

  const fixedId = crypto.randomUUID();
  await db.query(`INSERT INTO "ExtensionPairCode"
    (id,code,coach_id,chosen_platform,expires_at,import_intent_id)
    VALUES ('bound','990001','coach-a','synthetic',CURRENT_TIMESTAMP,$1)`, [fixedId]);
  await requiredError(() => db.query(`INSERT INTO "ExtensionPairCode"
    (id,code,coach_id,chosen_platform,expires_at,import_intent_id)
    VALUES ('duplicate','990002','coach-a','synthetic',CURRENT_TIMESTAMP,$1)`, [fixedId]), '23505');
  record('database unique constraint rejects duplicate non-null intent IDs');

  for (const role of ['anon', 'authenticated']) {
    await db.query(`SET ROLE ${role}`);
    assert.equal((await db.query('SELECT * FROM "ExtensionPairCode"')).rowCount, 0);
    await requiredError(() => db.query(`INSERT INTO "ExtensionPairCode"
      (id,code,coach_id,chosen_platform,expires_at)
      VALUES ('denied','999999','coach-a','synthetic',CURRENT_TIMESTAMP)`), '42501');
    assert.equal((await db.query(`UPDATE "ExtensionPairCode" SET chosen_platform='forbidden'`)).rowCount, 0);
    assert.equal((await db.query('DELETE FROM "ExtensionPairCode"')).rowCount, 0);
    await db.query('RESET ROLE');
    record(`${role}: select/write isolation remains enforced after migration`);
  }
  await db.query('SET ROLE service_role');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM "ExtensionPairCode"')).rows[0].n, 10001);
  await db.query('RESET ROLE');
  record('existing service-role access survives unchanged');

  // Invoke the unchanged frozen production service against real Prisma/PostgreSQL.
  require(`${root}/node_modules/ts-node`).register({ project: `${root}/tsconfig.json` });
  const { PrismaClient } = require(`${root}/node_modules/@prisma/client`);
  const { ExtensionPairService } = require(`${root}/src/extension-pair/extension-pair.service.ts`);
  prisma = new PrismaClient({ datasources: { db: {
    url: `postgresql://op80_test:${encodeURIComponent(password)}@127.0.0.1:55480/${database}?schema=public`,
  } } });
  const service = new ExtensionPairService(prisma, {});
  const init = await service.init('coach-a', 'synthetic');
  assert.match(init.import_intent_id, /^[0-9a-f-]{36}$/);
  const own = await service.session('coach-a', init.import_intent_id);
  assert.deepEqual(Object.keys(own).sort(), ['chosen_platform', 'import_intent_id', 'status']);
  assert.equal(own.status, 'pending');
  assert.equal(own.import_intent_id, init.import_intent_id);
  assert.equal(own.chosen_platform, 'synthetic');
  record('real production init/session persist one server ID and return credential-free setup');

  const notFound = async (owner, id) => {
    let failure;
    try { await service.session(owner, id); } catch (error) { failure = error; }
    assert.ok(failure);
    assert.equal(failure.getStatus(), 404);
    return failure.message;
  };
  assert.equal(await notFound('coach-b', init.import_intent_id),
    await notFound('coach-a', crypto.randomUUID()));
  record('real Prisma owner predicate makes foreign and unknown lookups indistinguishable');
  await db.query(`UPDATE "ExtensionPairCode" SET used_at=CURRENT_TIMESTAMP,
    expires_at=CURRENT_TIMESTAMP - interval '1 day' WHERE import_intent_id=$1`, [init.import_intent_id]);
  assert.equal((await service.session('coach-a', init.import_intent_id)).status, 'paired');
  record('paired setup lookup survives expired code TTL');
  await db.query(`UPDATE "User" SET role='student' WHERE id='coach-a'`);
  await notFound('coach-a', init.import_intent_id);
  await db.query(`UPDATE "User" SET role='coach',deleted_at=CURRENT_TIMESTAMP WHERE id='coach-a'`);
  await notFound('coach-a', init.import_intent_id);
  await db.query(`UPDATE "User" SET deleted_at=NULL WHERE id='coach-a'`);
  record('live role demotion and soft deletion deny previously owned setup');
  const legacyStatus = await service.status('coach-a', '000001');
  assert.equal(Object.hasOwn(legacyStatus, 'import_intent_id'), false);
  const ownerInit = await service.init('owner-c', 'synthetic');
  assert.equal((await service.session('owner-c', ownerInit.import_intent_id)).status, 'pending');
  let forbidden;
  try { await service.init('sub-d', 'synthetic'); } catch (error) { forbidden = error; }
  assert.equal(forbidden?.getStatus(), 403);
  record('legacy omission, owner eligibility and sub-coach rejection match frozen service');
  await db.query(`ANALYZE "ExtensionPairCode"`);
  plan = (await db.query(`EXPLAIN (ANALYZE,FORMAT JSON) SELECT *
    FROM "ExtensionPairCode" WHERE import_intent_id=$1`, [init.import_intent_id])).rows[0]['QUERY PLAN'];
  assert.match(JSON.stringify(plan), /ExtensionPairCode_import_intent_id_key/);
  record('known-ID database lookup uses the new unique index on the synthetic table');
  await db.query(`DELETE FROM "User" WHERE id='owner-c'`);
  assert.equal((await db.query(`SELECT 1 FROM "ExtensionPairCode" WHERE import_intent_id=$1`,
    [ownerInit.import_intent_id])).rowCount, 0);
  record('existing hard-account-delete cascade terminates retained setup');
  await prisma.$disconnect();
  prisma = null;
  const rowCount = (await db.query(`SELECT count(*)::int AS n FROM "ExtensionPairCode"`)).rows[0].n;
  await db.query(sql(down));
  assert.equal((await db.query(`SELECT count(*)::int AS n FROM "ExtensionPairCode"`)).rows[0].n, rowCount);
  assert.deepEqual(await policySnapshot(), beforePolicy);
  await db.query(sql(migration));
  assert.equal((await db.query(`SELECT count(import_intent_id)::int AS n FROM "ExtensionPairCode"`)).rows[0].n, 0);
  assert.deepEqual(await policySnapshot(), beforePolicy);
  record('disposable down/up preserves rows and RLS but destroys IDs, not an operational rollback');
  assert.equal(tree(), expectedTree);
  record('frozen source tree unchanged throughout parent proof');
  const result = {
    timestamp: new Date().toISOString(), verdict: 'BOUNDED_PROOF_PASS',
    tree: expectedTree, database, serverVersion: version,
    hashes: { original: hash(original), up: hash(migration), down: hash(down) },
    syntheticLegacyRows: 10000, uncontendedMigrationMs: migrationMs, checks, plan,
    limitations: [
      'PostgreSQL 18.6 differs from checked-in CI PostgreSQL 15.',
      'Original pairing migration plus minimal User fixture, not full migration-chain validation.',
      'Production service/storage predicates tested; HTTP guards, external token mint and full suite not exercised.',
      'Small synthetic timing is not production-size lock or latency evidence.',
      'No security/retention/idempotency blocker is waived; no consumer freeze or activation.',
    ],
  };
  fs.writeFileSync(path.join(evidence, 'RESULT.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ passed: checks.length, tree: expectedTree, database,
    migrationMs, serverVersion: version, checks }, null, 2));
}

main().catch((error) => {
  const message = String(error.stack || error).split(password).join('[REDACTED]');
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(path.join(evidence, 'FAILURE.log'), message + '\n');
  console.error(message);
  process.exitCode = 1;
}).finally(async () => {
  if (prisma) await prisma.$disconnect();
  if (lock) await lock.end();
  if (db) await db.end();
  await admin.end();
});
