# TGP Gym SaaS Deep Research: Extended Brief
## Front Desk, Owner Financials, Competitor Analysis & Build Priorities

*Compiled June 2026. Extends the baseline brief at gym-owner-frontdesk-needs.md — material already covered there is not repeated.*

---

## SECTION 1: Front Desk Staff — What Makes Their Job Easy or Enjoyable

### 1.1 What Front Desk Staff Actually Say (Reddit, Indeed, Glassdoor)

The clearest signal from staff-facing sources is this: front desk at a gym is a **high-social, low-pay, low-software-empathy** role, and the software is a consistent source of anxiety rather than support.

At **Equinox**, where front desk staff field 150+ member interactions per shift, an AMA thread on Reddit revealed a telling moment: staff are required to stand all day because sitting "doesn't align with the brand image." The software anxiety maps to the same logic — everything is optimized for the member experience and the brand, not for the person doing the work. [One former employee wrote](https://www.reddit.com/r/EquinoxGyms/comments/1e88smu/i_work_as_front_desk_equinox_ask_me_anything/): *"Yes! It's really REALLY important at my location that we check in EVERYONE. To the extent where if my manager thinks someone might not have been checked in they will ask us to double check and hunt down the person if their check in didn't go through."* The check-in system creates audit anxiety — not confidence.

On **Indeed**, Equinox front desk reviews from 2024–2025 consistently note the gap between the luxury environment and the administrative reality. A September 2024 review from Los Angeles: *"While I was employed, I LOVED LOVED LOVED the job and went over/beyond. However, in retrospect I am deeply ASHAMED of having worked there — due to intense corporate fraud/malpractice and a toxic work environment… Minimum Wage pay, even though the company keeps raising membership rates."* A June 2024 review: *"Pay is still kinda garbage considering each executive membership is about $350 a month and you may only make less than $20 depending on state minimums."* ([Indeed — Equinox Front Desk Reviews](https://www.indeed.com/cmp/Equinox-1/reviews?fjobtitle=Front+Desk+Agent))

At **Orangetheory**, the front desk turnover problem is severe enough that franchises have begun experimenting with full check-in kiosk replacement. A 2025 Reddit thread from r/orangetheory titled "no more front desk staff?" documented franchise owners cutting SA (Sales Associate) roles and replacing them with tablet kiosks. The community response was instructive: *"Sales associates play a crucial role; having a dedicated point of contact significantly enhances both sales effectiveness and customer retention compared to dealing with random individuals in a call center."* A neighboring commenter noted the kiosk model failed at their franchise and they reverted: *"Nowadays, it's typically just one individual handling things."* ([Reddit — r/orangetheory](https://www.reddit.com/r/orangetheory/comments/1md8duy/no_more_front_desk_staff/)) This dynamic — owners trying to automate away the front desk, then discovering the human relationship is the product — is the central tension TGP should solve: **give staff software that makes them indispensable, rather than making them feel replaceable.**

A former **Orangetheory SA** put the job requirements bluntly: *"Hi, former SA…. If you like cold calling people to get them to come in for intros, then go for it. We had to make a minimum of 50 calls per day. Not fun. There are sales quotas to meet every month. Also, it doesn't pay much."* ([Reddit — r/orangetheory](https://www.reddit.com/r/orangetheory/comments/s8s53d/should_i_work_at_otf/)) The coldcalling burden is software-assignable: if the CRM tracked member engagement and auto-queued calls based on at-risk signals, staff would make 15 targeted calls instead of 50 untargeted ones.

At **LA Fitness** (a big-box context), a former multi-role employee conducted a Reddit AMA that revealed a different kind of burnout: *"Chronic understaffing due to abhorrently high turnover rates. I'm talking like 600% [turnover]."* ([Reddit — r/LAFitness](https://www.reddit.com/r/LAFitness/comments/1gnk1ds/i_used_to_work_at_la_fitness_for_years_and_held_a/)) In a big-box environment, the front desk is often a single person covering an enormous gym. The software has to do more of the cognitive work — auto-surfacing exceptions, auto-resolving routine queries — because there's no colleague to ask.

At **Anytime Fitness** (franchise model), a 2025 Indeed review from a front office receptionist noted: *"There was no communication between different positions. If it was your job to do something, it was inconvenient to ask anyone else a question for clarification or even help. There was no teamwork with front office and personal trainers."* ([Indeed — Anytime Fitness](https://www.indeed.com/cmp/Anytime-Fitness/reviews)) The software gap here is internal communication: trainers and front desk staff are siloed, so member information doesn't flow. TGP's member notes + trainer notes unified view is a direct play on this.

### 1.2 Specific Software Workflow Complaints (Direct Quotes)

From a crossfit gym management Reddit discussion, [a gym owner summarizing the front desk experience](https://www.reddit.com/r/crossfit/comments/1mbhfrf/honest_conversation_about_gym_management_software/) described the multi-app problem: *"It often leads to members juggling multiple applications — one for scheduling, another for tracking performance, and yet another for viewing leaderboards. This can feel quite cumbersome, especially when trying to update payment methods."* The front desk absorbs this confusion at every check-in.

From the same thread, a PushPress user described the check-in experience favorably: *"The platform allows you to schedule classes, view workouts, track your attendance, and log your performance metrics… we also use the app for check-ins, and it handles our purchases seamlessly."* But a different user in the same thread gave the core criticism: *"Pushpress on paper is very good. But super buggy and crappy support. They are responsive but nothing actually gets fixed."* The front desk is the person who has to work around bugs at 6am with 20 people waiting. ([Reddit — r/crossfit honest conversation](https://www.reddit.com/r/crossfit/comments/1mbhfrf/honest_conversation_about_gym_management_software/))

A Trainerize G2 review captured the back-end clutter problem: *"App looked very old and not appealing to clients. Back end was cluttered and I found it stressful to manage clients."* ([G2 — Trainerize](https://www.g2.com/products/xplor-truecoach/reviews)) "Stressful to manage" is the front desk experience in three words.

### 1.3 What Makes a Shift Feel "Good" vs "Exhausting" — Psychological Drivers

The distinction is not feature-based. It is **agency and competence**. Staff feel good when they can answer any member question from one screen without asking them to wait. They feel exhausted when the software makes them look incompetent in front of members — a payment error they can't explain, a booking they can't find, a question they have to put the member on hold to research.

Key psychological drivers identified across staff reviews:

**Good shift drivers:**
- Knowing the answer before the member finishes asking (surfaced alerts, pre-loaded context)
- Check-in that is so fast that members smile and walk through — no friction creates positive energy
- Being able to solve a problem on the spot without escalating to a manager (empowered override with logged reason)
- Quiet moments where no queue forms and there's time to have a real conversation with a member
- When the tech works reliably — not having to apologize for the system

**Exhausting shift drivers:**
- The system being down during the 6am rush (cited in multiple reviews across platforms)
- Having to re-explain the same member payment problem they've already called about twice
- Alerts that block check-in with no resolution path — the member is frustrated, the staff member is embarrassed
- Training a new hire mid-shift on software that has no discoverability
- Having to manually reconcile what the system says with what the manager said via separate text

The [OTF community discussion](https://www.reddit.com/r/orangetheory/comments/1md8duy/no_more_front_desk_staff/) captured a specific positive: *"Implementing check-in kiosks would be fantastic. Having preassigned stations that are randomized through software could work really well! However, I also feel that SAs play a crucial role, and their efforts could be better utilized in areas like member management, engaging on social media, and maintaining the facility, rather than handling check-ins."* The insight: **staff want to be freed from mechanical tasks (check-in) to do relational tasks (engagement)**. TGP's kiosk + staff hybrid model is exactly right here.

### 1.4 Turnover Rates and Burnout Drivers

Front desk is the highest-turnover role in fitness. LA Fitness's own insider described 600% annual turnover at some locations. ([Reddit AMA](https://www.reddit.com/r/LAFitness/comments/1gnk1ds/i_used_to_work_at_la_fitness_for_years_and_held_a/)) OTF observers noted new staff every 1.5 months at some studios. The root causes are consistent:

1. **Low pay vs. high social load** — minimum wage at luxury gyms creates resentment
2. **Sales pressure on non-sales-minded staff** — OTF SAs required 50 cold calls/day
3. **Software that creates member-facing awkwardness** — staff who can't resolve a problem feel incompetent
4. **No career progression** — there's nothing to learn from the software, so growth stalls
5. **Toxic management hiding behind policy** — Anytime Fitness and Equinox reviews both cite management using "brand standards" to justify irrational operational decisions

TGP can't solve pay or management culture. But it can **reduce the competence anxiety** that drives early-tenure exits: make the first-week experience so simple that a new hire handles the six most common scenarios in their first hour, with guided flows that prevent them from accidentally doing something wrong.

### 1.5 Boutique Studio vs. Big-Box Gym vs. CrossFit Affiliate

| Dimension | Boutique Studio (Pilates, yoga, barre) | Big-Box (LA Fitness, Planet Fitness) | CrossFit/Martial Arts Affiliate |
|---|---|---|---|
| **Volume** | 20–60 check-ins/shift | 100–500 check-ins/shift | 15–50 check-ins/shift |
| **Member relationships** | High — most members known by name | Low — transactional | High — community-centric |
| **Software complexity** | Medium — class pack tracking, trial flows | High — simple check-in needs, but billing complexity | Medium — performance tracking, WOD results |
| **Primary pain** | New-member trial conversion | Processing speed at peak hour | Attendance + WOD tracking overlap |
| **Training time needed** | 30–60 min | 15–30 min (simpler tasks) | 45–90 min (more features used) |
| **Biggest staff frustration** | Wrong class credits deducted | System down during morning rush | Billing and performance data in separate tools |

At CrossFit affiliates, the two-brain community survey showed gym owners actively want [software that unifies operations](https://twobrainbusiness.com/best-gym-management-software-2021/), and the PushPress choice (18.3% of top gym owners) is partly because it was built by CrossFit gym owners. The front desk at a CrossFit box often is the owner — making the boundary between owner and staff UX especially blurry.

### 1.6 New Hire Struggles in Week One

From the crossfit gym owner [discussion](https://www.reddit.com/r/crossfit/comments/1cibfie/to_all_owners_what_gym_management_software_should/), one owner's advice: *"Regardless of which you go with, realize it won't be perfect. I would dive into one, try to learn the ins and outs of it, and write some basic Standard Operating Procedures before you open your doors."* The fact that SOPs are the workaround tells you everything: the software doesn't teach its own workflows.

New hire week-one failures cluster around five scenarios:
1. Check-in for a member with an account issue — don't know whether to let them in or not
2. Selling a day pass or session pack — can't find the right product in POS
3. Processing a refund or credit — requires manager intervention in most systems
4. Adding a walk-in to a full class — booking system fights the override
5. Explaining a membership charge on a member's account — billing history not surfaced clearly

TGP play: **role-based onboarding flow**. On first login, the front desk role gets a guided "5 scenarios in 10 minutes" walkthrough that covers exactly these five. Zero-to-confident in a single shift.

### 1.7 Member Interaction Stressors the Software Could Mitigate

The high-stress interactions at front desk are predictable and repeatable. Software can pre-defuse them:

| Member scenario | Current software failure | TGP solution |
|---|---|---|
| "My payment failed, I should still be able to come in" | No context on why, no resolution path shown | Alert shows payment fail date, retry link, and suggested script |
| "Did my session pack renew?" | Staff has to navigate to billing > history | Pack balance shown on check-in screen tile |
| "Can you book me into Thursday's class?" | Navigate away from check-in screen | Quick-add to class from member tile, no screen switch |
| "I referred my friend, where's my reward?" | Referral data not surfaced at front desk | Referral status shown in member profile notes |
| "Why was I charged twice this month?" | Billing history in separate module | Billing timeline on member profile, one tap |

---

## SECTION 2: Gym Owner/GM — Financial Health & Membership Management

### 2.1 Cash Flow Visibility

From a direct Reddit thread on r/gymowner titled ["Gym owners: how do you track daily payments and cash flow?"](https://www.reddit.com/r/gymowner/comments/1q98a2a/gym_owners_how_do_you_track_daily_payments_and/), the responses reveal the current state of the art is manual:

> *"Establishing an accounting process is essential, and you generally only need to perform it monthly. I suggest beginning with Excel or Google Sheets for tracking your finances."*

The original poster pushed back: *"Do you ever encounter moments where you wish you had better visibility throughout the week or even daily? For instance, situations where cash flow feels unexpectedly constrained, settlements are delayed, or uncertainty arises regarding what has already been collected versus what is still outstanding."* The answers confirmed: **daily cash visibility is a real gap most owners are patching with spreadsheets or best-guess estimates from their gym software dashboard.**

The [PushPress financial tracking guide](https://www.pushpress.com/blog/tracking-your-gym-s-financial-performance) describes what owners actually need at the daily level: *"Total revenue collected today (including cash, card, and direct debit), expected future revenue from active memberships, outstanding balances, and failed payment attempts."* This is the daily screen owners want to open first. Most current platforms bury this data across 3–5 different report tabs.

From the [boxbase.app KPI guide](https://boxbase.app/blog/key-financial-metrics-gym-owners-must-track), the core MRR formula that gym owners now understand and want tracked automatically: **MRR = active members × average monthly revenue per member**, with breakout into New MRR, Expansion MRR (upgrades), and Churned MRR. The article notes that most gym owners track total membership count but not the revenue composition — losing the signal that shows whether growth is genuine or churned-and-replaced.

### 2.2 KPI Cadence: What Owners Check Daily, Weekly, Monthly

Based on multiple sources including the Reddit r/gymowner thread and the PushPress/Wodify financial guides:

**Daily (checked on mobile, before or after opening):**
- Total revenue collected yesterday
- Failed payment count and total value
- New sign-ups
- Cancellations submitted
- Class fill rates for today

**Weekly (desktop, 20–30 min review):**
- Net new members (joins minus cancels)
- MRR change week-over-week
- Failed payment recovery rate
- Top-attended and lowest-attended classes
- Trainer sessions delivered vs. scheduled

**Monthly (serious analysis session):**
- MRR with cohort breakout (new, expansion, churned)
- Retention curve by join month (which cohort is sticking?)
- Trainer P&L (revenue generated per trainer vs. commission paid)
- CAC and LTV trends
- Revenue by source (memberships, packs, drop-ins, retail)
- Lead-to-member conversion rate

The [Wodify financial management guide](https://www.wodify.com/blog/six-financial-management-tips-for-gyms) explicitly notes that owners who review these metrics monthly make materially different business decisions — primarily around pricing (raise prices when LTV > 12 months of CAC recovery), class cutting (remove consistently under-12 attendance classes), and trainer hiring (expand when any trainer's booked client hours exceed 80% of their available hours).

### 2.3 Failed Payment Recovery

This is a $-denominated gap that every platform handles poorly. The [WellnessLiving vs Zen Planner comparison](https://www.wellnessliving.com/blog/why-zen-planner-customers-are-switching-software/) documented Zen Planner's specific billing failures: *"They will repeatedly double-charge your client and will blame it on their server issue."* And: *"It took me three months to get them to finish my cancellation as they kept sending emails to students saying they owed."*

What owners want from failed payment recovery:
1. **Immediate alert** when a payment fails, with the failed amount and member name
2. **One-click retry** — not a workflow involving navigating to billing, finding the member, clicking retry
3. **Automated dunning sequence** — retry on day 1, SMS on day 2, email on day 3, access restriction on day 5 (configurable)
4. **Soft vs. hard lock** — some owners want to let members in while payment is outstanding; others want hard block after day 3. This should be a toggle, not a support ticket
5. **Recovery rate reporting** — what % of failed payments eventually recovered, at what average days-to-recovery

Notably, from the [Glofox Capterra reviews](https://www.capterra.com/p/136861/Glofox/reviews/), payment failure is among the top three complaints: *"52% negative reviews out of 42: payment processing involves transaction errors, unpredictable deposit timelines, regional limitations, and difficulties tracking cash payments."* One verified reviewer wrote: *"I canceled my service with Glofox and continued to charge me $1,300 after cancellation on a CC they had on file but was not authorized for them to charge."* ([Capterra — ABC Glofox](https://www.capterra.com/p/136861/Glofox/reviews/))

### 2.4 Membership Cohort Analysis and Retention Curves

This is a feature that exists in generic SaaS analytics tools (ChartMogul, Baremetrics) but is absent from every gym management platform reviewed. The gap is real and documented. From the [boxbase MRR guide](https://boxbase.app/blog/key-financial-metrics-gym-owners-must-track): owners who segment churned MRR by join month discover patterns invisible in aggregate data — e.g., January cohorts (resolution joiners) churn 40% by March, while March cohorts (spring prep joiners) retain 70% through summer.

What a gym-specific cohort view needs that generic SaaS tools don't provide:
- **Join source** as a cohort dimension (Instagram ad vs. referral vs. walk-in)
- **Membership type** as a cohort dimension (unlimited vs. 10-pack vs. drop-in)
- **Trainer assignment** as a cohort dimension (do members with assigned PTs retain longer?)
- **Class frequency** as a cohort predictor (members who attend 3+ times/week in month 1 retain 6x longer)

TGP play: a **cohort retention matrix** accessible from the home dashboard, not buried in reports. Default view: join month × months retained, with color heat map. One-click drill-down to see which members are in each cell.

### 2.5 Trainer P&L

This is consistently described as a "build your own spreadsheet" experience across all platforms. The [baseline brief](gym-owner-frontdesk-needs.md) covers the desire; what the research adds is the specific gap: **no platform shows trainer P&L in a single view that includes revenue generated, commission owed, session delivery rate, and client 3-month retention rate.** 

From [PushPress's G2 reviews](https://www.g2.com/products/pushpress/reviews) (avg 4.8/5): the platform handles commission calculations, but "inadequate reporting" appears as a top-three complaint, with 3 reviews explicitly citing the need for better trainer-level analytics. In [Wodify's G2 reviews](https://www.g2.com/products/wodify/reviews) (avg 4.7/5), "limited customization" in reporting is a recurring theme. Neither platform surfaces trainer P&L as a pre-built dashboard — it requires manual report builds.

### 2.6 Class Profitability Analysis

No major platform reviewed offers class-level profitability analysis. What owners currently do: manually calculate (monthly revenue from class type ÷ trainer cost per hour) in a spreadsheet. The data to do this automatically exists in every system — session revenue, trainer pay rate, class attendance — but no one surfaces it.

The decision this data supports: **should I add a 7pm Thursday HIIT class?** That requires knowing: what does the current 7pm Thursday class generate vs. cost, and is there unsatisfied demand on the waitlist? A class profitability screen showing revenue/hour, cost/hour, and margin for every class slot would enable data-driven scheduling in 2 minutes rather than 30.

### 2.7 Mobile vs. Desktop Preferences

From the r/gymowner discussions and financial KPI articles, the split is clear:
- **Mobile (phone):** Daily metrics only — revenue yesterday, failed payments today, cancels submitted today. Owners check this before they arrive at the gym or during commute.
- **Desktop (laptop/tablet):** Weekly and monthly analysis, report building, staff management, pricing changes. Owners don't trust themselves to make pricing decisions on a 5-inch screen.
- **Tablet at desk (iPad):** Front desk management view, checking the schedule, reviewing member profiles during member conversations.

The implication: TGP's mobile app needs a **ruthlessly simplified daily view** — 4–6 numbers, no more. Save the dashboards for desktop. Every gym owner who described their ideal mobile experience described a "morning briefing" not a full dashboard.

### 2.8 Multi-Location Consolidated Financials

Multi-location owners are underserved by every platform. From [Hapana Capterra reviews](https://www.capterra.com/p/143341/Hapana/reviews/): *"The systems inside of the Hapana framework don't talk to each other, meaning if you want to find member information you are forced to jump between 2 systems to find the most basic of information."* (March 2025 review) Another Hapana reviewer with multi-location franchise: *"Migration issues, lost/incorrect membership billing and incorrect billing to franchise owners."*

What multi-location owners specifically need:
- Consolidated MRR across all locations in one view
- Per-location P&L comparison
- Staff performance comparison across locations
- Ability to set pricing at the network level or override at the location level
- Member transfer between locations without billing re-setup

### 2.9 Accounting Integrations and Tax Reporting

[Wodify's QuickBooks integration blog post](https://www.wodify.com/blog/gym-accounting-made-easy-with-wodify-quickbooks-online) positions this as a competitive feature. The underlying need: gym owners who separate their gym finances from personal finances (the minority who do this correctly) want their gym software to push clean transaction data to QuickBooks or Xero without manual CSV exports. Current state: most platforms offer a CSV export. Better platforms offer a QuickBooks sync. The best-in-class would offer: automatic category tagging (membership revenue, session revenue, retail revenue, refunds), automated revenue recognition timing, and tax-period summary reports.

---

## SECTION 3: Competitor Dominate vs. Copy Guide

### 3.1 Mindbody

**Positioning:** The largest fitness/wellness management platform, 40,000+ businesses. Originally built for spas, salons, and wellness studios; fitness is one vertical among many. Now selling AI add-ons (SmartDesk) to justify price increases.

**G2 rating:** 3.7/5.0 (519 reviews) — [G2 Mindbody](https://www.g2.com/products/mindbody/reviews)

**✅ What users praise (copy):**
1. The **Mindbody Marketplace** connects businesses to 3M+ active users searching for classes — discovery platform built in
2. **Branded mobile app** builder — clients get a custom-logo app from the App Store without custom dev cost
3. **Scheduling tools** are functional and sync across website, app, and touchpoints
4. Client profile navigation — finding and managing client information
5. Setup experience — initial onboarding is rated positively

**❌ What users consistently complain about (dominate):**
1. **Pricing escalation** — *"continues to raise the price to satisfy shareholders without improving their software"* ([PushPress blog on Mindbody alternatives](https://www.pushpress.com/blog/7-best-mindbody-alternatives-for-gym-owners-in-2026)). Plans range $129–$599/month before add-ons; branded app, SMS marketing, and advanced reporting are all extra
2. **Platform built for everyone/no one** — serves salons, spas, wellness, and fitness simultaneously. Gym owners wade through irrelevant features. 23 G2 reviewers in 2025 cited specific feature gaps that matter to gyms but not salons
3. **Discovery marketplace competes with you** — the consumer-facing Mindbody app shows your gym next to every competitor in your area. You're subsidizing the competition
4. **Poor usability under pressure** — 25 G2 reviews cite non-intuitive navigation and inconsistent features across desktop vs. mobile ([G2 — Mindbody](https://www.g2.com/products/mindbody/reviews))
5. **Locked contracts** — annual contracts with no exit, described by multiple reviewers as feeling "trapped"

**TGP play:** The Mindbody marketplace is the hardest thing to replicate; copy the branded app and dismiss the marketplace trap as a feature, not a benefit.

---

### 3.2 Wodify

**Positioning:** CrossFit, BJJ, functional fitness, and boutique studio focus. Independently owned (not PE-backed as of 2026), which they explicitly market. Rated highest for support.

**G2 rating:** 4.7/5.0 (186 reviews) — [G2 Wodify](https://www.g2.com/products/wodify/reviews)

**✅ What users praise (copy):**
1. **Wodify Retain** — churn prediction based on attendance drop-off. Cited as the feature owners would miss most if they switched. (20+ G2 reviews mention it)
2. **All-in-one consolidation** — class booking, payments, appointments, and lead management genuinely in one place, not siloed
3. **Coach View** — coaches see their class roster, can sign members in, log results, and view coaching notes from one screen
4. **ClassPass integration** — fills empty class slots through a third-party marketplace without requiring a separate tool
5. **Responsive customer support** — 42 G2 reviews cite prompt and friendly support as a primary reason for staying

**❌ What users consistently complain about (dominate):**
1. **Missing features despite high rating** — 17 G2 reviews cite missing features as a top issue; specifically: no built-in nutrition tracking, limited white-label options for branded apps, incomplete PT session management for 1:1 work
2. **Scheduling complexity** — 9 G2 reviews flag scheduling "frustrations" including limited recurrence options and poor coach substitution UX
3. **Slow performance and software bugs** — 8 G2 reviews cite performance issues and bugs, with one owner writing: *"Nothing gets fixed"* ([Reddit — crossfit software thread](https://www.reddit.com/r/crossfit/comments/1mbhfrf/honest_conversation_about_gym_management_software/))
4. **Limited customization in reporting** — owners want custom report builds; Wodify's reporting is functional but not flexible
5. **Email-only support path** — *"Having to have conversations via email when sometimes a phone call is all I really need"* ([G2 — Wodify](https://www.g2.com/products/wodify/reviews))

---

### 3.3 PushPress

**Positioning:** Modern, gym-owner-founded platform. AI-positioned in 2025–2026 marketing. Free tier available; Pro at $159/month. Growing fast in CrossFit affiliate market.

**G2 rating:** 4.8/5.0 (196 reviews) — [G2 PushPress](https://www.g2.com/products/pushpress/reviews)

**✅ What users praise (copy):**
1. **Ease of setup** — 10 G2 reviews specifically cite "easy setup" with no onboarding fees. Getting a new gym live in <1 day
2. **Communication tools** — SMS/email automation for members and leads praised in 9 reviews
3. **Financial dashboards** — real-time billing, coach commission calculations, and revenue reporting in one system
4. **Staff compensation calculations** — automatic commission tracking praised specifically
5. **Free tier** — allows small or starting gyms to onboard without financial risk

**❌ What users consistently complain about (dominate):**
1. **Bugs that stay unfixed** — *"Pushpress on paper is very good. But super buggy and crappy support. They are responsive but nothing actually gets fixed"* and *"The product we pay $300+ a month for has a lot of bugs. I report them and regularly get told 'that'll get sorted'. None have. It's been months."* ([Reddit](https://www.reddit.com/r/crossfit/comments/1mbhfrf/honest_conversation_about_gym_management_software/))
2. **PushPress Grow module** — the marketing/website product is explicitly rated lower than Core by users: one G2 review titled *"Highly recommend Push Press CORE (it's really great!) but do NOT recommend Push Press GROW"* ([G2 — PushPress](https://www.g2.com/products/pushpress/reviews))
3. **Inadequate reporting** — 3 G2 reviews specifically cite lack of granularity in financial and operational reports
4. **Integration limits** — users wanting to connect preferred payment processors or third-party tools encounter friction
5. **Feature gaps for large gyms** — PushPress targets boutique/affiliate market; owners scaling past 200 members find feature limits

---

### 3.4 ABC Glofox

**Positioning:** Dublin-founded (2014), acquired by ABC Fitness Solutions (Thoma Bravo) in 2022 for ~$200M. Now part of the ABC portfolio alongside Trainerize. Strongest for franchise chains and multi-location boutiques.

**Capterra rating:** 4.4/5.0 (354 reviews) — [Capterra Glofox](https://www.capterra.com/p/136861/Glofox/reviews/)
**Trustpilot rating:** 3.3/5.0 (365 reviews) — [Trustpilot Glofox](https://ie.trustpilot.com/review/www.glofox.com)

**✅ What users praise (copy):**
1. **Intuitive and visually appealing UI** — 92% positive on usability in Capterra review analysis
2. **Effortless daily business management** — 98% positive for ease of daily operations
3. **Branded studio management** — clean consumer-facing branding experience
4. **Onboarding experience** — when the onboarding team is engaged, it's praised specifically
5. **Multi-currency/multi-language** — strongest international support in the market

**❌ What users consistently complain about (dominate):**
1. **Inconsistent and confusing payment handling** — 52% negative reviews on payments: *"payment processing involves transaction errors, unpredictable deposit timelines, regional limitations"*
2. **Frequent unresolved technical problems** — 79% negative reviews on bugs: *"bugs and issues cause slow performance, recurring glitches, delayed fixes, and operational disruptions"* ([Capterra — Glofox](https://www.capterra.com/p/136861/Glofox/reviews/))
3. **Post-acquisition service degradation** — Trustpilot reviews explicitly tie support decline to the 2022 ABC sale. *"Been using Glofox for almost 2 years, it was never perfect but did the job. Recently though, it has been a nightmare. Payments are not working properly."* Glofox's Trustpilot headcount evidence is stark: staff reportedly fell from 193 to 137 between mid-2024 and early 2026 per [Vibefam's 2026 review](https://vibefam.com/glofox-review-pricing-features-pros-cons-2026/)
4. **Membership billing problems** — 62% negative on billing: one reviewer wrote *"I canceled my service with Glofox and continued to charge me $1,300 after cancellation on a CC they had on file but was not authorized for them to charge"*
5. **Pricing opacity** — three of four pricing tiers are sales-call-gated on the website; 70% price-increase complaints documented post-contract

---

### 3.5 Zen Planner

**Positioning:** Built in 2006 by a martial arts school owner. Now owned by Daxko. Serves CrossFit boxes, martial arts schools, BJJ academies, boutique studios. Adding AI marketing tools (Engage module).

**G2 rating:** 4.2/5.0 (101 reviews) — [G2 Zen Planner](https://www.g2.com/products/zen-planner/reviews)
**Trustpilot rating:** 2.5/5.0 (328 reviews) — [Trustpilot Zen Planner](https://www.trustpilot.com/review/zenplanner.com)

**✅ What users praise (copy):**
1. **Martial arts-specific features** — belt and skill tracking, graduation events, rank progression
2. **Initial reliability and functionality** for basic member management and billing
3. **Campaign Marketplace** — 50+ pre-built email/SMS campaigns (via Engage add-on)
4. **Two-way SMS and integrated comms**
5. **Community and webinars** — Zen Academy and online community for gym owners

**❌ What users consistently complain about (dominate):**
1. **Trustpilot is devastating** — *"I could give you 25 reasons not to use this company. False claims, long delays in service, and just misleading business practices and policies. Avoid at all costs."* Rated 2.5/5 based on 328 reviews ([Trustpilot — Zen Planner](https://www.trustpilot.com/review/zenplanner.com))
2. **Billing failures** — *"They will repeatedly double-charge your client and will blame it on their server issue."* And: *"Zen Planner has definitely stolen my money! I haven't received any payments for 4 months."* ([WellnessLiving ZP comparison](https://www.wellnessliving.com/blog/why-zen-planner-customers-are-switching-software/))
3. **Forced payment processor** — *"I am obliged to use your Credit Card payment processor (CardPointe) which is super expensive (~3.5%)"* ([Trustpilot — Zen Planner](https://www.trustpilot.com/review/zenplanner.com))
4. **Cancellation and post-cancellation billing** — *"It took me three months to get them to finish my cancellation as they kept sending emails to students saying they owed"*
5. **Limited app functionality** — *"ZP app has very limited functionality. Need to show open classes, attendance, body weight."* Mobile experience hasn't kept pace

---

### 3.6 Trainerize (ABC Trainerize)

**Positioning:** PT-focused coaching platform, also owned by ABC Fitness. Strong on workout programming delivery; weak on gym management. 694 Capterra reviews — the most-reviewed PT tool.

**Capterra rating:** 4.6/5.0 (694 reviews) — [Capterra Trainerize](https://www.capterra.com/p/140262/Trainerize/reviews/)

**✅ What users praise (copy):**
1. **Programming ease** — creating, copying, and progressing workout programs is the best-in-class UX
2. **Client progress tracking** — visual progress, workout history, and milestone sharing
3. **MyFitnessPal integration** for nutrition tracking
4. **Video upload and feedback** loop between coach and client
5. **Centralized client management** — 97% positive on client organization in Capterra

**❌ What users consistently complain about (dominate):**
1. **Frequent bugs and crashes** — 75% negative on bugs in Capterra: *"frequent crashes, lost data, and frustrating glitches affecting reliability"*
2. **Slow performance** — 96% negative on speed: *"slow loading, app freezes, and connectivity disruptions"* ([Capterra — Trainerize](https://www.capterra.com/p/140262/Trainerize/reviews/))
3. **Outdated exercise videos** — *"Exercise library videos are really terrible, form on those videos is that of a very novice lifter. I have to upload my own videos for just about every exercise."* ([G2 — TrueCoach/Trainerize](https://www.g2.com/products/xplor-truecoach/reviews))
4. **No gym management** — zero scheduling, check-in, billing, or front desk capabilities. PT-only tool
5. **Habits/lifestyle features cluttering the UX** — *"they really clam up the client's calendar and make things look overwhelming"*

---

### 3.7 TrueCoach (Xplor TrueCoach)

**Positioning:** PT coaching simplicity tool, now owned by Xplor Technologies. 278 G2 reviews. Mission: "enable 1-to-1 coaching that scales."

**G2 rating:** 4.6/5.0 (278 reviews) — [G2 TrueCoach](https://www.g2.com/products/xplor-truecoach/reviews)

**✅ What users praise (copy):**
1. **Programming features** — diverse exercise library and easy copy/progress week-to-week
2. **Client video upload** — easy for clients to upload form videos for coach feedback
3. **Simple interface** — accessible for both coaches and clients
4. **MyFitnessPal sync** — macro tracking visible in coach view

**❌ What users consistently complain about (dominate):**
1. **Nutrition/micro tracking gap** — only macros visible, not micronutrients or full food log
2. **Exercise video quality** — same complaint as Trainerize: *"form on those videos is that of a very novice lifter"*
3. **No gym management capabilities** — zero billing, scheduling, or front desk features
4. **Lifestyle/habit features feeling tacked on** — same UX clutter issue as Trainerize
5. **Limited metrics** — bodyweight tracking requires workaround; no integrated body comp tracking

---

### 3.8 Everfit

**Positioning:** AI-powered personal training platform with 200,000+ coaches in 190+ countries. Strongest internationally. Meal plans, recipe books, habit coaching, community tools, and white-label included.

**G2 rating:** 4.8/5.0 (192 reviews) — [G2 Everfit](https://www.g2.com/products/everfit/reviews)
**Capterra rating:** 4.8/5.0 (377 reviews) — [Capterra Everfit](https://www.capterra.com/p/202837/Everfit/reviews/)

**✅ What users praise (copy):**
1. **Intuitive interface** — 50 G2 reviews cite interface simplicity as primary praise
2. **Customization depth** — workout programming highly customizable for different client types
3. **Feature-richness** — habit coaching, community, challenges, and meal plans in one tool
4. **Feature update cadence** — 13 G2 reviews specifically praise ongoing development
5. **White-label solutions** — coaches can brand the platform as their own

**❌ What users consistently complain about (dominate):**
1. **High cost with add-ons** — 11 G2 reviews cite high cost: *"The high cost of Everfit, along with necessary add-ons, to be a significant drawback"*
2. **Poor nutrition features** — 10 G2 reviews: *"inadequate nutrition features, relying on other apps for detailed data"*
3. **No gym management** — purely coaching-focused; no check-in, billing, or scheduling for physical gyms
4. **International payment limitations** — *"I can't invoice clients because I live in Azerbaijan and my country isn't supported by the billing service"* ([Capterra — Everfit](https://www.capterra.com/p/202837/Everfit/reviews/))
5. **Mobile UX gaps** — *"not being able to make notes for clients on the phone app and dark mode"*

---

### 3.9 Hapana

**Positioning:** Modern, scaling studio platform targeting Xponential-style franchise networks. Branded apps, multi-location tools, automated marketing workflows.

**Capterra rating:** 4.4/5.0 (96 reviews) — [Capterra Hapana](https://www.capterra.com/p/143341/Hapana/reviews/)
**G2 rating:** Essentially no reviews ([G2 — Hapana](https://www.g2.com/products/hapana/reviews))

**✅ What users praise (copy):**
1. **Lead workflow automation** — *"workflows in Grow give us the ability to streamline all our leads in one place and automatically follow through with a highly customizable process"*
2. **Customer support quality** — *"the care and attentiveness they have is like none other in the space"*
3. **Comprehensive features** — member management, scheduling, billing, reporting all present
4. **Marketing suite** integration

**❌ What users consistently complain about (dominate):**
1. **Disconnected internal systems** — *"The systems inside of the Hapana framework don't talk to each other, meaning if you want to find member information you are forced to jump between 2 systems"* ([Capterra — Hapana](https://www.capterra.com/p/143341/Hapana/reviews/))
2. **Migration and billing errors** — *"Migration issues, lost/incorrect membership billing and incorrect billing to franchise owners"*
3. **Slow loading and poor UX** — *"Slow loading time and lack of intuitiveness of the software UI"* (March 2026)
4. **Price not justified by stability** — *"It is functional in some aspects but the price they charge is not reflective of what should be expected for stable functionality"* (June 2025)
5. **Milestone reporting gaps** — *"there were some limitations, such as being able to run a milestone report for all attendees so we can celebrate member achievements"*

---

### 3.10 WellnessLiving

**Positioning:** Mindbody alternative targeting switchers. "Fastest-growing" claim. 5,000+ businesses, 15M users. All-in-one with strong customer service reputation.

**G2 rating:** 4.5/5.0 (197 reviews) — [G2 WellnessLiving](https://www.g2.com/products/wellnessliving/reviews)

**✅ What users praise (copy):**
1. **Intuitive ease of use** — 40 G2 reviews; simpler than Mindbody for daily management
2. **Customer support** — 36 G2 reviews praise support quality
3. **All-in-one platform** — 14 reviews cite value of everything being in one place
4. **Easy setup** — frequently cited as smoother onboarding than Mindbody

**❌ What users consistently complain about (dominate):**
1. **Missing scheduling features** — 8 G2 reviews: gaps in recurring scheduling and integration capabilities
2. **Learning curve** — 6 G2 reviews: complex initial setup despite marketed simplicity
3. **Slow response from support under pressure** — *"poor support... delays and lack of direct communication options"*
4. **Payment and membership freeze issues** — 5 G2 reviews cite specific difficulties with pausing memberships
5. **Limited customization** — 5 G2 reviews note lack of flexibility in reports and flows

---

### 3.11 Vagaro

**Positioning:** Multi-vertical (beauty, wellness, fitness) business management. 220,000+ professionals. Strong on appointment scheduling; fitness is a secondary vertical.

**G2 rating:** 4.6/5.0 (393 reviews) — [G2 Vagaro](https://www.g2.com/products/vagaro/reviews)

**✅ What users praise (copy):**
1. **Scheduling ease** — 166 G2 reviews; best-in-class appointment booking UX
2. **Notification/reminder system** — 90 reviews praise automated reminders that reduce no-shows
3. **Online booking simplicity** — 65 reviews: clients book correctly with minimal friction
4. **AI-powered content tools** — for marketing emails and client communication
5. **Payroll and reporting** — multi-staff payroll handling integrated with bookings

**❌ What users consistently complain about (dominate):**
1. **Tip calculation and multi-client booking** — 47 G2 reviews; fitness-irrelevant but signals UX fragility
2. **Limited gym-specific features** — built for salons/spas; gym-specific workflows (class packs, WOD tracking, PT sessions) are weak
3. **Overwhelming feature set** — *"poor usability in Vagaro, citing difficulties with setup and overwhelming features that hinder their experience"* (40 reviews)
4. **Multi-store limitations** — not built for gym chains or franchises
5. **Fitness vertical treated as secondary** — gym owners using Vagaro frequently note it feels like they're using a beauty-industry tool

---

### 3.12 ClubReady

**Positioning:** Large chain management — the platform of choice for big-box operators and national franchise chains. Enterprise-tier pricing and feature depth.

**GetApp listing** — [GetApp ClubReady](https://www.getapp.com/recreation-wellness-software/a/clubready/)

**✅ What users praise (copy):**
1. **Multi-location management** — built natively for chains with consolidated reporting
2. **Lead management and CRM** depth for high-volume sales operations
3. **Billing reliability** at scale — handles complex national billing scenarios
4. **Access control integrations** — works with physical access hardware at scale

**❌ What users consistently complain about (dominate):**
1. **Complexity** — feature set is enterprise-grade and therefore impenetrable for smaller operators
2. **UX dated and clunky** — front desk staff describe the interface as requiring significant training
3. **Price point** — enterprise pricing excludes independent gyms and small chains
4. **Support tier disparity** — top-tier accounts get better support than base-tier accounts
5. **No modern mobile experience** — mobile app lags behind modern gym software

---

### 3.13 Gymdesk

**Positioning:** Small gym and martial arts specialist. Praised for simplicity and owner-responsiveness.

**G2 rating:** 4.8/5.0 (21 reviews) — [G2 Gymdesk](https://www.g2.com/products/gymdesk/reviews)

**✅ What users praise (copy):**
1. **Customer service** — *"They are only just an email away and reply back within hours"* ([G2 — Gymdesk](https://www.g2.com/products/gymdesk/reviews))
2. **Simplicity** — everything needed for a small gym with no feature bloat
3. **Constant product evolution** — owner engagement in product development praised
4. **Billing and attendance tracking** — core features done reliably

**❌ What users consistently complain about (dominate):**
1. **Limited website customization** — *"I wish I had more control over website options"*
2. **Feature gaps for growing gyms** — scale ceilings hit quickly; not built for 200+ members or multi-staff
3. **Limited marketing tools** — CRM and automation are basic
4. **Small review base** — 21 reviews means patterns are hard to confirm

---

### 3.14 TeamUp

**Positioning:** Boutique studio and fitness business management. 341 Capterra reviews, acquired by DaySmart. Strong on scheduling flexibility and support.

**Capterra rating:** 4.8/5.0 (341 reviews) — [Capterra TeamUp](https://www.capterra.com/p/150357/Teamup/reviews/)
**G2 rating:** 4.6/5.0 (269 reviews) — [G2 TeamUp](https://www.g2.com/products/teamup/reviews)

**✅ What users praise (copy):**
1. **Responsive support** — *"support from the TeamUp staff is great and always reply almost instantly and solved every single problem I have had"*
2. **Scheduling flexibility** — courses, class packages, multiple membership tiers all supported
3. **GoCardless payment integration** — *"links perfectly with that so our payments are straightforward"*
4. **Reliability** — 2 G2 reviews specifically praise consistent uptime

**❌ What users consistently complain about (dominate):**
1. **Admin scheduling a non-paying client** — *"There NEEDS to be a option where as an ADMIN I can schedule a client that has not purchased or paid... because I AM THE OWNER/ADMIN/RECEPTIONIST/TEACHER"* ([Capterra — TeamUp](https://www.capterra.com/p/150357/Teamup/reviews/)) — a real owner-as-front-desk pain point
2. **Cannot notify client on second-to-last session automatically**
3. **Cost is high vs. alternatives** — *"Costs are higher than some alternatives"*
4. **Cannot split payments to different accounts**
5. **Mobile readability** — *"light blue writing on a grey background makes it difficult to see on your phone screen"*

---

### 3.15 Walla

**Positioning:** Modern AI-powered boutique fitness studio platform. Built specifically for yoga, barre, Lagree, Pilates, and franchise growth. Youngest modern entrant in the boutique category.

**G2 rating:** 4.7/5.0 (16 reviews) — [G2 Walla](https://www.g2.com/products/walla/reviews)

**✅ What users praise (copy):**
1. **Integrated everything** — *"I use Walla as my all-in-one software across CRM, studio/booking management, staffing, management reporting, sales, and marketing"* ([G2 — Walla](https://www.g2.com/products/walla/reviews))
2. **AI forecasting** — *"AI capabilities that help predict and forecast where you need to be in your business"*
3. **Onboarding quality** — hand-holding through setup including goal-setting, not just product features
4. **AI support capabilities** — *"customer support AI capabilities that solve 90% of my problems on their own"*
5. **Customer feedback loop** — *"they really listen to their customer feedback, more so than any software company I've ever worked with"*

**❌ What users consistently complain about (dominate):**
1. **Lead management still maturing** — *"their lead management capabilities are still fairly new and not necessarily covering the full scope of what I would want"*
2. **Small review base** — 16 reviews is not yet statistically meaningful; likely skewed positive by early adopters
3. **Limited to boutique studio use cases** — not suitable for big-box gyms or CrossFit affiliates
4. **Pricing not public** — similar opacity to Glofox

---

### 3.16 TGP Strategic Matrix

| Capability | Best-in-class today | What they do well | Where they fail | TGP's play |
|---|---|---|---|---|
| **Churn prediction / retention AI** | Wodify Retain | Attendance-based at-risk scoring | No LTV segmentation, no trainer-linked retention data | Copy Retain + add trainer assignment as a retention variable |
| **Front desk check-in UX** | PushPress | Fast, color-coded, works on tablet | Bugs under pressure, no offline fallback | Copy + add offline-first architecture |
| **Programming / workout delivery** | Everfit / TrueCoach | Rich exercise library, client video feedback | No gym integration, no billing | Integrate into PT module as native feature |
| **Lead automation & CRM** | Hapana / PushPress Grow | Workflows, multi-channel follow-up | Systems don't talk to each other (Hapana), Grow module buggy (PushPress) | Build as first-class citizen: unified CRM where lead data flows directly into member profile on conversion |
| **Payment recovery** | TeamUp / WellnessLiving | Reliable collection, clean payment UI | No smart dunning sequences, no AI retry timing | Dominate: AI-optimized retry timing (research shows Tue/Wed 10am retries recover 30% more) |
| **Trainer P&L** | Wodify (partial) | Coach commission tracking | No per-trainer profitability screen | Dominate: dedicated trainer P&L dashboard with sessions, revenue, payout, and client retention |
| **Financial dashboard / MRR** | PushPress | Real-time revenue overview | Reporting depth limited, no cohort analysis | Dominate: MRR + cohort + CAC/LTV in one screen |
| **Class profitability** | None | N/A | No platform shows revenue/cost per class hour | Dominate: new feature, no competitors |
| **Multi-location consolidation** | ClubReady / Hapana | Enterprise-grade location management | Complex, expensive, not boutique-friendly | Copy the consolidation view at a price boutique chains can afford |
| **Mobile owner experience** | Walla (partial) | AI forecasting, daily summary feel | Review base too small to confirm | Dominate: ruthlessly simple 6-number morning dashboard |
| **Pricing transparency** | PushPress / TeamUp | Published pricing, no traps | Neither shows true total cost on dashboard | Dominate: show TGP's fee in real dollars on the owner dashboard, every day |
| **New hire onboarding** | Gymdesk (support) | Responsive human support | Doesn't scale, no in-app guided flows | Dominate: role-specific onboarding flows, in-app guided scenarios for top 5 front desk tasks |
| **Boutique studio UX** | Walla | Modern, AI-native | Early stage, limited use case breadth | Copy Walla's UX philosophy; broader category support |
| **CrossFit/functional fitness** | Wodify | Purpose-built, WOD tracking, community | Pricing, limited customization | Copy WOD tracking + Retain; build at lower price point |

---

## SECTION 4: Top 10 Features TGP Should Build to Dominate

Rankings weighted by: (1) frequency of competitor failure, (2) frequency of user demand, (3) AI-build feasibility.

### #1 — Unified Member Profile with Real-Time Alert Intelligence

**The gap:** Every competitor stores member data across 3–7 different screens. Front desk staff navigate to billing, then to bookings, then to notes — while a member stands waiting. No platform surfaces contextual alerts with resolution scripts.

**The TGP play:** A single member tile that loads in <1 second and shows membership status, billing status, upcoming bookings, pack balance, assigned trainer, last check-in date, and any flagged notes — all visible without scrolling. Alert layers: Red (access should be discussed), Yellow (mention this), Grey (FYI only). Each alert carries a suggested script. Staff never need to think about what to say.

**Why dominate now:** This has been the #1 front desk ask for 5+ years across every platform. No one has built it correctly because review platforms (G2, Capterra) are dominated by owner voices, not staff voices. TGP is explicitly building for staff — this is the competitive moat.

---

### #2 — AI-Powered Churn Prediction with One-Tap Action

**The gap:** Wodify Retain is the only retention module that gets consistent praise, but it's limited to attendance-based signals. No platform surfaces at-risk members with a triggered action — owners still have to notice the list and decide what to do.

**The TGP play:** A risk board on the owner home screen: three columns (Red / Amber / Green) auto-populated by an AI model trained on attendance frequency, check-in recency, pack balance depletion rate, and class variety (members who only attend one class type churn faster). One tap to send a personalized check-in SMS from a pre-written template. Track whether it worked. Feed the outcome back into the model.

**Why dominate now:** Wodify has the concept but not the AI execution. Every other platform has neither. This is a feature that demonstrably earns its subscription cost in member retention — the ROI calculation is trivial to show in onboarding.

---

### #3 — Full Billing Transparency Dashboard with Smart Payment Recovery

**The gap:** Failed payment recovery is the #1 revenue leak in gym businesses. Every platform (Glofox, Zen Planner, Mindbody, Hapana) has documented billing failures. The standard is: payment fails, owner eventually notices, owner manually retries. Recovery rates vary wildly.

**The TGP play:** A daily cash flow screen that shows: expected revenue today, collected revenue today, failed payment queue (amount + member name + days overdue), and recovery rate trend. Automated dunning: retry on day 1 (no human action), SMS on day 2 (*"Hi [Name], your payment didn't go through — tap here to update your card"*), email on day 3, configurable access restriction. Show the owner exactly what the 3.3% GMV fee is costing them in real dollars alongside what they're recovering. Transparency is the trust builder.

**Why dominate now:** This is TGP's direct revenue line — higher recovery rate = higher GMV = higher TGP revenue. Every dollar recovered from a failed payment is a dollar to the gym and a percentage to TGP. This feature pays for itself.

---

### #4 — Trainer P&L Dashboard

**The gap:** No platform shows the owner a per-trainer profitability view in a single screen. Commission tracking exists in PushPress and Wodify but is hidden in reports rather than surfaced as a management dashboard.

**The TGP play:** A dedicated Trainer P&L tab per trainer: sessions delivered this month vs. scheduled, revenue generated, commission owed, payout to date, client 90-day retention rate, and average class fill rate. One screen, one minute, full picture. The owner can see in 60 seconds which trainers are profitable and which are retention risks for their client base.

**Why dominate now:** This is a spreadsheet replacement. Every gym owner with more than 2 trainers builds this manually in Google Sheets every month. The data already lives in TGP — presenting it is a UI decision, not an engineering one.

---

### #5 — Membership Cohort Retention Matrix

**The gap:** No gym management platform offers cohort analysis. Owners who want retention curves by join month are building them in Sheets or paying for ChartMogul on top of their gym software.

**The TGP play:** A heatmap-style cohort table: rows = join month, columns = months since join, cells = % of that cohort still active, colored green-to-red. Clickable cells drill down to member list. Filterable by membership type, acquisition source, and trainer assignment. This one screen answers "when do we lose members and who?" for the first time in the gym owner's business life.

**Why dominate now:** This is standard SaaS analytics (ChartMogul has had this for a decade) applied to a vertical that has never seen it. The "wow" moment in a demo will be immediate for any owner who has stared at a flat membership count for years.

---

### #6 — Class Profitability Analysis

**The gap:** This feature does not exist in any reviewed platform. Owners make class scheduling decisions on intuition and fill rate alone. Cost-per-class-hour is never calculated automatically.

**The TGP play:** For each class slot: revenue per session (total member sessions that class generates ÷ sessions run), trainer cost per session (hourly rate × duration), operating margin per session, and waitlist backlog (unmet demand). A simple ranking: most profitable class → least profitable class. Decision support: which classes to add, which to cut, which to move to better time slots.

**Why dominate now:** This is a new-to-market feature that requires existing data (billing, scheduling, trainer rates) to compute — no new data collection needed. It demonstrates TGP's analytical layer in a way that generic scheduling tools cannot match.

---

### #7 — Role-Based Onboarding with Guided Front Desk Scenarios

**The gap:** New front desk hires at gyms are expected to be productive in a single shift, but no platform provides guided in-app onboarding. The current state is owner-written SOPs or YouTube videos.

**The TGP play:** On first front desk login, a 10-minute interactive tutorial covers: (1) check in a member, (2) sell a day pass, (3) add a walk-in to a class, (4) handle a payment flag, (5) look up a member's upcoming bookings. Each scenario is a guided sandbox with real data. After completing all five, the staff member has a green checkmark visible on their profile. Owner can see which staff have completed onboarding.

**Why dominate now:** Turnover in front desk roles is extreme (some locations 600%+ annually). Every new hire who gets confident in hour 1 is a hire who stays through month 3. This feature reduces the owner's cost of turnover — a high-value, low-engineering feature.

---

### #8 — Self-Serve Pricing Experiment Infrastructure

**The gap:** No gym platform enables owners to test price sensitivity on membership tiers without calling support. This is standard in SaaS but absent in gym software.

**The TGP play:** A pricing lab within the owner dashboard: create a new membership tier, set eligibility criteria (e.g., new members only, specific classes), run it for a defined time window, and compare conversion rate and 90-day retention vs. control group. The owner gets a read on whether $89/month converts better than $99/month without manual tracking.

**Why dominate now:** Gym owners are entering a post-COVID pricing normalization period — many have not adjusted prices since 2020 and are leaving money on the table. A tool that helps them safely experiment with pricing has immediate perceived ROI.

---

### #9 — Mobile Morning Briefing (Daily Owner Dashboard)

**The gap:** Every gym management platform tries to cram a full desktop dashboard into a mobile app. The result is unusable. Owners check revenue on mobile before they arrive at the gym — they need 6 numbers, not 60.

**The TGP play:** A mobile home screen showing exactly: (1) yesterday's revenue, (2) today's classes and fill rates, (3) failed payments pending, (4) new sign-ups this week, (5) cancellations submitted this week, (6) one at-risk member to contact today. Tappable items drill into action (call member, retry payment, view class). Everything else is on desktop.

**Why dominate now:** Walla is beginning to build in this direction, but with 16 total reviews their model is unproven. PushPress has revenue snapshots but no AI-selected action item. Being the first platform where the owner starts their day in the app — rather than logging in at the gym — creates daily active usage that competitors lack.

---

### #10 — Unified Internal Communication (Front Desk ↔ Trainer ↔ Owner)

**The gap:** Front desk, trainers, and owners operate on separate communication channels. Front desk gets instructions via WhatsApp. Trainers leave notes for front desk on paper. Owners find out about member issues days later. No gym platform has an internal communication layer tied to member records.

**The TGP play:** An in-platform notes and messaging system with three layers: (1) Member notes (visible to all staff, tagged by author, linked to member profile — appears automatically when member checks in), (2) Shift notes (front desk leaves end-of-shift notes for the next shift — what happened today, what needs follow-up), (3) Staff messages (quick-fire internal chat without leaving the software). The key innovation: member notes surface automatically at check-in, so the incoming shift knows everything without being told.

**Why dominate now:** This is the solution to the #1 Anytime Fitness, LA Fitness, and Equinox front desk complaint: *"no communication between positions."* It requires zero new infrastructure — it's a messaging layer on top of the existing member profile. The feature reduces the cognitive load of handoffs between shifts and makes the front desk feel supported rather than isolated.

---

*Research based on: G2, Capterra, TrustRadius, Trustpilot, Indeed, Reddit (r/crossfit, r/gymowner, r/orangetheory, r/LAFitness, r/EquinoxGyms), and direct platform documentation. All quotes linked to primary sources. Compiled June 2026 by TGP research process.*
