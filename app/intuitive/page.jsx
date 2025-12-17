import Link from "next/link";

const quickStarts = [
  {
    title: "Reset the day",
    description:
      "Set one focus, trim distractions, and restart timers so Today stays decisive.",
    cta: "Go to Today",
    href: "/#section-today",
    accent: "from-sky-500/50 via-cyan-400/40 to-emerald-400/40",
  },
  {
    title: "Ship something",
    description:
      "Jump into the publishing stack to draft, review, and pulse out a fast update.",
    cta: "Open Publishing",
    href: "/#section-creative",
    accent: "from-violet-500/50 via-fuchsia-500/40 to-cyan-400/40",
  },
  {
    title: "Check money & risk",
    description:
      "Glance at balances, targets, and ledger edges before making moves.",
    cta: "View Money",
    href: "/#section-money",
    accent: "from-amber-400/50 via-emerald-400/40 to-sky-500/40",
  },
  {
    title: "Stabilize health",
    description:
      "Align energy, mood, and recovery so you can keep producing without burnout.",
    cta: "Health Pulse",
    href: "/#section-health",
    accent: "from-emerald-400/50 via-lime-300/40 to-blue-400/40",
  },
];

const operatingFlows = [
  {
    label: "Command rhythm",
    steps: [
      "Set one focus and the three supporting actions.",
      "Mark blockers; assign to obligations or scratchpad.",
      "Start a 50-minute sprint and review at the bell.",
    ],
  },
  {
    label: "Publishing pulse",
    steps: [
      "Pick a channel from Publishing Planner.",
      "Draft or update the piece in the editor.",
      "Log outcome in Publishing Summary for telemetry.",
    ],
  },
  {
    label: "Money check-in",
    steps: [
      "Confirm runway vs. targets in Money Snapshot.",
      "Record new movements in Daily Ledger.",
      "Capture risks or approvals in Obligations.",
    ],
  },
];

const systemSignals = [
  {
    title: "Session health",
    body: "Look for green lights in Session Status; re-auth if the gate locks.",
  },
  {
    title: "Analytics pulse",
    body: "Publishing Summary and Analytics panels surface spikes and drops.",
  },
  {
    title: "System diagnostics",
    body: "Use System + Audit Log to trace changes, experiments, or outages.",
  },
];

export default function IntuitivePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
              Intuitive View
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Operate the system at a glance
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Start from the control surface with a single move. Each card below
              jumps you straight into the panel you need without scrolling.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-100 transition hover:border-white/40 hover:bg-white/10"
            >
              ← Control Surface
            </Link>
            <Link
              href="/#section-command"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.3)] transition hover:bg-emerald-400/15"
            >
              Jump to Command
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {quickStarts.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/80 p-5 shadow-xl transition hover:border-white/30 hover:shadow-[0_18px_60px_rgba(15,23,42,0.8)]"
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-70 blur-3xl transition duration-300 group-hover:opacity-100 group-hover:blur-2xl bg-gradient-to-br ${item.accent}`}
              />
              <div className="relative flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300">
                  Quick Start
                </p>
                <h2 className="text-xl font-semibold text-white">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-200/80">{item.description}</p>
                <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-100 transition group-hover:border-white/60 group-hover:bg-white/10">
                  {item.cta}
                  <span className="text-xs opacity-80">↗</span>
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 shadow-lg sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                Operating patterns
              </p>
              <h3 className="text-lg font-semibold text-white">
                Flows you can repeat
              </h3>
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-200">
              3 ready flows
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {operatingFlows.map((flow) => (
              <div
                key={flow.label}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200"
              >
                <div className="text-[11px] uppercase tracking-[0.2em] text-sky-200">
                  {flow.label}
                </div>
                <ul className="space-y-2 text-slate-300">
                  {flow.steps.map((step) => (
                    <li
                      key={step}
                      className="flex gap-2 rounded-md bg-white/5 px-2 py-1"
                    >
                      <span className="text-emerald-300">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-950 p-5 shadow-xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                Signals
              </p>
              <h3 className="text-lg font-semibold text-white">
                What to watch
              </h3>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-100">
              Stay in green
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {systemSignals.map((signal) => (
              <div
                key={signal.title}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner"
              >
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-indigo-200">
                  {signal.title}
                </div>
                <p className="text-slate-300">{signal.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
