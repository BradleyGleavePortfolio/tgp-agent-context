# Lane B-CONSENT-COPY (agent 110) — Claude Opus 5.5 builder: "AI chats kept forever" truth everywhere (T4 consent copy) + #611

Owner 20:32: "I want to keep past AI chats forever." OR-110-1: user delete and account deletion erase AI chats; no time purge.
Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md, the AUD-OPUS-2 verdict on backend #626 (R-626-1) and on mobile #310, and every
AUDIT comment on backend #611. Today the box-2 consent copy says chats are "kept for 180 days" (backend
src/ai-consent/ai-consent.constants.ts ~line 34 on main; mobile #310 copy.ts ~line 33) — false.
1. Backend PR onto main: bump the box-2 consent copy version (client-ai-v4) with true retention copy ("kept until you delete them or
   delete your account"), keep accepting v3 grants per the existing version rules (say exactly how old grants are treated), remove
   any 180-day AI-chat purge job/config if one exists, tests.
2. Mobile: matching copy + version on #310's branch (you are #310's copy builder for this change only; coordinate the merge-order
   note C-310-10) and in any other mobile surface that states AI retention.
3. mobile #326 @ 32ed8546 (AI refusal handling; you are its builder for this round): AUD-OPUS-2 B-326-1 (after a lost response the
   sheet says "AI help is still off" though the grant may be saved: say "not confirmed" and reconcile) and B-326-2 (the sheet's grant
   bypasses #310's write queue and pending-withdrawal marker; next app-open drain withdraws the user's newer yes: route every grant
   and withdrawal through ONE queue; probe on the merged #310+#326 tree), plus #310's B-310-6 (the 180-day copy; same fix as 1-2) and
   the onboarding consent version bump to v3 AUD-OPUS-2 recommends. Merge order: #310 before #326.
4. #611 (public pages: privacy policy, consumer health): fix every A/B in its audits and make the privacy policy state AI chat
   retention truthfully (kept until deleted; deleted with the account) — never name the clinic partner.
Merge main first (no rebase). Update PR bodies; if a body edit is refused by a safety check, do not work around it.
Report to /home/user/workspace/ops/reports/B-CONSENT-COPY-110.md. Final answer (<400 words): PRs + heads, tests, CI, risks.
