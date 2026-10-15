export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-blue-100 bg-blue-50 text-blue-900",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    success: "border-emerald/20 bg-mint/50 text-navy",
  };
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${styles[tone]}`}>{children}</div>;
}
