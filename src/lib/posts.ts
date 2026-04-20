import manifestoCover from "@/assets/blog-manifesto.jpg";

export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMinutes: number;
  category: string;
  tone: "blue" | "sand" | "rust" | "lime";
  manifesto?: boolean;
  cover?: string;
  body: PostBlock[];
};

export const POSTS: Post[] = [
  {
    slug: "ai-agents-for-human-flourishing",
    title: "AI agents for human flourishing",
    excerpt:
      "The shift from doing tasks to owning outcomes. Why 'send this email' is the wrong input — and what changes when the agent owns the result instead.",
    author: "L. Park",
    date: "April 17, 2026",
    readMinutes: 9,
    category: "Manifesto",
    tone: "rust",
    manifesto: true,
    cover: manifestoCover.src,
    body: [
      {
        type: "p",
        text: "For a decade, software has been a stack of tools waiting for you to pick them up. You opened a spreadsheet, you tagged a transaction, you moved money between accounts. The app was the verb; you were the subject. It worked, until it didn't — until life got busy enough that the tools sat unused while the things you actually wanted slipped further away.",
      },
      {
        type: "p",
        text: "We think the next ten years of personal software will be different. Not because the apps get prettier or faster, but because the unit of work changes. You stop telling software what to do. You tell it what you want, and it figures out the doing.",
      },
      { type: "h2", text: "From task-native to outcome-native" },
      {
        type: "p",
        text: "A task-native app asks: what should I do next? An outcome-native one asks: where do you want to be? The first puts the burden on you to assemble the plan. The second puts the burden on itself to deliver the result.",
      },
      {
        type: "p",
        text: "The difference is small in a sentence and enormous in practice. 'Send a reminder email' is a task. 'Make sure the rent gets paid even if I forget' is an outcome. The first ends the moment the email leaves your outbox. The second ends only when the outcome is true — and stays true.",
      },
      { type: "h2", text: "Why money is the right place to start" },
      {
        type: "p",
        text: "Money is the most universally task-shaped corner of modern life. We've turned a single goal — 'be okay' — into a scattered to-do list of fifteen apps, three accounts, two inboxes, and a vague feeling that we should probably check in on all of it.",
      },
      {
        type: "quote",
        text: "The best money software you can imagine is not an app you open. It's a result you trust.",
      },
      {
        type: "p",
        text: "An outcome-native financial agent doesn't replace your accounts. It sits above them, watches what's coming in and going out, and quietly does the boring, recurring, error-prone work of keeping your goals on track. It tells you what it did, in plain English. When trade-offs come up — and they always do — it surfaces the choice, not the spreadsheet.",
      },
      { type: "h2", text: "What this looks like in practice" },
      {
        type: "list",
        items: [
          "You set a goal — a home, a trip, sending money home — and it stays alive across every paycheck.",
          "You see what each spending choice costs you in days, not abstract percentages.",
          "When something unexpected happens, the plan bends without breaking. You don't get a guilt-trip notification.",
          "The agent does the work; you stay in charge of the direction.",
        ],
      },
      { type: "h2", text: "The bet" },
      {
        type: "p",
        text: "The bet we're making is that people don't want a better dashboard. They want their life back. They want to spend the energy they currently burn on financial admin on the things that matter — the people they love, the work they care about, the version of themselves they want to grow into.",
      },
      {
        type: "p",
        text: "That's what we mean by 'AI agents for human flourishing.' Not chatbots that mimic conversation. Not copilots that wait for prompts. Software that takes responsibility for outcomes, so you don't have to.",
      },
    ],
  },
  {
    slug: "money-on-the-internet",
    title: "Money on the internet",
    excerpt:
      "Why the next decade of personal finance will be done for you, not by you — and what makes that a good thing.",
    author: "A. Okafor",
    date: "April 13, 2026",
    readMinutes: 6,
    category: "Essay",
    tone: "blue",
    body: [
      {
        type: "p",
        text: "The first wave of fintech moved money onto the internet. The second wave is going to take the work of moving it off your plate.",
      },
      {
        type: "p",
        text: "It's tempting to read that as 'AI does my budget.' That's not quite it. The interesting shift is who owns the outcome. For twenty years, you owned every decision: which card to use, which account to top up, when to transfer, when to invest, when to pause. The software just kept the books.",
      },
      { type: "h2", text: "Outcome ownership changes the product" },
      {
        type: "p",
        text: "Once an agent owns the outcome, the product looks different. There's no dashboard with twelve graphs. There's a goal, and a quiet log of moves. There's no 'please categorize this transaction' nag. The categories are derived from your goals, not the other way around.",
      },
      {
        type: "p",
        text: "It also changes how trust gets built. You don't trust the agent because it's clever; you trust it because it explains what it did, and because it bends — predictably and visibly — when life moves. Trust is earned in plain English over months, not in a flashy onboarding flow.",
      },
      { type: "h2", text: "What stays human" },
      {
        type: "p",
        text: "What stays with you are the things that should: the direction, the priorities, the trade-offs that need a heart, not an algorithm. Whether to send a little extra home this month. Whether to push the home goal out by six weeks to take a trip. The agent does the math; you make the call.",
      },
      {
        type: "p",
        text: "That's what 'money on the internet' should mean by 2030. Not faster transfers. Not more graphs. The boring, recurring, error-prone work — done. The decisions that need you — saved for you, framed clearly, ready when you are.",
      },
    ],
  },
  {
    slug: "aire-engine",
    title: "How Aire handles your paycheck",
    excerpt:
      "A look inside the way we split each paycheck across bills, the people you support, and what's left to grow.",
    author: "M. Lindqvist",
    date: "April 7, 2026",
    readMinutes: 7,
    category: "Build notes",
    tone: "sand",
    body: [
      {
        type: "p",
        text: "Every two weeks (or four, or whenever your paycheck lands), Aire runs a small, quiet routine. Most of you will never see it. That's the point. But since people keep asking what's actually happening under the hood, here's the short version.",
      },
      { type: "h2", text: "Step 1 — Cover the musts" },
      {
        type: "p",
        text: "First, we look at what has to happen this period. Rent, utilities, the loan payment, the standing transfer to family. These are tagged 'Must' and they get paid first, with a small buffer in case anything is slightly off.",
      },
      { type: "h2", text: "Step 2 — Top up the safety net" },
      {
        type: "p",
        text: "Next, the cushion. If your safety net has taken a hit recently — a vet bill, an unexpected flight — Aire rebuilds it before doing anything else. The size of the cushion depends on what you told us during onboarding.",
      },
      { type: "h2", text: "Step 3 — Move the goals forward" },
      {
        type: "p",
        text: "Whatever's left gets split across your active goals, weighted by priority and how close they are to the finish line. A 'Should' goal that's 95% done usually gets the next push, even if it's not the highest priority — because finishing things feels good, and we believe momentum matters.",
      },
      { type: "h2", text: "Step 4 — Park the rest" },
      {
        type: "p",
        text: "Anything left over goes into the savings booster. It doesn't sit idle. You can pull it back into a goal at any time with one tap, and we'll show you exactly how many days it would shave off.",
      },
      {
        type: "p",
        text: "That's it. No magic. Just the same boring routine you would do yourself, except it actually happens — every paycheck, on time, without you having to remember.",
      },
    ],
  },
  {
    slug: "resilient",
    title: "Built to bend",
    excerpt:
      "How we design a money helper that adjusts when something unexpected hits — without making you feel bad about it.",
    author: "P. Rao",
    date: "March 30, 2026",
    readMinutes: 5,
    category: "Design",
    tone: "lime",
    body: [
      {
        type: "p",
        text: "The single biggest thing we got wrong in the first version of Aire was assuming people would tell us when something changed. They didn't. They just stopped opening the app.",
      },
      { type: "h2", text: "Plans break. Quietly." },
      {
        type: "p",
        text: "Real life doesn't send a calendar invite. A car needs a repair. A friend gets married overseas. A paycheck arrives a week late. A plan that can't absorb any of these is a plan you'll abandon by month three.",
      },
      { type: "h2", text: "What 'bend' means here" },
      {
        type: "list",
        items: [
          "If a goal slips, we adjust the timeline — visibly — instead of sending a red notification.",
          "If a 'Must' goes up, we negotiate with the 'Shoulds' before touching the safety net.",
          "If you skip a contribution, we don't shame you. We update the math and show what catching up looks like.",
        ],
      },
      {
        type: "p",
        text: "The result is a tool that survives a real year, not a perfect one. It's the difference between a fitness app you use for two weeks and one you still have on your phone in December.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export const TONE_BG: Record<Post["tone"], string> = {
  blue: "bg-[oklch(0.92_0.04_245)]",
  sand: "bg-[oklch(0.94_0.02_85)]",
  rust: "bg-[oklch(0.86_0.06_45)]",
  lime: "bg-[oklch(0.93_0.12_120)]",
};
