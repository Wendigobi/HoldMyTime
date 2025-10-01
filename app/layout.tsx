import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Hold My Time",
  description: "Self-serve booking with fixed deposit",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600" />
            <span className="font-extrabold text-lg">Hold My Time</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <a href="/" className="hover:underline">Home</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 pb-20">{children}</main>
        <footer className="border-t py-8">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <p className="muted">© {new Date().getFullYear()} Hold My Time</p>
            <p className="muted">Powered by Stripe</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
