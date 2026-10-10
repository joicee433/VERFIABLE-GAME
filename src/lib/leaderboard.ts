import "server-only";
import { db } from "./supabase";

export type Row = { username: string; score: number; total: number; duration_ms: number; played_at: string };

export async function getLeaderboard(limit = 50): Promise<Row[]> {
  const { data, error } = await db()
    .from("leaderboard")
    .select("username, score, total, duration_ms, played_at")
    .order("score", { ascending: false })
    .order("duration_ms", { ascending: true })
    .order("played_at", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("leaderboard failed", error);
    return [];
  }
  return data as Row[];
}
