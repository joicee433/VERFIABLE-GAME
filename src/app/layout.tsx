import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verified Weekly Challenge",
  description:
    "Prove who you are with a zero-knowledge proof, play one short quiz a week, and climb a public leaderboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        {children}
        <footer className="mx-auto max-w-5xl px-5 py-10 text-sm text-ink/70">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6">
            <p>We store your public username, a proof id, your score and when you played. Nothing else.</p>
            <nav className="flex gap-5">
              <Link href="/play" className="underline underline-offset-4">Play</Link>
              <Link href="/leaderboard" className="underline underline-offset-4">Leaderboard</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
