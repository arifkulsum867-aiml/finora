import Link from "next/link";
import { CircleDollarSign } from "lucide-react";

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className={`focus-ring inline-flex items-center gap-2 font-bold tracking-tight ${light ? "text-white" : "text-navy"}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-emerald">
        <CircleDollarSign aria-hidden="true" size={21} strokeWidth={2.2} />
      </span>
      <span className="text-xl">finora<span className={light ? "text-emerald-200" : "text-emerald"}>.</span></span>
    </Link>
  );
}
