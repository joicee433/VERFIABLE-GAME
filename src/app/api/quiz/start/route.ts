import { NextResponse } from "next/server";
import { getSession, createAttempt } from "@/lib/session";
import { getEligibility } from "@/lib/eligibility";
import { toPublic, weeklyQuestions, weekKey } from "@/lib/quiz";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Verify your account first." }, { status: 401 });

  const eligibility = await getEligibility(session.username);
  if (!eligibility.allowed)
    return NextResponse.json(
      { error: "You already played this week.", nextAllowedAt: eligibility.nextAllowedAt },
      { status: 403 },
    );

  const questions = weeklyQuestions();
  const attempt = await createAttempt(session.username, questions.map((q) => q.id));
  return NextResponse.json({ attempt, week: weekKey(), questions: questions.map(toPublic) });
}
