import Link from "next/link";
import { requestPasswordReset } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Notice } from "@/components/notice";
import { isSupabaseConfigured } from "@/lib/supabase/server";

type SearchParams = Promise<{ error?: string; message?: string }>;

export default async function ForgotPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, message } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-9">
        <Logo />
        <p className="muted-label mt-9">Account recovery</p>
        <h1 className="mt-2 text-3xl font-bold text-navy">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Enter your account email. If it is registered, Supabase will send a password reset link.</p>
        <div className="mt-5 space-y-3">
          {!isSupabaseConfigured() && <Notice>Supabase is not configured. Add project credentials to <code>.env.local</code> to enable account recovery.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          {message && <Notice tone="success">{message}</Notice>}
        </div>
        <form action={requestPasswordReset} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-ink">Email address
            <input className="field mt-1.5" type="email" name="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" />
          </label>
          <button className="focus-ring min-h-12 w-full rounded-xl bg-navy text-sm font-semibold text-white">Send reset link</button>
        </form>
        <Link href="/login" className="focus-ring mt-5 block text-center text-sm font-semibold text-emerald hover:underline">Back to sign in</Link>
      </div>
    </main>
  );
}
