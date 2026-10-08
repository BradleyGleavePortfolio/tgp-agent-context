# DES-BA-127 — preferences

## Scope traced
- Builder agent 128. Own worktree `/home/user/workspace/wt/DES-BA-127-mobile`, branch `agent128/des-ba-127`, base c00a2a5f.
- Exact three owned screens plus their tests and only their matching README entries. No navigator, hook, service, backend or production edits.
- Acceptance: every switch/option retained, semantic theme colours, unfilled hairline rows, truthful descriptions, 44 pt targets.

## B list
- Fixed B1: an ordinary user disables Coach Messages or Reminders expecting the promised session/water/check-in alerts to stop, but the switches only PATCH message channels or `eat_enabled`. Descriptions now name exactly the saved preference; the unsupported billing/security guarantee and coach-set/midday claims are gone.
- Fixed B2: a user changes a category in the notification channel screen and then opens category settings, where all but workout reminders previously displayed stale local/default values instead of the server setting. Every category now hydrates from its mapped server field.

## U list
- Fixed U1: filled boxes, undersized descriptions/options and legacy colour-map use replaced with semantic-theme unfilled hairline groups, serif titles, Inter copy and 44 pt controls.
- Fixed U2: notification channel preferences returned a blank screen on initial load failure; now a specific notice provides working retry and back.

## C one-liners
- None.

## PRs
- [Mobile #507](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507), head `f69a5d77f313c22cf65fd90061b04f429c42cf1a`, 304 additions + 72 deletions = 376 lines. All four CI/CodeQL checks green at this head; mergeable, no conflict.
- [Opening READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507#issuecomment-6047415988) posted at 14:41 PDT (date command). Opus/Sol verdicts pending; deliberately not awaited under owner override.
- Explicit-identity merges of origin/main `f240af37f38d775ad4b47794e8978c8f31ad8dce` and then `4185b9b2cb4e415234dc526af0f0da97d2dd8ef4` completed with no conflict. Only own Preferences README entry changed; upstream screen entries retained. Worktree clean.
- All local commands through heavy.sh, one Jest file per command: new calm/parity tests 7/7; existing category tests 27/27; notification-center/preferences tests 33/33; doctrine 30/30.
- Failing-first proof on unmodified source: new tests failed on misleading meal copy, stale server category values, missing initial-load retry, and semantic palette/title expectations. Parity mock corrected to return full server preferences, matching the existing API contract.
- No full-project typecheck or eslint run locally.
- First CI run failed only on four new test-double type errors (partial navigation assertion and incomplete typed Axios responses). Corrected with a fully typed navigation stub and complete Axios response factory; no product-source correction needed. Standard run-log request hit an API rate limit once; direct known job-log endpoint worked, so no auth or quota change was made.

## Not fixed (needs operator)
- Operator 1 (B, outside owned files): `src/hooks/usePreferences.ts:103-115` exposes persisted choices, but current Home/calendar/unit/notification surfaces do not consume this hook; `src/components/HeroAction.tsx:29` explicitly ignores tone. A user selects Off or hides a Home module and saves successfully, but those choices do not change notification delivery or Home. Smallest recommended default: route a separate consumer-integration lane for all retained personalization fields; do not remove options, per this job's explicit parity rule. Screen copy now promises only saved preferences.
- Operator 2 (B, backend scope): backend `src/notifications/notifications.service.ts:249` stores `eat_enabled`, but no current emitter reads it. A user disables Reminders and saves the flag, but no delivery logic consumes it. Smallest recommended default: route a backend lane to connect the existing meal-reminder emitter/gate or determine whether the currently offered preference needs different mapping. This PR preserves the exact field and describes a preference, not water/check-in delivery.
- Operator 3 (U, outside owned files): `src/hooks/usePreferences.ts:92-97,106-107` silently rolls back failed personalization saves and exposes neither mutation error nor async result. Smallest default: expose mutation failure/async save from the hook, then render a setting-specific notice. No false saved-success state was added here.

## HANDOFF
- DONE to READY: PR #507 remains open, not merged or deployed. Exact head `f69a5d77f313c22cf65fd90061b04f429c42cf1a`; 376 changed lines; all checks green, no conflict, clean worktree. Main was merged and verified already up to date immediately before READY.
- Opus/Sol verdicts pending, not awaited. Builder finished immediately after READY under the 14:08 override; operator/FIX lane owns reviews and any later conflicts.
- Fixed within scope: B1 truthful preference descriptions, B2 real server category state, U1 calm/readable theme styling, U2 channel-load recovery. Every existing switch/option/action retained and rendered parity-tested.
- Separate operator work: (1) personalization consumer integration, (2) backend eat_enabled consumer/gate, (3) personalization save-error hook exposure. Recommended defaults and file:line details are in Not fixed above and the PR body.
- Worktree `/home/user/workspace/wt/DES-BA-127-mobile`; branch `agent128/des-ba-127`. Author/committer verified Bradley Gleave for every new commit. No production change, new dependency or lockfile edit.
- Notify: `/home/user/workspace/ops/lanes128/notify/DES-BA-127.txt`.
