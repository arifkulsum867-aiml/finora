import Link from "next/link";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="muted-label mb-2">Finora</p>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action && <Link href={action.href} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90">{action.label}</Link>}
    </div>
  );
}
