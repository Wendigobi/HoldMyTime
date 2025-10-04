import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HoldMyTime - Booking with Deposits",
  description: "Crush no-shows with instant booking and paid deposits. Perfect for contractors, cleaners, and service businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
