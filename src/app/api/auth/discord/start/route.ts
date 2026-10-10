import { NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";
import { redirectUri } from "@/lib/origin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const state = crypto.randomUUID();
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", requireEnv("DISCORD_CLIENT_ID"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri(req));
  url.searchParams.set("scope", "identify"); // public profile only, no email, no servers
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "none"); // skip the approval screen for returning users

  const res = NextResponse.redirect(url);
  res.cookies.set("vwc_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
