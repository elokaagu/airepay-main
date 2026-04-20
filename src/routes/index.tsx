import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/plomo/PageShell";
import { Hero } from "@/components/plomo/Hero";
import { GoalsGrid } from "@/components/plomo/GoalsGrid";
import { RippleSimulator } from "@/components/plomo/RippleSimulator";
import { Negotiator } from "@/components/plomo/Negotiator";
import { YieldEngine } from "@/components/plomo/YieldEngine";
import { AgentApi } from "@/components/plomo/AgentApi";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Aire — Money that works for you" },
      {
        name: "description",
        content:
          "Aire is one smart assistant for your home savings, the money you send home, and growing what's left. Stop juggling apps and start getting there.",
      },
      { property: "og:title", content: "Aire — Money that works for you" },
      {
        property: "og:description",
        content:
          "Stop juggling apps. Aire handles your bills, the people you support, and your savings — all in one place.",
      },
    ],
  }),
});

function Index() {
  return (
    <PageShell>
      <Hero />
      <AgentApi />
      <GoalsGrid />
      <RippleSimulator />
      <Negotiator />
      <YieldEngine />
    </PageShell>
  );
}
