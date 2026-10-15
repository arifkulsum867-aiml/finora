import Link from "next/link";
import { signIn } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Notice } from "@/components/notice";
import { isSupabaseConfigured } from "@/lib/supabase/server";

type SearchParams = Promise<{ error?: string; message?: string; next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, message, next } = await searchParams;
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_0.85fr]">
      <section className="flex flex-col justify-between bg-navy px-6 py-7 text-white sm:px-10 lg:px-14 lg:py-10">
        <Logo light />
        <div className="my-16 max-w-lg">
          <p className="muted-label text-emerald-200">Spend smarter. Live better.</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">A clearer picture of your everyday money.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/70">Track your spending, make a plan, and build a money routine that feels right for you.</p>
          <div className="mt-8 h-1 w-16 rounded bg-emerald-300" />
        </div>
        <p className="text-xs text-white/50">Your financial data is private to your account when Supabase is configured.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <p className="muted-label">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Sign in to Finora</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Enter the email and password for your account.</p>
          <div className="mt-6 space-y-3">
            {!isSupabaseConfigured() && <Notice tone="info">Supabase is not configured yet. Add your project URL and anon key to <code>.env.local</code> to enable accounts. See the README for setup.</Notice>}
            {error && <Notice tone="error">{error}</Notice>}
            {message && <Notice tone="success">{message}</Notice>}
          </div>
          <form action={signIn} className="mt-7 space-y-4">
            <input type="hidden" name="next" value={next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"} />
            <label className="block text-sm font-semibold text-ink">Email address
              <input className="field mt-2" type="email" name="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-semibold text-ink">Password
              <input className="field mt-2" type="password" name="password" autoComplete="current-password" required minLength={8} maxLength={128} placeholder="At least 8 characters" />
            </label>
            <button className="focus-ring mt-2 min-h-12 w-full rounded-xl bg-navy px-4 font-semibold text-white transition hover:bg-navy/90">Sign in</button>
          </form>
          <p className="mt-3 text-right"><Link href="/forgot-password" className="focus-ring text-xs font-semibold text-emerald hover:underline">Forgot password?</Link></p>
          <p className="mt-6 text-center text-sm text-muted">New to Finora? <Link href="/signup" className="font-semibold text-emerald hover:underline">Create an account</Link></p>
          <p className="mt-7 text-center text-xs leading-5 text-muted">Finora provides budgeting tools and is not financial, tax, or investment advice.</p>
        </div>
      </section>
    </main>
  );
}
