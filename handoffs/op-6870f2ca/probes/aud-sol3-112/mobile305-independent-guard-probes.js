'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const guard = require(path.resolve(process.argv[2], 'scripts/eas-update-guard.js'));
const args = ['--channel', 'clinic', '--environment', 'production', '--message', 'synthetic audit'];
const F = guard.FLAG;
const normal = [
  'EXPO_PUBLIC_API_URL=https://api.example.test/api',
  'EXPO_PUBLIC_SUPABASE_URL=https://abc.supabase.co',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.c3ludGhldGlj',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_syntheticpublicvalue',
  `${F}=true`,
].join('\n');
function runGuard({ argv = args, project = normal, account = '', env = {} } = {}) {
  const calls = [];
  const logs = [];
  const run = (cmd, argv, opts) => {
    calls.push({ cmd, argv, env: opts.env });
    if (argv[1] === 'env:get') return { status: 0, stdout: `${F}=true` };
    if (argv[1] === 'env:list') return { status: 0, stdout: argv.includes('project') ? project : account };
    if (argv[1] === 'update') return { status: 0 };
    throw new Error(`Unexpected synthetic command: ${argv.join(' ')}`);
  };
  const status = guard.main(argv, { run, env, log: (message) => logs.push(message) });
  return { status, calls, logs, published: calls.find((call) => call.argv[1] === 'update') };
}
let failed = 0;
let passed = 0;
function probe(name, body) {
  try { body(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failed++; console.log(`FAIL ${name}\n${error.message}`); }
}
probe('rollout option is forwarded without dropping clinic flags', () => {
  const x = runGuard({ argv: [...args, '--rollout-percentage', '10'] });
  assert.equal(x.status, 0);
  assert.ok(x.published.argv.includes('--rollout-percentage'), 'accepted --rollout-percentage=10 but update command silently omitted it');
  assert.equal(x.published.env.EXPO_PUBLIC_FF_CLIENT_TUTORIAL, 'true');
});
probe('successful OTA publish orchestrates source-map upload', () => {
  const x = runGuard();
  assert.equal(x.status, 0);
  assert.ok(x.calls.some((call) => call.argv.some((arg) => /sourcemaps|sentry-expo-upload/.test(arg))), 'only env:get, env:list, env:list, update were invoked; no source-map upload');
});
probe('remote parity refusal does not disclose a synthetic private value', () => {
  const canary = 'AUDIT_SYNTHETIC_PRIVATE_CONFIG_CANARY';
  const x = runGuard({ project: `${normal}\nEXPO_PUBLIC_FF_CLIENT_TUTORIAL=${canary}` });
  assert.equal(x.status, 1);
  assert.equal(x.published, undefined);
  assert.ok(!x.logs.join('\n').includes(canary), 'configured remote value was printed by parity diagnostic');
});
probe('local flag refusal does not disclose a synthetic private value', () => {
  const canary = 'AUDIT_SYNTHETIC_PRIVATE_LOCAL_CANARY';
  const x = runGuard({ env: { [F]: canary } });
  assert.equal(x.status, 1);
  assert.equal(x.calls.length, 0);
  assert.ok(!x.logs.join('\n').includes(canary), 'configured local value was printed by flag diagnostic');
});
probe('required EAS-builder-only secret cannot pass the local OTA environment gate', () => {
  const secret = "***** (This is a secret env variable that can only be accessed on EAS builder and can't be read in any UI. Learn more.)";
  const project = normal.replace(/EXPO_PUBLIC_SUPABASE_ANON_KEY=[^\n]+/, `EXPO_PUBLIC_SUPABASE_ANON_KEY=${secret}`);
  const x = runGuard({ project });
  assert.equal(x.status, 1, 'required builder-only secret marker incorrectly satisfied presence; publish proceeded');
  assert.equal(x.published, undefined);
});
probe('required API placeholder is refused before publishing', () => {
  const x = runGuard({ project: normal.replace('https://api.example.test/api', 'REPLACE_WITH_API_URL') });
  assert.equal(x.status, 1, 'required placeholder incorrectly satisfied presence; publish proceeded');
  assert.equal(x.published, undefined);
});
probe('positive: valid configuration preserves clinic env and drops stray public shell values', () => {
  const x = runGuard({ env: { PATH: '/bin', EXPO_PUBLIC_API_URL: 'http://localhost:3000/api' } });
  assert.equal(x.status, 0);
  assert.equal(x.published.env.EXPO_PUBLIC_FF_CLIENT_TUTORIAL, 'true');
  assert.equal(x.published.env.EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING, 'true');
  assert.equal(x.published.env.EXPO_PUBLIC_FF_COMMUNITY_DM, 'false');
  assert.equal(x.published.env.EXPO_PUBLIC_API_URL, undefined);
});
probe('positive: environment/channel mismatch fails before any remote command', () => {
  const x = runGuard({ argv: ['--channel', 'clinic', '--environment', 'preview', '--message', 'synthetic audit'] });
  assert.equal(x.status, 1);
  assert.equal(x.calls.length, 0);
});
console.log(JSON.stringify({ passed, failed, actualProviderCalls: 0, syntheticInputsOnly: true }));
process.exitCode = failed ? 1 : 0;
