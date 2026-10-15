"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, ChevronRight, CircleHelp, CreditCard, Lightbulb, LogOut, Menu, Settings2, Wallet, X } from "lucide-react";
import { signOut } from "@/app/actions";
import { Logo } from "@/components/logo";

const links = [
  { href: "/dashboard", label: "Overview", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/budgets", label: "Budgets", icon: CircleHelp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/insights", label: "Spending insights", icon: Lightbulb },
];

export function AppNavigation({ displayName, email }: { displayName?: string | null; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const label = displayName?.trim() || email.split("@")[0] || "Account";
  return (
    <>
      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Logo href="/dashboard" />
        <button className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-navy" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      {open && <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-navy/25 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-line bg-white px-4 py-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between px-2">
          <Logo href="/dashboard" />
        </div>
        <p className="muted-label mb-3 px-3">Workspace</p>
        <nav aria-label="Main navigation" className="space-y-1">
          {links.map(({ href, label: linkLabel, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-mint/65 text-navy" : "text-muted hover:bg-canvas hover:text-ink"}`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                {linkLabel}
                {active && <ChevronRight className="ml-auto text-emerald" size={16} />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Link href="/settings" onClick={() => setOpen(false)} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${pathname === "/settings" ? "bg-mint/65 text-navy" : "text-muted hover:bg-canvas hover:text-ink"}`}>
            <Settings2 size={18} /> Settings
          </Link>
          <div className="mt-5 flex items-center gap-3 border-t border-line px-2 pt-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{label.charAt(0).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{label}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
            <form action={signOut}>
              <button className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-navy" title="Sign out" aria-label="Sign out">
                <LogOut size={17} />
              </button>
            </form>
          </div>
          <p className="mt-4 px-2 text-[11px] text-muted">Spend smarter. Live better.</p>
        </div>
      </aside>
      <div className="hidden lg:block lg:w-[270px] lg:shrink-0" aria-hidden="true" />
    </>
  );
}
