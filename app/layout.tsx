// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hold My Time",
  description: "Book more jobs in 24h — with a deposit",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <header style={{ padding: "12px 24px", borderBottom: "1px solid #eee" }}>
          <nav style={{ display: "flex", gap: 16 }}>
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
