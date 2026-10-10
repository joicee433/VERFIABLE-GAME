import type { Row } from "@/lib/leaderboard";
import { formatDuration } from "@/lib/format";

export function LeaderboardTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <p className="border-y border-rule py-8 text-lg">
        No scores yet. The first verified player takes the top spot.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-left">
        <caption className="sr-only">Best score per verified username</caption>
        <thead>
          <tr className="border-b-2 border-ink text-sm">
            <th scope="col" className="w-14 py-2 pr-2 font-semibold">Rank</th>
            <th scope="col" className="py-2 pr-2 font-semibold">Player</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold">Score</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold">Time</th>
            <th scope="col" className="py-2 text-right font-semibold">Played</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.username} className="border-b border-rule">
              <td className="py-3 pr-2 font-display text-xl font-bold tabular-nums">{i + 1}</td>
              <td className="py-3 pr-2 font-medium break-all">@{r.username}</td>
              <td className="py-3 pr-2 text-right font-display text-xl font-bold tabular-nums">
                {r.score}<span className="text-ink/60">/{r.total}</span>
              </td>
              <td className="py-3 pr-2 text-right tabular-nums">{formatDuration(r.duration_ms)}</td>
              <td className="py-3 text-right tabular-nums text-ink/70">
                {new Date(r.played_at).toISOString().slice(0, 10)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
