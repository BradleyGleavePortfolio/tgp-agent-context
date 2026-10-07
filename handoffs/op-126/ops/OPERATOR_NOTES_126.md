# OPERATOR_NOTES_126 (agent 126 running log for the handoff)
- 18:00 Fly logs (run 37555057997) confirm double scheduler: NudgeScheduler logs twice same second at 00:45:00Z and 01:00:00Z;
  SettlementSweepCron at 01:00:00Z: one copy SFEE_SWEEP_DONE, other SFEE_SWEEP_SKIPPED_LOCK_HELD (single machine); drip skip each minute.
- 18:0x Production read-only counts (all-time): ClientPurchase 0, Invoice 0, ChargeSettlement 0, ChargeRefund 0, ConnectTransfer 0,
  DunningAttempt 0, DunningNoticeDelivery 0, PaymentReminder 0, SplitLedgerEntry 0, Notification 0, PushOutbox 0, EmailSendLog 0,
  NudgeLog 0, WorkoutReminderDelivery 0, CoachSubscription 1, NotificationDigestLog 6 (one per day/kind, no duplicates, all failed:
  Resend 403 domain not verified, last 2026-10-06 06:00Z = before owner's Resend fix 12:02 PDT 10-06). auth.users 5. ScheduledDrop 0.
- 18:07 b#808 merged by merge loop (dual APPROVE @ 9487faa2).
- 18:13 AUD-MJ-SETTLE-126: SAFE 23 / UNSAFE 0. Q0 run: all 14 unique indexes it relies on exist in production. Q1-Q11 trivially 0
  (all settlement/ledger/transfer/refund tables empty).
- TODO operator: check NotificationDigestLog after 2026-10-07 06:00Z (23:00 PDT) for status=sent (Resend fix).
- 18:16 AUD-MJ-DUNNING-126: 12 SAFE / 0 UNSAFE but assumed FEATURE_DUNNING_V2 off (stale line in _COMMON_126 copied from 125; fixed).
  v2 is ON in production (b#762 merged; env-sync apply run 37532040631 at 21:11Z). Auditor re-queued for the v2-on paths.
- 18:20 SAFE-AIB-PRE-126: b#808 clean (merged 2df556b7). m#439 B1 (approve response parsed as error) + B2 (shorten/explain/reorder
  fail) -> B-AIB5P-126 (hard stop 19:15). b#809 B3 (model-marker hash mismatch after DB round trip; head coach w/ sub-coach refused)
  + U1 -> B-AIB2-126. B4 (sub-coaches can never use Ask AI) -> OWNER DECISION (default: status+propose 404 for sub-coaches on 10-07,
  full support v1.1). LM lenses told not to approve m#439 @ 63417260.
- 18:17 AUD-CRONX-126: 39 timed jobs; money all guarded; U1 nudges (deferred quiet-hour nudge delivered twice at 08:00), U2 coach
  red-risk alert twice; both vanish with B-CRON. Production: Q3 canary = CoachEffectivenessScore 2 rows/night for 1 coach on all 30
  nights (09-07..10-06) -> double run proven in history. CoachAlert 0 rows, Notification 0, NudgeLog sent 0, PtmPrediction 0 ->
  zero duplicate user-facing notifications actually sent. Canary rows are internal scores (C; no customer data changed).
- 18:15 FU-COPY-126: m#440 READY @ 48348a62 (364 lines, CI green) -> LF lenses.
- 18:18 AUD-MJ-PAYOUT-126: 15 SAFE / 0 UNSAFE; payout tables empty -> its Q1-Q6 trivially 0. B-CRON PR = b#810.
- 18:20 AUD-MJ-DUNNING-126 redo (v2 on): 10 SAFE / 0 UNSAFE. Dunning tables all 0 rows; StripeProcessedEvent 0 (no Stripe webhooks processed yet) -> Q8-Q13 trivially 0.
- 18:21 AUD-MJ-BILL-126: 15 SAFE / 2 UNSAFE (guest welcome email can send twice; no money). Outside scope: guest charged w/o account on slow pay/decline retry (unverified). GuestCheckout 0 rows in prod. -> B-GUEST-126 launched.
