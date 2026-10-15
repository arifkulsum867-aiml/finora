import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finora | Spend smarter. Live better.",
  description: "Track expenses, plan monthly budgets, and understand everyday spending with Finora.",
  applicationName: "Finora",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#142c3b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
