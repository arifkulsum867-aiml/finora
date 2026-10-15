import { shiftMonth, startOfMonth } from "@/lib/date-utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Budget, Transaction } from "@/types/finance";

export async function requireUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error("Unable to verify your session. Please sign in again.");
  if (!data.user) return null;
  return { supabase, user: data.user };
}

export async function getFinanceData(monthKey: string) {
  const auth = await requireUser();
  if (!auth) return null;
  const first = startOfMonth(monthKey);
  const next = startOfMonth(shiftMonth(monthKey, -1));
  const [current, previous, budgets, allTransactions] = await Promise.all([
    fetchTransactions(auth.supabase, auth.user.id, first, monthKeyNext(monthKey)),
    fetchTransactions(auth.supabase, auth.user.id, next, first),
    auth.supabase.from("budgets").select("*").eq("user_id", auth.user.id).eq("month", first),
    fetchTransactions(auth.supabase, auth.user.id),
  ]);
  if (budgets.error) throw new Error("Could not load your finance data. Please try again.");
  return {
    user: auth.user,
    current,
    previous,
    budgets: (budgets.data ?? []) as Budget[],
    allTransactions,
  };
}

async function fetchTransactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  start?: string,
  end?: string,
): Promise<Transaction[]> {
  const pageSize = 500;
  const transactions: Transaction[] = [];
  for (let offset = 0; ; offset += pageSize) {
    let query = supabase.from("transactions").select("*").eq("user_id", userId);
    if (start) query = query.gte("transaction_date", start);
    if (end) query = query.lt("transaction_date", end);
    const { data, error } = await query.order("transaction_date", { ascending: false }).range(offset, offset + pageSize - 1);
    if (error) throw new Error("Could not load your finance data. Please try again.");
    const page = (data ?? []) as Transaction[];
    transactions.push(...page);
    if (page.length < pageSize) return transactions;
  }
}

function monthKeyNext(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, "0")}-01`;
}
