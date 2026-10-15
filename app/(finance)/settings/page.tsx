import { PageHeader } from "@/components/page-header";
import { SettingsManager } from "@/components/settings-manager";
import { getFinanceData } from "@/lib/finance-data";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const data = await getFinanceData(new Date().toISOString().slice(0, 7));
  if (!data) return null;
  const supabase = await createClient();
  const { data: profile, error } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).maybeSingle();
  if (error) throw new Error("Could not load your profile.");
  const demoCount = data.allTransactions.filter((item) => item.is_demo).length;
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, sample data, and privacy details." />
      <SettingsManager displayName={profile?.display_name ?? ""} demoCount={demoCount} />
    </>
  );
}
