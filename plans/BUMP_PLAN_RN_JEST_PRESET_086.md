# BUMP DECISION — @react-native/jest-preset 0.85 → 0.86 (Mobile PR #246)

**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Created:** 2026-06-13
**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/246 (replaced closed #243)
**Branch:** `dependabot/npm_and_yarn/dev-dependencies-1562e56c1d`
**Decision:** **CLOSE — UPSTREAM BLOCKED**

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

**CLOSE PR #246 with a comment explaining the upstream block, and add `@react-native/jest-preset` to the Dependabot ignore list until the jest-expo peer is relaxed.**

## Action items

1. Comment on #246:

   > Closing — upstream blocked. `jest-expo@56` (and all 57.0.0 canaries to date) still declare `@react-native/jest-preset` peer as `^0.85.0`. Bumping to 0.86 fails `npm install` with ERESOLVE. Will reopen automatically when jest-expo releases a version with a relaxed peer constraint. Tracked in `plans/BUMP_PLAN_RN_JEST_PRESET_086.md`.

2. Close PR #246 via `gh pr close 246 --repo BradleyGleavePortfolio/growth-project-mobile --comment "<above>"`.

3. Update `.github/dependabot.yml` in `growth-project-mobile` to add an ignore rule for `@react-native/jest-preset` until peer is unblocked:

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

4. After landing the dependabot.yml update, the OTHER three dev-deps in the group (`@expo/metro-runtime`, `babel-preset-expo`, `react-dom`) will need to be re-evaluated. Dependabot will auto-reopen a smaller group PR within 24h.

## Re-evaluation trigger

Re-open this PR (or wait for Dependabot's next attempt) when EITHER:

- `jest-expo` publishes a version with `@react-native/jest-preset` peer relaxed to `^0.85 || ^0.86`, OR
- Project upgrades Expo SDK to a version that ships compatible jest-expo (Expo SDK 57+ likely, watch SDK release notes).

## Lane safety

- **NO lane impact.** Closing the PR removes a CI-broken branch from the inventory; it does not touch any source code.
- **NO subagent needed.** This is a pure operator action.

## Parallelization

Trivially parallel with all other in-flight work. Recommend executing immediately on operator green-light to clear the broken-CI noise.
