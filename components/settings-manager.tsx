"use client";

import { useTransition } from "react";
import { addDemoTransactions, deleteDemoTransactions, saveProfile } from "@/app/actions";

export function SettingsManager({ displayName, demoCount }: { displayName: string; demoCount: number }) {
  const [pending, startTransition] = useTransition();
  function run(action: () => Promise<{ ok: boolean; message: string }>, messageElement: HTMLElement | null) {
    if (!messageElement) return;
    startTransition(async () => {
      const result = await action();
      messageElement.textContent = result.message;
      messageElement.dataset.tone = result.ok ? "success" : "error";
    });
  }
  function removeDemo() {
    if (!window.confirm("Remove all Finora demo transactions from your account? Your personal transactions will stay untouched.")) return;
    run(deleteDemoTransactions, document.getElementById("demo-message"));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card">
        <p className="muted-label">Account</p>
        <h2 className="mt-2 text-lg font-bold text-navy">Profile details</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Your account email is managed by Supabase authentication. Update how your name appears inside Finora.</p>
        <form action={(formData) => {
          startTransition(async () => {
            const result = await saveProfile(formData);
            const element = document.getElementById("profile-message");
            if (element) {
              element.textContent = result.message;
              element.dataset.tone = result.ok ? "success" : "error";
            }
          });
        }} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-ink">Display name
            <input className="field mt-1.5" type="text" name="display_name" maxLength={80} defaultValue={displayName} placeholder="Your name" />
          </label>
          <button disabled={pending} className="focus-ring min-h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
          <p id="profile-message" aria-live="polite" className="text-sm text-emerald" />
        </form>
      </section>

      <section className="card">
        <p className="muted-label">Demo data</p>
        <h2 className="mt-2 text-lg font-bold text-navy">Explore with sample expenses</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Sample rows are inserted only after your action and are clearly marked. Removing them never deletes personal transactions.</p>
        <p className="mt-4 text-sm font-semibold text-ink">{demoCount} demo transaction{demoCount === 1 ? "" : "s"} currently in your account</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button disabled={pending || demoCount > 0} onClick={() => run(addDemoTransactions, document.getElementById("demo-message"))} className="focus-ring min-h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">Add sample transactions</button>
          <button disabled={pending || demoCount === 0} onClick={removeDemo} className="focus-ring min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-45">Remove demo data</button>
        </div>
        <p id="demo-message" aria-live="polite" className="mt-3 text-sm text-emerald" />
      </section>

      <section className="card lg:col-span-2">
        <p className="muted-label">Privacy & support</p>
        <h2 className="mt-2 text-lg font-bold text-navy">A note about your data</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Finora stores personal finance records in your Supabase account. Row-level security policies limit database access to the signed-in owner. Never publish financial records or share account credentials. Finora offers budgeting tools, not financial, tax, legal, or investment advice.</p>
      </section>
    </div>
  );
}
