import Link from "next/link";
import type { Metadata } from "next";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leaderboard | Verified Weekly Challenge" };

export default async function LeaderboardPage() {
  const rows = await getLeaderboard(100);
  return (
    <main id="main" className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/" className="font-display font-bold underline underline-offset-4">Verified Weekly Challenge</Link>
      <h1 className="mt-6 text-5xl font-extrabold">Leaderboard</h1>
      <p className="mt-3 max-w-[34rem] text-lg text-ink/80">
        Each verified username appears once, with its best play. Ties go to the faster time, then the earlier play.
      </p>
      <div className="mt-8"><LeaderboardTable rows={rows} /></div>
      <Link href="/play" className="mt-10 inline-block bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink">
        Verify and play
      </Link>
    </main>
  );
}
