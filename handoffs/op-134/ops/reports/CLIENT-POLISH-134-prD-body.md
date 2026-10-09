CLIENT-POLISH-134 (agent 134), SHOTS-134B item b: **B29**. P0 "Before we start" at 360x800: box 1 sits below the fold, so Continue looked disabled for no visible reason (seen in a web render, SHOTS-134B 6).

### Change
- `src/screens/consultation/QuestionScreen.tsx` (`ConsentBody`): while box 1 is unticked (and the agreement is not blocked by a version mismatch), the pinned footer shows one muted line directly above the disabled Continue: **"Tick the first box above to continue."** It goes as soon as box 1 is ticked and comes back if it is unticked. Live region polite, so a screen reader hears it.
- Why a line and not moving box 1: the P0 record hashes the screen text in display order (title, paragraphs 1-3, box 1, paragraph 4, box 2, footer; `consentCopyText()`, server `consult-consent-copy.ts`). Moving box 1 out of that order would change what the hash says was shown. The line is outside the consent text (like the coach-sharing sentence and the Privacy Policy link), so `consult-consent-v3/v4`, `CONSENT_COPY_SHA256` and the server copy do not change.

### Before -> after
| Screen | Before | After |
|---|---|---|
| P0, 360x800, box 1 unticked | disabled Continue, no reason on screen (box 1 below the fold) | "Tick the first box above to continue." above the disabled Continue |
| P0, box 1 ticked | Continue enabled | unchanged; the line is gone |
| P0, version mismatch | error line, Continue disabled | unchanged (no tick line; the error says why) |

### Parity table
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 26 P0 (consent) | src/screens/consultation/QuestionScreen.tsx | two boxes in the agreement order, pinned Continue, optional box 2 unticked | a muted line above the disabled Continue on unticked box 1 (prototype at 390 shows box 1 above the fold; at 360 it is not) |

### WHY / WHEN / WHO
The P0 screen (mobile #310, D2 two-box contract) put Continue in the pinned footer and box 1 after three paragraphs; on a 360x800 phone the paragraphs push box 1 below the fold. Only an accessibilityHint said why.

### Tests (heavy.sh, one file at a time; seen in a test)
- new `src/screens/consultation/__tests__/consentTickHint134.test.tsx` 2/2: the line shows with a disabled Continue, sits in the pinned footer with Continue (box 1 does not), goes on tick and returns on untick; it is not in `consentCopyText()`.
- kept green: consultationPrivacy 66/66, ConsultationFlow 32/32, consultationLostResponse 21/21, consultationMemoryBox2 12/12, consultationCoachSharing 2/2, truthfulCopy 20/20, copyVoice 8/8. tsc clean, eslint clean.

### Not seen on a device
Check P0 on a 360x800 Android phone: the line sits above the disabled Continue and goes when box 1 is ticked.

agent 134
