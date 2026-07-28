#!/usr/bin/env bash
# verify-rendering.sh — prove that the Op-75 markdown artifacts SAY, once rendered, what their bytes say.
#
# WHY THIS EXISTS. Eight passes verified this branch's controls by running the commands printed inside
# them. Every command ran. Nobody rendered the page. In GitHub-Flavored Markdown a `|` inside a table
# cell delimits a cell EVEN INSIDE A CODE SPAN, and any cell beyond the header's column count is
# silently DISCARDED — no warning, no ellipsis, no diff. Two §9 control rows carried shell pipelines
# with bare pipes, so GitHub truncated each of them at its first `|`:
#
#   row 284 -> cut mid-command, losing the composition derivation and the no-workflow-directory proof
#   row 315 -> cut after `` ✅ Verify: `grep -rniE '\b(eight `` , losing the ENTIRE row body: the
#              measured-scope paragraph, all three permitted classification classes, and an R5/R132
#              correction record
#
# A reviewer on github.com saw a green tick with its evidence invisible. That is this branch's own
# defining failure — A CONTROL A READER TRUSTS — reappearing one layer up, in the PRESENTATION of the
# controls rather than in the controls themselves. No amount of running the commands can catch it,
# because the bytes are correct and only the rendering is not.
#
# THE STRUCTURAL RULE THIS ENFORCES: a table row may not produce more cells than its header defines.
# That is decidable from the bytes alone, needs no network, and is the whole defect class. `--render`
# then confirms the conclusion against GitHub's own renderer rather than against our model of it.
#
# TWO CHECKS, AND WHY BOTH:
#   A. STRUCTURAL (always, offline, deterministic). Count unescaped `|` per table row; compare to the
#      header. A row with MORE is dropping content. This is the gate.
#   B. RENDERED (only with `--render`, needs `gh`). POST each file to GitHub's /markdown API, strip to
#      text, and assert the TAIL OF EVERY TABLE ROW survived. The tail is checked because truncation
#      always removes a suffix — if the last words of a row are present, nothing in between was cut.
#      Probes are DERIVED FROM EACH ROW, never a hand-listed set, so this cannot go stale the way an
#      enumerated probe list would.
#
# `--render` IS NOT OPTIONAL-BY-DEFAULT-MEANS-FINE. If it is requested and `gh` cannot reach the API,
# this script FAILS. An unavailable check is not a passing check. Run WITHOUT `--render` only when
# offline, and then say so rather than reporting a clean run.
#
# EXIT CODES (same three-state idiom as the sibling controls):
#   0 = RENDERING: PASS
#   1 = RENDERING: FAIL   -> a row drops cells, or a row's tail vanished from GitHub's own output,
#                            or `--render` was asked for and could not be performed
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

BASE=b76d0962de53ce494fa8f869a706ff0c15aee0b6
RENDER=0
[ "${1:-}" = "--render" ] && RENDER=1

# Diff BASE against the WORKING TREE, not against HEAD. The checks below read working-tree bytes, so
# deriving the file list from `BASE..HEAD` would silently skip a markdown file changed but not yet
# committed — the run would report PASS having never opened it. On a clean tree the two are identical.
mapfile -t FILES < <(git diff --name-only "$BASE" -- '*.md')
[ "${#FILES[@]}" -gt 0 ] || { echo "no changed markdown files against $BASE"; exit 1; }

fail=0

echo "=== A. structural: does any table row produce more cells than its header? ==="
for f in "${FILES[@]}"; do
  [ -f "$f" ] || { echo "  FAIL missing: $f"; fail=$((fail+1)); continue; }
  # Unescaped-pipe count: delete every `\|` first, then count what is left. awk has no lookbehind,
  # and this ordering is exactly equivalent for the only two forms GFM distinguishes.
  awk -v F="$f" '
    function pipes(s,   t) { t=s; gsub(/\\\|/,"",t); return gsub(/\|/,"",t) }
    {
      line=$0; sub(/^[ \t]+/,"",line)
      if (line !~ /^\|/) { hdr=0; next }
      n=pipes(line)
      if (line ~ /^\|[ \t:|-]+\|[ \t]*$/ && hdr) next       # delimiter row
      if (!hdr) { hdr=n; hln=NR; next }
      if (n > hdr) { printf "  DROPS-CELLS  %s:%d  row has %d unescaped pipes, header (line %d) defines %d -> %d cell(s) discarded by GFM\n", F, NR, n, hln, hdr, n-hdr; bad++ }
      else if (n < hdr) { printf "  SHORT-ROW    %s:%d  row has %d unescaped pipes, header (line %d) defines %d (renders, but check it is intentional)\n", F, NR, n, hln, hdr }
    }
    END { exit (bad>0) }
  ' "$f" || fail=$((fail+1))
done
[ "$fail" = "0" ] && echo "  no row drops cells"

if [ "$RENDER" = "1" ]; then
  echo "=== B. rendered: does every table row's tail survive GitHub's own renderer? ==="
  command -v gh >/dev/null 2>&1 || { echo "  FAIL --render requested but gh is unavailable; an unavailable check is not a passing check"; exit 1; }
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  for f in "${FILES[@]}"; do
    python3 -c 'import json,sys; json.dump({"text":open(sys.argv[1]).read(),"mode":"markdown"},open(sys.argv[2],"w"))' "$f" "$TMP/req.json"
    if ! gh api -X POST /markdown --input "$TMP/req.json" > "$TMP/out.html" 2>"$TMP/err"; then
      echo "  FAIL could not render $f:"; sed 's/^/    /' "$TMP/err"; fail=$((fail+1)); continue
    fi
    python3 - "$f" "$TMP/out.html" <<'PY' || fail=$((fail+1))
import html, re, sys

src, rendered = sys.argv[1], sys.argv[2]

text = open(rendered).read()
text = re.sub(r'(?s)<(script|style).*?</\1>', ' ', text)
text = html.unescape(re.sub(r'(?s)<[^>]+>', ' ', text))
norm = lambda s: re.sub(r'[^0-9a-z]+', '', s.lower())
hay = norm(text)

bad = 0
lines = open(src).read().split('\n')
hdr = None
for i, raw in enumerate(lines, 1):
    line = raw.strip()
    if not line.startswith('|'):
        hdr = None
        continue
    if re.fullmatch(r'\|[\s:|-]+\|', line) and hdr:
        continue
    if hdr is None:
        hdr = i
        continue
    # The tail of the row: truncation always removes a suffix, so if the last words survived,
    # nothing before them was cut. Strip markdown decoration before comparing. Link TARGETS must go
    # first and whole — GitHub emits them as href attributes, which tag-stripping removes, so a tail
    # that reached into `](…)` would report every linked row as truncated.
    cell = line.rstrip('|').strip()
    plain = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', cell)
    plain = re.sub(r'[`*_\[\]()#>|\\]', '', plain)
    tail = norm(plain)[-60:]
    if len(tail) < 12:
        continue
    if tail not in hay:
        bad += 1
        print(f'  TRUNCATED-IN-RENDER  {src}:{i}  tail of this row is absent from GitHub output')
        print(f'      looked for: …{plain[-70:].strip()}')
print(f'  {src}: rows checked against rendered output, {bad} truncated')
sys.exit(1 if bad else 0)
PY
  done
else
  echo "=== B. rendered: SKIPPED (pass --render to confirm against GitHub's own renderer) ==="
fi

echo
if [ "$fail" -gt 0 ]; then
  cat <<'EOF'
RENDERING: FAIL
  DROPS-CELLS         -> a table row emits more cells than the header defines, so GFM discards the
                         overflow. Almost always a bare `|` inside a code span. Two remedies, in
                         order of preference:
                           1. move the command OUT of the table into a fenced block and have the
                              cell reference it by anchor — fenced blocks have no cell semantics, so
                              the shell text stays copy-pasteable AND the prose stays visible;
                           2. escape it as `\|` in the cell — renders correctly, but then the raw
                              bytes are no longer runnable, which is how the rule-numbering row came
                              to publish a pipeline that errors with `grep: |: No such file`.
                         Do not solve shell correctness by breaking Markdown, or the reverse.
  TRUNCATED-IN-RENDER -> GitHub's renderer dropped the end of a row that the structural check passed.
                         Read the rendered output before assuming the structural rule is complete.
EOF
  exit 1
fi
echo "RENDERING: PASS"
exit 0
