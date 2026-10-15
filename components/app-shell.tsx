import { AppNavigation } from "@/components/app-navigation";

export function AppShell({ children, displayName, email }: { children: React.ReactNode; displayName?: string | null; email: string }) {
  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <AppNavigation displayName={displayName} email={email} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
