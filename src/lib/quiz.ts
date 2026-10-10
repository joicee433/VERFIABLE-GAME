import { QUESTIONS_PER_WEEK } from "./env";

export type Question = { id: string; prompt: string; options: string[]; answer: number };
export type PublicQuestion = Omit<Question, "answer">;

export const BANK: Question[] = [
  { id: "https", prompt: "What does the S in HTTPS stand for?", options: ["Standard", "Secure", "Server", "Signed"], answer: 1 },
  { id: "port443", prompt: "Which port does HTTPS use by default?", options: ["80", "8080", "443", "22"], answer: 2 },
  { id: "tls", prompt: "TLS is the modern successor to which protocol?", options: ["SSH", "FTP", "SSL", "SMTP"], answer: 2 },
  { id: "sha256", prompt: "How many bits long is a SHA-256 hash?", options: ["128", "256", "512", "64"], answer: 1 },
  { id: "privkey", prompt: "In public-key cryptography, which key must you keep secret?", options: ["The public key", "The private key", "Both keys", "Neither"], answer: 1 },
  { id: "dns", prompt: "What does DNS do?", options: ["Encrypts web traffic", "Translates domain names to IP addresses", "Stores cookies", "Blocks malware"], answer: 1 },
  { id: "404", prompt: "Which HTTP status code means Not Found?", options: ["200", "301", "404", "500"], answer: 2 },
  { id: "zkp", prompt: "What does a zero-knowledge proof let you do?", options: ["Hide that a proof exists", "Show a statement is true without revealing the secret behind it", "Skip authentication", "Compress large files"], answer: 1 },
  { id: "passwords", prompt: "Which is the safest way for a service to store passwords?", options: ["Plain text", "Reversible encryption with one shared key", "A salted, slow hash such as Argon2", "A fast unsalted MD5 hash"], answer: 2 },
  { id: "ipv6", prompt: "How many bits long is an IPv6 address?", options: ["32", "64", "128", "256"], answer: 2 },
  { id: "get", prompt: "Which HTTP method is meant for reading data without changing it?", options: ["POST", "GET", "PUT", "DELETE"], answer: 1 },
  { id: "cors", prompt: "What does CORS stand for?", options: ["Cross-Origin Resource Sharing", "Central Origin Request Security", "Cross-Object Rendering System", "Client Origin Routing Standard"], answer: 0 },
  { id: "u8", prompt: "What is the largest value an unsigned 8-bit integer can hold?", options: ["127", "128", "255", "256"], answer: 2 },
  { id: "js", prompt: "Which company created JavaScript?", options: ["Microsoft", "Sun Microsystems", "Netscape", "Google"], answer: 2 },
  { id: "nonce", prompt: "Why do login challenges include a one-time nonce?", options: ["To speed up requests", "To stop a captured response being replayed later", "To compress the payload", "To pick a server"], answer: 1 },
  { id: "setcookie", prompt: "What does the Set-Cookie response header do?", options: ["Deletes the browser cache", "Asks the browser to store a cookie", "Opens a WebSocket", "Redirects to another page"], answer: 1 },
];

/** ISO-style week key in UTC, e.g. 2026-W41. Everyone gets the same questions in a given week. */
export function weekKey(d = new Date()): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((t.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function weeklyQuestions(d = new Date()): Question[] {
  const rand = seeded(weekKey(d));
  const pool = [...BANK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, QUESTIONS_PER_WEEK);
}

export const toPublic = ({ id, prompt, options }: Question): PublicQuestion => ({ id, prompt, options });

export function grade(questionIds: string[], answers: unknown): number {
  if (!Array.isArray(answers) || answers.length !== questionIds.length) return -1;
  let score = 0;
  questionIds.forEach((id, i) => {
    const q = BANK.find((x) => x.id === id);
    if (q && Number.isInteger(answers[i]) && answers[i] === q.answer) score++;
  });
  return score;
}
