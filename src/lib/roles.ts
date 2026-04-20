// Single source of truth for open roles across /careers and /careers/$slug.
// Edit this file to publish, edit, or archive roles.

export type Role = {
  slug: string;
  title: string;
  tag?: string;
  category: "Engineering" | "Design" | "Operations" | "Sales & Growth";
  location: string;
  type: "Full-time" | "Contract";
  comp: string;
  /** A short, evocative summary shown on the list and at the top of the role page. */
  summary: string;
  /** Long-form description, supports paragraph-by-paragraph rendering. */
  about: string[];
  doing: string[];
  youAre: string[];
  bonus?: string[];
};

export const ROLES: Role[] = [
  {
    slug: "product-engineer-general",
    title: "Product Engineer",
    tag: "General",
    category: "Engineering",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$170K–$220K + meaningful equity",
    summary:
      "Ship the surface area people actually touch. You'll build features end-to-end across the dashboard, simulator, and goal engine.",
    about: [
      "Plomo is a small team building a money helper that meets people where they are — juggling rent, family they send money home to, and a vague hope of one day owning a place.",
      "We move carefully on the things that matter (money, trust) and quickly on everything else. Most of what we ship reaches someone within a week.",
    ],
    doing: [
      "Own product surfaces end-to-end — from the database up through the UI.",
      "Translate user research into shipped features, not Jira tickets.",
      "Pair with design daily. Half our best ideas come from the seam between you two.",
      "Hold a high bar for performance, accessibility, and copy.",
    ],
    youAre: [
      "5+ years building product. You've shipped things people actually use.",
      "Comfortable across the stack — TypeScript, React, Postgres, a backend language of your choice.",
      "Strong written communicator. We work async first.",
      "Allergic to half-built features sitting in a dashboard nobody opens.",
    ],
    bonus: [
      "You've worked on consumer fintech before.",
      "You have an opinion about typography.",
    ],
  },
  {
    slug: "product-engineer-trust-monitoring",
    title: "Product Engineer",
    tag: "Trust & monitoring",
    category: "Engineering",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$180K–$230K + meaningful equity",
    summary:
      "Build the systems that let users trust us with their money — anomaly detection, observability, audit trails, and the alerting that wakes us up before they notice.",
    about: [
      "Trust is the product. Without it, nothing else matters.",
      "You'll own the systems that catch problems before they hit a user — bad data, weird transactions, drifting forecasts, silent failures.",
    ],
    doing: [
      "Design and own the platform's observability layer end-to-end.",
      "Build anomaly detection on user balances, projections, and yield routing.",
      "Lead post-incident reviews and turn them into permanent guardrails.",
      "Define the SLOs we're willing to be measured against.",
    ],
    youAre: [
      "5+ years in production engineering with a real on-call track record.",
      "Have shipped real anomaly detection — not just dashboards.",
      "Calm in incidents. Curious afterwards.",
    ],
  },
  {
    slug: "product-engineer-risk-credit",
    title: "Product Engineer",
    tag: "Risk & credit",
    category: "Engineering",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$190K–$240K + meaningful equity",
    summary:
      "Build the underwriting and risk surface that decides what Plomo will and won't do with someone's money. You'll work at the intersection of product, ops, and policy.",
    about: [
      "We're early in our credit and risk roadmap. The systems you build will set the tone for years.",
    ],
    doing: [
      "Design the underwriting models and policy DSL that drives them.",
      "Build risk surfaces visible in the product (caps, alerts, explanations).",
      "Own the data pipelines that feed risk decisions.",
    ],
    youAre: [
      "5+ years in fintech, lending, or trading risk.",
      "Comfortable making policy live in code, not slides.",
    ],
  },
  {
    slug: "data-engineer",
    title: "Data Engineer",
    category: "Engineering",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$170K–$220K + meaningful equity",
    summary:
      "Own the data platform — ingestion, modeling, the warehouse, and the contracts that keep the rest of the team unblocked.",
    about: [
      "Data is the substrate the rest of the product runs on. You'll own it end-to-end.",
    ],
    doing: [
      "Design and operate ingestion from banking partners and internal systems.",
      "Build a clean, well-modeled warehouse layer the whole team can rely on.",
      "Define the data contracts between product and analytics.",
    ],
    youAre: [
      "5+ years on production data systems.",
      "Strong SQL. Opinions about modeling.",
      "Care about the people who consume your tables, not just the pipelines that fill them.",
    ],
  },
  {
    slug: "design-engineer",
    title: "Design Engineer",
    category: "Engineering",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$170K–$220K + meaningful equity",
    summary:
      "The seam between design and engineering. You make the product feel as good as it looks, and ship the small details that make people smile.",
    about: [
      "Sit between design and engineering. Some weeks you're prototyping in code, some weeks you're shipping the polish nobody else has the patience for.",
    ],
    doing: [
      "Prototype product surfaces in real code, not Figma.",
      "Own animation, motion, and the small details that make the product feel alive.",
      "Build and maintain the design system end-to-end.",
    ],
    youAre: [
      "Equally fluent in Figma and React.",
      "Have shipped consumer-grade UI with strong motion and craft.",
      "Read CSS specs for fun.",
    ],
  },
  {
    slug: "infrastructure-engineer",
    title: "Infrastructure Engineer",
    category: "Engineering",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$180K–$230K + meaningful equity",
    summary:
      "Keep the lights on and the floors swept. You'll build the platform the rest of engineering ships against.",
    about: [
      "We want infrastructure that gets out of the way. You'll be the person who makes that real.",
    ],
    doing: [
      "Own deployment, CI/CD, observability, and on-call tooling.",
      "Define the patterns the product team uses to ship safely.",
      "Drive the platform's cost, performance, and reliability story.",
    ],
    youAre: [
      "5+ years in platform / infra at a consumer-scale company.",
      "Comfortable saying no to complexity.",
    ],
  },
  {
    slug: "payments-engineer",
    title: "Payments Engineer",
    category: "Engineering",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$190K–$240K + meaningful equity",
    summary:
      "Own the rails. ACH, cards, international, partner banks — and the reconciliation that keeps it all honest.",
    about: [
      "Payments is the floor we stand on. When it breaks, everything breaks.",
    ],
    doing: [
      "Integrate and maintain partner bank and processor integrations.",
      "Own ledger and reconciliation end-to-end.",
      "Reduce the operational tax of moving money.",
    ],
    youAre: [
      "5+ years on payments. You've debugged a NACHA file at 2am.",
    ],
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    category: "Design",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$160K–$210K + meaningful equity",
    summary:
      "Shape the product end-to-end. You'll hold the pen on flows that touch real money — the highest bar there is.",
    about: [
      "We design carefully because the cost of getting it wrong is real money and real trust.",
    ],
    doing: [
      "Own product surfaces from research through ship.",
      "Pair with engineering daily. We design in code more often than in Figma.",
      "Define and tend the visual and motion language.",
    ],
    youAre: [
      "5+ years designing consumer products.",
      "Strong systems thinker, strong typographer.",
    ],
  },
  {
    slug: "brand-designer",
    title: "Brand Designer",
    category: "Design",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$150K–$200K + meaningful equity",
    summary:
      "Define how Plomo looks and sounds in the world — site, social, identity, comms, and the small things people screenshot.",
    about: [
      "Our brand is editorial, calm, and grown-up. You'll make sure it stays that way.",
    ],
    doing: [
      "Own visual identity across web, social, and product marketing.",
      "Direct illustration, photography, and motion.",
      "Help shape the voice — written, visual, sonic.",
    ],
    youAre: [
      "Strong portfolio of identity work, ideally for a company you'd respect.",
      "Editorial eye. Restraint over maximalism.",
    ],
  },
  {
    slug: "head-of-risk-operations",
    title: "Head of Risk Operations",
    category: "Operations",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$200K–$260K + meaningful equity",
    summary:
      "Build and run the risk ops function from scratch — fraud, KYC, disputes, and the team that handles them.",
    about: [
      "This is a build-it-yourself role. You'll define the function, hire it, and own the floor.",
    ],
    doing: [
      "Design fraud, KYC, and disputes operations end-to-end.",
      "Hire and lead a small ops team.",
      "Partner with engineering to translate ops pain into product fixes.",
    ],
    youAre: [
      "8+ years in risk ops at a consumer fintech, ideally including a 0→1 chapter.",
    ],
  },
  {
    slug: "compliance-lead",
    title: "Compliance Lead",
    category: "Operations",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$180K–$230K + meaningful equity",
    summary:
      "Own the compliance program — partner bank relationships, BSA/AML, audits, and the boring forever-work that protects users.",
    about: [
      "Compliance done well is invisible. We want it done well.",
    ],
    doing: [
      "Own the compliance program end-to-end.",
      "Be the primary point of contact for partner banks and regulators.",
      "Partner with product and engineering to bake compliance in early.",
    ],
    youAre: [
      "7+ years in fintech compliance.",
      "Calm under audit pressure.",
    ],
  },
  {
    slug: "founding-account-executive",
    title: "Founding Account Executive",
    category: "Sales & Growth",
    location: "Brooklyn / remote (US)",
    type: "Full-time",
    comp: "$150K base / $300K OTE + equity",
    summary:
      "Open the API channel. You'll sell Plomo's developer platform into fintechs, neobanks, and the next wave of consumer apps.",
    about: [
      "We're early in monetizing the API channel — there is real room to define this motion from scratch.",
    ],
    doing: [
      "Own the full sales cycle for our developer API.",
      "Partner with engineering and DevRel to land design-partner accounts.",
      "Define the playbook the rest of the GTM team will follow.",
    ],
    youAre: [
      "5+ years selling developer or fintech APIs.",
      "Comfortable in a room of engineers.",
    ],
  },
  {
    slug: "developer-advocate",
    title: "Developer Advocate",
    category: "Sales & Growth",
    location: "Brooklyn / Lisbon / remote (UTC-5 to UTC+2)",
    type: "Full-time",
    comp: "$160K–$200K + equity",
    summary:
      "Make Plomo's API the easiest thing developers integrate this year. Docs, demos, sample apps, and the conferences you'd actually want to be at.",
    about: [
      "The API channel only works if developers love using it. You'll be the person who makes that real.",
    ],
    doing: [
      "Own developer-facing content — docs, demos, sample apps.",
      "Run developer office hours and help land early integrations.",
      "Be the voice of developers inside the company.",
    ],
    youAre: [
      "Have shipped real code. Have written content people actually read.",
    ],
  },
];

export const CATEGORIES = [
  "Engineering",
  "Design",
  "Operations",
  "Sales & Growth",
] as const;

export function rolesByCategory() {
  return CATEGORIES.map((c) => ({
    category: c,
    roles: ROLES.filter((r) => r.category === c),
  }));
}

export function getRole(slug: string): Role | undefined {
  return ROLES.find((r) => r.slug === slug);
}
