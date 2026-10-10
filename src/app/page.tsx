import Link from "next/link";
import { Seal } from "@/components/Seal";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await getLeaderboard(10);

  return (
    <main id="main">
      <section className="bg-cobalt text-white">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.5fr_1fr] md:pb-24">
          <div className="md:col-span-2">
            <p className="font-display text-lg font-bold">Verified Weekly Challenge</p>
          </div>
          <div>
            <h1 className="text-5xl font-extrabold leading-[0.95] sm:text-6xl md:text-7xl">
              Prove it&apos;s you. Play once a week. Take your rank.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-white/90">
              Sign in with Discord in one click, answer five questions, and your score goes on a public board. Free to
              play, no extension, no wallet. We never see your password.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/play" className="bg-white px-6 py-3 font-display text-lg font-bold text-ink hover:bg-stamp">
                Sign in and play
              </Link>
              <Link href="/leaderboard" className="border-2 border-white px-6 py-3 font-display text-lg font-bold hover:bg-white hover:text-ink">
                See the leaderboard
              </Link>
            </div>
          </div>
          <div className="mx-auto w-56 md:w-full md:max-w-64">
            <Seal />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-bold">Top players right now</h2>
          <Link href="/leaderboard" className="underline underline-offset-4">Full leaderboard</Link>
        </div>
        <LeaderboardTable rows={rows} />
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="text-3xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {[
            ["Sign in with Discord", "One click and a Discord approval screen. We only read your public username. Your password never reaches us."],
            ["Answer five questions", "Everyone gets the same questions in a given week. Your score is graded on the server."],
            ["Wait seven days to play again", "Your next play unlocks seven days after your last score was saved. Try earlier and you will see the exact date."],
          ].map(([title, body], i) => (
            <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-t-2 border-ink pt-4">
              <span className="font-display text-3xl font-extrabold text-cobalt">{i + 1}</span>
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-1 max-w-[34rem] leading-relaxed text-ink/80">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
