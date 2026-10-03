# AUD-OPUS-MONEY (Claude Opus 5.5) — operator 115 audit report

Queue (after operator 10:47 PDT): backend #627 #654 #656 #661. #628 #641 #642 moved to AUD-OPUS-MONEY-2 (pre-read notes handed over in /home/user/workspace/ops/aud-115/AUD-OPUS-MONEY/PRE-READ-for-AUD-OPUS-MONEY-2.md).

## backend#627 @ 3a5338d72c277238486452f7f256da2d8e22c7c8 — APPROVE (A0/B0/C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5972040127 (posted 11:13 PDT)
- Delta from my RC @7c29d981. Merge 37e8d015 pure (merge-tree 6c6abd22 = its tree).
- B-627-9 (narrowed): closed (adopt under same key, claim identity attempts+marker, reproveSendClaim, sync beforeSend start budget 30 s max(wall, mono)); failing-before runs 37142752391 / 37142019274.
- C-627-2 closed (cd332bfa), C-627-8 closed (alert names live reconciliation gap route).
- New C-627-10 (outside diff, since #215): same Stripe key on every attempt; after a definitive refusal attempts 2-5 (within ~5.3 h) replay the stored 4xx; fix = attempt-scoped key after a refusal.

## backend#654 @ 02c48de710f9f69bfc985336eb14249663bbb638 — APPROVE (A0/B0/C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5972187301 (posted ~11:28 PDT under the operator 11:25 PAUSE "post the verdict you are writing now").
- At posting: the builder's FIX ROUND 2 comment 5971989117 names this head but has no READY FOR AUDIT line. The 7 required checks that run on the stacked base (agent/clinic/s-fee-coach-net) are green. CodeQL, banned-cast, SBOM and danger do not run on a non-main base; they must pass after the retarget to main. A grep of the added lines finds no banned token.
- Prior Opus: B-654-1 closed (setup_intent.succeeded + failed lookup -> throw/redeliver; test b-recur-3-fix-round-2.spec.ts:175). C-654-2, C-654-3 and C-654-4 closed. My read of Sol's B-654-5/6/7: closed by design (Sol closes them).
- C-654-8: a pinned resend after the 24 h key window makes a second subscription (the orphan trial keeps trialing). Probe red at 317301b5 (run 37142324612) and at 02c48de7 (run 37143117139). Audit branch deleted.
- C-654-9 (cross-lane): mobile #334 @0629d50 rejects mode 'none' (packagePayment.ts:171-183).
- C-654-10: the errorLabel fallback returns an unfiltered Error.name (same pattern Sol rated B-656-7 in #656).

## Queue state at PAUSE (11:28 PDT)
- backend#627: APPROVE posted @3a5338d7 (5972040127). Needs Sol's verdict at that head.
- backend#654: APPROVE posted @02c48de7 (5972187301). Needs Sol's verdict at that head.
- backend#656 @b9939d02: not auditable for this lens (Sol REQUEST CHANGES 5972091723: B-656-3 narrowed, B-656-5 narrowed, B-656-6, B-656-7). No Opus verdict posted. A full own-diff audit is done; the draft with my C-656-2/3/4 is in /home/user/workspace/ops/aud-115/AUD-OPUS-MONEY/v656.md and carries to the next head.
- backend#661 @f4679fd8: not auditable (Sol REQUEST CHANGES 5972103999). No Opus verdict; not audited this session.
- backend #634, #647 and mobile #328, #317 are not in this lens's queue.

## HANDOFF
- Unaudited items: backend#656 at its next head. Close Sol's 4 Bs, then do a delta audit and fold in C-656-2 (email retry after timeout uses a new key, so a duplicate email), C-656-3 (canceled-purchase notices stay pending and can fill the 50-row sweep batch) and C-656-4 (the in-app row's will_charge is frozen at record time). See v656.md for the file:line references. Also backend#661 at its next head (full audit owed; builder B-FEE-9).
- Cleanup done: worktrees AUD-OPUS-MONEY-641 and -654 removed, audit/AUD-OPUS-MONEY/* branches deleted, wait loop stopped. Claims left in place: lanes115/claims/backend-{654-317301b5,654-02c48de7,627-3a5338d7,656-b9939d02}-opus.
- Notes: /home/user/workspace/ops/aud-115/AUD-OPUS-MONEY/notes.md; #628/#641 pre-read for MONEY-2: PRE-READ-for-AUD-OPUS-MONEY-2.md.
