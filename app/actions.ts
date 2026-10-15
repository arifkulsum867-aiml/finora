"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authSchema, budgetSchema, transactionSchema } from "@/lib/validation/finance";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { requireUser } from "@/lib/finance-data";

export type ActionResult = { ok: boolean; message: string };

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signIn(formData: FormData): Promise<void> {
  const parsed = authSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });
  if (!parsed.success) redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  if (!isSupabaseConfigured()) redirect(`/login?error=${encodeURIComponent("Authentication is unavailable. Check your Supabase setup.")}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent("Email or password was not accepted.")}`);
  const next = getString(formData, "next");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function signUp(formData: FormData): Promise<void> {
  const parsed = authSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });
  const displayName = getString(formData, "display_name").trim();
  if (!parsed.success) redirect(`/signup?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  if (displayName.length > 80) redirect(`/signup?error=${encodeURIComponent("Name must be 80 characters or fewer.")}`);

  if (!isSupabaseConfigured()) redirect(`/signup?error=${encodeURIComponent("Authentication is unavailable. Check your Supabase setup.")}`);
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  });
  if (error || !data.user) redirect(`/signup?error=${encodeURIComponent("We could not create that account. Check the details or try signing in.")}`);
  if (!data.session) redirect(`/login?message=${encodeURIComponent("Account created. Check your email to verify the address, then sign in.")}`);
  redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = z.string().trim().email("Enter a valid email address.").safeParse(getString(formData, "email"));
  if (!email.success) redirect(`/forgot-password?error=${encodeURIComponent(email.error.issues[0].message)}`);
  if (!isSupabaseConfigured()) redirect(`/forgot-password?error=${encodeURIComponent("Authentication is unavailable. Check your Supabase setup.")}`);
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset`,
  });
  if (error) redirect(`/forgot-password?error=${encodeURIComponent("We could not send a reset email. Check your address and try again.")}`);
  redirect(`/forgot-password?message=${encodeURIComponent("If an account exists for that address, you will receive a password reset email.")}`);
}

export async function updatePassword(formData: FormData): Promise<void> {
  const password = getString(formData, "password");
  const confirmation = getString(formData, "confirm_password");
  const parsed = z.string().min(8, "Password must be at least 8 characters.").max(128).safeParse(password);
  if (!parsed.success) redirect(`/auth/reset?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  if (parsed.data !== confirmation) redirect(`/auth/reset?error=${encodeURIComponent("Passwords do not match.")}`);
  if (!isSupabaseConfigured()) redirect(`/auth/reset?error=${encodeURIComponent("The reset session is no longer available. Request another reset email.")}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) redirect(`/auth/reset?error=${encodeURIComponent("Could not update the password. Request a fresh reset email.")}`);
  redirect(`/login?message=${encodeURIComponent("Password updated. You can now sign in.")}`);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) redirect(`/settings?error=${encodeURIComponent("Could not sign out. Please try again.")}`);
  redirect("/");
}

export async function saveTransaction(formData: FormData): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse({
    description: getString(formData, "description"),
    amount: getString(formData, "amount"),
    category: getString(formData, "category"),
    transaction_date: getString(formData, "transaction_date"),
    payment_method: getString(formData, "payment_method"),
    notes: getString(formData, "notes"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const id = getString(formData, "id");
  if (id && !z.string().uuid().safeParse(id).success) return { ok: false, message: "Select a valid transaction." };
  const auth = await requireUser();
  if (!auth) return { ok: false, message: "Please sign in to manage transactions." };
  const values = {
    ...parsed.data,
    amount: parsed.data.amount,
    notes: parsed.data.notes || null,
    updated_at: new Date().toISOString(),
  };

  const result = id
    ? await auth.supabase.from("transactions").update(values).eq("id", id).eq("user_id", auth.user.id).select("id").single()
    : await auth.supabase.from("transactions").insert({ ...values, user_id: auth.user.id }).select("id").single();
  if (result.error) return { ok: false, message: "Could not save the transaction. Check your input and try again." };
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  revalidatePath("/insights");
  revalidatePath("/budgets");
  return { ok: true, message: id ? "Transaction updated." : "Transaction added." };
}

export async function deleteTransaction(formData: FormData): Promise<ActionResult> {
  const id = z.string().uuid().safeParse(getString(formData, "id"));
  if (!id.success) return { ok: false, message: "Select a valid transaction." };
  const auth = await requireUser();
  if (!auth) return { ok: false, message: "Please sign in to manage transactions." };
  const { error, count } = await auth.supabase.from("transactions").delete({ count: "exact" }).eq("id", id.data).eq("user_id", auth.user.id);
  if (error) return { ok: false, message: "Could not delete the transaction. Please try again." };
  if (!count) return { ok: false, message: "Transaction not found." };
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  revalidatePath("/insights");
  revalidatePath("/budgets");
  return { ok: true, message: "Transaction deleted." };
}

export async function saveBudget(formData: FormData): Promise<ActionResult> {
  const parsed = budgetSchema.safeParse({
    month: getString(formData, "month"),
    category: getString(formData, "category"),
    amount: getString(formData, "amount"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const auth = await requireUser();
  if (!auth) return { ok: false, message: "Please sign in to manage budgets." };
  const month = `${parsed.data.month}-01`;
  const category = parsed.data.category || null;
  const existing = await auth.supabase.from("budgets").select("id, category").eq("user_id", auth.user.id).eq("month", month);
  if (existing.error) return { ok: false, message: "Could not check for an existing budget." };
  const match = existing.data?.find((budget) => budget.category === category);
  const result = match
    ? await auth.supabase.from("budgets").update({ amount: parsed.data.amount, updated_at: new Date().toISOString() }).eq("id", match.id).eq("user_id", auth.user.id)
    : await auth.supabase.from("budgets").insert({ user_id: auth.user.id, month, category, amount: parsed.data.amount });
  if (result.error) return { ok: false, message: "Could not save this budget. Please try again." };
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  revalidatePath("/insights");
  return { ok: true, message: match ? "Budget updated." : "Budget added." };
}

export async function deleteBudget(formData: FormData): Promise<ActionResult> {
  const id = z.string().uuid().safeParse(getString(formData, "id"));
  if (!id.success) return { ok: false, message: "Select a valid budget." };
  const auth = await requireUser();
  if (!auth) return { ok: false, message: "Please sign in to manage budgets." };
  const { error, count } = await auth.supabase.from("budgets").delete({ count: "exact" }).eq("id", id.data).eq("user_id", auth.user.id);
  if (error) return { ok: false, message: "Could not delete this budget. Please try again." };
  if (!count) return { ok: false, message: "Budget not found." };
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  revalidatePath("/insights");
  return { ok: true, message: "Budget deleted." };
}

export async function deleteDemoTransactions(): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth) return { ok: false, message: "Please sign in to manage demo data." };
  const { error } = await auth.supabase.from("transactions").delete().eq("user_id", auth.user.id).eq("is_demo", true);
  if (error) return { ok: false, message: "Could not remove demo transactions. Please try again." };
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { ok: true, message: "Demo transactions removed." };
}

export async function addDemoTransactions(): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth) return { ok: false, message: "Please sign in to add demo data." };
  const existing = await auth.supabase.from("transactions").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id).eq("is_demo", true);
  if (existing.error) return { ok: false, message: "Could not check for existing demo transactions." };
  if (existing.count) return { ok: false, message: "Demo transactions are already in this account. Remove them first to add them again." };
  const today = new Date();
  const date = (daysAgo: number) => {
    const value = new Date(today);
    value.setDate(value.getDate() - daysAgo);
    return value.toISOString().slice(0, 10);
  };
  const examples = [
    { description: "Neighborhood supermarket", amount: "1840.00", category: "Groceries", payment_method: "UPI", daysAgo: 1 },
    { description: "Coffee and breakfast", amount: "420.00", category: "Food", payment_method: "Credit Card", daysAgo: 2 },
    { description: "Metro travel pass", amount: "680.00", category: "Transport", payment_method: "UPI", daysAgo: 4 },
    { description: "Internet bill", amount: "999.00", category: "Bills and Utilities", payment_method: "Bank Transfer", daysAgo: 6 },
    { description: "Bookshop", amount: "750.00", category: "Education", payment_method: "Debit Card", daysAgo: 9 },
  ] as const;
  const { error } = await auth.supabase.from("transactions").insert(examples.map((item) => ({
    id: demoTransactionId(auth.user.id, item.description),
    user_id: auth.user.id,
    description: item.description,
    amount: item.amount,
    category: item.category,
    payment_method: item.payment_method,
    transaction_date: date(item.daysAgo),
    is_demo: true,
  })));
  if (error) return { ok: false, message: "Could not add demo transactions. Please try again." };
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/analytics");
  revalidatePath("/insights");
  return { ok: true, message: "Sample transactions added to your account. They are marked as demo data." };
}

function demoTransactionId(userId: string, description: string): string {
  const bytes = createHash("sha256").update(`finora-demo:${userId}:${description}`).digest().subarray(0, 16);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function saveProfile(formData: FormData): Promise<ActionResult> {
  const displayName = z.string().trim().max(80, "Name must be 80 characters or fewer.").safeParse(getString(formData, "display_name"));
  if (!displayName.success) return { ok: false, message: displayName.error.issues[0].message };
  const auth = await requireUser();
  if (!auth) return { ok: false, message: "Please sign in to update settings." };
  const { data, error } = await auth.supabase.from("profiles").update({
    display_name: displayName.data || null,
    updated_at: new Date().toISOString(),
  }).eq("id", auth.user.id).select("id").maybeSingle();
  if (error) return { ok: false, message: "Could not update your profile. Please try again." };
  if (!data) return { ok: false, message: "Your profile was not found. Sign out and sign in again." };
  revalidatePath("/settings");
  return { ok: true, message: "Profile updated." };
}
