// Read-only, bounded auth-handler equality proof against fetched origin/main.
// Run from the lane's own worktree via heavy.sh; does not typecheck the project.
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const ts = require(require.resolve('typescript', { paths: [process.cwd()] }));
const printer = ts.createPrinter({ removeComments: true });

function contracts(file, code) {
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result = new Map();
  let effect = 0;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name &&
        !node.name.text.endsWith('Screen') && node.name.text !== 'makeStyles') {
      result.set(node.name.text, printer.printNode(ts.EmitHint.Unspecified, node, source));
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
        node.name.text !== 'makeStyles' && node.initializer &&
        (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
      result.set(node.name.text, printer.printNode(ts.EmitHint.Unspecified, node.initializer, source));
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
        node.expression.text === 'useEffect') {
      result.set(`useEffect:${effect++}`, printer.printNode(ts.EmitHint.Unspecified, node, source));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

let total = 0;
for (const name of ['LoginScreen', 'ForgotPasswordScreen', 'ResetPasswordScreen']) {
  const file = `src/screens/auth/${name}.tsx`;
  const main = contracts(file, execFileSync('git', ['show', `origin/main:${file}`], { encoding: 'utf8' }));
  const local = contracts(file, fs.readFileSync(file, 'utf8'));
  if (main.size !== local.size) throw new Error(`${file}: contract count differs`);
  for (const [key, value] of main) {
    if (local.get(key) !== value) throw new Error(`${file}: handler/effect changed: ${key}`);
  }
  total += main.size;
  console.log(`PASS ${file}: ${main.size} named handlers/helpers/effects equal origin/main`);
}
console.log(`PASS ${total} auth contracts; styles/render copy intentionally excluded`);
