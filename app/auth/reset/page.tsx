import Link from "next/link";
import { updatePassword } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Notice } from "@/components/notice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

type SearchParams = Promise<{ error?: string }>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  let validResetSession = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    validResetSession = Boolean(data.user);
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-9">
        <Logo />
        <p className="muted-label mt-9">Account recovery</p>
        <h1 className="mt-2 text-3xl font-bold text-navy">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Use at least eight characters. You’ll sign in with this password after saving it.</p>
        <div className="mt-5 space-y-3">
          {!isSupabaseConfigured() && <Notice>Supabase is not configured. See the README to set up authentication.</Notice>}
          {!validResetSession && isSupabaseConfigured() && <Notice tone="error">This reset link is expired or was already used. <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
        </div>
        {validResetSession && <form action={updatePassword} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-ink">New password
            <input className="field mt-1.5" type="password" name="password" required minLength={8} maxLength={128} autoComplete="new-password" />
          </label>
          <label className="block text-sm font-semibold text-ink">Confirm password
            <input className="field mt-1.5" type="password" name="confirm_password" required minLength={8} maxLength={128} autoComplete="new-password" />
          </label>
          <button className="focus-ring min-h-12 w-full rounded-xl bg-navy text-sm font-semibold text-white">Update password</button>
        </form>}
        <Link href="/login" className="focus-ring mt-5 block text-center text-sm font-semibold text-emerald hover:underline">Back to sign in</Link>
      </div>
    </main>
  );
}
