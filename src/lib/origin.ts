/** Public origin of this deployment, correct behind Vercel's proxy. */
export function originOf(req: Request) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? new URL(req.url).host;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const redirectUri = (req: Request) => `${originOf(req)}/api/auth/discord/callback`;
