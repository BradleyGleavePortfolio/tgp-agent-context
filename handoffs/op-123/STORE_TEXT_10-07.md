# Store text — October 07 build

Prepared for agent 123 by S-STORECOPY-123, W3-19. Read-only inspection; no submission, build, production change or commit.

## Use this packet

Use the plain-text blocks for the store fields; the evidence and operator instructions outside those blocks are not store copy.

The inspected baseline is mobile `a727eb495a0ce381a22c4ac40370c0c69f53a656` and backend `5230306cb63df7290459bb362340a42f385f39d5`, verified against GitHub main. [Mobile baseline](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a727eb495a0ce381a22c4ac40370c0c69f53a656), [backend baseline](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/5230306cb63df7290459bb362340a42f385f39d5).

**Recommendation:** use the release copy below, correct the four normal-use claim findings, and supply verified review accounts before submission.

## 1. App Store — What's New

```text
New in this update:

- Roman chat for training questions, with optional AI permission.
- View and delete past conversations with Roman.
- A Calendar tab to book and manage coaching sessions.
- Community spaces for coach-led posts and conversations.
- Improved coach messaging with replies, editing, pinned messages and mute controls.
- A Programs library for coaches to build and assign training.
- Clearer renewal and trial terms for recurring coaching plans.
```

Roman, Community, Calendar and Programs are enabled in the production build profile, and the client and coach navigators register the corresponding screens. [Production profile](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/eas.json), [client routes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/navigation/ClientNavigator.tsx), [coach routes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/navigation/CoachNavigator.tsx).

Consent and conversation controls are supported by the Roman settings screens, messaging v2 is enabled in the backend manifest, and recurring checkout displays renewal and trial terms. [Roman permission controls](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/screens/settings/RomanAiConsentScreen.tsx), [Roman conversation controls](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/screens/settings/romanChatsCopy.ts), [message actions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/components/messaging/threadV2.ts), [backend feature manifest](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/.github/fly-env-desired-state.json), [plan terms](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/lib/planTerms.ts).

Validated draft length: **460 Unicode characters**.

Apple allows up to 4,000 characters and does not offer this field for an app's first version. [Apple version-information reference](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information).

Before using this block, run the same ordinary client and coach paths in the actual October 07 binary; remove any bullet whose feature is disabled or unavailable in that submitted build.

## 2. Play — What's new

```text
This update adds Roman chat with optional AI permission, controls to view and delete Roman conversations, a coaching Calendar, and community spaces. Coach messaging includes replies, edits, pinned messages and mute controls. Coaches can build and assign training programs. Recurring coaching-plan checkout shows renewal and trial terms.
```

The same implementation evidence supports this shorter version; it deliberately omits Health Connect, which is disabled in the inspected production Android profile. [Production profile and platform distinction](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/eas.json).

Google permits 500 Unicode characters per language and prohibits promotional solicitation in release notes. [Google release instructions](https://support.google.com/googleplay/android-developer/answer/9859348?hl=en).

Validated draft length: **336 Unicode characters**, leaving 164 characters of headroom.

### Play full-description health paragraph

Append this to the full description, not just the release notes:

```text
The Growth Project provides personal training and general nutrition guidance. It is not a medical device and does not diagnose, treat, cure, or prevent any medical condition. Consult a healthcare professional for medical advice, diagnosis, or treatment, and before making medical decisions. Roman is an AI assistant, not a healthcare professional, and its replies can be wrong.
```

Google's health policy requires the non-medical-device disclaimer in the app description and a reminder to consult a healthcare professional; the product's existing training waiver and public terms already describe personal training rather than medical care. [Google health policy](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en), [training consent](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/lib/consultation/copy.ts), [public terms](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/trust-pages.html.ts).

## 3. App Review notes

**Paste only after the review-account checklist and the real-time coaching attestation below are complete. Do not submit an assertion that the owner has not verified.**

```text
The Growth Project is a personal-training app for clients and individual coaches. It is not a medical service.

REVIEW ACCESS
The client and coach credentials are supplied in App Review Information. Both accounts contain synthetic review data only. The client is paired with the review coach and has an active coaching plan, sample training and nutrition logs, a message thread, community membership and coaching sessions.

Client review paths:
- Calendar: open the Calendar tab to see sessions and book an available time with the assigned coach.
- Messages: open the coach thread; long-press a message for the available reply, edit, pin and delete actions.
- Roman: open More > Roman. Client-data AI requires the optional AI permission. Reviewers can allow or withdraw it in More > Settings > Privacy > Roman and AI.
- Roman history: use the conversations button in Roman to view and delete past conversations.
- Privacy controls: open More > Settings > Privacy for Trust & Privacy and data export. Account deletion is available in Settings.

Coach review paths:
- Clients and Messages: open the populated client roster and coach-client thread.
- Programs: open the Programs tab to inspect, edit and assign the sample training program.
- Settings: Packages, Availability and Booking Inbox show the sample coaching offer and session setup.

PAYMENTS — GUIDELINE 3.1.3(d)
The paid client offers available in this iOS release are real-time, one-to-one personal-training services between the client and a named individual coach. Stripe PaymentSheet collects payment for those human coaching services under Guideline 3.1.3(d). Recurring plans display price, renewal interval and any trial terms before payment.

Programs and app tools support the human coaching service; they are not sold as standalone digital products in this iOS release. Coach software subscriptions, AI credit packs and paid group services are not offered for purchase in this iOS app. Roman is an AI assistant, not the human coaching service that supports the payment exception.

HEALTH DATA AND AI
Apple Health connection is optional. After HealthKit permission, selected activity, workout, sleep, heart-rate and body-measurement data is sent to The Growth Project's servers and shown to the client and assigned coach for personal training. The current connector reads Apple Health; it does not write workouts back to it.

Optional client-data AI permission identifies Anthropic and the training information used for Roman and coach AI drafts. Declining or withdrawing it does not remove the client's ordinary coaching, plan or messages. Roman conversations are private from the coach, not from all service operators; authorized staff access and provider processing are described in the privacy policy.

Health data is not used for advertising or marketing. The app does not diagnose or treat medical conditions. Users are directed to qualified healthcare professionals for medical decisions.

Privacy policy:
https://app.trygrowthproject.com/privacy

Consumer Health Data Privacy Policy:
https://app.trygrowthproject.com/consumer-health-privacy
```

### Notes evidence and submission boundaries

Validated App Review notes draft length: **3,114 Unicode characters**. Credentials belong in the private review-access fields, not in the published metadata.

- **Access:** Apple requires an active demo account or fully featured demo mode and a functioning backend, not invented example credentials. [Apple review-access requirements](https://developer.apple.com/app-store/review/guidelines/).
- **Payment basis:** 3.1.3(d) applies to **real-time** services between two individuals; it is not a blanket exception for asynchronous coaching, training PDFs, prerecorded content, AI answers or group services. [Apple payment rule](https://developer.apple.com/app-store/review/guidelines/).
- **Implementation:** the inspected iOS purchase policy hides non-P2P purchases, but its own documentation says client packages still depend on the product catalog being genuinely real-time 1:1 coaching. [iOS purchase policy](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/config/purchaseSurfaces.ts).
- **Health and AI:** the HealthKit client requests `write: []`; optional consent names Anthropic, and the policy describes health-data use, processing and restricted staff access to Roman chats. [Read-only HealthKit implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/services/health/healthkit/healthKitClient.ts), [AI consent copy](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/lib/consultation/copy.ts), [privacy disclosures](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/trust-pages.html.ts).
- **Review navigation:** the cited client settings and client/coach routes support the paths in the draft; menu labels must still be checked in the submitted binary. [Client privacy settings](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/screens/client/SettingsScreen.tsx), [client routes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/navigation/ClientNavigator.tsx), [coach routes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/navigation/CoachNavigator.tsx).

### Owner completion checklist

1. **Provide two working review accounts.** Use a client paired with a review coach and an independent coach sign-in; populate the data listed in the draft. Keep every real person's health, messages and payment information out of the demo.
2. **Verify access in the submitted binary.** Check email/password login, both roles, plan entitlement, coach availability, messages, community membership and optional AI permission. Include any additional access instructions in the private store-console review fields.
3. **Keep credentials private.** Enter each account's actual credentials directly in App Store Connect and Play App access. Do not copy passwords, tokens or credential exports into this packet, GitHub or screenshots.
4. **Attest to each paid iOS offer.** Confirm the named human coach and the real-time 1:1 service delivered, including recurring packages. If an offer is asynchronous-only, standalone content or a group product, remove that offer from iOS purchase availability or implement its applicable store-payment route; do not disguise it by calling it coaching.
5. **Confirm the exact October 07 artifact and store forms.** Use its final version/build identifiers, enabled features and permission set. Confirm the privacy URLs and Health apps declaration in the store consoles; this inspection did not access those consoles or a built binary.

## 4. Claim findings — four normal-use Bs

These are copy corrections, not requests for feature expansion or edge hardening.

### B-STORECOPY-1 — Trust Center overstates security guarantees

**Location:** mobile `src/screens/TrustCenterScreen.tsx:459,544-546`.

**Normal-user story:** a client opens Trust & Privacy and is told that every transfer uses TLS 1.3, every stored datum uses AES-256 and authentication tokens reside in a secure enclave, although the implementation and public security statement do not establish those universal promises. [Trust Center claims](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/screens/TrustCenterScreen.tsx), [public security statement](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/trust-pages.html.ts).

The public security page explicitly says TLS **1.2 or higher**, with TLS 1.3 where supported, while mobile storage includes an AsyncStorage fallback and token storage uses Expo SecureStore rather than a guarantee that the token itself resides in secure-enclave hardware. [Public security, line 606](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/trust-pages.html.ts), [actual cache storage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/storage/mmkv.ts), [token adapter](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/services/secureStorage.ts), [Expo storage behavior](https://docs.expo.dev/versions/latest/sdk/securestore/).

**Smallest fix:** replace the metadata value with `Encrypted in transit; secure token storage`, remove the universal algorithm/hardware claims, and use these bullets:

```text
Data sent to The Growth Project's servers is encrypted in transit.
Authentication tokens use iOS Keychain or Android Keystore-backed secure storage.
Some app data is cached on this device. The Privacy Policy describes server storage and access.
```

Do not claim a new data leak or require a storage redesign: the finding is the customer-facing guarantee.

### B-STORECOPY-2 — Public signup still says invite-only

**Location:** backend `src/public-pages/public-pages.html.ts:135-142`; repeated on `src/public-pages/trust-pages.html.ts:665`.

**Normal-user story:** a new client or coach opens the public signup page without a code and is incorrectly told that an invitation is required, discouraging the open signup the owner approved. [Public signup copy](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/public-pages.html.ts), [open-signup owner decision](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/42859172cef880c4d50fac70518a19c36223053b/TGP_SOURCE_OF_TRUTH.md).

The page is publicly routed at `/signup`; the backend signup policy makes invitation requirements configurable rather than intrinsically mandatory, and the owner explicitly superseded “by invitation only.” [Public route](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/public-pages.controller.ts), [signup policy](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/auth/auth.service.ts), [owner decision](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/42859172cef880c4d50fac70518a19c36223053b/TGP_SOURCE_OF_TRUTH.md).

**Smallest fix:** change the no-code headline/body and status-page label; preserve the valid-code branch.

```text
Headline: Create an account

Body: Open The Growth Project app to create a client or coach account. If a coach shared an invite code, enter it during setup to connect with them. No invite code is needed to create an account. For help with setup, contact support.

Status-page label: Signup information and coaching invitations.
```

If an intentional live invitation gate is reinstated, use gate-aware wording instead of the unconditional last sentence.

### B-STORECOPY-3 — Public FAQ incorrectly describes coaching as web-only

**Location:** backend `src/public-pages/help-pages.html.ts:466-468`; mirrored in `docs/help/faq.md:105-108`.

**Normal-user story:** a coach reads the public FAQ and is told the coach experience is web-only even though the launch app provides mobile Clients, Programs, Messages and Settings, misleading the coach about where work can be done. [Customer-facing FAQ](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/help-pages.html.ts), [mobile coach navigator](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/navigation/CoachNavigator.tsx).

**Smallest fix:** replace the answer in the rendered page and its Markdown mirror:

```text
Coach tools are available in The Growth Project mobile app. Sign in with a coach account to manage clients, messages, training programs, coaching packages and availability.
```

### B-STORECOPY-4 — Copy-paste store declaration worksheets are obsolete

**Location:** mobile `PLAY_STORE_READINESS.md:44-64`; `docs/PLAY_INTERNAL_TESTING_PACKAGE.md:118-152`.

**Normal-user story:** the owner follows the repository's explicit copy-paste submission worksheet and submits an incomplete declaration that omits client AI processing and messages, describes diagnostics as optional without a user-choice basis, and relies on an obsolete permission inventory. [Readiness declaration table](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/PLAY_STORE_READINESS.md), [copy-paste submission worksheet](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/docs/PLAY_INTERNAL_TESTING_PACKAGE.md).

Current privacy disclosures include Roman/coach messages, Anthropic processing after optional permission, analytics linked to account ID and diagnostic reports linked to account ID; the app configuration also includes health and calendar native modules rather than the worksheet's original camera-only/no-direct-Android-permissions account. [Current privacy categories](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/trust-pages.html.ts), [current native configuration](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/app.json), [profile-specific health switch](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/eas.json).

The inspected telemetry initializers use configured SDK keys/DSNs rather than exposing a user opt-in/out in those initialization paths, while Google defines optional collection by user control, not by a developer's choice to configure a vendor. [Sentry initialization](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/services/sentry.ts), [PostHog initialization](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/lib/analytics.ts), [Google optional-collection definition](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).

**Smallest fix:** mark the old rows “superseded — do not paste,” then replace both worksheets with the final binary's declaration inventory from the review-readiness/privacy workstreams. Include in-app messages and other user content, Roman/AI processing and its optional permission, user/account identifiers in telemetry, actual enabled vendors, and the native permission inventory; do not call diagnostics “optional” unless a verified user opt-out makes that true.

Keep Google “collected” and “shared” classifications separate: service-provider processing exemptions must be evaluated rather than mechanically marking every backend transfer as sharing. [Google Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en). Google's declaration covers the sum of app practices across versions distributed on Play; include any other Play-distributed profile/version, not just this production build. [Google declaration coverage](https://support.google.com/googleplay/answer/11416267).

Do not declare Health Connect available in the current production Android profile or describe the user-initiated calendar copy as automatic synchronization. [Production platform switch](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/eas.json), [calendar-copy implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/calendar/phoneCalendar.ts).

## 5. Sweep outcome and wording boundaries

| Area | Outcome |
| --- | --- |
| Medical claims | No positive diagnosis, cure, treatment or clinical-accuracy claim found in the inspected visible training/health copy; existing consent and bloodwork language expressly limit the product to non-medical guidance. Keep the store description equally narrow. [Training consent](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/lib/consultation/copy.ts). |
| HIPAA / certification | No positive HIPAA-certified, SOC 2-certified or ISO-certified claim found in the inspected customer-facing surfaces; the public security copy explicitly does not claim an independent audit certification. Do not add one to metadata. [Certification wording](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/trust-pages.html.ts). |
| Off features | Omit featured-coach/coachless Home, new coach Code tools, Broadcasts, dunning v2, community DMs and community voice notes while their inspected launch gates are off. Existing one-to-one coach messages and legacy invite codes are different features. [Backend gates](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/.github/fly-env-desired-state.json), [Broadcast entry gate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/screens/coach/broadcasts/BroadcastsEntry.tsx), [coachless gate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/components/coachless/CoachlessHomeSlot.tsx). |
| AI positioning | Say “optional AI assistant,” not a doctor, autonomous coach, guaranteed answer or unlimited service; consent and public terms describe Anthropic processing and potentially incorrect replies. [AI consent](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/lib/consultation/copy.ts), [public AI terms](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/trust-pages.html.ts). |
| Historical docs | C: `docs/help/faq.md:98-101` still says 30-day deletion, while the rendered FAQ already says 14 days; synchronize the mirror, not a new deletion-system change. [Historical mirror](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/docs/help/faq.md), [rendered FAQ](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5230306cb63df7290459bb362340a42f385f39d5/src/public-pages/help-pages.html.ts). |
| Health-write metadata | C: `app.json:30,191` and `docs/mobile/HEALTH_NATIVE_MODULES.md:3,61` describe writing workouts to Apple Health, but the connector requests read-only access. Do not promote this as a shipped feature; align the dormant usage-description/docs during build-config work. [Metadata](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/app.json), [native-module notes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/docs/mobile/HEALTH_NATIVE_MODULES.md), [read-only connector](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a727eb495a0ce381a22c4ac40370c0c69f53a656/src/services/health/healthkit/healthKitClient.ts). |

**Boundary:** this packet is a source-code and repository-copy review, not a certification, store approval, live catalog inspection, credential check or device pass. No store-console description or screenshot was fetched; claims about what is already published in those consoles are intentionally excluded.

## HANDOFF
