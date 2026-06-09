# ROMAN_AVATAR_INTEGRATION_SPEC — Roman Avatar Implementation + Integration Plan

Author: Dynasia G <dynasia@trygrowthproject.com>

Date: 2026-06-09

Status: implementation-ready planning spec; no source-code changes in this PR.

Scope: integrate the five operator-approved Roman mascot crops into the TGP client app and coach app while preserving Roman as the single in-product AI persona.

Primary source inputs verified before writing: Roman identity PR #1, bank payout / first-payment-wow PR #4, `/tmp/mobile-main` at `4b7587e`, `/tmp/backend-main` at `ed78bbe`, and the five PNG files under `mascot-assets/`.

Repository constraints: this document only specifies implementation; it does not modify mobile app source code, backend source code, or image assets.

---

## §0 — Asset inventory + naming

The operator approved the five Roman mascot crops as-is. Treat these source PNGs as the immutable v1 masters for this spec PR.

| Source file in this PR | Purpose | Dimensions | Background type | Canonical asset name | Primary use sites |
|---|---:|---:|---|---|---|
| `mascot-assets/roman_chat_avatar_neutral_1024.png` | Default composed Roman chat/head avatar | 1024×1024 | Opaque warm-grey | `roman_avatar_neutral` | AI chat, coach brief, neutral blockers, generic empty states |
| `mascot-assets/roman_chat_avatar_smile_1024.png` | Restrained smile / knowing approval face | 1024×1024 | Opaque warm-grey | `roman_avatar_smile` | Joke punchlines, workout completion, first-payment wow, dunning recovery, milestone celebrations |
| `mascot-assets/roman_full_body_hero_9x16.png` | Portrait full-body hero | 1024×1820 | Opaque warm-grey gradient | `roman_hero_full_body` | Day-one welcome, coach first-payment wow, premium hero cards, optional onboarding step |
| `mascot-assets/roman_monogram_icon_512.png` | Single-letter Roman monogram | 512×512 | Transparent | `roman_monogram` | app splash, small badges, fallback, tab/empty-state accents, image-disabled fallback |
| `mascot-assets/roman_welcome_card_16x9.png` | Landscape welcome composition with negative space | 1820×1024 | Opaque warm-grey gradient | `roman_welcome_card` | auth welcome, day-one welcome, first-launch card, shareable intro surface |

Canonical React Native bundle names should be lowercase snake_case with scale suffixes because Metro understands `name.ext`, `name@2x.ext`, and `name@3x.ext`.

Use `src/assets/roman/` in the mobile repo for bundled fallbacks and generated local derivatives.

The source PNG names in this agent-context PR should remain unchanged so future asset provenance is obvious.

Recommended generated bundle file bases:

- `src/assets/roman/roman_avatar_neutral.webp`
- `src/assets/roman/roman_avatar_neutral@2x.webp`
- `src/assets/roman/roman_avatar_neutral@3x.webp`
- `src/assets/roman/roman_avatar_smile.webp`
- `src/assets/roman/roman_avatar_smile@2x.webp`
- `src/assets/roman/roman_avatar_smile@3x.webp`
- `src/assets/roman/roman_monogram.png`
- `src/assets/roman/roman_monogram@2x.png`
- `src/assets/roman/roman_monogram@3x.png`
- `src/assets/roman/roman_hero_full_body.webp`
- `src/assets/roman/roman_hero_full_body@2x.webp`
- `src/assets/roman/roman_hero_full_body@3x.webp`
- `src/assets/roman/roman_welcome_card.webp`
- `src/assets/roman/roman_welcome_card@2x.webp`
- `src/assets/roman/roman_welcome_card@3x.webp`

Recommended CDN object keys should be versioned and content-addressable:

- `/roman/v1/roman_avatar_neutral_1024.webp`
- `/roman/v1/roman_avatar_smile_1024.webp`
- `/roman/v1/roman_monogram_512.png`
- `/roman/v1/roman_hero_full_body_1024x1820.webp`
- `/roman/v1/roman_welcome_card_1820x1024.webp`
- `/roman/v1/manifest.json`

The generated local names intentionally avoid crop sizes in the base name so React Native can select the right scale automatically.

The CDN names intentionally include dimensions because the URL is a stable public artifact and must be readable without source context.

---

## §1 — Asset hosting strategy

### Option A — Bundled assets

Ship Roman inside the app binary and load each crop via `require('../../assets/roman/...')`.

Pros:

- Zero network dependency.
- Works offline on first launch.
- Instant render for welcome, chat, and blocker moments.
- Simpler implementation because Metro owns the asset graph.
- Fewer privacy and observability concerns because no image request leaves the device.

Cons:

- The five approved PNG masters total 6.1 MB on disk.
- `/tmp/mobile-main/assets` is only 692 KB today, so shipping all current PNG masters would increase the existing asset directory by roughly 8.8× before store compression.
- Every visual update requires a new app release and app-store review cycle.
- A/B visual variants require bundling every candidate for every user, even users not assigned to that variant.
- Dark-mode variants would add another asset set and compound binary growth.

### Option B — CDN-hosted with bundled fallback

Load primary Roman assets from a CloudFront/S3 URL, but keep a lower-resolution bundled fallback for offline and first-render reliability.

Pros:

- Hotswap v2 Roman assets without an app update.
- Enables A/B testing of visual variants, joke rates, and smile-trigger policies.
- Keeps app binary growth modest by bundling only compressed fallbacks.
- Allows dark-mode or platter-specific variants to ship independently of mobile release trains.
- `expo-image` can keep CDN assets in memory and disk cache after first load.

Cons:

- Requires network for first high-resolution render.
- More complex than pure Metro assets.
- Needs manifest versioning, fallback logic, analytics, and CDN invalidation discipline.
- Must define behavior when users are in gyms, garages, basements, rural areas, or travel settings with weak connectivity.

### Verdict

Recommend **Option B: CDN-hosted with bundled fallback** for production, with Phase 1 structured so the bundled fallback alone can ship if the CDN work is not ready.

Reasoning:

- Fitness app users routinely open the app in real-world environments with unreliable connectivity: gyms with overloaded Wi-Fi, garages, basements, parks, and travel contexts.
- The fallback must be good enough to preserve Roman in chat, onboarding, and blocker moments without waiting on the network.
- The approved source PNGs are 6.1 MB, while the current mobile asset directory is 692 KB; always bundling the full masters is disproportionate for v1.
- Roman is a new brand persona, so the team should expect post-launch tuning: dark variants, smile frequency, welcome-card composition, and joke-rate experiments.
- CDN primary delivery gives the operator iteration speed while bundled fallbacks preserve the offline trust required for a fitness product.

Implementation rule: never block a user flow while fetching a Roman image.

Implementation rule: if the CDN manifest fails, render the bundled fallback immediately and suppress user-visible errors.

Implementation rule: keep the monogram bundled at all times because it is the smallest, transparent, most reliable fallback.

---

## §2 — Image processing pipeline

### Current mobile image framework inventory

The mobile repo currently uses React Native `Image` from `react-native` in app screens and shared components.

Verified existing `Image` use sites in `src/`:

- `src/screens/client/active-workout/ExerciseImage.tsx`
- `src/screens/client/RecipesScreen.tsx`
- `src/screens/client/RecipeDetailScreen.tsx`
- `src/components/log/QuantityPickerModal.tsx`
- `src/components/log/FoodSearchView.tsx`
- `src/components/home/CoachIntroductionBanner.tsx`
- `src/components/FoodImage.tsx`

No `expo-image` or `react-native-fast-image` dependency is present in `/tmp/mobile-main/package.json`.

Recommendation: add `expo-image` for Roman only, and do not refactor existing food/exercise images in the same PR.

Why `expo-image`:

- The app is already an Expo app on Expo SDK 56.
- Roman needs CDN URLs, fallback handling, transitions, memory cache, and disk cache.
- `expo-image` has cache controls and preloading APIs suited to the CDN-with-fallback architecture.
- Using it only in `RomanAvatar` keeps the change localized.

### Format policy

Use lossy WebP for warm-grey opaque assets.

Use PNG for the transparent monogram fallback unless a later platform test proves lossless WebP transparency is equally safe across the supported Expo SDK target set.

Do not use AVIF in v1 because React Native / Expo support remains less predictable than PNG/WebP across all target devices.

For WebP quality, start at `q=84` for square avatars and `q=86` for hero/welcome assets.

Retain the original approved PNG masters outside the mobile app, not inside the production bundle.

### Exact local fallback sizes to generate

| Variant | Local fallback files | Pixel sizes | Format | Notes |
|---|---|---:|---|---|
| `neutral` | `roman_avatar_neutral.webp`, `@2x`, `@3x` | 128×128, 256×256, 384×384 | WebP | Default chat and brief head crop. |
| `smile` | `roman_avatar_smile.webp`, `@2x`, `@3x` | 128×128, 256×256, 384×384 | WebP | Smile state for positive triggers and punchlines. |
| `monogram` | `roman_monogram.png`, `@2x`, `@3x` | 64×64, 128×128, 192×192 | PNG | Transparent; fallback for all failures. |
| `hero` | `roman_hero_full_body.webp`, `@2x`, `@3x` | 341×607, 682×1213, 1024×1820 | WebP | Maintains original 9:16-ish portrait aspect. |
| `welcome` | `roman_welcome_card.webp`, `@2x`, `@3x` | 360×203, 720×405, 1080×608 | WebP | 16:9 card for onboarding and auth. |

### Exact CDN sizes to generate

| Variant | CDN primary | CDN thumbnail | Format | Cache behavior |
|---|---:|---:|---|---|
| `neutral` | 1024×1024 | 384×384 | WebP | Immutable object key under `/roman/v1/`. |
| `smile` | 1024×1024 | 384×384 | WebP | Immutable object key under `/roman/v1/`. |
| `monogram` | 512×512 | 192×192 | PNG | Immutable object key under `/roman/v1/`. |
| `hero` | 1024×1820 | 682×1213 | WebP | Immutable object key under `/roman/v1/`. |
| `welcome` | 1820×1024 | 1080×608 | WebP | Immutable object key under `/roman/v1/`. |

### Script to specify, not execute in this PR

Create `scripts/build-roman-assets.sh` in the mobile repo in a later implementation PR.

The script should be deterministic and should fail if a source PNG is missing or if a generated file has zero bytes.

The script should accept `SOURCE_DIR` and `OUT_DIR` environment variables so CI and local workflows can run the same command.

Pseudo-implementation:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${SOURCE_DIR:=mascot-assets}"
: "${OUT_DIR:=src/assets/roman}"

mkdir -p "$OUT_DIR"

# Required sources
test -f "$SOURCE_DIR/roman_chat_avatar_neutral_1024.png"
test -f "$SOURCE_DIR/roman_chat_avatar_smile_1024.png"
test -f "$SOURCE_DIR/roman_monogram_icon_512.png"
test -f "$SOURCE_DIR/roman_full_body_hero_9x16.png"
test -f "$SOURCE_DIR/roman_welcome_card_16x9.png"

# Square avatars, WebP fallbacks
magick "$SOURCE_DIR/roman_chat_avatar_neutral_1024.png" -resize 128x128 "$OUT_DIR/roman_avatar_neutral.webp"
magick "$SOURCE_DIR/roman_chat_avatar_neutral_1024.png" -resize 256x256 "$OUT_DIR/roman_avatar_neutral@2x.webp"
magick "$SOURCE_DIR/roman_chat_avatar_neutral_1024.png" -resize 384x384 "$OUT_DIR/roman_avatar_neutral@3x.webp"

magick "$SOURCE_DIR/roman_chat_avatar_smile_1024.png" -resize 128x128 "$OUT_DIR/roman_avatar_smile.webp"
magick "$SOURCE_DIR/roman_chat_avatar_smile_1024.png" -resize 256x256 "$OUT_DIR/roman_avatar_smile@2x.webp"
magick "$SOURCE_DIR/roman_chat_avatar_smile_1024.png" -resize 384x384 "$OUT_DIR/roman_avatar_smile@3x.webp"

# Transparent monogram, PNG fallbacks
magick "$SOURCE_DIR/roman_monogram_icon_512.png" -resize 64x64 "$OUT_DIR/roman_monogram.png"
magick "$SOURCE_DIR/roman_monogram_icon_512.png" -resize 128x128 "$OUT_DIR/roman_monogram@2x.png"
magick "$SOURCE_DIR/roman_monogram_icon_512.png" -resize 192x192 "$OUT_DIR/roman_monogram@3x.png"

# Hero and welcome crops
magick "$SOURCE_DIR/roman_full_body_hero_9x16.png" -resize 341x607 "$OUT_DIR/roman_hero_full_body.webp"
magick "$SOURCE_DIR/roman_full_body_hero_9x16.png" -resize 682x1213 "$OUT_DIR/roman_hero_full_body@2x.webp"
magick "$SOURCE_DIR/roman_full_body_hero_9x16.png" -resize 1024x1820 "$OUT_DIR/roman_hero_full_body@3x.webp"

magick "$SOURCE_DIR/roman_welcome_card_16x9.png" -resize 360x203 "$OUT_DIR/roman_welcome_card.webp"
magick "$SOURCE_DIR/roman_welcome_card_16x9.png" -resize 720x405 "$OUT_DIR/roman_welcome_card@2x.webp"
magick "$SOURCE_DIR/roman_welcome_card_16x9.png" -resize 1080x608 "$OUT_DIR/roman_welcome_card@3x.webp"

# Sanity check
find "$OUT_DIR" -type f -name "roman_*" -size 0 -print -quit | grep -q . && exit 1 || true
```

Do not run this script as part of the agent-context spec PR.

---

## §3 — React Native integration touchpoints

The following touchpoints are grounded in the actual `/tmp/mobile-main/src` tree.

Counted integration touchpoints: **20**.

| # | Priority | Verified file path | Current placeholder / state | Roman crop | Layout notes |
|---:|---|---|---|---|---|
| 1 | P0 | `src/screens/client/AIGuideScreen.tsx` | AI messages render a `GP` text avatar; empty state uses a chatbubble icon. | `neutral`; `smile` for punchlines/milestones. | Replace `styles.aiAvatar` content with `RomanAvatar size={30}`; keep bubble spacing; add smile only when message metadata says positive trigger or quip. |
| 2 | P0 | `src/screens/day-one/WelcomeScreen.tsx` | Wordmark block renders `TGP` as text. | `welcome` or `hero`. | Put `roman_welcome_card` above the first welcome copy on large screens; use `monogram` on compact screens if vertical space is tight. |
| 3 | P0 | `src/screens/auth/WelcomeScreen.tsx` | Logo container renders a circular `GP` text mark. | `welcome`; fallback `monogram`. | Replace the `GP` mark with a Roman card in the hero area or a monogram in the existing 80px circle; keep auth CTAs visually dominant. |
| 4 | P0 | `src/screens/client/ClientPackagesScreen.tsx` | `DunningBanner` uses warning icon and dunning copy when available. | `neutral`; `smile` on recovery. | Day-3 warning: small neutral avatar beside calm payment-method copy; Day-7 blocker: centered Roman head above the update-card CTA; after successful retry/update show smile for one render. |
| 5 | P0 | `src/entitlements/PaywallSheet.tsx` | Global entitlement paywall has text and CTA but no Roman visual. | `neutral`. | Add 48–64px neutral avatar above title; do not use smile because a blocker is not celebratory. |
| 6 | P0 | `src/entitlements/ProtectedScreen.tsx` | Fail-closed centered paywall has title/body/button. | `monogram` or `neutral`. | Use monogram for compact protected screens; use neutral if there is at least 96px top whitespace. |
| 7 | P1 | `src/screens/coach/CoachBriefScreen.tsx` | Coach daily brief has empty/error states and summary cards. | `neutral`; rare `smile`. | Add Roman in the header summary card as the brief presenter; smile only on all-clear or record-morning state. |
| 8 | P1 | `src/components/coach/CoachAiSection.tsx` | Coach AI entry point has no persona avatar. | `neutral` or `monogram`. | Put monogram in the section header and neutral in expanded helper copy; keep coach task CTAs primary. |
| 9 | P1 | `src/components/coach/ai-execution/AskAiActionSheet.tsx` | Bottom sheet starts with “Ask AI” copy and option icons. | `neutral`. | Add 40px neutral avatar in the sheet header; do not animate in a bottom sheet. |
| 10 | P1 | `src/screens/coach/PendingAiDraftsScreen.tsx` | Empty state uses document-style iconography. | `monogram`. | Use monogram for the empty state and neutral only if the first draft preview contains Roman-authored copy. |
| 11 | P1 | `src/screens/client/CheckoutReturnScreen.tsx` | Payment success uses animated check badge; cancel/loading states use generic icons. | `smile` for success only. | Place 56px smile avatar below the check badge after confirmed paid state; never show Roman on cancel/loading. |
| 12 | P1 | `src/screens/client/PurchaseUnpackScreen.tsx` | Receipt header uses checkmark-circle; empty/error states use cube/hourglass/alert icons. | `smile` for paid receipt; `neutral` for empty/error. | Add smile in the receipt header for “You are in”; use neutral for “coach is finalising” state; keep deliverable rows untouched. |
| 13 | P1 | `src/screens/client/ActiveWorkoutScreen.tsx` | Finish flow uses native `Alert.alert` and then saves/navigates. | `smile`. | Future replacement: Roman completion sheet after successful save; do not put Roman in the pre-finish confirmation alert. |
| 14 | P1 | `src/screens/client/Day1WinScreen.tsx` | Day-one win screen has AI message content but no Roman visual. | `smile`. | Put smile avatar beside the AI message card; use neutral if the selected day-one win is non-celebratory. |
| 15 | P1 | `src/screens/client/ClientPathCopilotScreen.tsx` | AI copilot surface has empty states and AI notes, behind feature flag. | `neutral`. | Add Roman to empty state and note header; keep all flag checks unchanged. |
| 16 | P2 | `src/screens/share/ShareCardScreen.tsx` | Share-card renderer uses variant icons and branded layout. | `monogram` or `smile`. | Default to monogram watermark; allow smile on milestone share cards only if the image does not reduce text contrast. |
| 17 | P2 | `src/components/EmptyState.tsx` | Shared empty-state component accepts icon-like visual patterns. | Configurable. | Add optional `illustration`/`footerVisual` support rather than globally inserting Roman into every empty state. |
| 18 | P2 | `src/ui/empty-states/EmptyState.tsx` | UI-layer empty-state surface used by multiple screens. | Configurable. | Same as above: Roman is opt-in by surface, not automatic. |
| 19 | P2 | `src/screens/coach/payments/CoachConnectScreen.tsx` | Stripe Connect onboarding uses wallet/construct/check icons and text states. | `neutral`; `smile` after fully onboarded. | Use neutral for setup and config-required states; smile only after `charges_enabled` and `payouts_enabled` are both true. |
| 20 | P2 | `src/screens/coach/payments/CoachEarningsScreen.tsx` | Earnings screen has pending payout hero, empty coming-soon card, and last-payout row. | `neutral`; `smile` for first payout / record payout. | Use neutral in empty state; smile only on milestone payout state. |

Future ED.3 first-payment wow screen: no existing `FirstPaymentWowScreen` or `WowScreen` file exists under `/tmp/mobile-main/src` today.

Recommended future file path: `src/screens/coach/payments/FirstPaymentWowScreen.tsx`.

For the ED.3 first-payment wow screen, use `hero` for full-screen ceremony if vertical room exists, and use `smile` for compact modal/share-card layouts.

Human coach/client direct messaging surfaces should not show Roman as a participant.

Verified human-message surfaces that should remain human-only include `src/screens/coach/MessagesScreen.tsx`, `src/screens/client/MessagesScreen.tsx`, and `src/components/messaging/MessageBubble.tsx`.

---

## §4 — Component contracts

Create a shared React Native component: `src/components/roman/RomanAvatar.tsx`.

Required public props:

```ts
type RomanVariant = 'neutral' | 'smile' | 'monogram' | 'hero' | 'welcome';

interface RomanAvatarProps {
  variant: RomanVariant;
  size?: number;
  theme?: 'auto' | 'light' | 'dark';
  onPress?: () => void;
  accessibilityLabel?: string;
}
```

Recommended internal-only props may include `style`, `testID`, `contentFit`, and `surface`, but do not expose them until the first integration proves they are necessary.

Variant mapping:

- `neutral` maps to `roman_avatar_neutral`.
- `smile` maps to `roman_avatar_smile`.
- `monogram` maps to `roman_monogram`.
- `hero` maps to `roman_hero_full_body`.
- `welcome` maps to `roman_welcome_card`.

Behavior requirements:

- Choose CDN URI first when the manifest is loaded and enabled.
- Choose bundled fallback immediately when the manifest is absent, stale, or disabled.
- Render bundled monogram if the selected non-monogram image fails.
- Never show a red error or broken-image icon to the user.
- Respect `onPress` by wrapping the image in an accessible pressable only when `onPress` is provided.
- If `onPress` is absent and adjacent text already introduces Roman, mark the image decorative.
- If `onPress` is present, set accessibility role to `button`.
- Apply a light skeleton or muted monogram while the primary image loads.
- Use `contentFit="contain"` for `hero` and `welcome`, and `contentFit="cover"` for square avatars only when the container is square.
- Use rounded corners only for square chat/avatar variants.
- Do not crop the full-body hero unless a layout explicitly asks for a partial portrait.

Dark-mode behavior:

- The opaque warm-grey images should render inside a wrapper surface in dark mode.
- The wrapper should use the app dark elevated-surface token, a subtle border, and 8–12px padding.
- The transparent monogram should render directly over the current app surface color.
- Do not attempt to tint or recolor Roman artwork in code.

Loading behavior:

- Initial render: show bundled monogram immediately if primary asset is not synchronously available.
- CDN load success: crossfade to CDN primary with a 120–180ms transition.
- CDN load failure: keep fallback, track a non-blocking analytics event, and do not retry more than once in the same render lifecycle.

Error fallback priority:

1. CDN selected variant.
2. Bundled selected variant fallback.
3. Bundled monogram.
4. Text fallback “Roman” for image-disabled/data-saver mode.

Performance preloading:

- Preload `monogram` and `neutral` after auth state is known.
- Preload `welcome` before first-launch/day-one routes if onboarding will render.
- Lazy-load `hero` because it is large and not needed in common app sessions.
- Lazy-load `smile`, but opportunistically preload after the first successful Roman render because smile is likely on positive milestones.

Testing contract:

- Unit test variant-to-asset mapping.
- Unit test CDN failure falls back to monogram.
- Unit test `onPress` changes accessibility role.
- Unit test dark-mode wrapper behavior.
- Snapshot test at least one compact and one hero layout.

---

## §5 — Joke rotation infrastructure

Roman identity PR #1 says dry humour is a small tendency, roughly one message in eight, never two in a row, and never at the user’s expense.

That rule is a copy/voice property, but the smile variant should support the same moment without turning Roman into a comic mascot.

Default rule: Roman is `neutral` unless a positive or dry-humour trigger explicitly requests `smile`.

Smile duration rule: for static cards, the avatar stays smile for that card; for chat, smile belongs to the specific message bubble; for transient toasts, smile should not exceed the toast lifetime.

| Event / trigger | Surface owner | Variant | Notes |
|---|---|---|---|
| Roman default assistant answer | Client AI guide / coach AI | `neutral` | Standard face for all ordinary AI copy. |
| Dry-joke punchline selected by copy policy | Client AI guide / coach brief | `smile` | Only if the message is the joke-bearing message; next Roman message must return neutral. |
| Successful workout completion | Client workout | `smile` | Use after successful save, not before confirmation. |
| Personal best / PR logged | Client workout / share card | `smile` | Pair with measured milestone copy. |
| Day-one win completed | Client day-one flow | `smile` | This is a positive activation moment. |
| First payment received by coach, ED.3 | Coach payments | `smile` or `hero` | Use smile head in compact layout; hero in full-screen ceremony. |
| First payout sent to bank | Coach earnings / payout | `smile` | Only for milestone payout, not every routine payout. |
| Dunning Day-3 reminder | Client packages / blocker | `neutral` | Calm, dignified; money matter should not smile. |
| Dunning Day-7 blocker | Client packages / blocker | `neutral` | Firm and composed. |
| Dunning recovery / card updated / retry success | Client packages / payment recovery | `smile` | Smile after the user is restored. |
| Subscription renewal reminder | Client billing | `neutral` | Money disclosure remains plain. |
| Checkout purchase success | Client checkout return / purchase unpack | `smile` | Success only; cancel/error remains neutral or no Roman. |
| Generic system error | Both apps | `neutral` | Never smile on failure. |
| Transient network hiccup with self-deprecating quip | Both apps | `smile` optional | Only for low-stakes retryable errors. |
| Coach all-clear morning brief | Coach brief | `smile` | Rare positive business moment. |
| New client joined coach roster | Coach roster / brief | `smile` optional | Use sparingly; default can remain neutral. |
| Voice logging confirmation | Client workout | `neutral` | Precision matters more than warmth. |
| Day-7 retry success after failed payment | Client packages / dunning | `smile` | Explicit recovery moment. |

Joke-state storage should live outside the visual component.

Recommended policy object: `romanVoicePolicy` with `lastQuipAt`, `lastQuipSurface`, `sessionQuipCount`, and `assignedRate`.

The visual component only receives `variant`; it must not decide whether a joke should fire.

---

## §6 — Accessibility

Roman should be respectful, useful, and never noisy for assistive technology users.

Per-crop en-US alt text defaults:

| Variant | Default accessibility label | Decorative default? |
|---|---|---:|
| `neutral` | `Roman, The Growth Project assistant.` | Yes when adjacent text already identifies Roman. |
| `smile` | `Roman, smiling slightly.` | Yes for decorative celebration; no if image is the only indicator of success. |
| `monogram` | `Roman monogram.` | Yes unless used as the only logo/identity mark. |
| `hero` | `Roman, The Growth Project assistant, standing composed.` | No on welcome hero unless adjacent title already names Roman. |
| `welcome` | `Roman welcomes you to The Growth Project.` | No on first-launch card; yes if the text says the same thing. |

VoiceOver and TalkBack behavior:

- Do not announce Roman repeatedly for every AI chat bubble if the message is already clearly from Roman.
- In chat, announce the sender once per grouped message cluster where practical.
- If the avatar is tappable, announce the label and button role.
- If the avatar is decorative, set the image as not accessible and keep semantic focus on the message or CTA.
- Do not use the smile image as the only accessibility signal for success; include text such as “Workout complete” or “Payment updated.”

Image-disabled / data-saver fallback:

- Provide a settings-aware fallback that renders a text badge reading `Roman` or `R` instead of downloading images.
- The monogram fallback may be bundled and safe even in data-saver mode if the user has not disabled all images.
- Roman chat messages should remain readable with sender label text, not just avatar identity.
- Any screen that relies on Roman for emotional payoff must still render the copy and CTA without image assets.

Color contrast:

- Do not place body text directly over warm-grey gradient artwork unless there is a tested overlay or separate text panel.
- If text overlays the welcome card, body text must meet WCAG AA 4.5:1 contrast and large display text must meet 3:1 contrast.
- Preferred layout is text beside or below artwork, not over artwork.
- In share cards, reserve sufficient solid-background area for text before adding Roman watermark or smile avatar.
- Run automated contrast checks for any final overlay treatment in both light and dark themes.

Motion and sensory accessibility:

- Crossfades should be short and non-essential.
- Respect reduce-motion settings by disabling any bounce, parallax, or celebration animation around Roman.
- Haptics on milestone surfaces should be tied to the surface event, not to the avatar image itself.

---

## §7 — Dark mode + theming

The current mobile `app.json` sets `userInterfaceStyle` to `light`, but Roman should be designed so dark mode does not require a rewrite later.

### Option A — Keep warm-grey backgrounds in dark mode

Pros:

- No new assets required.
- The warm-lit patch can feel intentional, like Roman is lit separately from the dark UI.
- Lowest implementation effort.
- Works with the five approved crops as-is.

Cons:

- The warm rectangle may feel jarring on fully dark screens.
- Requires wrapper styling so the image does not look like an accidental light-mode island.

### Option B — Ship dark-background variants

Pros:

- Best long-term polish once dark mode is official.
- Lets Roman feel native to dark surfaces.
- Avoids warm-grey cards clashing with dark modals.

Cons:

- Requires new operator-approved art generation.
- Doubles the asset matrix and increases CDN / fallback complexity.
- Adds QA scope across all surfaces.

### Option C — Render Roman on transparent background over app surface

Pros:

- Most theme-native approach.
- Best for flexible layouts and share cards.

Cons:

- Only the monogram crop is transparent today.
- The four character crops have baked warm-grey backgrounds.
- Requires follow-up regeneration or matting work for character assets.

### Recommendation

Recommend **Option A for v1**: keep warm-grey backgrounds and wrap them intentionally in dark elevated surfaces if dark mode is enabled later.

Follow-up recommendation: create transparent or dark-background character variants only after the first product rollout validates which surfaces actually need them.

If the operator chooses Option C later, commission regenerated transparent character crops rather than trying to remove the baked background from approved assets.

---

## §8 — Preloading + caching

Use `expo-image` cache policy `memory-disk` for Roman CDN images and bundled fallbacks.

Cache policy by asset:

| Variant | Cache policy | Preload timing | Rationale |
|---|---|---|---|
| `monogram` | bundled + memory | App startup / immediately after JS bootstrap | Tiny, transparent, universal fallback. |
| `neutral` | memory-disk | After auth state resolves | Most common Roman face across chat, brief, blockers. |
| `smile` | memory-disk | Idle after first Roman render | Likely used during milestones; not required at app open. |
| `welcome` | memory-disk | Before auth/day-one welcome route | Needed for first impression but not for returning app sessions. |
| `hero` | memory-disk | Lazy on route focus | Large, only used on high-emotion surfaces. |

App-launch eager preload list:

1. `roman_monogram` bundled fallback.
2. `roman_avatar_neutral` bundled fallback.
3. CDN manifest if network is available and user has not enabled data-saver image suppression.

Post-login idle preload list:

1. CDN `neutral` thumbnail.
2. CDN `smile` thumbnail.
3. CDN `welcome` if user is in first-session/day-one state.

Lazy-load list:

1. `hero` full-body crop.
2. Full-resolution `welcome` card outside first launch.
3. Any future v2/dark/platter variants.

CDN cache invalidation strategy:

- Use immutable versioned object keys for actual assets: `/roman/v1/...`, `/roman/v2/...`.
- Keep `manifest.json` as the only short-TTL object.
- Manifest TTL should be short enough for experiments, such as 5–15 minutes, but assets should be immutable for one year.
- The manifest should include `version`, `variantId`, `url`, `width`, `height`, `sha256`, and `fallbackBundleKey`.
- Do not overwrite `/roman/v1/roman_avatar_neutral_1024.webp` for routine changes.
- For emergency rollback, flip manifest pointers back to a prior immutable version.
- Only use CloudFront invalidation for accidental bad uploads, not normal releases.

Offline behavior:

- If the network is unavailable, render bundled fallback immediately.
- If the CDN asset is cached, render cached asset even when offline.
- If cached CDN and bundled fallback differ, prefer cached CDN unless the manifest marks that version revoked.

---

## §9 — A/B variant infra

Roman visual assets and Roman joke policy should be independently configurable.

Visual A/B structure:

- CDN manifest exposes one or more asset sets, such as `roman.v1.approved`, `roman.v2.dark`, or `roman.v2.transparent`.
- PostHog feature flag assigns a stable `roman_asset_set` per user.
- The mobile app loads the assigned manifest entry and falls back to `roman.v1.approved` if assignment is missing or invalid.
- Asset-set assignment must be sticky by user ID, not by session.

Joke-rate A/B structure:

- PostHog feature flag `roman_joke_rate` controls the dry-humour probability.
- Suggested variants: `0` for no jokes, `0.125` for identity-default one-in-eight, and `0.25` for exploratory upper bound.
- Enforce “never two in a row” locally even if the assigned probability is higher.
- Money, failure, and precision-confirmation surfaces can opt out regardless of experiment assignment.

Smile-trigger A/B structure:

- Feature flag `roman_smile_policy` can tune how often visual smile appears.
- Suggested variants: `milestones_only`, `milestones_and_jokes`, and `milestones_jokes_recoveries`.
- Start with `milestones_and_jokes` for client app and `milestones_only` for coach app.

Analytics events:

- `roman_asset_exposed` with `surface`, `variant`, `asset_set`, `cdn_used`, `fallback_used`, and `cache_hit`.
- `roman_joke_policy_exposed` with `surface`, `assigned_rate`, and `previous_message_had_quip`.
- `roman_smile_rendered` with `surface`, `trigger`, and `duration_ms` when available.
- `roman_asset_error` with `surface`, `variant`, `asset_set`, and coarse error category only.

Experiment metrics:

- Client activation: day-one completion, first workout completed, AI guide engagement.
- Coach activation: coach brief opens, first package publish, first payment wow completion, Connect onboarding completion.
- Trust guardrails: support tickets mentioning AI tone, payment confusion, and app-store review sentiment.
- Performance guardrails: image load error rate, fallback rate, cold-start time, and route render time.

Privacy guardrail: do not use sensitive health metrics to assign Roman visual variants or joke rates.

---

## §10 — Coach app vs client app surface differences

Roman appears in both client app and coach app per the identity spec.

Recommendation: use an identical shared component and shared asset pipeline for both apps, with per-surface configuration for variant selection and joke-rate policy.

Shared component path: `src/components/roman/RomanAvatar.tsx`.

Shared policy path: `src/components/roman/romanPolicy.ts` or `src/lib/roman/romanPolicy.ts`, depending on where the team keeps cross-surface business logic.

Client app usage profile:

- More welcome and habit-building moments.
- More workout completion and streak celebration moments.
- More chat-based AI helper moments.
- Default joke rate can follow identity default of roughly 1 in 8 where the surface allows jokes.
- Smile can appear on workout completion, day-one win, PRs, purchase success, and dunning recovery.

Coach app usage profile:

- More businesslike and operational moments.
- More money, roster, brief, and draft-management surfaces.
- Lower joke rate is recommended, such as roughly 1 in 12 on coach-facing operational surfaces.
- Smile should be rarer and reserved for first payment, first payout, roster milestones, all-clear brief, and record business moments.
- Payment setup errors, Connect configuration blockers, and payout failures must remain neutral.

Do not fork the component.

Do allow config flags:

- `romanSurfaceProfile: "client" | "coach"`.
- `allowQuip: boolean`.
- `allowSmile: boolean`.
- `moneySurface: boolean`.
- `precisionSurface: boolean`.

The component stays visual; the policy layer decides whether a surface is allowed to smile or quip.

---

## §11 — Implementation phases / tickets

### Phase 1 — Asset pipeline + `RomanAvatar` foundation

Complexity: M.

Dependencies: approved source PNGs; decision on `expo-image` dependency; CDN domain decision can be stubbed behind a manifest interface.

Rough files touched in mobile implementation PR:

- `package.json` and lockfile for `expo-image`.
- `scripts/build-roman-assets.sh`.
- `src/assets/roman/*` generated fallbacks.
- `src/components/roman/RomanAvatar.tsx`.
- `src/components/roman/romanAssets.ts`.
- `src/components/roman/romanManifest.ts`.
- `src/components/roman/__tests__/RomanAvatar.test.tsx`.

Acceptance criteria:

- Given no network, when `RomanAvatar variant="neutral"` renders, then the bundled neutral fallback appears.
- Given the selected image fails, when the error callback fires, then bundled monogram appears with no user-visible error.
- Given dark theme, when an opaque crop renders, then it is wrapped in an intentional elevated surface.
- Given `onPress`, when screen reader focus lands on the avatar, then it announces as a button.

### Phase 2 — Top three client-value integrations

Complexity: M/L.

Dependencies: Phase 1 component; copy policy for smile triggers; design review for welcome layout.

Top surfaces:

1. `src/screens/client/AIGuideScreen.tsx`.
2. `src/screens/day-one/WelcomeScreen.tsx` and `src/screens/auth/WelcomeScreen.tsx`.
3. `src/screens/client/ClientPackagesScreen.tsx`, `src/entitlements/PaywallSheet.tsx`, and `src/entitlements/ProtectedScreen.tsx`.

Acceptance criteria:

- Given the AI guide renders a Roman-authored message, when the avatar appears, then it uses neutral by default.
- Given a joke-bearing Roman message, when it renders, then the smile variant appears for that message only.
- Given onboarding first-launch renders, when image loading is disabled, then the screen still names Roman and remains usable.
- Given a dunning blocker renders, when no image is available, then payment update copy and CTA remain primary.

### Phase 3 — Full rollout to remaining verified surfaces

Complexity: L.

Dependencies: Phase 2 validation; surface-by-surface design QA; ED.3 first-payment-wow backend/mobile route decisions.

Files likely touched:

- `src/screens/client/CheckoutReturnScreen.tsx`.
- `src/screens/client/PurchaseUnpackScreen.tsx`.
- `src/screens/client/ActiveWorkoutScreen.tsx`.
- `src/screens/client/Day1WinScreen.tsx`.
- `src/screens/client/ClientPathCopilotScreen.tsx`.
- `src/screens/share/ShareCardScreen.tsx`.
- `src/components/EmptyState.tsx`.
- `src/ui/empty-states/EmptyState.tsx`.
- `src/screens/coach/CoachBriefScreen.tsx`.
- `src/components/coach/CoachAiSection.tsx`.
- `src/components/coach/ai-execution/AskAiActionSheet.tsx`.
- `src/screens/coach/PendingAiDraftsScreen.tsx`.
- `src/screens/coach/payments/CoachConnectScreen.tsx`.
- `src/screens/coach/payments/CoachEarningsScreen.tsx`.
- Proposed new `src/screens/coach/payments/FirstPaymentWowScreen.tsx`.

Acceptance criteria:

- Given a routine coach payment setup blocker, when the screen renders, then Roman remains neutral.
- Given first-payment wow is triggered, when the ceremony renders, then Roman uses smile or hero according to available layout.
- Given a share card is generated, when Roman is included, then all visible text remains WCAG AA compliant.
- Given a human direct-message screen renders, when no AI message is present, then Roman does not appear as a participant.

### Phase 4 — A/B infrastructure + joke-rate tuning

Complexity: M.

Dependencies: PostHog flag naming; CDN manifest deployment; analytics schema review.

Files likely touched:

- `src/lib/analytics.ts` or equivalent analytics wrapper.
- `src/components/roman/romanExperiment.ts`.
- `src/components/roman/romanPolicy.ts`.
- `src/components/roman/romanManifest.ts`.
- PostHog flag configuration outside the repo.

Acceptance criteria:

- Given a user is assigned `roman_joke_rate=0`, when Roman copy renders, then no joke is selected.
- Given a user is assigned `roman_joke_rate=0.125`, when eligible messages render over a session, then the policy targets roughly one in eight while preventing consecutive jokes.
- Given the CDN manifest points to `roman.v2`, when a user is assigned that asset set, then the app uses v2 after manifest load and falls back to v1 bundled assets on failure.
- Given an asset error occurs, when analytics fires, then it contains no sensitive user health data.

---

## §12 — Open operator decisions

1. Confirm the CDN domain and object-path owner for `/roman/v1/*` assets.

2. Approve adding `expo-image` to the mobile app for Roman, or require the implementation to use React Native `Image` only for v1.

3. Confirm dark-mode direction for v1: keep warm-grey backgrounds with dark wrappers, or commission dark-background variants before launch.

4. Confirm whether ED.3 first-payment wow can use the approved `smile` / `hero` crops, or whether it needs a separate platter-specific celebration crop.

5. Confirm whether native `AppSplash` should remain brand-only or eventually use the transparent Roman monogram.

6. Confirm coach-app dry-joke rate: use the same roughly one-in-eight policy as client app, or lower coach operational surfaces to roughly one in twelve.

7. Confirm image-disabled / data-saver setting ownership: global app setting, OS/network-derived mode, or Roman-only preference.

8. Confirm whether Roman should appear on payment paywalls immediately in Phase 2 or wait until dunning copy and billing-state routes are fully live.

9. Confirm whether provenance artifacts such as `RUN_SUMMARY.md` and `_monogram_24px_check.png` should ever be committed, or whether implementation PRs should only consume the five approved PNG masters.

10. Confirm PostHog flag names before engineering starts Phase 4 so experiment dashboards and mobile code do not drift.

---

End of spec.
