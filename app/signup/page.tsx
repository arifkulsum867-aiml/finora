import Link from "next/link";
import { signUp } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Notice } from "@/components/notice";
import { isSupabaseConfigured } from "@/lib/supabase/server";

type SearchParams = Promise<{ error?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_0.85fr]">
      <section className="flex flex-col justify-between bg-navy px-6 py-7 text-white sm:px-10 lg:px-14 lg:py-10">
        <Logo light />
        <div className="my-16 max-w-lg">
          <p className="muted-label text-emerald-200">A fresh start, at your pace</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Make everyday spending easier to understand.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/70">Finora brings expense tracking, budgets, and explainable insights into one simple space.</p>
        </div>
        <p className="text-xs text-white/50">Spend smarter. Live better.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <p className="muted-label">Get started</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Create your account</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Your account is private. You can start with just your email.</p>
          <div className="mt-6 space-y-3">
            {!isSupabaseConfigured() && <Notice tone="info">Account creation requires Supabase. Add your project URL and anon key to <code>.env.local</code>; setup steps are in the README.</Notice>}
            {error && <Notice tone="error">{error}</Notice>}
          </div>
          <form action={signUp} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-ink">Name <span className="font-normal text-muted">(optional)</span>
              <input className="field mt-2" type="text" name="display_name" autoComplete="name" maxLength={80} placeholder="Your name" />
            </label>
            <label className="block text-sm font-semibold text-ink">Email address
              <input className="field mt-2" type="email" name="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-semibold text-ink">Password
              <input className="field mt-2" type="password" name="password" autoComplete="new-password" required minLength={8} maxLength={128} placeholder="At least 8 characters" />
            </label>
            <button className="focus-ring mt-2 min-h-12 w-full rounded-xl bg-navy px-4 font-semibold text-white transition hover:bg-navy/90">Create account</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-semibold text-emerald hover:underline">Sign in</Link></p>
          <p className="mt-7 text-center text-xs leading-5 text-muted">Finora provides budgeting tools and is not financial, tax, or investment advice.</p>
        </div>
      </section>
    </main>
  );
}
