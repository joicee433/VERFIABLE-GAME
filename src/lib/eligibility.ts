import "server-only";
import { db } from "./supabase";
import { COOLDOWN_MS } from "./env";

export type Eligibility = { allowed: true } | { allowed: false; nextAllowedAt: string };

export async function getEligibility(username: string): Promise<Eligibility> {
  const { data, error } = await db()
    .from("scores")
    .select("played_at")
    .eq("username", username)
    .order("played_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { allowed: true };
  const next = new Date(new Date(data.played_at).getTime() + COOLDOWN_MS);
  return next.getTime() > Date.now() ? { allowed: false, nextAllowedAt: next.toISOString() } : { allowed: true };
}
