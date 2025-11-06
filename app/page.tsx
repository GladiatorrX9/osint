"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, type ComponentType } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { pricingPlans } from "@/lib/pricing";
import {
  IconRadar,
  IconShieldLock,
  IconChartHistogram,
  IconCloudLock,
  IconTimeline,
  IconSparkles,
  IconAlertTriangle,
  IconWorldWww,
  IconChecks,
} from "@tabler/icons-react";

type FeatureCard = {
  title: string;
  description: string;
  stat: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
};

type Metric = {
  value: string;
  label: string;
  detail: string;
};

type WorkflowStep = {
  step: string;
  title: string;
  description: string;
};

type AssurancePoint = {
  title: string;
  description: string;
};

type HeroMetric = {
  value: string;
  label: string;
};

const trustedBy = [
  "Arclight Bank",
  "Sentinel Labs",
  "Vertex Defense",
  "Halcyon Systems",
  "Northwind Capital",
  "Eclipse Media",
];

const complianceBadges = [
  { label: "SOC 2 Type II", detail: "Independent audit renewed annually" },
  { label: "ISO 27001", detail: "Continuous controls monitoring" },
  { label: "GDPR Ready", detail: "Data residency alignment" },
  { label: "HIPAA Prepared", detail: "PHI workflows isolated" },
];

const assuranceStats = [
  { value: "24/7", label: "Global telemetry" },
  { value: "<4 hrs", label: "Evidence packages" },
  { value: "99.9%", label: "Uptime SLA" },
];

const featureCards: FeatureCard[] = [
  {
    title: "Dark Web Telemetry",
    description:
      "Sweep invite-only marketplaces, stealer logs, and ransomware dump sites in real time.",
    stat: "87 sources",
    icon: IconRadar,
    accent: "from-cyan-500/25 via-blue-500/10 to-transparent",
  },
  {
    title: "Credential Safeguards",
    description:
      "Correlate leaked credentials with identity providers and trigger password rotations automatically.",
    stat: "43% risk drop",
    icon: IconShieldLock,
    accent: "from-emerald-500/25 via-emerald-500/10 to-transparent",
  },
  {
    title: "Signal Analytics",
    description:
      "Score every hit with proprietary confidence models and MITRE ATT&CK mapping for triage-ready context.",
    stat: "Instant scoring",
    icon: IconChartHistogram,
    accent: "from-purple-500/25 via-indigo-500/10 to-transparent",
  },
  {
    title: "Automated Playbooks",
    description:
      "Orchestrate enrichment, notifications, and ticketing through secure integrations in minutes.",
    stat: "12+ automations",
    icon: IconCloudLock,
    accent: "from-sky-500/25 via-sky-500/10 to-transparent",
  },
];

const intelligenceMetrics: Metric[] = [
  {
    value: "5.4B+",
    label: "Credentials tracked",
    detail: "Deduped across 61 breach markets",
  },
  {
    value: "14 min",
    label: "Median alert lead",
    detail: "From leak discovery to notification",
  },
  {
    value: "99.2%",
    label: "Noise reduction",
    detail: "Signal scoring tuned by analysts",
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    step: "01",
    title: "Surface leaks instantly",
    description:
      "Streaming collectors fingerprint posts, credential dumps, and stealer logs the moment they land.",
  },
  {
    step: "02",
    title: "Enrich with context",
    description:
      "We match identifiers to business units, severity tiers, and exposure history for immediate prioritization.",
  },
  {
    step: "03",
    title: "Automate the response",
    description:
      "Sync findings into SIEM, SOAR, or ticketing workflows with pre-built, analyst-approved runbooks.",
  },
];

const assurancePoints: AssurancePoint[] = [
  {
    title: "Regulated data handling",
    description:
      "SOC 2 Type II controls with per-tenant encryption and tamper-proof auditing across every signal.",
  },
  {
    title: "Region-aware ingestion",
    description:
      "Choose EU or US collection paths to meet data residency, privacy mandates, and compliance programs.",
  },
  {
    title: "Blue-team collaboration",
    description:
      "Share sanitized evidence packages securely with internal teams and trusted partners without friction.",
  },
];

const heroMetrics: HeroMetric[] = [
  { value: "5.4B+", label: "Credentials monitored" },
  { value: "61", label: "Breach marketplaces" },
  { value: "14 min", label: "Average detection lead" },
];

const testimonial = {
  quote:
    "GladiatorRX replaced three disconnected feeds and cut our credential leak remediation time from days to minutes.",
  author: "Elena Fischer",
  role: "Director, Incident Response · Arclight Bank",
};

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-800 border-t-white" />
          <p className="text-sm text-neutral-400">
            Bootstrapping intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackgroundRippleEffect rows={14} cols={36} cellSize={56} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),rgba(15,23,42,0))]" />

      <nav className="relative z-30 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-black">
              GRX
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-semibold">GladiatorRX</span>
              <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
                Leak Intelligence
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/pricing"
              className="text-neutral-300 transition hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="hidden rounded-full border border-white/15 px-4 py-2 font-semibold text-white transition hover:border-white/30 hover:bg-white/10 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 px-5 py-2 font-semibold text-black transition hover:shadow-[0_0_25px_rgba(56,189,248,0.45)]"
            >
              Request access
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-20 flex w-full flex-col items-center">
        <section className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <BackgroundBeams className="opacity-40" />
          </div>
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-24 text-center md:pt-28 lg:pt-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <IconAlertTriangle className="h-4 w-4 text-cyan-300" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-200">
                Live breach telemetry
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="mt-8 text-4xl font-semibold  leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Detect database leaks before adversaries weaponize them
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mt-6 max-w-3xl text-base text-neutral-300 sm:text-lg"
            >
              GladiatorRX continuously harvests and enriches breach intelligence
              from underground communities so your security team can contain
              exposure minutes after a leak surfaces.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 px-8 py-3 text-sm font-semibold text-black shadow-[0_10px_40px_rgba(56,189,248,0.35)] transition hover:brightness-110"
              >
                Join the waitlist
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Explore pricing
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
            >
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
                >
                  <p className="text-2xl font-semibold text-white sm:text-3xl">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-neutral-400">
                    {metric.label}
                  </p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-12 w-full max-w-4xl rounded-3xl border border-white/5 bg-white/5 px-6 py-5"
            >
              <p className="text-center text-xs uppercase tracking-[0.4em] text-neutral-400">
                Trusted by incident response teams at
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-white/80">
                {trustedBy.map((brand) => (
                  <span
                    key={brand}
                    className="tracking-[0.25em] text-neutral-300"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative w-full px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-6xl"
          >
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-neutral-200">
                <IconSparkles className="h-4 w-4" />
                Platform capabilities
              </span>
              <h2 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                Operational intelligence built for blue teams
              </h2>
              <p className="mt-4 max-w-3xl text-sm text-neutral-400 sm:text-base">
                Each signal is enriched with proprietary scoring, historical
                context, and recommended actions so responders focus on
                decisions—not data gathering.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <BackgroundGradient
                    key={feature.title}
                    className="relative h-full overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/60 p-6"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-linear-to-br ${feature.accent} opacity-80 blur-2xl`}
                    />
                    <div className="relative flex h-full flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                          <Icon className="h-6 w-6 text-white" />
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.35em] text-white/70">
                          {feature.stat}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-neutral-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </BackgroundGradient>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="relative w-full px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mx-auto flex max-w-6xl flex-col gap-10 rounded-4xl border border-white/10 bg-neutral-950/80 p-8 backdrop-blur lg:flex-row lg:items-center lg:p-12"
          >
            <div className="flex-1 space-y-5">
              <span className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
                Live threat intelligence
              </span>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Real-time telemetry from underground communities
              </h2>
              <p className="text-sm text-neutral-400 sm:text-base">
                Our crawlers monitor invite-only forums, ransomware shaming
                sites, and credential exchanges. Every hit is deduplicated,
                enriched, and pushed to your workspace instantly.
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <IconWorldWww className="h-4 w-4 text-cyan-300" />
                <span>
                  Coverage spans stealer logs, paste sites, botnet telemetry,
                  and breach marketplaces.
                </span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
              {intelligenceMetrics.map((metric) => (
                <BackgroundGradient
                  key={metric.label}
                  className="rounded-2xl border border-white/5 bg-neutral-900/70 p-6 text-center"
                >
                  <p className="text-2xl font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-neutral-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-sm text-cyan-200/80">
                    {metric.detail}
                  </p>
                </BackgroundGradient>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative w-full px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-6xl"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
                  Workflow
                </span>
                <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                  Keep your response loop ahead of adversaries
                </h2>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                View live breach feed
                <IconTimeline className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12">
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-linear-to-b from-cyan-500/60 via-blue-500/40 to-purple-500/40 md:hidden" />
                <ol className="grid gap-8 md:grid-cols-3">
                  {workflowSteps.map((step) => (
                    <li key={step.step} className="relative pl-12 md:pl-0">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white md:static md:mb-4 md:h-12 md:w-12 md:rounded-2xl">
                        {step.step}
                      </div>
                      <BackgroundGradient className="h-full rounded-3xl border border-white/5 bg-neutral-900/60 p-6">
                        <h3 className="text-lg font-semibold text-white">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-sm text-neutral-400">
                          {step.description}
                        </p>
                      </BackgroundGradient>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </section>

        {/* <section className="relative w-full px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5"
          >
            <BackgroundGradient className="rounded-3xl border border-white/5 bg-neutral-950/80 p-8 lg:col-span-3">
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">
                    <IconShieldLock className="h-3.5 w-3.5" />
                    Assurance
                  </span>
                  <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                    Built for regulated industries and high-stakes teams
                  </h2>
                  <p className="text-sm text-neutral-300 sm:text-base">
                    Governance and security controls are embedded across
                    ingestion, storage, and response so your blue team can
                    activate breach intelligence without compliance trade-offs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {complianceBadges.map((badge) => (
                    <div
                      key={badge.label}
                      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/4 px-4 py-3"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                        {badge.label}
                      </span>
                      <span className="mt-1 text-[11px] text-neutral-400">
                        {badge.detail}
                      </span>
                      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/0 bg-linear-to-br from-white/5 via-transparent to-transparent opacity-0 transition group-hover:border-white/20 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {assurancePoints.map((point) => (
                    <div
                      key={point.title}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-400/10 via-transparent to-transparent opacity-60" />
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15">
                            <IconChecks className="h-5 w-5 text-cyan-300" />
                          </span>
                          <h3 className="text-base font-semibold text-white">
                            {point.title}
                          </h3>
                        </div>
                        <p className="mt-3 text-sm text-neutral-300">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/4 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                  {assuranceStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center gap-1 px-6 py-5 text-center"
                    >
                      <span className="text-2xl font-semibold text-white">
                        {stat.value}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </BackgroundGradient>

            <BackgroundGradient className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-neutral-950/80 p-8 lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <IconSparkles className="h-5 w-5 text-white" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">
                  Customer spotlight
                </span>
              </div>
              <p className="text-lg leading-relaxed text-neutral-100">
                {testimonial.quote}
              </p>
              <div>
                <p className="text-sm font-semibold text-white">
                  {testimonial.author}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-neutral-500">
                  {testimonial.role}
                </p>
              </div>
            </BackgroundGradient>
          </motion.div>
        </section> */}

        <section className="relative w-full px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-6xl"
          >
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-neutral-200">
                <IconSparkles className="h-4 w-4" />
                Pricing
              </span>
              <h2 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                Simple pricing designed to scale with you
              </h2>
              <p className="mt-4 text-sm text-neutral-400 sm:text-base">
                Start focused and expand coverage as your threat surface grows.
                No hidden fees or surprise overages.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {pricingPlans.map((plan) => {
                const isCustom = plan.monthlyPrice === 0;
                return (
                  <BackgroundGradient
                    key={plan.name}
                    className={`relative flex h-full flex-col rounded-3xl border border-white/5 bg-neutral-900/60 p-8 ${
                      plan.recommended ? "ring-2 ring-cyan-400/40" : ""
                    }`}
                  >
                    {plan.recommended && (
                      <span className="mb-4 inline-flex w-fit items-center justify-center rounded-full bg-linear-to-r from-cyan-400 to-blue-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-black">
                        Popular
                      </span>
                    )}
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-2xl font-semibold text-white">
                        {plan.name}
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
                        {isCustom ? "Custom" : "Subscription"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-neutral-400">
                      {plan.description}
                    </p>

                    <div className="mt-8">
                      {isCustom ? (
                        <div>
                          <p className="text-4xl font-semibold text-white">
                            Custom
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Designed around your breach surface
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-semibold text-white">
                              ${plan.monthlyPrice}
                            </span>
                            <span className="text-neutral-400">/month</span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500">
                            ${plan.yearlyPrice}/year billed annually
                          </p>
                        </div>
                      )}
                    </div>

                    <ul className="mt-8 space-y-3 text-sm text-neutral-300">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={`mt-10 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition ${
                        plan.recommended
                          ? "bg-linear-to-r from-cyan-400 to-blue-500 text-black hover:brightness-110"
                          : "border border-white/15 text-white hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {isCustom ? "Talk to sales" : "Start now"}
                    </Link>
                  </BackgroundGradient>
                );
              })}
            </div>

            <p className="mt-10 text-center text-sm text-neutral-500">
              Need procurement docs? Email
              <a
                href="mailto:support@gladiatorrx.com"
                className="ml-2 text-cyan-300 hover:text-cyan-200"
              >
                support@gladiatorrx.com
              </a>
              .
            </p>
          </motion.div>
        </section>

        <section className="relative w-full px-4 pb-20">
          <BackgroundGradient className="mx-auto flex max-w-6xl flex-col gap-8 rounded-3xl border border-white/10 bg-neutral-950/80 p-10 text-center md:flex-row md:items-center md:justify-between md:px-12 md:text-left">
            <div className="max-w-2xl space-y-4">
              <span className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
                Early access
              </span>
              <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Deploy GladiatorRX before the next credential dump circulates
              </h2>
              <p className="text-sm text-neutral-400">
                We configure identifiers, detection thresholds, and automated
                workflows tailored to your threat surface during a secure
                onboarding session.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <Link
                href="/register"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-neutral-100"
              >
                Schedule demo
              </Link>
              <a
                href="mailto:support@gladiatorrx.com"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Contact the team
              </a>
            </div>
          </BackgroundGradient>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>
            © 2025 GladiatorRX Security. Built for proactive breach response.
          </p>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.35em]">
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-white">
              Admin Login
            </Link>
            <a
              href="mailto:support@gladiatorrx.com"
              className="hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
