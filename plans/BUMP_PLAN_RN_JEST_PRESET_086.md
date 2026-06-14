# BUMP DECISION — @react-native/jest-preset 0.85 → 0.86 (Mobile PR #246)

**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Created:** 2026-06-13
**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/246 (replaced closed #243)
**Branch:** `dependabot/npm_and_yarn/dev-dependencies-1562e56c1d`
**Decision:** **IGNORE jest-preset specifically via Dependabot comment — keep other 2 bumps**

**Revised 2026-06-13 22:18 PDT** — after inspecting the actual diff, #246 also bumps `jest-expo: ~56.0.4 → ~56.0.5` (safe patch) and `react-dom: 19.2.3 → 19.2.7` (safe patch). CLOSING the PR would throw those away. Better: tell Dependabot to ignore jest-preset only; the group PR rebuilds without it and lands the other 2 bumps cleanly.

## Why this bump cannot land today

PR #246 (and the now-closed #243) attempt to bump `@react-native/jest-preset` from `^0.85.3` to `^0.86.0` as part of a dev-deps group bump.

`jest-expo` — pinned at `~56.0.5` in `package.json` — declares:

```
peerDependencies: { "@react-native/jest-preset": "^0.85.0" }
```

This peer constraint is **NOT relaxed in any released or canary version of jest-expo**, including the freshly-published `57.0.0-canary` channel. Verified via npm registry on 2026-06-13:

| jest-expo version | jest-preset peer |
|---|---|
| 56.0.4 | `^0.85.0` |
| 56.0.5 (latest) | `^0.85.0` |
| 56.0.5-canary-* (next) | `^0.85.0` |
| 57.0.0-canary-* | `^0.85.0` |

CI fails with `ERESOLVE` at `npm install` because the project's repo also pins jest-expo at `~56.0.5`. The bump cannot be made compatible without forking jest-expo OR pinning the project to an as-yet-unreleased jest-expo version.

## Decision

**Comment `@dependabot ignore this dependency` on PR #246 targeting `@react-native/jest-preset` only.** Dependabot will rebuild the group PR without the blocked dependency, and the other 2 safe bumps land in the rebuilt PR.

Also patch `.github/dependabot.yml` to make the ignore durable across future Dependabot cycles.

## What #246 actually bumps (verified via `gh pr diff`)

| Dep | From | To | Status |
|---|---|---|---|
| `@react-native/jest-preset` | ^0.85.3 | ^0.86.0 | **BLOCKED** (peer conflict) — must be excluded |
| `jest-expo` | ~56.0.4 | ~56.0.5 | SAFE patch |
| `react-dom` | 19.2.3 | 19.2.7 | SAFE patch |

## Action items

1. Comment on #246:

   > `@dependabot ignore @react-native/jest-preset`
   >
   > Blocked upstream — `jest-expo@~56.0.5` (and 57.0.0-canary) still pins `peer @react-native/jest-preset: ^0.85.0`. Reopens automatically when jest-expo relaxes peer. Plan: `plans/BUMP_PLAN_RN_JEST_PRESET_086.md`. Other group bumps (jest-expo patch, react-dom patch) should land in the rebuilt PR.

2. After Dependabot rebuilds, the new PR should be a clean 2-dep bump — audit and merge per standing rule.

3. Patch `.github/dependabot.yml` in `growth-project-mobile` to add a durable ignore rule:

   ```yaml
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       ignore:
         # Blocked upstream: jest-expo@56 peer-requires ^0.85
         # Re-enable when jest-expo releases a version with relaxed peer
         - dependency-name: "@react-native/jest-preset"
           versions: [">=0.86.0"]
   ```

## Re-evaluation trigger

Remove the ignore rule from `dependabot.yml` when EITHER:

- `jest-expo` publishes a version with `@react-native/jest-preset` peer relaxed to `^0.85 || ^0.86`, OR
- Project upgrades Expo SDK to a version that ships compatible jest-expo (Expo SDK 57+ likely, watch SDK release notes).

## Lane safety

- **NO subagent needed.** Operator-driven comment + small dependabot.yml patch.
- **NO source code touched.** Doesn't conflict with any of the 5 parallel lanes.

## Parallelization

Trivially parallel with all other in-flight work. Recommend executing immediately on operator green-light to clear the broken-CI noise.
