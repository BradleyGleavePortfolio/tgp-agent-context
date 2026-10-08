#!/usr/bin/env python3
# board.py: ONE GitHub reader for the whole fleet (operator agent 131). Writes ops/board/board.md and board.json.
# Comments are re-read only for PRs whose updatedAt changed, plus a full re-read every 15 minutes (catches deleted claims).
import json, os, re, subprocess, time, datetime

O = "BradleyGleavePortfolio"
REPOS = ["growth-project-backend", "growth-project-mobile"]
D = "/home/user/workspace/ops/board"
CACHE = f"{D}/cache.json"
SHORT = {"growth-project-backend": "b", "growth-project-mobile": "m"}


def gh(args):
    r = subprocess.run(["gh"] + args, capture_output=True, text=True, timeout=180)
    if r.returncode:
        raise RuntimeError(f"gh {' '.join(args[:3])}: {r.stderr.strip()[:300]}")
    return r.stdout


def pdt(ts=None):
    t = ts or time.time()
    return subprocess.run(["date", "-d", f"@{int(t)}", "+%H:%M"], capture_output=True, text=True,
                          env={**os.environ, "TZ": "America/Los_Angeles"}).stdout.strip()


def age_min(iso):
    t = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return int((datetime.datetime.now(datetime.timezone.utc) - t).total_seconds() // 60)


def main():
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    cache.setdefault("prs", {})
    full = time.time() - cache.get("last_full", 0) > 900
    rows, merged, calls = [], [], 0
    for repo in REPOS:
        prs = json.loads(gh(["pr", "list", "-R", f"{O}/{repo}", "--state", "open", "-L", "100", "--json",
                             "number,title,headRefName,headRefOid,isDraft,mergeStateStatus,additions,deletions,"
                             "statusCheckRollup,updatedAt"]))
        calls += 1
        prs = [p for p in prs if re.match(r"^agent1(2[789]|3[01])/", p["headRefName"])]
        for p in prs:
            key = f"{repo}#{p['number']}"
            c = cache["prs"].get(key)
            if full or not c or c.get("updatedAt") != p["updatedAt"]:
                out = gh(["api", "--paginate", f"repos/{O}/{repo}/issues/{p['number']}/comments?per_page=100",
                          "--jq", '.[] | {id, t: .created_at, b: (.body | split("\\n")[0])}'])
                calls += 1
                c = {"updatedAt": p["updatedAt"], "comments": [json.loads(l) for l in out.splitlines() if l.strip()]}
                cache["prs"][key] = c
            rows.append(summarise(repo, p, c["comments"]))
        try:
            m = json.loads(gh(["pr", "list", "-R", f"{O}/{repo}", "--state", "merged", "-L", "25", "--json",
                               "number,title,mergedAt,headRefName"]))
            calls += 1
            merged += [{"pr": f"{SHORT[repo]}#{x['number']}", "at": x["mergedAt"], "title": x["title"][:80]} for x in m
                       if age_min(x["mergedAt"]) <= 240]
        except Exception:
            pass
    open_keys = {f"{r['repo']}#{r['number']}" for r in rows}
    cache["prs"] = {k: v for k, v in cache["prs"].items() if k in open_keys}
    if full:
        cache["last_full"] = time.time()
    json.dump(cache, open(CACHE + ".tmp", "w"))
    os.replace(CACHE + ".tmp", CACHE)
    write(rows, merged, calls, full)


def summarise(repo, p, comments):
    head = p["headRefOid"]
    first = [(c["t"], c["b"]) for c in comments]
    ready = [(t, b) for t, b in first if "READY FOR AUDIT" in b]
    last_ready = ready[-1] if ready else None
    ready_at_head = bool(last_ready and head in last_ready[1])

    def verdict(prefix):
        v = [(t, b) for t, b in first if b.startswith(prefix) and f"@ {head}" in b]
        if not v:
            return "-"
        m = re.search(r"VERDICT:\s*([A-Z][A-Z ]+)", v[-1][1])
        return m.group(1).strip() if m else "?"

    opus, sol = verdict("AUDIT Claude Opus 5.5"), verdict("AUDIT GPT-6.1 Sol")
    claims = []
    for t, b in first:
        if "CLAIM" in b[:40] and head in b:
            who = re.search(r"\(([A-Z0-9-]+)\)", b)
            claims.append(f"{b.split(' (')[0].replace(' CLAIM', '')}:{who.group(1) if who else '?'} {age_min(t)}m")
    checks = p.get("statusCheckRollup") or []
    st = {}
    failing, pending = [], []
    for c in checks:
        s = c.get("conclusion") or c.get("state") or c.get("status") or "PENDING"
        if c.get("status") in ("IN_PROGRESS", "QUEUED", "PENDING", "WAITING") and not c.get("conclusion"):
            s = "PENDING"
        st[s] = st.get(s, 0) + 1
        name = c.get("name") or c.get("context") or "?"
        if s in ("FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED", "STARTUP_FAILURE"):
            failing.append(name)
        elif s == "PENDING":
            pending.append(name)
    ci = "none" if not checks else ("FAIL" if failing else ("running" if pending else "green"))
    lines = p["additions"] + p["deletions"]
    if p["isDraft"]:
        need = "draft: its builder or finisher"
    elif p["mergeStateStatus"] == "DIRTY":
        need = "conflict with main: merge origin/main"
    elif failing:
        need = "CI failing: " + ", ".join(failing[:3])
    elif pending or not checks:
        need = "CI running"
    elif not ready_at_head:
        need = "needs READY at head"
    elif opus == "APPROVE" and sol == "APPROVE":
        need = "DUAL APPROVED: operator merge"
    elif "REQUEST" in opus or "REQUEST" in sol:
        need = "needs fix: REQUEST CHANGES by " + "+".join(x for x, v in (("Opus", opus), ("Sol", sol)) if "REQUEST" in v)
    else:
        need = "needs " + " and ".join(x for x, v in (("Opus", opus), ("Sol", sol)) if v == "-")
    return {"repo": repo, "pr": f"{SHORT[repo]}#{p['number']}", "number": p["number"], "head": head,
            "branch": p["headRefName"], "title": p["title"][:90], "lines": lines, "draft": p["isDraft"],
            "merge": p["mergeStateStatus"], "ci": ci, "ci_counts": st, "failing": failing,
            "ready_at_head": ready_at_head, "last_ready": last_ready[1][:160] if last_ready else None,
            "opus": opus, "sol": sol, "claims_at_head": claims, "needs": need, "updatedAt": p["updatedAt"]}


def write(rows, merged, calls, full):
    now = time.time()
    rows.sort(key=lambda r: (r["repo"], -r["number"]))
    json.dump({"updated_pdt": pdt(now), "updated_epoch": int(now), "prs": rows, "merged_last_4h": merged},
              open(f"{D}/board.json.tmp", "w"), indent=1)
    os.replace(f"{D}/board.json.tmp", f"{D}/board.json")
    out = [f"# PR board (operator agent 131) - updated {pdt(now)} PDT; refreshed every 3 minutes",
           f"Open agent127-131 PRs in both repos: {len(rows)} (dependabot, cand/* and other old PRs are out of scope). GitHub calls this refresh: {calls}{' (full comment re-read)' if full else ''}.",
           "Verdicts and claims count only AT THE CURRENT HEAD. Re-check the head on GitHub before you claim or post a verdict.",
           "", "| PR | head | lines | CI | READY@head | Opus@head | Sol@head | claims@head (age) | needs | branch |",
           "|---|---|---:|---|---|---|---|---|---|---|"]
    for r in rows:
        out.append(f"| {r['pr']}{' (draft)' if r['draft'] else ''} | {r['head']} | {r['lines']} | {r['ci']} | "
                   f"{'yes' if r['ready_at_head'] else 'no'} | {r['opus']} | {r['sol']} | "
                   f"{'; '.join(r['claims_at_head']) or '-'} | {r['needs']} | {r['branch']} |")
    out += ["", "## Merged in the last 4 hours", ""] + [f"- {m['pr']} {m['at']} {m['title']}" for m in
                                                       sorted(merged, key=lambda m: m["at"], reverse=True)]
    open(f"{D}/board.md.tmp", "w").write("\n".join(out) + "\n")
    os.replace(f"{D}/board.md.tmp", f"{D}/board.md")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(time.strftime("%H:%M:%S"), "board error:", str(e)[:400], flush=True)
