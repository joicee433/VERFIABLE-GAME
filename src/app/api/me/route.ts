import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getEligibility } from "@/lib/eligibility";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ username: null });
  return NextResponse.json({ username: session.username, eligibility: await getEligibility(session.username) });
}
