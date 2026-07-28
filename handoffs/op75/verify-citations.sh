#!/usr/bin/env bash
# verify-citations.sh — verify the line-number citations in the Op-75 artifact set.
#
# WHY THIS EXISTS. Two passes in a row shipped a citation that had silently drifted. The second pass
# moved Lens A headings and left seven pointers behind. The sixth pass's own rename hunk shifted
# `BASELINE_HEADS_OP75.json` down by one line and broke two pointers in `DECISION_LOG.md` — one of
# which then resolved to a DIFFERENT blocker instead of to nothing, which is the dangerous failure
# mode, because a wrong-but-existing target looks fine to a reader. The §9 control that was supposed
# to catch this greped only the Lens A finding headings while its title claimed every `file:line`
# citation. This script is the honest version of that control, and §9 now states this envelope
# instead of a broader one.
#
# THE CENTRAL LESSON, ENCODED AS A CHECK. A line citation into a JSON file cannot be verified
# mechanically for CORRECTNESS, only for EXISTENCE: `:292` and `:293` are both "valid" line numbers,
# so an off-by-one that lands inside a neighbouring record passes any in-range test. Therefore this
# script does not merely check JSON line citations — it REJECTS them, and requires a structural `jq`
# property path instead. A `jq` path either resolves or it does not, and it survives every reflow.
#
# EXIT CODES (three states, same idiom as r3-identity-gate.sh — callers key off these, not off
# "non-zero"):
#   0 = CITATIONS: PASS               -> nothing to fix
#   1 = CITATIONS: FAIL               -> a resolvable citation is out of range, OR a JSON target is
#                                        cited by line number instead of by `jq` path
#   3 = CITATIONS: CLASSIFY_REQUIRED  -> everything verifiable is correct, but unanchored `:N`
#                                        references remain whose target is implied by prose. Each
#                                        must be classified by a human as ACTIVE or HISTORICAL.
#                                        This script deliberately does NOT guess.
#
# SCOPE, STATED HONESTLY — four citation shapes exist here and they are not equivalent:
#   (a) anchored, in-repo      `handoffs/op75/FOO.md:12` / `FOO.md:12`  -> verified: path resolves
#                                 (by relative path or by unique basename) and the line is in range,
#                                 with the target line printed so content can be eyeballed.
#   (b) anchored, cross-repo   `src/foo.ts:12`  -> targets the audited BACKEND repo, which is not
#                                 checked out here. Reported, never failed. Out of scope by
#                                 construction, not by choice.
#   (c) JSON line citation     `BASELINE_HEADS_OP75.json:292`, or a bare `:292` sitting within 15
#                                 characters of a `.json` filename ON THE SAME LINE
#                                 -> REJECTED. Use a `jq` property path. See the lesson above.
#   (d) unanchored             `` `:99-105` `` with the file named in surrounding prose
#                                 -> not machine-resolvable. Reported at exit 3 for classification.
#
# THE ADJACENCY WINDOW IS DELIBERATELY TIGHT, AND HERE IS WHAT THAT COSTS. Shape (c)'s second form
# needs the filename near the number, because a wide window fires on any line that merely LINKS to a
# JSON file while its `:N` points at markdown — two such lines exist here, and a detector that cries
# wolf on them would be turned off within one pass. The cost is that a reference split across a line
# break (filename on line N, `:296` on line N+1 — exactly the second half of the drift that motivated
# this script) is NOT caught as shape (c). It is still surfaced, as shape (d), and classifying it
# ACTIVE makes it a defect. So nothing is missed; some things arrive under the weaker label.
#
# A structural citation (`.open_blockers_ref.B3.sev_note`) is immune to line drift by construction and
# is the required form for JSON. This script does not check those; `jq -e` does, and §9 records that.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

ARTIFACTS=(
  DECISION_LOG.md
  handoffs/op75/PRE_BUILD_REVIEW_OP75.md
  handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md
  handoffs/op75/OWNERSHIP_AND_LADDER_OP75.md
  handoffs/audit-reports/P0-AUDIT-A-5076a07a.md
  handoffs/audit-reports/P0-AUDIT-B-5076a07a.md
)

ok=0; broken=0; crossrepo=0; jsonline=0; unanchored=0

# Resolve a cited path to a real file: try it relative to the citing file, then repo-relative, then
# as a unique basename anywhere in the repo. Empty result => not in this repo.
resolve() {
  local citing_dir="$1" p="$2" cand hits
  for cand in "$citing_dir/$p" "$p"; do
    [ -f "$cand" ] && { printf '%s' "${cand#./}"; return; }
  done
  hits="$(git ls-files | grep -E "(^|/)$(basename "$p")$" || true)"
  [ "$(printf '%s\n' "$hits" | grep -c .)" = "1" ] && printf '%s' "$hits"
}

echo "--- anchored citations ---"
for f in "${ARTIFACTS[@]}"; do
  [ -f "$f" ] || { echo "  FAIL artifact missing: $f"; broken=$((broken+1)); continue; }
  while IFS= read -r cite; do
    [ -n "$cite" ] || continue
    path="${cite%:*}"; span="${cite##*:}"; start="${span%%-*}"
    target="$(resolve "$(dirname "$f")" "$path")"
    if [ -z "$target" ]; then
      crossrepo=$((crossrepo+1)); echo "  CROSS-REPO  $f -> $cite"; continue
    fi
    if [ "${target##*.}" = "json" ]; then
      jsonline=$((jsonline+1))
      echo "  JSON-LINE-CITATION (use a jq path)  $f -> $cite  [resolves to $target]"
      continue
    fi
    total="$(wc -l < "$target")"
    if [ "$start" -ge 1 ] && [ "$start" -le "$total" ]; then
      ok=$((ok+1))
      printf '  OK  %s -> %s  [%s, %s lines] | %.60s\n' \
        "$f" "$cite" "$target" "$total" "$(sed -n "${start}p" "$target" | tr -s '[:space:]' ' ')"
    else
      broken=$((broken+1))
      echo "  BROKEN  $f -> $cite  [$target has only $total lines]"
    fi
  done < <(grep -oE '[A-Za-z0-9_][A-Za-z0-9_./-]*\.(md|json|sh|ts|py):[0-9]+(-[0-9]+)?' "$f" || true)
done

echo "--- unanchored line references (target implied by prose) ---"
for f in "${ARTIFACTS[@]}"; do
  [ -f "$f" ] || continue
  while IFS= read -r n; do
    line="$(sed -n "${n}p" "$f")"
    # A `.json` filename within 15 chars of the number means this ref points into JSON: same
    # rejection. Wider windows fire on lines that merely link to a JSON file — see the header.
    if printf '%s' "$line" | grep -qE '\.json[^:]{0,15}:[0-9]'; then
      jsonline=$((jsonline+1))
      printf '  JSON-LINE-CITATION (use a jq path)  %s:%s | %.90s\n' "$f" "$n" "$(printf '%s' "$line" | tr -s '[:space:]' ' ')"
      continue
    fi
    unanchored=$((unanchored+1))
    printf '  CLASSIFY  %s:%s | %.90s\n' "$f" "$n" "$(printf '%s' "$line" | tr -s '[:space:]' ' ')"
  done < <(grep -nE '`:[0-9]+(-[0-9]+)?`' "$f" | cut -d: -f1 || true)
done

echo
echo "anchored_in_repo_verified = $ok"
echo "anchored_in_repo_broken   = $broken"
echo "anchored_cross_repo       = $crossrepo   (backend targets; not checked out here, never failed)"
echo "json_line_citations       = $jsonline   (must become jq property paths)"
echo "unanchored_refs           = $unanchored   (each needs ACTIVE-vs-HISTORICAL classification)"

if [ "$broken" -gt 0 ] || [ "$jsonline" -gt 0 ]; then
  cat <<'EOF'
CITATIONS: FAIL
  BROKEN               -> the cited line is outside the target file. Re-derive it.
  JSON-LINE-CITATION   -> replace with a `jq` property path (e.g. `.open_blockers_ref.B3.sev_note`).
                          A JSON line number cannot be verified for correctness, only for existence:
                          an off-by-one lands inside the neighbouring record and still looks valid.
EOF
  exit 1
fi
if [ "$unanchored" -gt 0 ]; then
  cat <<'EOF'
CITATIONS: CLASSIFY_REQUIRED
  Everything machine-verifiable is correct. The unanchored `:N` references above name no path, so
  their target is only implied by surrounding prose. Classify each:
    ACTIVE     -> a live claim about the current tree. DEFECT: give it an anchored `path:line`
                  citation, or a `jq` property path if the target is JSON.
    HISTORICAL -> frozen prose describing a PRIOR state (an R5/R132 correction record quoting what an
                  earlier pass saw, or an excerpt of a backend file at the audited SHA). Correct
                  as-is; the number is not a claim about this tree.
  Do NOT "fix" a HISTORICAL reference by renumbering it — that rewrites the record R5/R132 preserves.
EOF
  exit 3
fi
echo "CITATIONS: PASS"
exit 0
