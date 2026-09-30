import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const repo = '/tmp/tgp-op80-backend-compose.git';
const base = 'c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7';
const candidate = 'a8908132a9c4882dbe80f9fbc1052532c7e68c3b';
const output = '/home/user/workspace/operator80/execution/recovery-sequencing/measurements.json';
const lines = execFileSync('git', [
  `--git-dir=${repo}`, 'diff', '--numstat', base, candidate,
], { encoding: 'utf8' }).trim().split('\n');
const rows = lines.map((line) => {
  const [added, removed, path] = line.split('\t');
  return { path, added: Number(added), removed: Number(removed) };
});
const workflowIncludes = (path) =>
  /^(src\/|test\/|prisma\/migrations\/|scripts\/|\.github\/workflows\/)/.test(path)
  || path === 'dangerfile.js' || /^[^/]+\.config\.json$/.test(path);
const summarize = (name, paths) => {
  const members = rows.filter(({ path }) => paths.includes(path));
  if (members.length !== paths.length) throw new Error(`Missing or duplicate path in ${name}`);
  const sum = (filter, key) => members.filter(filter).reduce((total, row) => total + row[key], 0);
  const productionAdded = sum(({ path }) => path.startsWith('src/'), 'added');
  const testAdded = sum(({ path }) => path.startsWith('test/'), 'added');
  return {
    name,
    workflowNet: members.filter(({ path }) => workflowIncludes(path))
      .reduce((total, row) => total + row.added - row.removed, 0),
    srcAdded: productionAdded,
    testAdded,
    testToSrcAdded: productionAdded ? testAdded / productionAdded : null,
    note: 'Read-only grouping, not a reconstructed or independently runnable PR. src-only density is not the wider canonical denominator.',
    paths: members,
  };
};
const diagnosticPaths = [
  'src/filters/http-exception.filter.ts',
  'src/observability/orm-diagnostics.ts',
  'src/observability/sentry-config.ts',
  'test/scout/scout-diagnostics.integrity.spec.ts',
];
const validationPaths = [
  'src/scout/scout-ingest.controller.ts',
  'src/scout/scout-ingest.dto.ts',
  'src/scout/scout-ingest.service.ts',
  'src/scout/scout-ingest.validation.ts',
  'scripts/importer-contract.ts',
  'docs/contracts/importer-openapi.json',
  'test/scout/scout-ingest.integrity.spec.ts',
];
const databasePaths = [
  'prisma/migrations/20261224000100_scout_ingest_entity_type_uniqueness/down.sql',
  'prisma/migrations/20261224000100_scout_ingest_entity_type_uniqueness/migration.sql',
  'prisma/schema.prisma',
  'src/scout/scout-reconstruct.service.ts',
  'test/rls-scout-ingest-uniqueness.spec.ts',
  'test/utils/scout-ingest-db.ts',
  'test/scout/scout-live-target.spec.ts',
  '.github/workflows/ci.yml',
  'test/scout/scout-ingest-ci.spec.ts',
];
const covered = new Set([...diagnosticPaths, ...validationPaths, ...databasePaths]);
const result = {
  base, candidate,
  workflowDefinition: '.github/workflows/r100-quality-gate.yml:135-180; all src/test/migrations/scripts/workflow paths, not production-only',
  fullWorkflowNet: rows.filter(({ path }) => workflowIncludes(path))
    .reduce((total, row) => total + row.added - row.removed, 0),
  groups: [
    summarize('Independent diagnostics candidate', diagnosticPaths),
    summarize('Request validation candidate, excluding mixed idempotency tests', validationPaths),
    summarize('Database compatibility/proof kernel, excluding adjacent regression deltas', databasePaths),
  ],
  unassigned: rows.filter(({ path }) => !covered.has(path)),
  limitations: [
    'No product files changed, no composition or tests run.',
    'Some test files contain mixed concerns; file grouping is not a safe split.',
    'No test removal, gate exemption, approval or release readiness implied.',
  ],
};
if (result.fullWorkflowNet !== 1335) throw new Error(`Unexpected frozen delta: ${result.fullWorkflowNet}`);
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
