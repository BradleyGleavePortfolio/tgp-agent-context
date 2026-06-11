# v1-6 Mobile Coach Community UI — UX/Design Audit Report

**Verdict:** NEEDS_REVISION  
**Audit SHA:** c6a3711b23b8feb9cd18a1ace042487d80a1e628  
**Auditor model:** gpt_5_5 (UX/Design lane)  
**Audit timestamp:** 2026-06-11T00:00:00Z  
**Doctrine reference:** /home/user/workspace/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md

## The user's three questions — answer each directly

1. **Is this visually appealing?** MOSTLY — the surfaces are restrained, warm, and consistent: cream/bone backgrounds, bordered cards, compact rows, 44pt+ targets, and a simple type hierarchy make the screens feel calm rather than flashy. The visual system is not yet excellent because it relies on many local font-size literals instead of the existing typography tokens, and `RomanAvatar` currently renders an "R" monogram tile for neutral/smile crops rather than Roman's actual face.
2. **Is this usable?** MOSTLY — the main paths are recognizable: home routes to inbox/cohorts/moderation/lab, cohorts create through one modal, detail invites through one modal, inbox uses an obvious Ack action, lab autosaves, and moderation confirms risky decisions. It is not ship-ready because error states are visually indistinguishable from successful empty states, every empty-state copy/crop is local static copy instead of backend-payload-sourced Roman voice, and several completion moments simply close/remove rows without a designed confirmation moment.
3. **Is this overwhelming?** SOMEWHAT — no single screen is a total feature dump, and the home screen stays to four choices, but the home cards have nearly equal weight, member removal is foregrounded on every client row, and moderation rows expose dense content plus two decisions per item. A first-day coach can usually infer what to do in 3 seconds, but the hierarchy does not always make the default path irresistible.
4. **Does it have everything clearly laid out / hidden as it should be?** MOSTLY — common paths are visible and advanced/destructive paths generally have confirmation modals, but destructive/rare controls are not hidden enough in the cohort member list, the inbox long-press batch action is too hidden to be discoverable, and failure states are hidden incorrectly as reassuring empty states.

## Per-screen verdict

### CoachCommunityHomeScreen.tsx
- Emotional target: reassured and oriented — the coach should feel that Roman will surface what needs attention.
- Primary action (Step 2 of §5.1): choose the highest-priority work queue, ideally unread inbox or flagged moderation.
- Miller count (visible actionable elements, no scroll): 4 — PASS if counted as Inbox, Cohorts, Flagged today, Lab.
- Hick's Law (3-tap primary path): PASS for navigation, but WEAK because all four cards/links have similar priority and no smart default highlights the most urgent next step.
- Empty state (if applicable): RomanAvatar present? YES via `CoachEmptyState`; Backend payload used? NO; Voice variant correct? neutral crop is passed from local copy.
- Anti-pattern hits: AP-2 mild — the landing screen exposes every v1-6 surface equally; AP-7 — local hardcoded Roman voice and monogram-only avatar weaken polish.
- Overall: NEEDS WORK — visually calm, but the default path and empty/error contract need revision.

### CoachCommunityCohortsScreen.tsx
- Emotional target: capable — the coach should feel they can create or enter a cohort quickly.
- Primary action (Step 2 of §5.1): open an existing cohort, or create the first cohort when empty.
- Miller count (visible actionable elements, no scroll): 1 primary FAB plus visible cohort rows; PASS by interaction-pattern chunking, but row count can exceed 5 on long lists.
- Hick's Law (3-tap primary path): PASS — open a cohort in 1 tap, create in FAB → name → Create.
- Empty state (if applicable): RomanAvatar present? YES; Backend payload used? NO; Voice variant correct? neutral crop from local copy.
- Anti-pattern hits: AP-4 — cohort creation closes the modal but lacks a designed success/closure micro-moment; AP-7 — empty voice is static local copy.
- Overall: NEEDS WORK — the list/modal pattern is clear, but the face+voice source and confirmation design are below the bar.

### CoachCommunityCohortDetailScreen.tsx
- Emotional target: in control — the coach should feel able to manage a cohort safely.
- Primary action (Step 2 of §5.1): invite a client or inspect current members.
- Miller count (visible actionable elements, no scroll): 1 Invite FAB plus one Remove action per visible client row; NEEDS WORK because destructive actions can exceed 5 and compete with member scanning.
- Hick's Law (3-tap primary path): PASS for invite flow; WEAK for member management because every client row foregrounds a rare/destructive Remove control.
- Empty state (if applicable): RomanAvatar present? YES; Backend payload used? NO; Voice variant correct? neutral crop from local copy.
- Anti-pattern hits: AP-2 — visible Remove on every member row exposes an advanced action too prominently; AP-4 — invite/remove outcomes have no designed closure state; AP-7 — empty voice is local static copy.
- Overall: NEEDS WORK — the invitation path is simple, but destructive actions should move behind overflow/swipe/contextual disclosure.

### CoachCommunityInboxScreen.tsx
- Emotional target: calm momentum — the coach should feel they can clear client signals quickly.
- Primary action (Step 2 of §5.1): acknowledge the most recent client signal.
- Miller count (visible actionable elements, no scroll): one Ack action per visible row plus hidden long-press batch action; PASS by repeated-row chunking, but can become dense with many items.
- Hick's Law (3-tap primary path): PASS for Ack in 1 tap; FAIL for batch mark-read discoverability because long-press is not visible to sighted users.
- Empty state (if applicable): RomanAvatar present? YES; Backend payload used? NO; Voice variant correct? neutral crop from local copy.
- Anti-pattern hits: AP-4 — acknowledgement removes an item without a visible closure/micro-confirmation; AP-5 — row is announced as a button but its only row-level action is long-press; AP-7 — empty voice is local static copy.
- Overall: NEEDS WORK — the triage surface is readable, but feedback and hidden interaction affordance need polish.

### CoachCommunityLabScreen.tsx
- Emotional target: focused and safe — the coach should feel they can draft without losing work.
- Primary action (Step 2 of §5.1): write a draft.
- Miller count (visible actionable elements, no scroll): empty state = 1 editor action; with draft = editor plus Clear draft = 2 — PASS.
- Hick's Law (3-tap primary path): PASS — typing is immediate once hydrated.
- Empty state (if applicable): RomanAvatar present? YES; Backend payload used? NO; Voice variant correct? neutral crop from local copy.
- Anti-pattern hits: AP-4 minor — clear draft has no proportionate closure state; AP-7 — empty voice is local static copy.
- Overall: PASS/NEEDS WORK — this is the least overwhelming screen, but it still violates the empty-state voice-source contract.

### CoachCommunityModerationScreen.tsx
- Emotional target: confident and careful — the coach should feel able to protect the cohort without overreacting.
- Primary action (Step 2 of §5.1): review a flagged item and choose Approve or Hide.
- Miller count (visible actionable elements, no scroll): two actions per visible flagged row; NEEDS WORK once more than two rows are visible.
- Hick's Law (3-tap primary path): PASS for decision flow, but WEAK because Hide receives the same filled accent treatment used for constructive actions elsewhere.
- Empty state (if applicable): RomanAvatar present? YES; Backend payload used? NO; Voice variant correct? smile crop for a cleared queue is correct, but dangerously wrong when reused for load error.
- Anti-pattern hits: AP-4 — approve/hide completion removes a card without a designed closure moment; AP-5 — same accent color is used for constructive CTAs and destructive Hide; AP-7 — error state can masquerade as celebratory all-clear.
- Overall: NEEDS WORK — the confirmation gate is good, but error handling and destructive visual semantics block launch-quality UX.

## Master Checklist results (§6.2)

### Emotional Design
- [x] Emotional target defined per screen — PASS 6/6 in this audit, though not explicitly encoded in product copy.
- [ ] Confirmation moments have dedicated micro-interactions — FAIL: create cohort, invite, ack, approve/hide, remove, and clear draft rely on row disappearance/modal close rather than a designed completion moment.
- [ ] Session peak moment designed with maximum investment — FAIL: moderation cleared uses a smile crop, but no motion/transition; other peak moments have no treatment.
- [ ] Session ends in explicit closure state — FAIL: optimistic removals/acks provide little visible closure and can feel like content simply vanished.
- [ ] Character (Roman) state triggered by user-generated events — PARTIAL/FAIL: empty states use Roman, but user actions do not trigger Roman state changes except the static moderation empty result.
- [x] Anxiety moments have CALM treatment — PASS/PARTIAL: destructive actions use confirmation modals, but error states need honest calm messaging.

### Cognitive Simplicity
- [ ] Cognitive load audit: D-class elements removed — PARTIAL: screens are visually restrained, but equal-weight home cards, foregrounded Remove actions, and dense moderation rows add avoidable load.
- [x] Miller's Law: ≤5 actionable elements visible without scrolling — PASS 4/6 by pattern count; NEEDS WORK on CohortDetail and Moderation when multiple list rows are visible.
- [x] Hick's Law: primary path achievable without engaging secondary options — PASS 5/6; Inbox batch action is too hidden and home lacks a strong default path.
- [ ] Progressive disclosure: advanced options accessible but not foregrounded — FAIL: Remove is foregrounded on every client row.
- [ ] Smart default set for at least one decision in every non-trivial flow — PARTIAL/FAIL: valid inputs enable submits, but home/moderation do not prioritize the most likely next action beyond raw counts.
- [ ] Interaction pattern consistent with established product vocabulary — PARTIAL/FAIL: the same filled accent represents create/invite/ack/hide; row long-press is discoverability-inconsistent.
- [x] One-sentence description of each screen possible — PASS 6/6.
- [ ] New user test: primary path navigable in under 3 minutes without instruction — PARTIAL: likely pass for basic navigation, likely fail for long-press batch acknowledgement and nuanced moderation semantics.
- [ ] Anticipatory element present — PARTIAL/FAIL: dashboard counts are anticipatory, but they are not used to visually rank the recommended next action.

## Anti-Pattern hits (§5.5)

- AP-1 Permission-Front Onboarding: None.
- AP-2 Feature Dump First Screen: `src/screens/community/CoachCommunityHomeScreen.tsx:77-122` — all four surfaces are presented with comparable visual weight; `src/screens/community/CoachCommunityCohortDetailScreen.tsx:130-142` — rare/destructive member removal is foregrounded in every row.
- AP-3 Unescapable Streak Architecture: None.
- AP-4 Empty Confirmation: `src/screens/community/CoachCommunityCohortsScreen.tsx:52-62`, `src/screens/community/CoachCommunityCohortDetailScreen.tsx:77-87`, `src/screens/community/CoachCommunityInboxScreen.tsx:49-64`, `src/screens/community/CoachCommunityModerationScreen.tsx:56-66`, `src/screens/community/CoachCommunityLabScreen.tsx:95-104` — important actions close/remove/update without a dedicated confirmation micro-interaction.
- AP-5 Inconsistency Tax: `src/screens/community/CoachCommunityCohortsScreen.tsx:144-155`, `src/screens/community/CoachCommunityCohortDetailScreen.tsx:192-203`, `src/screens/community/CoachCommunityInboxScreen.tsx:196-205`, `src/screens/community/CoachCommunityModerationScreen.tsx:111-122` — the same filled accent treatment covers constructive, triage, and destructive decisions; `src/screens/community/CoachCommunityInboxScreen.tsx:156-162` — row-level long-press is hidden while the row still presents as a button.
- AP-6 Gamification Mismatch: None; coach-side gamification is appropriately absent.
- AP-7 Polish as Afterthought: `src/components/community/coach/coachVoice.ts:23-54` and all six screen empty-state call sites — empty copy/crop is static local copy rather than backend payload; `src/components/community/RomanAvatar.tsx:43-45` — neutral/smile crops visually reuse the monogram fallback instead of Roman's face; `src/screens/community/CoachCommunityModerationScreen.tsx:148-153` — a load error can render the celebratory smile/all-clear state.

## Face + Voice contract (operator-locked)

For each empty state in the 6 screens:
- Screen: CoachCommunityHomeScreen | RomanAvatar present: YES (`CoachEmptyState`) | Payload-driven copy: NO (`COACH_EMPTY_COPY.home`) | avatar_crop forwarded: NO backend `avatar_crop`; local crop only | voice_variant correct: NO backend `voice_variant` read
- Screen: CoachCommunityCohortsScreen | RomanAvatar present: YES | Payload-driven copy: NO (`COACH_EMPTY_COPY.cohorts`) | avatar_crop forwarded: NO backend `avatar_crop`; local crop only | voice_variant correct: NO backend `voice_variant` read
- Screen: CoachCommunityCohortDetailScreen | RomanAvatar present: YES | Payload-driven copy: NO (`COACH_EMPTY_COPY.cohortMembers`) | avatar_crop forwarded: NO backend `avatar_crop`; local crop only | voice_variant correct: NO backend `voice_variant` read
- Screen: CoachCommunityInboxScreen | RomanAvatar present: YES | Payload-driven copy: NO (`COACH_EMPTY_COPY.inbox`) | avatar_crop forwarded: NO backend `avatar_crop`; local crop only | voice_variant correct: NO backend `voice_variant` read
- Screen: CoachCommunityLabScreen | RomanAvatar present: YES | Payload-driven copy: NO (`COACH_EMPTY_COPY.lab`) | avatar_crop forwarded: NO backend `avatar_crop`; local crop only | voice_variant correct: NO backend `voice_variant` read
- Screen: CoachCommunityModerationScreen | RomanAvatar present: YES | Payload-driven copy: NO (`COACH_EMPTY_COPY.moderation`) | avatar_crop forwarded: NO backend `avatar_crop`; local crop only | voice_variant correct: NO backend `voice_variant` read; crop intent is correct for true clear state but wrong for error reuse

## Findings

### P0 — must fix before ship (UX-blocking)
- `src/screens/community/CoachCommunityHomeScreen.tsx:58-61`, `src/screens/community/CoachCommunityCohortsScreen.tsx:123-126`, `src/screens/community/CoachCommunityCohortDetailScreen.tsx:178-181`, `src/screens/community/CoachCommunityInboxScreen.tsx:103-106`, `src/screens/community/CoachCommunityLabScreen.tsx:116-119`, `src/screens/community/CoachCommunityModerationScreen.tsx:149-152` — every empty state uses local `COACH_EMPTY_COPY` instead of backend-payload-sourced `{ text, avatar_crop, surface_key, voice_variant }`, violating the operator-locked face+voice contract.
- `src/screens/community/CoachCommunityHomeScreen.tsx:51-64`, `src/screens/community/CoachCommunityCohortsScreen.tsx:122-127`, `src/screens/community/CoachCommunityCohortDetailScreen.tsx:177-182`, `src/screens/community/CoachCommunityInboxScreen.tsx:97-108`, `src/screens/community/CoachCommunityModerationScreen.tsx:148-153` — load errors are visually collapsed into calm/celebratory empty states, so the coach can falsely believe there are no messages, cohorts, members, or flagged items.

### P1 — must fix this PR (significant UX impact)
- `src/screens/community/CoachCommunityCohortDetailScreen.tsx:130-142` — destructive Remove is visible on every client row instead of being demoted behind a contextual menu/swipe/overflow, adding cognitive load and accidental-action anxiety.
- `src/screens/community/CoachCommunityModerationScreen.tsx:111-122` plus constructive CTAs at `CoachCommunityCohortsScreen.tsx:144-155`, `CoachCommunityCohortDetailScreen.tsx:192-203`, and `CoachCommunityInboxScreen.tsx:196-205` — the same filled accent treatment means both "create/invite/ack" and "hide" look like the primary positive action.
- `src/screens/community/CoachCommunityInboxScreen.tsx:156-162` — the row advertises button behavior but its row-level action is long-press only, making batch acknowledgement undiscoverable to new users.
- `src/components/community/RomanAvatar.tsx:43-45` — neutral/smile crops reuse the monogram visual, so the empty states do not actually show Roman's face even though they render the `RomanAvatar` component.

### P2 — should fix (improvement)
- `src/screens/community/CoachCommunityHomeScreen.tsx:77-122` — visually rank the next best action from dashboard counts rather than presenting four equally weighted destinations.
- `src/screens/community/CoachCommunityCohortsScreen.tsx:52-62`, `src/screens/community/CoachCommunityCohortDetailScreen.tsx:77-87`, `src/screens/community/CoachCommunityInboxScreen.tsx:49-64`, `src/screens/community/CoachCommunityModerationScreen.tsx:56-66` — add proportionate confirmation feedback for create/invite/ack/approve/hide so completed work feels intentional, not like content simply disappeared.
- `src/screens/community/*` style blocks — migrate repeated local font-size literals to the existing typography tokens for a stronger design-system contract.

### P3 — observation / nit
- Static visual rendering only; no iOS simulator was available. The repo contains screenshot harness files, but this audit did not use test pass/fail results as evidence because this lane is UX/design, not code/test grading.
- `src/screens/community/CoachCommunityLabScreen.tsx` is the clearest, least overwhelming surface; it should be the model for restraint in the other screens.

## Final recommendation

FIX & RE-AUDIT — the v1-6 coach community UI is directionally attractive and mostly understandable, but it cannot ship at the decacorn bar until the empty-state face+voice contract is payload-driven, errors receive honest distinct states, destructive/rare controls are demoted, and key completion moments receive proportionate visual feedback.
