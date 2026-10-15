import Link from "next/link";
import { ArrowRight, BarChart3, Check, ChevronRight, CircleDollarSign, LockKeyhole, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  { icon: WalletCards, title: "Everyday expense tracking", text: "Record purchases in one clear, searchable place." },
  { icon: BarChart3, title: "Understand your habits", text: "Explore category totals and spending trends from your own records." },
  { icon: CircleDollarSign, title: "Budgets that make sense", text: "Set monthly limits and see how much room you have left." },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-3" aria-label="Main">
          <Link href="/login" className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-canvas">Sign in</Link>
          <Link href="/signup" className="focus-ring rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90">Get started</Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-28 lg:pt-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald/15 bg-mint/45 px-3 py-1.5 text-xs font-semibold text-emerald">
            <Sparkles size={14} /> A clearer view of everyday money
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.09] tracking-tight text-navy sm:text-5xl lg:text-[62px]">
            Spend smarter.<br /><span className="text-emerald">Live better.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Finora helps you record expenses, plan monthly budgets, and understand your spending patterns — all in one calm, private space.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy px-6 text-sm font-semibold text-white transition hover:bg-navy/90">
              Get started <ArrowRight size={17} />
            </Link>
            <Link href="/login" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-6 text-sm font-semibold text-navy transition hover:bg-canvas">
              Sign in to Finora
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5"><Check className="text-emerald" size={15} /> Your data stays yours</span>
            <span className="inline-flex items-center gap-1.5"><Check className="text-emerald" size={15} /> Clear, explainable insights</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mint/60 blur-3xl" />
          <div className="absolute -bottom-8 -left-10 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative rounded-[26px] border border-line bg-white p-4 shadow-[0_25px_80px_rgba(20,44,59,0.12)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-emerald">Sample dashboard preview</p>
                <h2 className="mt-1 text-lg font-bold text-navy">A month at a glance</h2>
              </div>
              <span className="rounded-lg bg-canvas px-2.5 py-1.5 text-xs font-medium text-muted">Sample data</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-navy p-4 text-white">
                <p className="text-xs text-white/65">This month</p>
                <p className="mt-2 text-xl font-bold">₹ 24,680</p>
                <p className="mt-2 text-xs text-emerald-200">Illustrative figure</p>
              </div>
              <div className="rounded-2xl border border-line p-4">
                <p className="text-xs text-muted">Budget left</p>
                <p className="mt-2 text-xl font-bold text-navy">₹ 5,320</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full w-[82%] rounded-full bg-emerald" /></div>
                <p className="mt-2 text-xs text-muted">Sample progress</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">Spending by category</p>
                <span className="text-xs text-muted">Example only</span>
              </div>
              <div className="mt-5 flex h-28 items-end justify-around gap-3" aria-label="Illustrative category chart">
                {[56, 86, 42, 68, 34, 75, 48].map((height, index) => (
                  <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className={`w-full max-w-9 rounded-t-md ${index === 1 ? "bg-emerald" : "bg-mint"}`} style={{ height: `${height}%` }} />
                    <span className="text-[10px] text-muted">{["Food", "Home", "Ride", "Bills", "Fun", "Shop", "Other"][index]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-mint/35 px-3 py-2.5 text-xs leading-5 text-navy">
              <ShieldCheck size={16} className="shrink-0 text-emerald" /> A preview with sample figures — no real account data shown.
            </div>
          </div>
        </div>
      </section>

      <section className="bg-canvas px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="muted-label">A little more clarity</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy">Money management, without the noise.</h2>
            <p className="mt-4 text-sm leading-7 text-muted">Useful everyday tools help you see what is happening and decide what to do next.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-line bg-white p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint/55 text-emerald"><Icon size={20} /></span>
                <h3 className="mt-5 font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div>
              <h3 className="text-lg font-bold">Your financial data deserves care.</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Account data is protected by Supabase authentication and database row-level security when configured. Finora is a budgeting tool, not financial, tax, or investment advice.</p>
            </div>
            <Link href="/signup" className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-navy hover:bg-mint">Create your account <ChevronRight size={16} /></Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo />
        <p>Finora helps with everyday budgeting. Not financial, investment, tax, or legal advice.</p>
        <p><LockKeyhole className="mr-1 inline" size={13} /> Private by design · Check brand and domain availability before commercial use.</p>
      </footer>
    </main>
  );
}
