// Read-only proof for the main-merge-only #502 integration.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trimEnd();
const previous = 'a83774e0e4504b38875ad66f3d4e86750d0f84b1';
const main = '1d0564ff8e68176b9808307bb98fea673c9ba5dd';
const expected = 'b7f4e4bb6e98dfa72d37213ce6d513de5072f39a';
const actual = git('write-tree');
const email = 'src/screens/auth/EmailVerifiedScreen.tsx';
const readme = 'src/screens/auth/README.md';
const fixture = 'src/screens/auth/__tests__/AcceptInviteKeepsInvite.test.tsx';
const differences = git('diff', '--name-only', expected, actual).split('\n').filter(Boolean);
assert.deepEqual(differences.sort(), [email, readme, fixture].sort());
console.log(`PASS expected automatic-merge tree ${expected}; final index tree ${actual}`);
console.log('PASS all other files exactly match the direct merge of the approved head and current main');

let conflicts = 0;
const resolvedEmail = git('show', `${expected}:${email}`).replace(
  /^<<<<<<< [^\n]*\n([\s\S]*?)^=======\n([\s\S]*?)^>>>>>>> [^\n]*\n/gm,
  (_match, ours, theirs) => {
    conflicts++;
    const imports = [...ours.trim().split('\n'), ...theirs.trim().split('\n')];
    assert(imports.every((line) => /^import .*;$/.test(line)));
    return [...new Set(imports)].join('\n') + '\n';
  },
);
assert.equal(conflicts, 1);
assert.equal(git('show', `${actual}:${email}`), resolvedEmail);
console.log('PASS EmailVerified exactly matches the automatic merge with both conflicting imports retained');

for (const file of ['AcceptInviteScreen.tsx', 'RoleSelectionScreen.tsx']) {
  const path = `src/screens/auth/${file}`;
  assert.equal(git('show', `${actual}:${path}`), git('show', `${previous}:${path}`));
  console.log(`PASS ${file} byte-identical to the prior dual-approved head`);
}

const oldFactory = "  useTheme: () => ({ colors: require('../../../constants/colors').default }),";
const newFactory = [
  '  useTheme: () => ({',
  "    colors: require('../../../constants/colors').default,",
  "    semanticColors: require('../../../theme/tokens').lightTokens,",
  '  }),',
].join('\n');
const actualFixture = git('show', `${actual}:${fixture}`);
assert(actualFixture.includes(newFactory));
assert.equal(actualFixture.replace(newFactory, oldFactory), git('show', `${previous}:${fixture}`));
console.log('PASS only test-fixture change adds the existing semantic tokens required by main');

const rows = (content) => {
  const result = new Map();
  for (const line of content.split('\n')) {
    const match = line.match(/^\| `([^`]+\.tsx)` \|/);
    if (!match) continue;
    assert(!result.has(match[1]), `duplicate README row: ${match[1]}`);
    result.set(match[1], line);
  }
  return result;
};
const mainRows = rows(git('show', `${main}:${readme}`));
const actualRows = rows(git('show', `${actual}:${readme}`));
for (const [file, row] of mainRows) {
  if (file === 'EmailVerifiedScreen.tsx' || file === 'RoleSelectionScreen.tsx') continue;
  assert.equal(actualRows.get(file), row, `main README row lost/changed: ${file}`);
}
for (const file of ['EmailVerifiedScreen.tsx', 'RoleSelectionScreen.tsx', 'AcceptInviteScreen.tsx']) {
  assert(actualRows.has(file), `owned README row lost: ${file}`);
}
console.log('PASS main auth README rows retained verbatim; all owned rows present once');
console.log('No automatic verdict carry-over claimed: the documented fixture/import/docs delta needs both exact-head confirmations.');
