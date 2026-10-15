import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { requireUser } from "@/lib/finance-data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function FinanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!isSupabaseConfigured()) {
    return <main className="grid min-h-screen place-items-center bg-canvas px-5 py-12"><SetupNotice /></main>;
  }
  const auth = await requireUser();
  if (!auth) redirect("/login");
  const { data: profile, error } = await auth.supabase.from("profiles").select("display_name").eq("id", auth.user.id).maybeSingle();
  if (error) throw new Error("Could not load your profile settings.");
  return <AppShell displayName={profile?.display_name} email={auth.user.email ?? "Signed-in account"}>{children}</AppShell>;
}
