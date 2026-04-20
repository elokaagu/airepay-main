import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "./theme-provider";

const NAV = [
  { label: "Products", to: "/products" },
  { label: "Partners", to: "/partners" },
  { label: "Developers", to: "/developers" },
  { label: "Resources", to: "/resources" },
] as const;

const COMPANY_LINKS = [
  { label: "About", to: "/about", desc: "Learn more about Aire" },
  { label: "Blog", to: "/blog", desc: "Read the latest from the team" },
  { label: "Careers", to: "/careers", desc: "Join our team" },
  { label: "Pricing", to: "/pricing", desc: "View plans and pricing" },
] as const;

export function Header() {
  const { theme, toggle } = useTheme();
  const [companyOpen, setCompanyOpen] = useState(false);

  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-10 py-7">
        <div className="flex items-center gap-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path
                  d="M5 4 L5 20 M5 4 C 12 4 18 7 18 12 C 18 17 12 20 5 20"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[19px] font-medium tracking-tight">Aire</span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-[14px] text-foreground" }}
              >
                {n.label}
              </Link>
            ))}

            {/* Company dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCompanyOpen(true)}
              onMouseLeave={() => setCompanyOpen(false)}
            >
              <button
                onClick={() => setCompanyOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={companyOpen}
                aria-haspopup="true"
              >
                Company
                <svg
                  viewBox="0 0 12 12"
                  className={`h-3 w-3 transition-transform ${companyOpen ? "rotate-180" : ""}`}
                  fill="none"
                >
                  <path
                    d="M3 4.5 L6 7.5 L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {companyOpen && (
                  <>
                    {/* Bridge to prevent gap on hover */}
                    <div className="absolute left-0 right-0 top-full h-3" />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-1/2 top-[calc(100%+12px)] w-[420px] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]"
                    >
                      <ul className="p-2">
                        {COMPANY_LINKS.map((c) => (
                          <li key={c.to}>
                            <Link
                              to={c.to}
                              onClick={() => setCompanyOpen(false)}
                              className="group flex items-baseline justify-between gap-6 rounded-lg px-4 py-3.5 transition-colors hover:bg-surface"
                            >
                              <span className="font-display text-[18px] font-medium tracking-tight text-foreground">
                                {c.label}
                              </span>
                              <span className="text-[13px] text-muted-foreground transition-colors group-hover:text-foreground">
                                {c.desc}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <Link
            to="/auth"
            search={{ mode: "password" }}
            className="hidden text-[14px] text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-md bg-orange px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
