import { NextResponse } from "next/server";
import { getSession, readAttempt } from "@/lib/session";
import { grade } from "@/lib/quiz";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Verify your account first." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.attempt !== "string") return NextResponse.json({ error: "Missing attempt." }, { status: 400 });

  const attempt = await readAttempt(body.attempt);
  if (!attempt || attempt.username !== session.username)
    return NextResponse.json({ error: "This quiz attempt is no longer valid. Start again." }, { status: 400 });

  const score = grade(attempt.questionIds, body.answers);
  if (score < 0) return NextResponse.json({ error: "Answer every question." }, { status: 400 });

  // Duration is measured on the server from the signed attempt token, not reported by the browser.
  const durationMs = Math.max(0, Date.now() - attempt.iat * 1000);

  const { data, error } = await db().rpc("submit_score", {
    p_username: session.username,
    p_score: score,
    p_total: attempt.questionIds.length,
    p_duration_ms: durationMs,
  });
  if (error) {
    console.error("submit_score failed", error);
    return NextResponse.json({ error: "Could not save your score." }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.saved)
    return NextResponse.json(
      { error: "You already played this week.", nextAllowedAt: row?.next_allowed_at },
      { status: 403 },
    );

  return NextResponse.json({ score, total: attempt.questionIds.length, durationMs, nextAllowedAt: row.next_allowed_at });
}
