import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Hold My Time',
  description: 'Book more jobs in 24h — with a deposit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-grid">
          <nav className="sticky top-0 z-40 border-b border-zinc-800/60 bg-black/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-gold-400" />
                <span className="text-lg font-semibold tracking-wide">Hold My Time</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-ghost">Log in</Link>
                <Link href="/dashboard" className="btn-gold">Dashboard</Link>
              </div>
            </div>
          </nav>

          <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>

          <footer className="border-t border-zinc-800/60 py-10 text-center text-sm text-zinc-400">
            © {new Date().getFullYear()} Hold My Time — the no-show killer.
          </footer>
        </div>
      </body>
    </html>
  );
}
