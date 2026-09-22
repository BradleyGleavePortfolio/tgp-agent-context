# Roman-led Import: Customer Journey and Acceptance Contract

## Status and binding direction

This is the implementation target supplied by the user on September 17, 2026, not a claim that the flow is shipped. It refines the existing recovery plan: Roman owns guidance; the deterministic importer owns execution; the backend owns durable evidence; usable native TGP records are the result.

User direction, verbatim:

> We need this - cpach downloads TGP on their [phone from the app store/ google play -> then starts up their account, does onboarding, and meets roman the AI assistant -> then roman says "have you coached before, sir? -> yes -> Want to import your records from your past service? -> yes -> shows a list of common coaching sites OR a "go to browser and find it yourself..." option - make sense? then they go to their coaching platform either way, login, the exstension pops up and says "start importing?" - it shows a progress UI, calm and explanatory, then it says all done! Review information found? - need a quick page to show a sumamry of clients imported, past workouts, ect ect. -> then they go back to TGP and see the inofrmation imported and populated history!

## The customer journey

| Moment | Roman and the interface | Required underlying truth |
|---|---|---|
| Download and account creation | Coach installs TGP from their phone's store and creates the account. | Distribution is verified separately; app installation is not extension installation or pairing. |
| Meet Roman | Roman introduces himself during coach onboarding and asks, “Have you coached before?” The user's requested “sir” style can follow a known form-of-address preference rather than inferring gender. | Server-provisioned coach eligibility; a conversational answer never grants a role. |
| Offer the migration | “Would you like to bring your clients and coaching history into TGP?” Primary: “Import my records.” Secondary: “Do this later.” A new coach can continue without importing. | Persistent, resumable onboarding decision, not a blocking wizard or hidden Settings-only feature. |
| Choose the source | Familiar source shortcuts plus “Find another coaching platform.” | Shortcuts are navigation aids, not an unverified promise that all source families are supported. |
| Reach a supported browser | Roman explains the device requirement before opening a source login. Save the place and guide a secure desktop continuation for the current extension. | Browser/profile capability and an installed, enabled, compatible importer are positively verified. |
| Find another source | On the paired supported browser, the coach can navigate to the service they use, then select “Use this site.” A validated HTTPS address is a fallback, not the only discoverability path. | Explicit current-tab selection and scoped consent. Do not monitor unrelated browsing or automatically grant all-site access. |
| Log in to the source | Coach signs in directly to their coaching service. Roman explains why access is needed and that TGP will not change source records. | Correct source origin/account evidence; no source password collection by Roman; no claim of access based solely on opening a URL. |
| Obvious Start prompt | On-page extension-owned prompt or supported extension surface: “Ready to bring these records into TGP?” Primary: “Start importing.” Show source and destination accounts before consent. | Real extension handshake, valid pairing, source authorization, one durable accepted Start. A toolbar popup is not assumed to open automatically on every platform. |
| Calm progress | “Finding your clients” → “Bringing across workouts and history” → “Checking everything in TGP.” Show proven counts and the current action. | Durable intent-scoped evidence, bounded autonomous execution, no fabricated percentage or estimate represented as fact. Zero required coach navigation after Start on the successful path. |
| Review summary | “Your import is ready to review.” Show clients, programs/workouts, completed workout history and other actually verified families, with date coverage and exceptions. | Server-verified native writes and relationships. Found, staged, newly created, already present and unresolved are distinct counts. |
| Return to TGP | “Open my clients” and “View imported history” lead to the actual native records. Roman remembers the migration and offers the summary again. | Tenant-scoped result identifiers, real destination routes, current app data refresh. A file, staging row or generic entity label does not satisfy this step. |

## Mobile-to-browser bridge

The current extension route needs an explicit supported desktop continuation. Google's phone instructions use “Add to desktop”; the computer may still prompt for permissions and “Enable extension,” so phone selection is not proof of an enabled phone extension ([Chrome Web Store Help](https://support.google.com/chrome_webstore/answer/2664769?hl=en-GB)).

Roman should say, before redirecting: “We’ll start here. To connect your previous platform securely, continue this step in Chrome on your computer. I’ll keep your place, and you’ll be able to follow the import here in TGP.” The exact browser name and availability must be driven by the verified release support matrix.

The handoff is a resumable setup locator, not an access token. Opening it on a computer still requires authenticated ownership/explicit pairing; no bearer token, pairing code or customer data goes into a shareable URL. Show a real, verified install destination, then detect the extension and guide enablement if required. Do not display an invented store link.

If the coach has only a phone, provide “Continue later” without trapping onboarding. A fully phone-only import requires a separately built and verified execution path; the current MV3 extension cannot be represented as that solution.

## Honest progress and completion

Keep these concepts distinct in the contract:

- **Setup:** A durable invitation to import exists. Nothing has been captured.
- **Paired:** A particular extension session is bound to this coach. No import is implied.
- **Source ready:** The selected source is authorized and preflight is satisfied.
- **Started:** The server accepted one Start for this intent.
- **Importing:** Bounded read-only discovery and import are active; source inventory may still be unknown.
- **Verifying:** Captured material is being reconciled to native clients, workouts, history and relationships.
- **Complete:** The authorized source scope is accounted for and usable native results are verified.
- **Needs attention / incomplete:** Explain the exact missing or unsafe scope and available recovery. Never say “all done” for partial, timed-out or unreconciled work.

Use indeterminate progress while scope is unknown. Only use a determinate total after the denominator is evidenced and stable; preserve counts across interruptions, label stale data, and report reconnection without pretending execution has stopped or completed.

The summary is an inspection surface after successful migration, not a second mandatory approval that silently delays importing until the coach returns. It must also support an honest incomplete-result view. No automatic invitations, emails, payments or source-service changes are part of import.

## Acceptance scenarios for implementation

1. Fresh mobile coach says no previous coaching: normal onboarding continues, with no pairing request.
2. Existing coach accepts import: Roman's source choices appear in onboarding, not only Settings.
3. Coach postpones from any setup stage: the app remains usable and a named resume entry returns to the same owned intent.
4. Phone opens a source URL without a desktop extension: no “connected” or “Start ready” claim appears.
5. Missing/disabled/incompatible/wrong-profile extension: explain the specific issue and supported remedy.
6. Common source shortcut: source and destination account confirmation precedes Start.
7. Other-source choice: coach can find the site in the paired browser; access remains restricted to explicitly selected origins.
8. Source logged out, permission refused or account mismatched: no source capture begins; the recovery action is concrete.
9. Duplicate Start / transient retry: one logical run, one accepted-start time and idempotent native writes.
10. Popup closes, worker suspends or mobile app backgrounds: authoritative status remains resumable or reports a bounded recoverable failure.
11. Roster changes from an unrelated action: they are not counted as this import.
12. Stage ingest succeeds but native history is absent: the run cannot display “all done.”
13. Missing family, relationship, historical period or contradictory evidence: non-success identifies unresolved scope without fabricating zero records.
14. Successful run: summary counts match native results and every relevant deep link opens usable records.
15. Coach signs out and another signs in: intent, setup state, progress and results do not cross tenants.
16. Accessibility: keyboard/screen-reader use, contrast, focus, reduced motion and polite status announcements work on each real surface.
17. After one accepted Start: the coach is never required to click through client pages to teach the importer the successful path.
18. Five-minute target: measure accepted Start through native reconciliation, not first staged record; a deadline breach is not relabeled complete.

## Implementation dependency and current evidence

The existing approved order remains C1 durable server intent, then M5 coach onboarding and a separately reviewed extension consumer; no flag flip or live-account pilot is authorized by the ruling ([C1/M5 ruling](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md)).

The inspected mobile source has a separate coach wizard, while the older generic onboarding navigator is deprecated; implementation must use the actual coach branch and reconcile server-supported roles rather than insert a screen into the wrong stack. Current pairing and importer status cannot by themselves prove this full journey: server-issued durable correlation, browser activation, autonomous discovery, native-family writing and final reconciliation remain explicit work.

This document changes the target and test obligations, not production behavior. Backend recovery and independent pagination audits continue in disjoint lanes; Roman/M5 product code is not claimed implemented.
