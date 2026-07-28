#!/usr/bin/env bash
# verify-citations.sh — verify the line-number citations in the Op-75 artifact set.
#
# WHY THIS EXISTS, AND WHY THE PREVIOUS VERSION DID NOT WORK. Three passes in a row shipped a citation
# that had silently drifted. The seventh pass wrote this script to stop that, and the script it wrote
# CANNOT DETECT THE DEFECT IT WAS WRITTEN FOR. It checked that a cited line number was within the
# target file's line count. Insert one line above a cited finding and every pointer below it moves by
# one while every one of them stays comfortably in range. A range check reports PASS on exactly the
# mutation that motivated it. That is worse than no control, because it is a control a reader trusts.
#
# WHAT REPLACES IT: CONTENT PINNING. Every anchored in-repo citation carries a pin — the SHA-1 of the
# text actually living at that span — recorded in a ledger beside this script. On each run the span is
# re-digested and compared. Drift changes the content at the number, so drift changes the digest, so
# drift fails. A citation with no pin is itself a failure: an unpinned citation is unverifiable, and
# this script refuses to launder "unverifiable" into "fine".
#
# WHAT ELSE THE PREVIOUS VERSION MISSED: SCOPE. It read six markdown files. Two changed JSON mirrors
# — `handoffs/importer-wave/current-state.json` and `handoffs/op75/BASELINE_HEADS_OP75.json` — carry
# live `path:line` citations and frozen correction prose, and were simply not read, so the control was
# blind to the very drift class it claimed to cover. Both are now in scope, and they are read with
# `jq` rather than `grep` — a STRUCTURAL choice, not a fix for anything observed in these files.
#
#   Neither mirror contains a single `\uXXXX` escape at this head. Verify, do not take it on trust:
#     grep -c '\\u[0-9a-fA-F]\{4\}' handoffs/importer-wave/current-state.json \
#                                    handoffs/op75/BASELINE_HEADS_OP75.json
#   prints `…current-state.json:0` and `…BASELINE_HEADS_OP75.json:0`, and EXITS 1 — which is grep
#   reporting "no match", not an error. Stated because a zero from a command that also signals
#   failure is exactly the sort of result a previous pass wrote down without running.
#
# So the paragraph below states a property of the READER, not a defect found in the tree. `jq` emits
# the decoded string, so extraction sees what the document MEANS; `grep` sees the file bytes, so it
# sees what the document is SPELLED as, and the two differ whenever a citation carries an escape.
# Demonstrated on a constructed input (a JSON string spelling the leading `P` as `\u0050`):
#
#   file bytes:  {"note": "see \u0050RE_BUILD_REVIEW_OP75.md:99 for detail"}
#   raw grep  -> \u0050RE_BUILD_REVIEW_OP75.md:99      (unresolvable; a silent miss)
#   jq        -> PRE_BUILD_REVIEW_OP75.md:99            (the real target)
#
# Reading through `jq` therefore holds whether or not escapes are currently present, which is the
# point: it cannot regress the day someone's editor writes one.
#
# UNANCHORED REFERENCES ARE ADJUDICATED, NOT COUNTED. A bare `` `:99-105` `` names no path, so no
# machine can resolve it. Each is recorded in the ledger against a digest of the citing text with an
# explicit class. Because the key is the text digest and not a line number, editing the prose voids
# the adjudication and forces it to be made again — which is the property a stale-able classification
# needs and a line-keyed one cannot have.
#
# EXIT CODES (three states, same idiom as r3-identity-gate.sh — callers key off these, not off
# "non-zero"):
#   0 = CITATIONS: PASS               -> nothing outstanding
#   1 = CITATIONS: FAIL               -> content drift, an unpinned or out-of-range citation, a JSON
#                                        target cited by line number, or a stale ledger record
#   3 = CITATIONS: CLASSIFY_REQUIRED  -> everything verifiable is correct and unanchored references
#                                        remain. Exit 3 is terminal, not transitional: it is ACCEPTED
#                                        only when every such reference carries a ledger adjudication,
#                                        and REFUSED while any is unclassified. The two cases print
#                                        different text; read it before accepting an exit 3.
#
# THE FOUR CITATION SHAPES, AND WHAT EACH GETS:
#   (a) anchored, in-repo      `handoffs/op75/FOO.md:12` -> path resolved, range checked, AND content
#                                 pinned. This is the only shape that can be called verified.
#   (b) anchored, cross-repo   `src/foo.ts:12` -> targets the audited BACKEND repo, not checked out
#                                 here. Reported, never failed. Out of scope by construction.
#   (c) JSON line citation     -> REJECTED, not pinned. `:292` and `:293` are both in range, so an
#                                 off-by-one lands inside the neighbouring record and reads as valid.
#                                 A `jq` property path either resolves or does not, and survives
#                                 reflow. Pinning a JSON line would only pin the wrong thing harder.
#   (d) unanchored             `` `:99-105` `` -> adjudicated in the ledger (see above).
#
# LEDGER FORMAT (handoffs/op75/CITATION_LEDGER.tsv, tab-separated, `#` comments):
# Field order below is the ORDER ON DISK, in the order the parser reads it — `ledger_get` keys on
# field 2 and takes its value from field 3 for both record kinds, so the two must agree:
#   PIN  <target>:<span>  <sha1-12 of that span's text>
#   ADJ  <sha1-12 of citing file + citing text>  <class>  <citing file>  <excerpt>
# Regenerate skeleton rows with `--write-ledger`; classes must then be set by hand. `--write-ledger`
# never overwrites an existing record, so a hand-made adjudication cannot be clobbered by a rerun.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

LEDGER=handoffs/op75/CITATION_LEDGER.tsv
WRITE=0
[ "${1:-}" = "--write-ledger" ] && WRITE=1

MD_ARTIFACTS=(
  DECISION_LOG.md
  handoffs/op75/PRE_BUILD_REVIEW_OP75.md
  handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md
  handoffs/op75/OWNERSHIP_AND_LADDER_OP75.md
  handoffs/audit-reports/P0-AUDIT-A-5076a07a.md
  handoffs/audit-reports/P0-AUDIT-B-5076a07a.md
)
JSON_ARTIFACTS=(
  handoffs/importer-wave/current-state.json
  handoffs/op75/BASELINE_HEADS_OP75.json
)

CITE_RE='[A-Za-z0-9_][A-Za-z0-9_./-]*\.(md|json|sh|ts|py|prisma):[0-9]+(-[0-9]+)?'
# A `.json` name within 15 chars of the number, requiring a NON-DIGIT immediately before the colon so
# that an ISO timestamp (`current-state.json@2026-07-07T17:10:00Z`) is not mistaken for a citation.
JSONLINE_RE='\.json([^:]{0,14}[^0-9:])?:[0-9]'
# A bare `:N` in JSON prose. Same non-digit guard, for the same reason.
JSONBARE_RE='(^|[^0-9A-Za-z_]):[0-9]+(-[0-9]+)?'
VALID_CLASSES='BACKEND_EXCERPT FROZEN_CORRECTION'

# --- --self-test -----------------------------------------------------------------------------------
# A control that has not been demonstrated failing has not been demonstrated. This mode injects ONE
# JSON line citation into a real artifact, re-runs this script against the mutated tree, and asserts
# the tally is exactly 1 — the regression guard for a double count that reported 2 for one injection.
# It restores the file and refuses to report success unless `git diff` confirms the tree came back.
if [ "${1:-}" = "--self-test" ]; then
  V="handoffs/op75/BASELINE_HEADS_OP75.json"
  git diff --quiet -- "$V" || { echo "SELF-TEST: REFUSED — $V already has uncommitted changes"; exit 1; }
  BK="$(mktemp)"; cp "$V" "$BK"
  restore() { cp "$BK" "$V"; rm -f "$BK"; }
  trap 'restore' EXIT
  # Byte-level insertion after the opening brace: a re-serialised file would differ everywhere and
  # make the resulting tally harder to attribute to the injection.
  python3 - "$V" <<'PYEOF'
import sys
p = sys.argv[1]
b = open(p, "rb").read()
i = b.index(b"{") + 1
b = b[:i] + b'\n  "self_test_injected_json_line_citation": "see handoffs/op75/BASELINE_HEADS_OP75.json:42 for detail",' + b[i:]
open(p, "wb").write(b)
PYEOF
  out="$("$0" 2>&1)"; rc=$?
  n="$(printf '%s\n' "$out" | sed -n 's/^json_line_citations *= *\([0-9]*\).*/\1/p')"
  hits="$(printf '%s\n' "$out" | grep -c 'JSON-LINE-CITATION' || true)"
  restore; trap - EXIT
  git diff --quiet -- "$V" && tree="restored clean" || tree="NOT RESTORED"
  echo "=== self-test: one injected JSON line citation ==="
  echo "  json_line_citations tally = ${n:-<unparsed>}   (expected 1)"
  echo "  JSON-LINE-CITATION lines  = $hits   (expected 1)"
  echo "  verifier exit on mutated tree = $rc   (expected 1: any json line citation is a hard fail)"
  echo "  working tree after restore = $tree"
  if [ "$n" = "1" ] && [ "$hits" = "1" ] && [ "$rc" = "1" ] && [ "$tree" = "restored clean" ]; then
    echo "SELF-TEST: PASS"; exit 0
  fi
  echo "SELF-TEST: FAIL"; exit 1
fi


TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
touch "$TMP/live_pins" "$TMP/live_adj"
[ -f "$LEDGER" ] || : > "$LEDGER"

digest() { printf '%s' "$1" | sha1sum | cut -c1-12; }
# Ledger excerpts are a human hint only — the digest is the key, and it is taken over the FULL text, so
# changing this has no effect on any recorded classification. Reduced to printable ASCII because a byte
# truncation of UTF-8 can split a multi-byte character and leave the ledger unreadable as text.
excerpt() { printf '%s' "$1" | tr -s '[:space:]' ' ' | LC_ALL=C tr -cd '\11\40-\176' | cut -c1-100; }
span_digest() { sed -n "$2,$3p" "$1" | sha1sum | cut -c1-12; }
ledger_get() { grep -P "^$1\t\Q$2\E\t" "$LEDGER" 2>/dev/null | head -1; }

# Resolve a cited path to a real file: relative to the citing file, then repo-relative, then as a
# unique basename anywhere in the repo. Empty result => not in this repo.
resolve() {
  local citing_dir="$1" p="$2" cand hits
  for cand in "$citing_dir/$p" "$p"; do
    [ -f "$cand" ] && { printf '%s' "${cand#./}"; return; }
  done
  hits="$(git ls-files | grep -E "(^|/)$(basename "$p")$" || true)"
  [ "$(printf '%s\n' "$hits" | grep -c .)" = "1" ] && printf '%s' "$hits"
}

ok=0; broken=0; drifted=0; unpinned=0; crossrepo=0; jsonline=0
# Set by check_anchored when it has already charged a JSON line citation for the scalar currently
# being scanned. The JSON caller re-scans the same scalar with JSONLINE_RE to catch citations that
# CITE_RE does not reach, and without this flag a `.json`-targeted citation is charged twice — the
# tally inflates in the direction that flatters the control, which is the wrong direction to be
# wrong in for a script whose whole claim is that its numbers can be trusted. Exercised by --self-test.
consumed_jsonline=0
unanch=0; adjudicated=0; unclassified=0; badclass=0; stale=0; missing=0

# Emit one extracted record: KIND, citing file, human locator, payload.
check_anchored() {
  local f="$1" loc="$2" cite="$3"
  local path="${cite%:*}" span="${cite##*:}" start end target total have want
  start="${span%%-*}"; end="${span##*-}"
  target="$(resolve "$(dirname "$f")" "$path")"
  if [ -z "$target" ]; then
    crossrepo=$((crossrepo+1)); echo "  CROSS-REPO  $f ($loc) -> $cite"; return
  fi
  if [ "${target##*.}" = "json" ]; then
    jsonline=$((jsonline+1)); consumed_jsonline=1
    echo "  JSON-LINE-CITATION (use a jq path)  $f ($loc) -> $cite  [resolves to $target]"
    return
  fi
  total="$(wc -l < "$target")"
  if [ "$start" -lt 1 ] || [ "$end" -gt "$total" ] || [ "$start" -gt "$end" ]; then
    broken=$((broken+1)); echo "  BROKEN  $f ($loc) -> $cite  [$target has $total lines]"; return
  fi
  have="$(span_digest "$target" "$start" "$end")"
  printf '%s:%s\n' "$target" "$span" >> "$TMP/live_pins"
  want="$(ledger_get PIN "$target:$span" | cut -f3)"
  if [ -z "$want" ]; then
    if [ "$WRITE" = "1" ]; then
      printf 'PIN\t%s\t%s\n' "$target:$span" "$have" >> "$LEDGER"
      echo "  PINNED (new)  $f ($loc) -> $cite  [$have]"
      ok=$((ok+1)); return
    fi
    unpinned=$((unpinned+1))
    echo "  UNPINNED  $f ($loc) -> $cite  [no ledger pin; run --write-ledger and review]"
    return
  fi
  if [ "$have" != "$want" ]; then
    drifted=$((drifted+1))
    echo "  CONTENT-DRIFT  $f ($loc) -> $cite  [pinned $want, span now $have]"
    printf '    now: %.72s\n' "$(sed -n "${start},${end}p" "$target" | tr -s '[:space:]' ' ')"
    return
  fi
  ok=$((ok+1))
  printf '  OK  %s (%s) -> %s  [%s] | %.56s\n' "$f" "$loc" "$cite" "$have" \
    "$(sed -n "${start},${end}p" "$target" | tr -s '[:space:]' ' ')"
}

check_unanchored() {
  local f="$1" loc="$2" text="$3" d rec cls
  d="$(digest "$f|$text")"
  unanch=$((unanch+1))
  printf '%s\n' "$d" >> "$TMP/live_adj"
  rec="$(ledger_get ADJ "$d")"
  if [ -z "$rec" ]; then
    if [ "$WRITE" = "1" ]; then
      printf 'ADJ\t%s\tUNCLASSIFIED\t%s\t%s\n' "$d" "$f" "$(excerpt "$text")" >> "$LEDGER"
    fi
    unclassified=$((unclassified+1))
    printf '  UNCLASSIFIED  %s (%s) | %.80s\n' "$f" "$loc" "$(printf '%s' "$text" | tr -s '[:space:]' ' ')"
    return
  fi
  cls="$(printf '%s' "$rec" | cut -f3)"
  case " $VALID_CLASSES " in
    *" $cls "*) adjudicated=$((adjudicated+1)); printf '  %s  %s (%s)\n' "$cls" "$f" "$loc" ;;
    *) badclass=$((badclass+1)); printf '  BAD-CLASS "%s"  %s (%s)\n' "$cls" "$f" "$loc" ;;
  esac
}

echo "=== markdown artifacts ==="
for f in "${MD_ARTIFACTS[@]}"; do
  [ -f "$f" ] || { echo "  FAIL artifact missing: $f"; missing=$((missing+1)); continue; }
  while IFS= read -r rec; do
    [ -n "$rec" ] || continue
    check_anchored "$f" "line ${rec%%:*}" "${rec#*:}"
  done < <(grep -noE "$CITE_RE" "$f" || true)
  while IFS= read -r n; do
    [ -n "$n" ] || continue
    line="$(sed -n "${n}p" "$f")"
    if printf '%s' "$line" | grep -qE "$JSONLINE_RE"; then
      jsonline=$((jsonline+1))
      printf '  JSON-LINE-CITATION (use a jq path)  %s (line %s) | %.72s\n' "$f" "$n" "$(printf '%s' "$line" | tr -s '[:space:]' ' ')"
      continue
    fi
    check_unanchored "$f" "line $n" "$line"
  done < <(grep -nE '`:[0-9]+(-[0-9]+)?`' "$f" | cut -d: -f1 || true)
done

echo "=== json artifacts (read through jq: escaped citations cannot hide) ==="
for f in "${JSON_ARTIFACTS[@]}"; do
  [ -f "$f" ] || { echo "  FAIL artifact missing: $f"; missing=$((missing+1)); continue; }
  if ! jq -e . "$f" >/dev/null 2>&1; then
    echo "  FAIL not parseable: $f"; missing=$((missing+1)); continue
  fi
  while IFS=$'\t' read -r jpath val; do
    [ -n "${val:-}" ] || continue
    found=0
    consumed_jsonline=0
    while IFS= read -r cite; do
      [ -n "$cite" ] || continue
      found=1
      check_anchored "$f" ".$jpath" "$cite"
    done < <(printf '%s' "$val" | grep -oE "$CITE_RE" || true)
    if [ "$consumed_jsonline" = 0 ] && printf '%s' "$val" | grep -qE "$JSONLINE_RE"; then
      jsonline=$((jsonline+1))
      printf '  JSON-LINE-CITATION (use a jq path)  %s (.%s) | %.72s\n' "$f" "$jpath" "$val"
      continue
    fi
    # Bare `:N` left over once full citations are removed => shape (d) inside JSON prose.
    residue="$(printf '%s' "$val" | sed -E "s@$CITE_RE@@g")"
    if printf '%s' "$residue" | grep -qE "$JSONBARE_RE"; then
      check_unanchored "$f" ".$jpath" "$val"
    elif [ "$found" = "0" ]; then
      :
    fi
  done < <(jq -r 'paths(scalars) as $p | [($p|map(tostring)|join(".")), (getpath($p)|tostring)] | @tsv' "$f")
done

echo "=== ledger hygiene ==="
while IFS=$'\t' read -r kind key rest; do
  case "${kind:-}" in
    PIN) grep -qxF "$key" "$TMP/live_pins" || { stale=$((stale+1)); echo "  STALE PIN  $key  (no citation targets this span any more)"; } ;;
    ADJ) grep -qxF "$key" "$TMP/live_adj" || { stale=$((stale+1)); echo "  STALE ADJ  $key  (the adjudicated text no longer exists as written)"; } ;;
  esac
done < <(grep -v '^#' "$LEDGER" | grep -v '^[[:space:]]*$' || true)
[ "$stale" = "0" ] && echo "  no stale records"

echo
echo "artifacts_scanned        = ${#MD_ARTIFACTS[@]} markdown + ${#JSON_ARTIFACTS[@]} json"
echo "artifacts_unreadable     = $missing"
echo "anchored_verified        = $ok   (path resolves, span in range, content digest matches its pin)"
echo "anchored_broken          = $broken"
echo "anchored_content_drift   = $drifted   (the pinned span no longer holds the pinned text)"
echo "anchored_unpinned        = $unpinned   (unverifiable: no pin recorded)"
echo "anchored_cross_repo      = $crossrepo   (backend targets; not checked out here, never failed)"
echo "json_line_citations      = $jsonline   (must become jq property paths)"
echo "unanchored_refs          = $unanch   -> adjudicated $adjudicated / unclassified $unclassified / bad class $badclass"
echo "ledger_stale_records     = $stale"

if [ $((broken+drifted+unpinned+jsonline+badclass+stale+missing)) -gt 0 ]; then
  cat <<'EOF'
CITATIONS: FAIL
  CONTENT-DRIFT        -> the line number still resolves but the text there changed. This is the
                          failure a range check cannot see: re-derive the citation, then repin.
  UNPINNED / BROKEN    -> unverifiable or out of range. Re-derive, then `--write-ledger`.
  JSON-LINE-CITATION   -> replace with a `jq` property path (e.g. `.open_blockers_ref.B3.sev_note`).
  BAD-CLASS / STALE    -> the ledger disagrees with the tree. Reclassify; do not delete to silence.
EOF
  exit 1
fi
if [ "$unanch" -gt 0 ] && [ "$unclassified" -gt 0 ]; then
  cat <<'EOF'
CITATIONS: CLASSIFY_REQUIRED
  DO NOT ACCEPT THIS EXIT. Unanchored `:N` references remain with no ledger adjudication. Classify
  each in handoffs/op75/CITATION_LEDGER.tsv:
    BACKEND_EXCERPT   -> quotes a file in the audited BACKEND repo at the audited SHA. Not a claim
                         about this tree; not resolvable here by construction.
    FROZEN_CORRECTION -> R5/R132 record quoting what an earlier pass saw. Renumbering it would
                         rewrite the record the rule exists to preserve.
  A reference that is a live claim about THIS tree belongs in neither class: give it an anchored
  `path:line` citation, or a `jq` property path if the target is JSON.
EOF
  exit 3
fi
if [ "$unanch" -gt 0 ]; then
  cat <<'EOF'
CITATIONS: CLASSIFY_REQUIRED (terminal and accepted — every reference is adjudicated)
  Nothing is outstanding. This exit stays 3 rather than 0 because unanchored references exist and
  their correctness rests on a recorded human judgement, not on a machine check. Editing any
  adjudicated text changes its digest and reopens the judgement as a STALE ADJ failure.
EOF
  exit 3
fi
echo "CITATIONS: PASS"
exit 0
