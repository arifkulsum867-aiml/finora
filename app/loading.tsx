export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5">
      <div className="w-full max-w-4xl animate-pulse space-y-5" aria-label="Loading Finora">
        <span className="sr-only">Loading Finora…</span>
        <div className="h-8 w-48 rounded-lg bg-line" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl bg-white" />)}</div>
        <div className="h-72 rounded-2xl bg-white" />
      </div>
    </main>
  );
}
