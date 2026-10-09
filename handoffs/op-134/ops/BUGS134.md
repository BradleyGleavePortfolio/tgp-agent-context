# 41-problem register tracker (operator agent 134). Owner 20:2x: "alert me when all 41 issues are done and UI is improved for
# clients and coaches clearly". DONE = fix merged to main (and backend deployed where server-side); "seen in a test" / "from the code"
# per item; a device check is claimed only when done. Updated by the operator.

| B | Problem | Fix (PR) | Status 20:30 |
|---|---|---|---|
| B01 | Progress icons cut off | m#576 (COACHLESS-FIX-134) merged 20:59 | DONE (from the code) |
| B02 | Packages before coach setup | b#894 deployed (deploy 10); m#620 m#621 m#622 merged; m#623 (K5-K8) open | review (m#623) |
| B03 | Coach questions thin | b#894 deployed; m#620-622 merged; m#630 merged; b#897 open; m#623 open | review (m#623, b#897) |
| B04 | Confirmation email in spam | owner: Resend connected to Supabase (owner 20:2x "done") | DONE (owner; not seen in a test) |
| B05 | "Resend" looked broken | m#576 merged 20:59 | DONE (from the code) |
| B06 | Payouts not switched on | owner Stripe Connect 17:53 + m#576 copy merged 20:59 | DONE (from the code; not tested) |
| B07 | "Setup moved on another device" | b#889 (deploy 8) | DONE (from the code) |
| B08 | Back does nothing | m#576 merged 20:59 | DONE (from the code) |
| B09 | Back under gesture bar | m#576 merged 20:59 | DONE (from the code) |
| B10 | Technical error text | m#576 merged 20:59 | DONE (from the code) |
| B11 | Logo "GP" | merged (agent 133) | DONE |
| B12 | Bare welcome | merged (agent 133) | DONE |
| B13 | Squished to top | client: m#582 m#593 m#607 m#608 merged; coach: m#625 m#626 m#627 m#633 merged | DONE (from the code; seen in a test) |
| B14 | Not the consultative onboarding | m#580 m#579 m#581 merged; house seed applied 21:18 (1 active house set, owner account; SELECT) | DONE (from the code + production SELECT) |
| B15 | Letters cut off | merged | DONE |
| B16 | Rectangle buttons | m#607 merged 21:23 (radius tokens); coach literals m#625-627 | DONE (from the code) |
| B17 | Crammed role page | merged | DONE |
| B18 | "Where does it begin?" robotic | m#580 merged (lean flow never mounted) | DONE (from the code) |
| B19 | Bar over birth-year wheel | m#579 merged 20:59 | DONE (from the code) |
| B20 | Target weight on birth-year page | m#580 merged | DONE (from the code) |
| B21 | "Step 3 of 6" not chapters | m#579 merged 20:59; m#581 merged 21:06 | DONE (from the code) |
| B22 | "Logging comes with coaching" | b#888 deployed; app copy PaywallSheet.tsx:47 + HomeScreen.tsx:409 (CLIENT-POLISH-134 item 5) | server done; app copy building |
| B23 | Logging disabled coachless | b#888 merged, deploy 9 live 20:28 | DONE (from the code) |
| B24 | "Food and water logging need active access" | b#888, deploy 9 live 20:28 | DONE (from the code) |
| B25 | "Message your coach" coachless | m#618 merged 21:23 | DONE (from the code; seen in a test) |
| B26 | Community on two lines | m#618 merged 21:23 (Inter 11, one line at 360 pt measured from the font file) | DONE (from the code; seen in a test) |
| B27 | Roman picture cut off | m#602 merged | DONE |
| B28 | Squished at top | client + coach inset PRs merged (m#582 m#607 m#624 m#625 m#626 m#627 m#633) | DONE (from the code; seen in a test) |
| B29 | Pages not world-class | m#614-616 m#632 merged (Habits, Progress), m#633 coach Home solo target, m#624 m#631; m#634 + INSETS-A follow-up open | partly (2 small coach PRs open) |
| B30 | Roman chat prehistoric | m#601 m#602 merged | DONE |
| B31 | Roman can't see details | merged + deployed (agent 133) | DONE |
| B32 | No "Before Roman answers" sheet | m#592 merged 21:03; aiRefusal.ts coachless line (REFUSAL-COACHLESS-134) | DONE (from the code; one coachless copy line follow-up) |
| B33 | No reveals / tour | m#603 m#604 m#605 m#606 merged (tour, 7 beats, spotlights, overlay); m#581 merged | DONE (from the code; seen in a test) |
| B34 | "THURSDAY, THE EIGHTH." | m#618 merged 21:23 ("Thursday, 8 October", locale order) | DONE (from the code; seen in a test) |
| B35 | App never opens | m#619 merged 21:06 | DONE (from the code; seen in a test) |
| B36 | "Locked" flashes | m#619 merged 21:06 | DONE (from the code; seen in a test) |
| B37 | No calm try-again screen | m#619 merged 21:06 (prototype 44) | DONE (from the code; seen in a test) |
| B38 | Old data up to 60 s | b#889 (deploy 8) | DONE (from the code) |
| B39 | iPhone-only safe-area wrapper | safe-area-context everywhere: client PRs + coach m#625 m#626 m#627 merged | DONE (from the code) |
| B40 | Approved features off in builds | m#580 (eas.json flags) merged | DONE (from the code) |
| B41 | Owner first to see screens on a phone | pre-build screen pass + post-build check | open |
