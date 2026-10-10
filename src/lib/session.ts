import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requireEnv } from "./env";

const COOKIE = "vwc_session";
const key = () => new TextEncoder().encode(requireEnv("SESSION_SECRET"));

export type Session = { username: string; proofId: string };

async function sign(payload: Record<string, unknown>, kind: string, ttl: string) {
  return new SignJWT({ ...payload, kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(key());
}

async function read<T>(token: string, kind: string): Promise<(T & { iat: number }) | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (payload.kind !== kind) return null;
    return payload as unknown as T & { iat: number };
  } catch {
    return null;
  }
}

// ---- login session (httpOnly cookie) ----
export async function createSession(s: Session) {
  const token = await sign({ username: s.username, proofId: s.proofId }, "session", "2h");
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const p = await read<Session>(token, "session");
  return p ? { username: p.username, proofId: p.proofId } : null;
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

// ---- quiz attempt token (binds question set + start time to one user) ----
export async function createAttempt(username: string, questionIds: string[]) {
  return sign({ username, questionIds }, "attempt", "20m");
}

export async function readAttempt(token: string) {
  return read<{ username: string; questionIds: string[] }>(token, "attempt");
}
