import { Notice } from "@/components/notice";

export function SetupNotice() {
  return (
    <div className="card max-w-2xl">
      <p className="muted-label">One-time setup</p>
      <h2 className="mt-2 text-xl font-bold text-navy">Connect your private workspace</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Finora needs a Supabase project to create accounts and save finance data. Until it is configured, this screen shows no sample account records.</p>
      <div className="mt-5"><Notice>Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase project URL and public anon key, then apply the SQL migration from <code>supabase/migrations</code>. Full steps are in <code>README.md</code>.</Notice></div>
    </div>
  );
}
