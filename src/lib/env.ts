export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const COOLDOWN_DAYS = 7;
export const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
export const QUESTIONS_PER_WEEK = 5;
