export interface DecisionEntry {
  id: string;
  date: string;
  category: "Pricing" | "Hiring" | "Product" | "Funding" | "Legal" | "Marketing" | "Operations" | "Partnerships";
  stakes: "low" | "medium" | "high";
  situation: string;
  decision: string;
  reasoning: string;
  outcome: string;
}

export interface MatchedDecision {
  rank: number;
  entry: DecisionEntry;
  similarityScore: number; // 0 to 1
  similarityPct: number;   // 0 to 100
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  query: string;
  matchedIds: string[];
  scores: number[];
  primaryCategory?: string;
  llmCalled: boolean;
  confidenceMet: boolean;
  highStakes: boolean;
  latencyMs: number;
  answerSummary: string;
}

export const INITIAL_DECISION_LOG: DecisionEntry[] = [
  {
    id: "DEC-001",
    date: "2023-02-14",
    category: "Pricing",
    stakes: "high",
    situation: "Competitor ApexFlow launched an aggressive 45% undercut on our core workflow tier and their sales team is directly targeting our enterprise renewals.",
    decision: "Refused to match the discounted pricing. Doubled down on SLA guarantees, security compliance (SOC2 Type II), and concierge migration support.",
    reasoning: "Price wars are a race to the bottom that destroy gross margins and attract high-churn, price-sensitive customers. If we compete on price, we signal our product is a commodity. We win on reliability, enterprise security, and depth of workflow integrations.",
    outcome: "Lost only 2 out of 38 renewals; retained 94% NRR. ApexFlow instituted price hikes 9 months later after experiencing heavy infrastructure burn."
  },
  {
    id: "DEC-002",
    date: "2023-03-02",
    category: "Pricing",
    stakes: "medium",
    situation: "A mid-market prospect ($36k ARR deal) requested a 25% discount in exchange for a 2-year upfront commitment.",
    decision: "Offered a 10% multi-year discount maximum, but bundled 5 additional admin seats and dedicated onboarding rather than discounting the recurring base rate.",
    reasoning: "Protect base platform value and recurring ARR baseline. Giving heavy discounts sets an internal precedent for reps and degrades customer perceived value. Expanding feature/seat allowances incurs marginal server cost while keeping contract unit economics intact.",
    outcome: "Customer accepted the 10% discount + onboarding package. Expanded seat usage to full tier within 8 months."
  },
  {
    id: "DEC-003",
    date: "2023-04-18",
    category: "Pricing",
    stakes: "high",
    situation: "Our largest enterprise customer representing 18% of total ARR threatened to churn to a legacy competitor unless granted an immediate 35% price cut upon renewal.",
    decision: "Held firm on baseline rate card. Proposed a phased tier where non-active user seats were pruned, accompanied by an executive quarterly technical review.",
    reasoning: "Never let any single customer hold the product roadmap or margin structure hostage. A 35% discount would instantly collapse our blended gross margins from 78% to 69% and encourage other accounts to play chicken. If they churn, it is painful short term but protects the business long term.",
    outcome: "Customer pushed the negotiation down to the wire, but ultimately renewed at full price after realizing migration cost and data transfer friction exceeded the discount."
  },
  {
    id: "DEC-004",
    date: "2023-05-11",
    category: "Hiring",
    stakes: "high",
    situation: "Our Principal Infrastructure Engineer, who designed our core distributed queue system, resigned during sprint planning for the Q3 multi-region rollout.",
    decision: "Did not panic-counter with equity or promise hasty title promotions. Conducted a respectful exit interview, mapped knowledge transfer over 3 weeks, and distributed queue ownership across two senior engineers rather than rushing an external hire.",
    reasoning: "Counteroffers rarely resolve the underlying itch (they usually leave within 6 months anyway) and destabilize internal pay parity. Rushing to hire a replacement creates culture contamination and tech debt. High-stress departures reveal systemic documentation single-points-of-failure that must be addressed immediately.",
    outcome: "Migration paused for 3 weeks to document architectural runbooks. Two senior internal engineers successfully launched the rollout with zero downtime."
  },
  {
    id: "DEC-005",
    date: "2023-06-08",
    category: "Hiring",
    stakes: "medium",
    situation: "Engineering manager requested opening 6 junior developer roles immediately to accelerate the feature backlog.",
    decision: "Denied the 6 junior openings. Approved hiring 2 battle-tested senior engineers with distributed systems background instead.",
    reasoning: "Adding headcount to a late software project makes it later (Brooks' Law). Junior engineers require substantial mentorship hours from our most productive seniors. At our stage, a lean, dense, high-autonomy team outperforms an inflated junior bench.",
    outcome: "Feature velocity increased by 40% within 90 days with lower bug regressions and minimal onboarding overhead."
  },
  {
    id: "DEC-006",
    date: "2023-07-22",
    category: "Hiring",
    stakes: "high",
    situation: "A superstar VP of Sales candidate with Tier-1 pedigree passed all technical bars but demonstrated dismissive attitude towards product and support teams in informal lunch.",
    decision: "Rejected the candidate despite strong board enthusiasm and glowing quota attainment track record.",
    reasoning: "Brilliant jerks destroy startups from the inside out. Culture isn't what you preach on slides; it's the worst behavior you are willing to tolerate for revenue. A siloed, aggressive sales leader would fracture engineering-sales trust permanently.",
    outcome: "Found an equally competent, collaborative VP of Sales 7 weeks later. Team cohesion and cross-functional feedback remained exceptionally high."
  },
  {
    id: "DEC-007",
    date: "2023-08-15",
    category: "Funding",
    stakes: "high",
    situation: "Lead seed investor strongly pushed us to double headcount from 18 to 40 and launch European sales immediately to capture market land-grab.",
    decision: "Declined rapid headcount expansion. Committed to a controlled hiring pace of 4 critical hires and testing European demand via inbound self-serve first.",
    reasoning: "Premature scaling is the number one cause of startup mortality. Expanding sales before European localization and regulatory pipelines are battle-tested burns runway at 3x the rate without improving unit retention. We protect cash runway and maintain at least 24 months of runway at all times.",
    outcome: "European inbound validated product demand with minimal capital expenditure. Runway remained healthy through the subsequent 2023-2024 tech downturn."
  },
  {
    id: "DEC-008",
    date: "2023-09-04",
    category: "Funding",
    stakes: "high",
    situation: "Received an unsolicited Series A term sheet with a high valuation ($45M post) but onerous liquidation preferences (2x participating preferred and board majority).",
    decision: "Rejected the term sheet and chose a lower valuation ($32M post) clean 1x non-participating sheet from a founder-aligned fund.",
    reasoning: "Valuation is vanity, terms are sanity. Structured liquidation preferences can wipe out common shareholders and team option pools in moderate exits. Founder control and clean capital structure are paramount for long-term strategic sovereignty.",
    outcome: "Clean cap table kept employee morale high; future financing rounds closed without structural debt or recapitalization headaches."
  },
  {
    id: "DEC-009",
    date: "2023-10-12",
    category: "Product",
    stakes: "high",
    situation: "Sales team requested custom proprietary on-premise deployment mode to close a $150k ARR defense contractor.",
    decision: "Rejected the custom on-premise build. Offered single-tenant cloud VPC deployment on AWS GovCloud instead.",
    reasoning: "Custom one-off codebases fork the engineering team into maintaining dual release trains. One big check cannot justify turning a scalable SaaS platform into an agency services firm. Protect core product simplicity and release velocity.",
    outcome: "Customer accepted the isolated GovCloud VPC deployment. No custom on-premise software maintenance overhead was incurred."
  },
  {
    id: "DEC-010",
    "date": "2023-11-05",
    category: "Product",
    stakes: "medium",
    situation: "Several customers requested a dashboard dark mode and custom CSS customization engine.",
    decision: "Deprioritized UI theming; scheduled automated webhook retry logic and data export speed improvements instead.",
    reasoning: "Cosmetic features generate vocal praise on social media but don't prevent churn. Real customer retention is built on rock-solid data integrity, low latency, and dependable system plumbing. Prioritize core utility over superficial bells and whistles.",
    outcome: "Data pipeline throughput doubled; enterprise customer incident tickets dropped 35% in Q4."
  },
  {
    id: "DEC-011",
    date: "2023-12-01",
    category: "Product",
    stakes: "high",
    situation: "Competitor introduced generative AI copilot wrapper; executives and sales reps insisted we drop current sprint to ship a similar chatbot within 2 weeks.",
    decision: "Refused the hasty rush. Initiated a 3-week prototype sprint focused on high-precision workflow automation rather than a conversational gimmick.",
    reasoning: "Do not build reactive feature-parity checkboxes to soothe sales anxiety. Gimmicky chatbot wrappers provide fleeting novelty and zero sustainable defensibility. If we integrate AI, it must directly solve verifiable customer pain with deterministic reliability.",
    outcome: "Shipped contextual smart autofill and schema matching 6 weeks later. Customer adoption reached 72% with sustained daily active usage."
  },
  {
    id: "DEC-012",
    date: "2024-01-14",
    category: "Legal",
    stakes: "high",
    situation: "Received a patent troll demand letter alleging infringement on asynchronous data batch processing.",
    decision: "Did not settle quickly for $25k 'nuisance fee'. Hired specialized IP counsel to file an aggressive prior-art rebuttal and joined an open patent defense consortium.",
    reasoning: "Paying nuisance settlements puts a target on your back and flags your startup as an easy mark in public legal dockets. Establishing a reputation for defending our clean, open-source-backed architecture deters copycat nuisance claims.",
    outcome: "Troll firm dropped the demand with prejudice 45 days after receiving our prior-art filing. Zero settlement paid."
  },
  {
    id: "DEC-013",
    date: "2024-01-29",
    category: "Operations",
    stakes: "medium",
    situation: "AWS monthly cloud spend crossed $22,000, growing faster than ARR expansion.",
    decision: "Mandated a 2-week infrastructure efficiency sprint; refactored Redis caching and migrated telemetry logs from Elasticsearch to ClickHouse/S3 cold storage.",
    reasoning: "Gross margins are foundational to SaaS enterprise value. Unchecked cloud waste acts as a silent margin tax. Engineering excellence includes cloud efficiency and disciplined resource usage, not just shipping features.",
    outcome: "Reduced monthly infrastructure bill from $22k to $11.5k, boosting gross margins by 4.2% while improving query latency by 15%."
  },
  {
    id: "DEC-014",
    date: "2024-02-17",
    category: "Marketing",
    stakes: "low",
    situation: "Growth marketing agency proposed spending $30k/month on Google Search PPC bidding on competitor brand keywords.",
    decision: "Capped experimental paid search budget at $5k/month; redirected remainder into technical teardown essays and developer-focused docs.",
    reasoning: "Bidding wars on competitor keywords drive high acquisition costs with low conversion intent. Technical buyers don't click top search ads; they read transparent documentation, GitHub repos, and deep technical teardowns.",
    outcome: "Organic technical blog posts drove 3x more qualified demo bookings than paid ads, at 1/6th the blended CAC."
  },
  {
    id: "DEC-015",
    date: "2024-03-09",
    category: "Partnerships",
    stakes: "high",
    situation: "A legacy ERP vendor proposed an exclusive OEM partnership where they would rebrand our software and sell through their 500-person channel.",
    decision: "Declined exclusivity. Counter-offered a certified marketplace integration with co-marketing rights while retaining our brand.",
    reasoning: "Exclusivity cedes control of your destiny to a partner whose sales reps may deprioritize your product at any time. White-labeling erases brand equity and traps your product in an invisible tier. Never surrender customer relationships or brand independence.",
    outcome: "Non-exclusive integration listed on their marketplace brought 14 large enterprise accounts while our direct brand equity continued to climb."
  },
  {
    id: "DEC-016",
    date: "2024-03-24",
    category: "Hiring",
    stakes: "low",
    situation: "Debate over whether to allow asynchronous remote work across 4 different time zones for our new product marketing role.",
    decision: "Approved remote hire within +/- 3 hours of core engineering cluster, with strict asynchronous documentation expectations.",
    reasoning: "Talent density matters more than physical zip codes, but extreme time-zone dispersion (>5 hours) causes communication lag and isolated silos during early stage execution. Moderate overlap preserves fast decision cycles.",
    outcome: "Onboarded top talent in Montreal; collaboration remained seamless with London/New York engineering hours."
  },
  {
    id: "DEC-017",
    date: "2024-04-05",
    category: "Pricing",
    stakes: "medium",
    situation: "Customer success team noted many starter tier accounts were running heavy batch API queries with zero upgrade incentive.",
    decision: "Introduced transparent usage-based API rate limits and overage metering above 50,000 monthly events.",
    reasoning: "Freemium and low-tier subsidies must have hard utility ceilings. When heavy users consume disproportionate infrastructure without paying, paying users subsidize abusers. Align pricing directly with business value and infrastructure footprint.",
    outcome: "Converted 28% of heavy starter accounts into Growth tier within 60 days with virtually zero customer friction."
  },
  {
    id: "DEC-018",
    date: "2024-04-20",
    category: "Operations",
    stakes: "high",
    situation: "Production database experienced a 42-minute degradation due to an unindexed migration query during peak customer hours.",
    decision: "Instituted mandatory zero-downtime migration review protocols, synthetic canary pre-checks, and published a transparent public post-mortem.",
    reasoning: "Trust is built in drops and lost in buckets. Hiding outages behind vague 'maintenance' status messages insults your users' intelligence. Radical transparency about root causes and corrective steps converts an operational failure into a proof of maturity.",
    outcome: "Zero enterprise churn from the incident; received public praise from 3 CTO customers for the thorough technical post-mortem."
  },
  {
    id: "DEC-019",
    date: "2024-05-10",
    category: "Hiring",
    stakes: "medium",
    situation: "Two senior engineers had a persistent, escalating disagreement over microservices vs modular monolith architecture that began stalling team velocity.",
    decision: "Stepped in to arbitrate: set clear decision boundaries, chose modular monolith for current 18-month roadmap, and reassigned secondary domain ownership.",
    reasoning: "Endless architectural debates mask ego clashes and paralyze product shipping. Disagree and commit is an operational necessity. As founder, provide definitive closure once all trade-offs are articulated so the team moves forward as one.",
    outcome: "Team unblocked within 48 hours; code output rebounded and both engineers embraced the clear boundaries."
  },
  {
    id: "DEC-020",
    date: "2024-05-28",
    category: "Product",
    stakes: "medium",
    situation: "Enterprise customer requested building a custom Salesforce bidirectional sync connector with 20 proprietary field transforms.",
    decision: "Built a generalized Webhook and Zapier/Workato integration spec instead of custom one-off Salesforce code.",
    reasoning: "Custom connectors are a maintenance vortex. Once you write bespoke enterprise integrations, you become responsible for third-party schema shifts and API deprecations. Build open integration hooks and let the ecosystem handle edge-case workflows.",
    outcome: "Saved estimated 6 months of specialized maintenance; allowed customer's RevOps team to configure their own custom mappings."
  },
  {
    id: "DEC-021",
    date: "2024-06-15",
    category: "Funding",
    stakes: "medium",
    situation: "Venture debt lender offered $3M facility at 11% interest with warrant coverage.",
    decision: "Declined the venture debt facility. Maintained cash flow breakeven focus and relied on operating cash flow.",
    reasoning: "Debt in an unprofitable or volatile early-stage environment adds strict covenants and monthly cash drains. Warrants dilute the equity upside without providing true equity partnership. Live within revenue means until profitability is structural.",
    outcome: "Avoided restrictive debt covenants during a revenue fluctuation period; maintained total operational flexibility."
  },
  {
    id: "DEC-022",
    date: "2024-07-02",
    category: "Legal",
    stakes: "high",
    situation: "Prospective Fortune 500 customer requested unlimited liability indemnity for direct and indirect damages in master service agreement.",
    decision: "Refused uncapped indemnity. Capped total liability at 2x annual contract value, offering carve-outs strictly for gross negligence and willful misconduct.",
    reasoning: "Uncapped liability is an existential risk to a startup. A single unforeseen data outage or breach could bankrupt the company to satisfy an enterprise legal boilerplate. No single contract is worth gambling the life of the entire company.",
    outcome: "Customer's enterprise legal counsel conceded and signed the 2x contract value liability cap after 10 days."
  },
  {
    id: "DEC-023",
    date: "2024-07-21",
    category: "Marketing",
    stakes: "low",
    situation: "PR agency suggested hiring an external branding firm for $50k to execute a flashy company rebrand and mascot redesign.",
    decision: "Vetoed the external rebrand. Kept existing clean visual identity and used budget to host a high-quality in-person user group dinner for 25 engineering leads.",
    reasoning: "B2B SaaS companies succeed on trust and workflow indispensability, not cartoon mascots or slick brand manifestos. High-touch face-to-face interaction with power users creates genuine champions and immediate expansion opportunities.",
    outcome: "User dinner yielded 4 immediate tier expansions and invaluable direct customer feedback for upcoming Q3 roadmap."
  },
  {
    id: "DEC-024",
    date: "2024-08-11",
    category: "Partnerships",
    stakes: "medium",
    situation: "Consulting agency asked for a 20% ongoing revenue share to recommend our tool to their enterprise transformation clients.",
    decision: "Offered a flat 10% first-year referral commission only, with zero perpetual revenue rev-share.",
    reasoning: "Perpetual revenue shares mortgage your future margin. A partner should be rewarded for the introduction and deal closure, but ongoing retention and expansion are driven by our product and customer success teams. Protect terminal software gross margins.",
    outcome: "Agency accepted the first-year commission structure and brought in 3 qualified enterprise accounts."
  },
  {
    id: "DEC-025",
    date: "2024-08-30",
    category: "Operations",
    stakes: "low",
    situation: "Internal debate over requiring all engineers to participate in weekly customer support rotations.",
    decision: "Instituted mandatory monthly support shift for every engineer, including founders.",
    reasoning: "Insulating engineers from customer pain creates academic, detached software. When engineers personally witness customer confusion and bug frustrations, code quality and UX empathy skyrocket. Empathy is an engineering discipline.",
    outcome: "Customer bug backlog dropped 45%; engineer-initiated UX polish PRs increased dramatically."
  },
  {
    id: "DEC-026",
    date: "2024-09-14",
    category: "Pricing",
    stakes: "high",
    situation: "High inflation and increased vendor costs put slight pressure on annual gross margins.",
    decision: "Announced a transparent 12% price increase across legacy tiers with 60 days notice and grandfathered existing annual commitments for 1 year.",
    reasoning: "Pricing must reflect continuous value delivery and real underlying cost baselines. Apologetic price increases look weak; transparent, value-backed price adjustments framed around ongoing R&D investments command respect. Grandfathering honors early adopter loyalty.",
    outcome: "Over 80% of legacy monthly accounts switched to annual upfront plans to lock in the old rate; net ARR jumped 18%."
  },
  {
    id: "DEC-027",
    date: "2024-10-04",
    category: "Hiring",
    stakes: "medium",
    situation: "Head of Product proposed creating dedicated junior product manager roles to write technical user stories.",
    decision: "Denied PM expansion. Kept engineering squads pairing directly with designers and customers without intermediary proxy PMs.",
    reasoning: "Product managers should be strategic force multipliers, not bureaucratic ticket transmitters. Adding layers of story-writers between engineers and users dilutes signal, slows feedback loops, and creates bureaucratic process theater.",
    outcome: "Engineering cycle times remained fast (under 2 weeks from concept to production) and team ownership remained high."
  },
  {
    id: "DEC-028",
    date: "2024-10-25",
    category: "Product",
    stakes: "medium",
    situation: "Beta telemetry revealed that a new complex analytics feature had less than 4% monthly active user engagement after 90 days.",
    decision: "Killed the feature entirely, migrated the few power users to raw CSV export, and deleted 4,200 lines of legacy code.",
    reasoning: "Sunk cost fallacy is a silent killer. Keeping dead features alive imposes permanent cognitive tax on developers, complicates the UI, and balloons test suites. Be quick to prune what the market rejects to keep the surface area tight.",
    outcome: "Freed up engineering capacity; codebase test execution time reduced by 22% and UI confusion reports vanished."
  },
  {
    id: "DEC-029",
    date: "2024-11-18",
    category: "Legal",
    stakes: "medium",
    situation: "European enterprise prospect asked to store customer telemetry locally in Germany to satisfy internal data governance interpretation.",
    decision: "Provisioned an EU-Frankfurt isolated cell within our standard terraform multi-region architecture rather than building bespoke local infra.",
    reasoning: "Data sovereignty is a legitimate regulatory requirement, but it must be solved through repeatable infrastructure-as-code automation, not manual one-off setups. Turn compliance requests into standard product infrastructure capabilities.",
    outcome: "Closed the $85k ARR German enterprise deal and opened the pipeline for 8 additional EU accounts."
  },
  {
    id: "DEC-030",
    date: "2024-12-07",
    category: "Operations",
    stakes: "medium",
    situation: "Team reported feeling overwhelmed by sprawling Slack channels and constant ad-hoc direct messages disrupting deep work.",
    decision: "Enacted 'No-Meeting Thursdays', replaced conversational status updates with written asynchronous weekly memos, and archived 35 inactive channels.",
    reasoning: "Deep work requires uninterrupted multi-hour blocks of focus. Hyper-reactive chat culture simulates productivity while destroying thoughtful engineering and strategic planning. Synchronous meetings should be rare and high-leverage.",
    outcome: "Engineering output and code quality rose noticeably; employee satisfaction scores improved across all departments."
  },
  {
    id: "DEC-031",
    date: "2025-01-12",
    category: "Pricing",
    stakes: "low",
    situation: "Sales team requested permission to create bespoke custom pricing tiers for every prospective enterprise deal over $50k.",
    decision: "Denied bespoke pricing structures. Kept strict standardized modular add-on pricing with public tier transparency.",
    reasoning: "Custom pricing models create billing chaos, complicate quota attainment, and make revenue forecasting impossible. Standardized tiers with clean modular add-ons scale predictably and prevent sales reps from closing low-margin Frankenstein deals.",
    outcome: "Sales deal review cycles dropped from 5 days to 24 hours; finance billing audits became automated and effortless."
  },
  {
    id: "DEC-032",
    date: "2025-02-03",
    category: "Hiring",
    stakes: "high",
    situation: "Discovered that a recently hired senior account executive had fabricated customer references on their resume.",
    decision: "Terminated the employee immediately with standard severance, despite their promising outbound pipeline.",
    reasoning: "Integrity is non-negotiable. If you compromise on honesty for short-term revenue, you poison company culture and signal that dishonesty is acceptable if you hit numbers. Zero tolerance for ethical breaches protects organizational sanity.",
    outcome: "Team respected the swift, decisive action. Replacement AE was hired through transparent referral channels."
  },
  {
    id: "DEC-033",
    date: "2025-02-22",
    category: "Funding",
    stakes: "medium",
    situation: "Secondary investor offered to buy out 25% of founder shares at a 20% discount to latest valuation.",
    decision: "Declined the secondary liquidity offer. Retained 100% of founder equity stake.",
    reasoning: "Discounted secondary liquidity signals lack of founder conviction to the team and outside market. When you believe in the compounding moat of the business, selling equity at a discount is leaving long-term value on the table.",
    outcome: "Reinforced board and team alignment; preserved full ownership upside for future enterprise milestones."
  },
  {
    id: "DEC-034",
    date: "2025-03-15",
    category: "Product",
    stakes: "high",
    situation: "Engineering discovered an architectural concurrency race condition that occurs in 0.05% of extreme high-volume batch syncs.",
    decision: "Halted new feature roadmap for 2 weeks to rewrite the sync isolation engine with distributed locks and idempotency keys.",
    reasoning: "Data corruption is the unforgivable sin of B2B software. A 0.05% bug at enterprise scale corrupts millions of records. Never sweep edge-case data integrity bugs under the rug in pursuit of shipping flashy features. Build on bedrock.",
    outcome: "Engine rebuilt with bulletproof transactional integrity; zero customer data corruption reported even as volume grew 400%."
  },
  {
    id: "DEC-035",
    date: "2025-04-10",
    category: "Partnerships",
    stakes: "low",
    situation: "A venture-backed startup in an adjacent space proposed reciprocal social media takeovers and joint co-branding webinars.",
    decision: "Agreed to one focused technical workshop showcasing deep API integration rather than generic marketing co-promotion.",
    reasoning: "Generic co-marketing creates noise without substance. Show, don't tell: developer and operations audiences only engage when they see concrete technical utility and friction-free workflow interoperability.",
    outcome: "Workshop attracted 380 live attendees and generated 65 qualified enterprise trial signups."
  },
  {
    id: "DEC-036",
    date: "2025-05-02",
    category: "Marketing",
    stakes: "medium",
    situation: "Competitor launched a smear campaign comparing our platform latency based on cherry-picked benchmark criteria.",
    decision: "Did not engage in public social media spat. Published an open-source, fully reproducible benchmark harness with live public telemetry.",
    reasoning: "Never wrestle with pigs in the mud. Mud-slinging legitimizes their attacks and lowers your stature. Respond with unassailable technical artifacts, open-source code, and reproducible facts. The truth is the best marketing campaign.",
    outcome: "Industry engineers validated our open-source harness; competitor quietly retracted their campaign within 10 days."
  },
  {
    id: "DEC-037",
    date: "2025-05-24",
    category: "Legal",
    stakes: "low",
    situation: "Marketing requested using customer brand logos on public website without explicit written logo authorization.",
    decision: "Strictly forbade publishing any customer logo without executed written consent via our standard customer advocacy rider.",
    reasoning: "Cutting corners on legal permissions damages trust with enterprise procurement teams. What takes 10 seconds to slap on a webpage can trigger a procurement breach and jeopardize a six-figure contract.",
    outcome: "Secured 14 formal written permissions through customer success relationships; zero procurement complaints."
  },
  {
    id: "DEC-038",
    date: "2025-06-18",
    category: "Operations",
    stakes: "high",
    situation: "Critical third-party authentication API provider suffered a 6-hour global downtime that disrupted customer logins.",
    decision: "Engineered fallback local token verification mechanism and initiated architectural work to reduce external SaaS runtime dependencies.",
    reasoning: "Every runtime third-party dependency is an outage you do not control. While leveraging SaaS saves time early on, critical path authentication and core compute must possess resilient local offline fallback capabilities.",
    outcome: "Continuity Brain architecture hardened to operate local-first with zero external cloud dependencies for core reasoning."
  },
  {
    id: "DEC-039",
    date: "2025-07-09",
    category: "Pricing",
    stakes: "medium",
    situation: "Customer requested removing minimum seat commit threshold (lowering entry commit from 10 seats to 2 seats).",
    decision: "Held firm on minimum seat threshold for Enterprise tier; created a self-serve self-managed team tier with no SLA.",
    reasoning: "Enterprise customer success and white-glove onboarding costs have fixed floors. If you sell enterprise contracts below economic minimums, your CS team burns out serving accounts that can never become profitable. Segment strictly by service tier.",
    outcome: "Enterprise ACV stayed above $24k while small teams self-served without taxing high-touch support resources."
  },
  {
    id: "DEC-040",
    date: "2025-08-01",
    category: "Hiring",
    stakes: "high",
    situation: "Key engineering manager requested creating a 'Director' management layer when company headcount reached 26 people.",
    decision: "Declined creating middle management layer. Maintained flat pod structure with lead engineers holding tech lead autonomy.",
    reasoning: "Premature organizational layering breeds politics, slow approvals, and status-seeking empire building. At sub-50 people, everyone should be close to code, customers, or revenue. Keep communication lines as short as physically possible.",
    outcome: "Decision speed stayed lightning-fast; avoided bureaucratic overhead and maintained direct founder-team connection."
  }
];

export const HIGH_STAKES_KEYWORDS = [
  "layoff",
  "lawsuit",
  "acquisition",
  "funding",
  "shutdown",
  "fired",
  "resign",
  "subpoena",
  "breach",
  "bankruptcy",
  "terminate"
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-802194",
    timestamp: "2026-09-28T09:15:22.000Z",
    query: "A competitor is undercutting our annual subscription price by 40%. A sales rep is asking for permission to match it.",
    matchedIds: ["DEC-001", "DEC-002", "DEC-003"],
    scores: [0.892, 0.741, 0.685],
    primaryCategory: "Pricing",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 198,
    answerSummary: "Per precedent [DEC-001], our non-negotiable policy is that price wars destroy long-term unit economics and commodity-trap the platform. Rather than matching short-term competitor undercuts, we defend renewals by highlighting our SLA reliability, enterprise security tier, and dedicated migration onboarding. Final judgment rests with you."
  },
  {
    id: "AUD-802193",
    timestamp: "2026-09-28T08:44:11.000Z",
    query: "Our lead backend engineer just submitted their two weeks notice right in the middle of our v2 migration.",
    matchedIds: ["DEC-004", "DEC-005", "DEC-019"],
    scores: [0.915, 0.712, 0.640],
    primaryCategory: "Hiring",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 215,
    answerSummary: "In accordance with precedent [DEC-004], we avoid reactive panic-counteroffers and hasty external hires when a critical technical lead departs. Instead, we immediately execute a structured 3-week knowledge transfer and distribute queue ownership. Final judgment rests with you."
  },
  {
    id: "AUD-802192",
    timestamp: "2026-09-28T08:12:05.000Z",
    query: "Our biggest enterprise customer (18% of ARR) says they will churn unless we give them a 35% discount on renewal.",
    matchedIds: ["DEC-003", "DEC-001", "DEC-022"],
    scores: [0.938, 0.810, 0.690],
    primaryCategory: "Pricing",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 234,
    answerSummary: "Applying precedent [DEC-003], we never permit any single enterprise customer to hold our gross margin structure hostage under churn threats. We propose pruning inactive seat allocations and offering executive technical reviews rather than capitulating. Final judgment rests with you."
  },
  {
    id: "AUD-802191",
    timestamp: "2026-09-28T07:35:49.000Z",
    query: "Our lead seed investor is aggressively urging us to double headcount and expand to Europe immediately.",
    matchedIds: ["DEC-007", "DEC-008", "DEC-021"],
    scores: [0.884, 0.760, 0.630],
    primaryCategory: "Funding",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 189,
    answerSummary: "Guided by precedent [DEC-007], we adamantly resist premature scaling driven by investor excitement before international unit retention is battle-tested. Our policy prioritizes disciplined 24-month runway preservation. Final judgment rests with you."
  },
  {
    id: "AUD-802190",
    timestamp: "2026-09-28T06:58:30.000Z",
    query: "Enterprise prospect insists on custom on-premise software build before signing $150k ARR deal.",
    matchedIds: ["DEC-009", "DEC-020", "DEC-029"],
    scores: [0.865, 0.730, 0.695],
    primaryCategory: "Product",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 202,
    answerSummary: "Per precedent [DEC-009], we reject custom on-premise forks to maintain unified release velocity. Offered isolated cloud VPC deployment on GovCloud instead. Final judgment rests with you."
  },
  {
    id: "AUD-802189",
    timestamp: "2026-09-28T06:14:18.000Z",
    query: "Patent troll demand letter received alleging asynchronous batch infringement; lawyer suggests $25k quick settlement.",
    matchedIds: ["DEC-012", "DEC-022", "DEC-037"],
    scores: [0.920, 0.745, 0.615],
    primaryCategory: "Legal",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 220,
    answerSummary: "Under precedent [DEC-012], we never pay nuisance settlements to patent trolls because it paints a target on the company. We aggressively counter-file prior art with specialized counsel. Final judgment rests with you."
  },
  {
    id: "AUD-802188",
    timestamp: "2026-09-28T05:22:45.000Z",
    query: "Infrastructure telemetry bill spiked past $22,000/month, growing faster than top-line revenue.",
    matchedIds: ["DEC-013", "DEC-018", "DEC-034"],
    scores: [0.852, 0.710, 0.640],
    primaryCategory: "Operations",
    llmCalled: true,
    confidenceMet: true,
    highStakes: false,
    latencyMs: 175,
    answerSummary: "Following precedent [DEC-013], cloud efficiency is an engineering discipline. Mandated a 2-week optimization sprint to refactor Redis and migrate cold logs to ClickHouse/S3, boosting gross margin by 4.2%. Final judgment rests with you."
  },
  {
    id: "AUD-802187",
    timestamp: "2026-09-28T04:40:10.000Z",
    query: "Growth agency pitching $30k/month PPC budget bidding on competitor brand search keywords.",
    matchedIds: ["DEC-014", "DEC-023", "DEC-036"],
    scores: [0.812, 0.680, 0.620],
    primaryCategory: "Marketing",
    llmCalled: true,
    confidenceMet: true,
    highStakes: false,
    latencyMs: 165,
    answerSummary: "Reflecting precedent [DEC-014], bidding on competitor keywords drives high-CAC traffic with low conversion intent. We allocate capital to technical teardown essays and developer documentation. Final judgment rests with you."
  },
  {
    id: "AUD-802186",
    timestamp: "2026-09-28T03:19:02.000Z",
    query: "Global ERP vendor offering exclusive OEM white-label distribution deal through their enterprise channel.",
    matchedIds: ["DEC-015", "DEC-024", "DEC-035"],
    scores: [0.875, 0.750, 0.645],
    primaryCategory: "Partnerships",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 210,
    answerSummary: "Under precedent [DEC-015], exclusivity cedes control of company destiny and white-labeling erases brand equity. We counter-offered a certified marketplace integration while retaining 100% brand sovereignty. Final judgment rests with you."
  },
  {
    id: "AUD-802185",
    timestamp: "2026-09-28T02:40:15.000Z",
    query: "Prospective Fortune 500 enterprise customer demands uncapped liability indemnity in master services agreement.",
    matchedIds: ["DEC-022", "DEC-012", "DEC-037"],
    scores: [0.945, 0.760, 0.680],
    primaryCategory: "Legal",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 218,
    answerSummary: "Per precedent [DEC-022], uncapped liability is an existential risk to a growing startup. We strictly cap liability at 2x annual contract value with carve-outs only for gross negligence. Final judgment rests with you."
  },
  {
    id: "AUD-802184",
    timestamp: "2026-09-28T02:05:30.000Z",
    query: "European enterprise prospect asks to store telemetry locally in Frankfurt to meet internal regulatory guidelines.",
    matchedIds: ["DEC-029", "DEC-012", "DEC-022"],
    scores: [0.880, 0.720, 0.650],
    primaryCategory: "Legal",
    llmCalled: true,
    confidenceMet: true,
    highStakes: false,
    latencyMs: 185,
    answerSummary: "Applying precedent [DEC-029], solve data sovereignty through standardized infrastructure-as-code isolated cells rather than bespoke manual setups, turning compliance requests into standard product capabilities. Final judgment rests with you."
  },
  {
    id: "AUD-802183",
    timestamp: "2026-09-28T01:30:45.000Z",
    query: "Marketing requested publishing Fortune 500 customer brand logos on public website without formal written agreement.",
    matchedIds: ["DEC-037", "DEC-012", "DEC-022"],
    scores: [0.910, 0.710, 0.640],
    primaryCategory: "Legal",
    llmCalled: true,
    confidenceMet: true,
    highStakes: false,
    latencyMs: 170,
    answerSummary: "Guided by precedent [DEC-037], never publish client logos without formal written advocacy riders. Cutting corners with enterprise procurement triggers immediate contractual breaches. Final judgment rests with you."
  },
  {
    id: "AUD-802182",
    timestamp: "2026-09-27T23:45:10.000Z",
    query: "Top VP of Sales candidate with stellar quota record showed dismissive arrogance toward product and support teams in lunch interview.",
    matchedIds: ["DEC-006", "DEC-004", "DEC-032"],
    scores: [0.932, 0.780, 0.710],
    primaryCategory: "Hiring",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 225,
    answerSummary: "Under precedent [DEC-006], brilliant jerks destroy organizations from within. Culture is defined by the worst behavior you tolerate for short-term revenue. We reject candidates who fracture cross-functional trust. Final judgment rests with you."
  },
  {
    id: "AUD-802181",
    timestamp: "2026-09-27T22:15:00.000Z",
    query: "Discovered that a newly hired senior account executive fabricated customer references on their resume.",
    matchedIds: ["DEC-032", "DEC-006", "DEC-004"],
    scores: [0.948, 0.790, 0.700],
    primaryCategory: "Hiring",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 205,
    answerSummary: "Per precedent [DEC-032], integrity is non-negotiable. Compromising on honesty for revenue signals that dishonesty is acceptable if quotas are met. Immediate termination with severance was enacted. Final judgment rests with you."
  },
  {
    id: "AUD-802180",
    timestamp: "2026-09-27T20:50:20.000Z",
    query: "Engineering lead proposes creating a Director management layer when company headcount reached 26 people.",
    matchedIds: ["DEC-040", "DEC-027", "DEC-005"],
    scores: [0.895, 0.740, 0.660],
    primaryCategory: "Hiring",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 195,
    answerSummary: "Following precedent [DEC-040], premature organizational layering breeds politics and empire-building. At sub-50 people, maintain flat pods where everyone stays close to code, users, or revenue. Final judgment rests with you."
  },
  {
    id: "AUD-802179",
    timestamp: "2026-09-27T19:10:00.000Z",
    query: "Debate over hiring a product marketer in a time zone with more than 5 hours time difference from core engineering.",
    matchedIds: ["DEC-016", "DEC-005", "DEC-019"],
    scores: [0.860, 0.720, 0.670],
    primaryCategory: "Hiring",
    llmCalled: true,
    confidenceMet: true,
    highStakes: false,
    latencyMs: 180,
    answerSummary: "In accordance with precedent [DEC-016], talent density matters, but extreme time-zone dispersion creates communication lag in early-stage sprints. We cap remote hires within +/- 3 hours of the core pod. Final judgment rests with you."
  },
  {
    id: "AUD-802178",
    timestamp: "2026-09-27T17:40:00.000Z",
    query: "PR agency suggested spending $50k on external branding firm for flashy mascot redesign and corporate manifestos.",
    matchedIds: ["DEC-023", "DEC-014", "DEC-036"],
    scores: [0.925, 0.750, 0.690],
    primaryCategory: "Marketing",
    llmCalled: true,
    confidenceMet: true,
    highStakes: false,
    latencyMs: 190,
    answerSummary: "Reflecting precedent [DEC-023], B2B SaaS succeeds on workflow indispensability and trust, not mascots. Reallocate branding budgets into high-touch technical user dinners and direct customer interaction. Final judgment rests with you."
  },
  {
    id: "AUD-802177",
    timestamp: "2026-09-27T16:15:30.000Z",
    query: "Competitor launched public smear campaign comparing our platform API latency using rigged benchmarks.",
    matchedIds: ["DEC-036", "DEC-014", "DEC-023"],
    scores: [0.940, 0.770, 0.710],
    primaryCategory: "Marketing",
    llmCalled: true,
    confidenceMet: true,
    highStakes: true,
    latencyMs: 230,
    answerSummary: "Under precedent [DEC-036], never wrestle in the mud on social media. Respond by releasing an open-source, fully reproducible public benchmark harness with live telemetry. Facts are the best marketing. Final judgment rests with you."
  },
  {
    id: "AUD-802176",
    timestamp: "2026-09-27T14:30:00.000Z",
    query: "Adjacent venture-backed startup proposes reciprocal social media takeovers and joint co-branding webinars.",
    matchedIds: ["DEC-035", "DEC-014", "DEC-024"],
    scores: [0.870, 0.730, 0.650],
    primaryCategory: "Marketing",
    llmCalled: true,
    confidenceMet: true,
    highStakes: false,
    latencyMs: 175,
    answerSummary: "Guided by precedent [DEC-035], generic co-marketing creates noise without substance. We replace surface webinars with deep technical workshops that demonstrate live API interoperability. Final judgment rests with you."
  }
];

