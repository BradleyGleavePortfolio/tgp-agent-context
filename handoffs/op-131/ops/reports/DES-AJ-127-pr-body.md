Tier: T1
Why: Bounded presentation and truthful-copy pass on the existing More menu; every handler, route, flag and tutorial target remains.
T4 trigger scan: No auth, tenancy, PII, payments, credentials or destructive data change.
T3 trigger scan: No new backend contract, navigation registration, dependency or state mutation.
Bounded T1: MoreScreen + existing reachability tests + matching client README; under 300 changed lines.
Canonical builder: DES-AJ-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: See test evidence below; all 22 possible rows are exercised across eight flag/platform configurations and both semantic palettes.
Promotion triggers: Any required destination, data-access, consent or payment behavior change goes back to the operator.

## What changes for coaches/clients
The More index has six quiet groups instead of boxed cards. Cormorant titles, Inter row text, outline icons, generous targets and semantic theme colors replace filled icon tiles and card borders. Every destination remains one tap away, with a chevron and its existing accessibility hint. Order within each group follows the previous menu; groups follow first appearance, preserving tutorial-health-first and Roman-first priority.

No tab/navigator change, no hidden group, no new primary CTA, no data request, no lockfile edit or new dependency. A navigation index has one intent: choose a destination. Its rows are deliberately equal-weight rather than inventing a privileged action. Roman retains the existing original avatar per its face/voice contract; no new photo or illustration is added. All other rows retain outline glyphs. The wearable tutorial target ids remain unchanged.

## B / U list
- B1: A coachless client opening More is told to ask their coach's guide without an established coach; descriptions and hint now say AI guidance.
- B2: A client with no assigned meal plan, targets or history opening More sees descriptions asserting those exist; neutral destination descriptions replace those assertions.
- B3: A client opening an exercise without a video is promised a video for each exercise; the menu now describes exercise instructions.
- U1: Competing cards/filled icon tiles and missing groups make the index harder to scan; semantic hairlines and six overlines replace them.
- U2: Three title-case row labels become sentence case without changing destinations.
- U3: Membership/dashboard/prep/device descriptions describe the actual destinations without implying payments, configured widgets, a weekly plan or already-connected data.

## Truthful sweep (before styling; baseline d0875d26)
All references below are in `src/screens/client/MoreScreen.tsx`.

| Before line | Old copy | What is true | Replacement |
| --- | --- | --- | --- |
| 52 | The meals planned for you this week | Menu does not load an assigned plan | View meal plans |
| 59 | Your daily calories, protein and more | Menu does not load daily targets | View daily calorie and nutrient targets |
| 66 | Your weight trend and today's totals | Menu does not load history/totals | View weight trends and daily totals |
| 80 | Your journey so far, week by week | Menu does not check for timeline entries | View timeline entries |
| 87 | How each exercise is done, with video | Exercise detail supports missing video | Browse exercise instructions |
| 97, 99 | Ask your coach's guide anything / Opens guidance — your coach's AI assistant | No coach presence is checked on this screen | Open AI guidance / Opens AI guidance |
| 104 | Your plan, payments and access | Membership destination presents access details, not a payments list | Membership and access details |
| 160 | Customize your dashboard | Widgets destination presents setup/options and working shortcuts | Widget setup and options |
| 181 | Weekly meal prep plan | Menu does not check for a weekly prep plan | View meal preparation guidance |
| 229 | Activity, heart rate and sleep from your devices | Visible without any device connected | View activity, heart rate and sleep |

Other true/neutral descriptions and hints remain word for word. Neutral descriptions work for both populated and empty states without fetching or inventing user data; render tests check every changed description and the guidance hint.

## Routes/actions before -> after
Only MoreScreen is touched. Stack destinations use the unchanged `navigation.navigate(screen)`. Cross-tab destinations still use the parent tab navigator with `{ screen, initial: false }`, preserving Back behavior.

| Before label | After label | Destination/effect (unchanged) | Condition (unchanged) |
| --- | --- | --- | --- |
| Roman | Roman | MoreStack: RomanChat | romanChat on |
| Meal plan | Meal plan | MoreStack: Plan | Always |
| Macro targets | Macro targets | MoreStack: ClientMacros | Always |
| Progress | Progress | MoreStack: Progress | Always |
| Habits and check-in | Habits and check-in | Home tab: Habits, initial false | Always |
| Timeline | Timeline | MoreStack: Timeline | Always |
| Exercise library | Exercise library | WorkoutTab: ExerciseLibrary, initial false | Always |
| Health and sleep | Health and sleep | MoreStack: Health; tutorial target more-health | iOS, Android Health Connect build or tutorial on |
| Connected devices | Connected devices | MoreStack: Connections; tutorial target more-connections | iOS, Android Health Connect build or tutorial on |
| Guidance | Guidance | MoreStack: AIGuide | Always |
| Membership | Membership | MoreStack: Membership | Always |
| Recipes | Recipes | MoreStack: Recipes | Always |
| Fasting | Fasting | MoreStack: Fast | Always |
| Community | Community | MoreStack: Community | Always |
| Profile | Profile | MoreStack: ProfileMain | Always |
| Settings | Settings | MoreStack: Settings | Always |
| Report | Report | MoreStack: Report | Always |
| Learn | Learn | MoreStack: Learn | Always |
| Widgets | Widgets | MoreStack: Widgets | Always |
| Grocery List | Grocery list | MoreStack: GroceryList | Always |
| Shopping List | Shopping list | MoreStack: ShoppingList | Always |
| Prep Guide | Prep guide | MoreStack: PrepGuide | Always |

No route/action is removed. The list/listitem semantics and per-row button roles remain.

## Test evidence
- Local dependency-free failing-first proof: baseline d0875d26 fails `Meal plan has a group overline`; changed source passes all 22 route mappings, ten neutral descriptions, six groups, semantic colors, hairlines and retained row contracts. Logs: `ops/reports/DES-AJ-127-{baseline,head}-proof.log` in operator workspace.
- Shared deps were unavailable before the completed-code push (common brief rule 4 fallback); no dependency install or lockfile edit. After the operator announced READY at 13:35 PDT, local `heavy.sh npx jest src/screens/client/__tests__/MoreScreen.reach.test.tsx --runInBand` proved failing-first: d0875d26 baseline 12 failed / 8 passed, changed head 20 / 20 passed. Logs are `DES-AJ-127-render-{baseline,head}.log` in the operator report directory.
- `src/screens/client/__tests__/MoreScreen.reach.test.tsx`: render parity for every action, exact grouped order, flag/platform visibility, truthful copy and semantic light/dark styling.
- A separate baseline worktree at d0875d26 carries the same new test file used for the red/green render proof.
- Existing Roman-avatar/list semantics guard remains compatible; navigator is untouched.
- [CI run 37680956501](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680956501) passed the MoreScreen render parity file, Roman accessibility/face contract, quiet-luxury doctrine and copy-voice guards. Lint, typecheck and config guards passed. Overall test job initially failed only the untouched `ConnectProviderSheet.importEpoch.test.tsx:303` sign-out-during-import copy assertion (678 suites / 8,925 tests passed; one failed); one rerun of that failed job only was requested, without rerunning green CodeQL jobs.
- At 13:43 PDT the single failed-job rerun passed: all required checks and CodeQL are green at b19be4c99012ea0e106d2b7d316bed60f208e3bc. [FIX ROUND 1 opening](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/484#issuecomment-6046498141) requests the two independent exact-head audits.

## Documentation / doctrine
- Matching client README updated, including the stale four-tab/icons-only introduction; six launch tabs remain unchanged.
- No heavy display weights, placeholder feature claims, emojis, exclamation marks, new large radii, FABs, global banners, particles, gradients or TODOs.
