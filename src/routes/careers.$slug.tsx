import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { PageShell } from "@/components/plomo/PageShell";
import { getRole, ROLES, type Role } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/careers/$slug")({
  loader: ({ params }): { role: Role } => {
    const role = getRole(params.slug);
    if (!role) throw notFound();
    return { role };
  },
  head: ({ loaderData }) => {
    const role = loaderData?.role;
    if (!role) {
      return { meta: [{ title: "Role not found — Plomo" }] };
    }
    const title = `${role.title}${role.tag ? `, ${role.tag}` : ""} — Plomo`;
    return {
      meta: [
        { title },
        { name: "description", content: role.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: role.summary },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: RolePage,
  notFoundComponent: RoleNotFound,
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-10 py-24">
          <h1 className="font-display text-[28px] font-medium">
            Something went wrong
          </h1>
          <p className="mt-4 text-[14px] text-muted-foreground">
            {error.message}
          </p>
          <button
            onClick={() => router.invalidate()}
            className="mt-6 rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </PageShell>
    );
  },
});

function RoleNotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-10 py-24 text-center">
        <h1 className="font-display text-[40px] font-medium tracking-tight">
          Role not found
        </h1>
        <p className="mt-4 text-[15px] text-muted-foreground">
          That role isn't open right now. Browse the rest of our open jobs.
        </p>
        <Link
          to="/careers"
          className="mt-8 inline-block rounded-md border border-border-strong px-5 py-2.5 text-[13px] hover:border-orange hover:text-orange"
        >
          ← All jobs
        </Link>
      </div>
    </PageShell>
  );
}

function RolePage() {
  const { role } = Route.useLoaderData();

  return (
    <PageShell>
      <article className="mx-auto max-w-[1500px] px-10 py-20">
        <Link
          to="/careers"
          className="font-mono text-[12px] text-muted-foreground hover:text-orange"
        >
          ← All jobs
        </Link>

        <header className="mt-8 grid grid-cols-1 gap-12 border-b border-border pb-16 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="text-[12px] uppercase tracking-[0.2em] text-orange">
              {role.category}
            </div>
            <h1 className="mt-4 font-display text-[44px] font-medium leading-[1.1] tracking-tight md:text-[56px]">
              {role.title}
              {role.tag && (
                <span className="text-muted-foreground"> · {role.tag}</span>
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-[18px] leading-[1.55] text-muted-foreground">
              {role.summary}
            </p>
          </div>

          <aside className="space-y-5 border-l border-border pl-8">
            <Meta label="Location" value={role.location} />
            <Meta label="Type" value={role.type} />
            <Meta label="Compensation" value={role.comp} />
            <a
              href="#apply"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-orange px-5 py-3 text-[13px] font-medium text-primary-foreground"
            >
              Apply for this role
            </a>
          </aside>
        </header>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_360px]">
          <div className="space-y-12">
            <Section title="About the team">
              {role.about.map((p: string, i: number) => (
                <p
                  key={i}
                  className="text-[15px] leading-[1.7] text-foreground/90"
                >
                  {p}
                </p>
              ))}
            </Section>

            <Section title="What you'll do">
              <ul className="space-y-3">
                {role.doing.map((d: string, i: number) => (
                  <Bullet key={i}>{d}</Bullet>
                ))}
              </ul>
            </Section>

            <Section title="Who you are">
              <ul className="space-y-3">
                {role.youAre.map((d: string, i: number) => (
                  <Bullet key={i}>{d}</Bullet>
                ))}
              </ul>
            </Section>

            {role.bonus && role.bonus.length > 0 && (
              <Section title="Bonus">
                <ul className="space-y-3">
                  {role.bonus.map((d: string, i: number) => (
                    <Bullet key={i}>{d}</Bullet>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          <div id="apply" className="lg:sticky lg:top-24 lg:self-start">
            <ApplyForm
              roleSlug={role.slug}
              roleTitle={`${role.title}${role.tag ? ` · ${role.tag}` : ""}`}
            />
          </div>
        </div>

        <section className="mt-24 border-t border-border pt-16">
          <h2 className="font-display text-[24px] font-medium tracking-tight">
            Other open roles
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
            {ROLES.filter((r) => r.slug !== role.slug)
              .slice(0, 4)
              .map((r) => (
                <li key={r.slug} className="bg-background">
                  <Link
                    to="/careers/$slug"
                    params={{ slug: r.slug }}
                    className="group flex items-center justify-between p-6 hover:bg-surface"
                  >
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-orange">
                        {r.category}
                      </div>
                      <div className="mt-2 font-display text-[18px] font-medium tracking-tight">
                        {r.title}
                        {r.tag && (
                          <span className="text-muted-foreground"> · {r.tag}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </article>
    </PageShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-[24px] font-medium tracking-tight">
        {title}
      </h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[15px] leading-[1.65] text-foreground/90">
      <span aria-hidden className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-orange" />
      <span>{children}</span>
    </li>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-[14px] text-foreground">{value}</div>
    </div>
  );
}

const applicationSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email("Invalid email").max(254),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Invalid URL").max(500).optional().or(z.literal("")),
  portfolio_url: z.string().trim().url("Invalid URL").max(500).optional().or(z.literal("")),
  github_url: z.string().trim().url("Invalid URL").max(500).optional().or(z.literal("")),
  resume_url: z.string().trim().url("Invalid URL").max(500).optional().or(z.literal("")),
  note: z.string().trim().max(4000).optional().or(z.literal("")),
});

type FormState = z.infer<typeof applicationSchema>;

function ApplyForm({
  roleSlug,
  roleTitle,
}: {
  roleSlug: string;
  roleTitle: string;
}) {
  const [state, setState] = useState<FormState>({
    name: "",
    email: "",
    location: "",
    linkedin_url: "",
    portfolio_url: "",
    github_url: "",
    resume_url: "",
    note: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setState((s) => ({ ...s, [key]: e.target.value }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    const parsed = applicationSchema.safeParse(state);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setBusy(true);
    try {
      const payload = {
        role_slug: roleSlug,
        role_title: roleTitle,
        name: parsed.data.name,
        email: parsed.data.email,
        location: parsed.data.location || null,
        linkedin_url: parsed.data.linkedin_url || null,
        portfolio_url: parsed.data.portfolio_url || null,
        github_url: parsed.data.github_url || null,
        resume_url: parsed.data.resume_url || null,
        note: parsed.data.note || null,
        source: typeof window !== "undefined" ? window.location.pathname : null,
      };
      const { error } = await supabase.from("job_applications").insert(payload);
      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-border-strong bg-surface p-7"
      >
        <div className="font-mono text-[11px] uppercase tracking-wider text-orange">
          Received
        </div>
        <h3 className="mt-3 font-display text-[24px] font-medium tracking-tight">
          Thanks, {state.name.split(" ")[0]}.
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Your application for{" "}
          <span className="text-foreground">{roleTitle}</span> is in. We read
          everything and reply within a week — even when it's a no.
        </p>
        <Link
          to="/careers"
          className="mt-6 inline-block text-[13px] text-orange hover:underline"
        >
          ← Back to all jobs
        </Link>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border-strong bg-surface p-7"
    >
      <div className="font-mono text-[11px] uppercase tracking-wider text-orange">
        Apply
      </div>
      <h3 className="mt-3 font-display text-[22px] font-medium tracking-tight">
        Tell us about yourself.
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Short and direct beats polished. We read every application.
      </p>

      <div className="mt-6 space-y-4">
        <Field label="Name" error={errors.name}>
          <input
            value={state.name}
            onChange={update("name")}
            required
            maxLength={120}
            className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={state.email}
            onChange={update("email")}
            required
            maxLength={254}
            className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
          />
        </Field>
        <Field label="Where are you based?" error={errors.location}>
          <input
            value={state.location}
            onChange={update("location")}
            maxLength={120}
            placeholder="City, country"
            className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
          />
        </Field>
        <Field label="LinkedIn" error={errors.linkedin_url}>
          <input
            type="url"
            value={state.linkedin_url}
            onChange={update("linkedin_url")}
            maxLength={500}
            placeholder="https://"
            className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Portfolio / site" error={errors.portfolio_url}>
            <input
              type="url"
              value={state.portfolio_url}
              onChange={update("portfolio_url")}
              maxLength={500}
              placeholder="https://"
              className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
            />
          </Field>
          <Field label="GitHub" error={errors.github_url}>
            <input
              type="url"
              value={state.github_url}
              onChange={update("github_url")}
              maxLength={500}
              placeholder="https://"
              className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
            />
          </Field>
        </div>
        <Field label="Resume URL" error={errors.resume_url}>
          <input
            type="url"
            value={state.resume_url}
            onChange={update("resume_url")}
            maxLength={500}
            placeholder="Link to a hosted PDF / Drive / Notion page"
            className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] outline-none focus:border-orange"
          />
        </Field>
        <Field
          label="Why this role?"
          error={errors.note}
          hint="Two or three sentences."
        >
          <textarea
            value={state.note}
            onChange={update("note")}
            maxLength={4000}
            rows={5}
            className="block w-full rounded-md border border-border-strong bg-background px-4 py-2.5 text-[14px] leading-relaxed outline-none focus:border-orange"
          />
        </Field>
      </div>

      {serverError && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-[12px] text-destructive">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-md bg-orange px-5 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Sending…" : `Apply for ${roleTitle}`}
      </button>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        By submitting you agree to be contacted about this role. We don't share
        your info.
      </p>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {(error || hint) && (
        <p
          className={
            "mt-1.5 text-[11px] " +
            (error ? "text-destructive" : "text-muted-foreground")
          }
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
