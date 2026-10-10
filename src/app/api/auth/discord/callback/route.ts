import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/env";
import { originOf, redirectUri } from "@/lib/origin";
import { createSession } from "@/lib/session";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function back(req: Request, error?: string) {
  const url = new URL("/play", originOf(req));
  if (error) url.searchParams.set("error", error);
  const res = NextResponse.redirect(url);
  res.cookies.delete("vwc_oauth_state");
  return res;
}

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    if (params.get("error")) return back(req, "Sign-in was cancelled.");

    const code = params.get("code");
    const state = params.get("state");
    const saved = (await cookies()).get("vwc_oauth_state")?.value;
    if (!code || !state || !saved || state !== saved) return back(req, "Sign-in expired. Please try again.");

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        client_id: requireEnv("DISCORD_CLIENT_ID"),
        client_secret: requireEnv("DISCORD_CLIENT_SECRET"),
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri(req),
      }),
    });
    const token = (await tokenRes.json().catch(() => null)) as { access_token?: string } | null;
    if (!token?.access_token) return back(req, "Discord did not confirm the sign-in. Please try again.");

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const dc = (await userRes.json().catch(() => null)) as { id?: string; username?: string } | null;
    if (!userRes.ok || !dc?.id || !dc.username) return back(req, "Could not read your Discord username.");

    // Only the public username and Discord's numeric id are kept. The access token is discarded.
    const username = dc.username.toLowerCase();
    const proofId = `discord:${dc.id}`;

    const { error } = await db()
      .from("verified_users")
      .upsert({ username, proof_id: proofId, verified_at: new Date().toISOString() }, { onConflict: "username" });
    if (error) {
      if (error.code === "23505")
        return back(req, "This Discord account is already linked to another username. Contact the organizer.");
      throw new Error(error.message);
    }

    await createSession({ username, proofId });
    return back(req);
  } catch (e) {
    console.error("discord callback failed", e);
    return back(req, "Sign-in failed on the server. Please try again.");
  }
}
