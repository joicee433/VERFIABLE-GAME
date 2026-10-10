"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatDuration } from "@/lib/format";

type Eligibility = { allowed: true } | { allowed: false; nextAllowedAt: string };
type Question = { id: string; prompt: string; options: string[] };
type Phase =
  | { name: "loading" }
  | { name: "connect" }
  | { name: "ready"; username: string }
  | { name: "blocked"; username: string; nextAllowedAt: string }
  | { name: "quiz"; username: string; attempt: string; questions: Question[]; answers: (number | null)[]; index: number }
  | { name: "saving" }
  | { name: "done"; username: string; score: number; total: number; durationMs: number; nextAllowedAt: string };

async function json<T>(res: Response): Promise<T & { error?: string }> {
  return res.json().catch(() => ({ error: "Unexpected server response." }));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short", timeZoneName: "short" });
}

export function PlayFlow() {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [error, setError] = useState<string | null>(null);

  const applyEligibility = useCallback((username: string, e: Eligibility) => {
    setPhase(e.allowed ? { name: "ready", username } : { name: "blocked", username, nextAllowedAt: e.nextAllowedAt });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setError(err);
      window.history.replaceState(null, "", "/play");
    }
    fetch("/api/me")
      .then((r) => r.json())
      .then((me) => (me.username ? applyEligibility(me.username, me.eligibility) : setPhase({ name: "connect" })))
      .catch(() => setPhase({ name: "connect" }));
  }, [applyEligibility]);

  function signIn() {
    setError(null);
    window.location.href = "/api/auth/discord/start";
  }

  async function startQuiz(username: string) {
    setError(null);
    const res = await fetch("/api/quiz/start", { method: "POST" });
    const body = await json<{ attempt: string; questions: Question[]; nextAllowedAt?: string }>(res);
    if (res.status === 403 && body.nextAllowedAt) return setPhase({ name: "blocked", username, nextAllowedAt: body.nextAllowedAt });
    if (res.status === 401) return setPhase({ name: "connect" });
    if (!res.ok) return setError(body.error ?? "Could not start the quiz.");
    setPhase({
      name: "quiz",
      username,
      attempt: body.attempt,
      questions: body.questions,
      answers: body.questions.map(() => null),
      index: 0,
    });
  }

  async function submit(p: Extract<Phase, { name: "quiz" }>) {
    setPhase({ name: "saving" });
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attempt: p.attempt, answers: p.answers }),
    });
    const body = await json<{ score: number; total: number; durationMs: number; nextAllowedAt: string }>(res);
    if (res.status === 403 && body.nextAllowedAt) return setPhase({ name: "blocked", username: p.username, nextAllowedAt: body.nextAllowedAt });
    if (!res.ok) {
      setError(body.error ?? "Could not save your score.");
      return setPhase({ name: "ready", username: p.username });
    }
    setPhase({ name: "done", username: p.username, ...body });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setError(null);
    setPhase({ name: "connect" });
  }

  const btn = "bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50";

  return (
    <div className="mt-6" aria-live="polite">
      {error && (
        <p role="alert" className="mb-6 border-l-4 border-danger bg-white px-4 py-3 text-danger">{error}</p>
      )}

      {phase.name === "loading" && <p>Loading…</p>}

      {phase.name === "connect" && (
        <section>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Sign in with Discord</h1>
          <p className="mt-4 max-w-[34rem] text-lg leading-relaxed">
            One click and a Discord approval screen. We only read your public username. We never see your password,
            and it costs nothing to play.
          </p>
          <button onClick={signIn} className={`${btn} mt-8`}>Continue with Discord</button>
        </section>
      )}

      {phase.name === "ready" && (
        <section>
          <p className="text-ink/70">Verified as</p>
          <h1 className="break-all text-4xl font-extrabold sm:text-5xl">@{phase.username}</h1>
          <p className="mt-4 max-w-[34rem] text-lg">Five questions. Your score and time go on the public leaderboard, and your next play unlocks seven days later.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <button onClick={() => startQuiz(phase.username)} className={btn}>Start the quiz</button>
            <button onClick={logout} className="underline underline-offset-4">Not you? Sign out</button>
          </div>
        </section>
      )}

      {phase.name === "blocked" && (
        <section>
          <p className="text-ink/70">@{phase.username}</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">You&apos;ve already played this week</h1>
          <p className="mt-4 text-lg">You can play again on</p>
          <p className="mt-1 font-display text-2xl font-bold text-cobalt sm:text-3xl">{fmtDate(phase.nextAllowedAt)}</p>
          <p className="mt-2 text-ink/70">{new Date(phase.nextAllowedAt).toISOString()}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/leaderboard" className={btn}>See the leaderboard</Link>
            <button onClick={logout} className="underline underline-offset-4">Sign out</button>
          </div>
        </section>
      )}

      {phase.name === "quiz" && (() => {
        const q = phase.questions[phase.index];
        const picked = phase.answers[phase.index];
        const last = phase.index === phase.questions.length - 1;
        const setAnswer = (i: number) =>
          setPhase({ ...phase, answers: phase.answers.map((a, k) => (k === phase.index ? i : a)) });
        return (
          <section>
            <p className="text-ink/70">Question {phase.index + 1} of {phase.questions.length}</p>
            <div className="mt-2 h-1.5 bg-rule" aria-hidden>
              <div className="h-full bg-cobalt" style={{ width: `${((phase.index + 1) / phase.questions.length) * 100}%` }} />
            </div>
            <fieldset className="mt-6">
              <legend className="font-display text-3xl font-bold leading-tight">{q.prompt}</legend>
              <div className="mt-6 space-y-3">
                {q.options.map((o, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-center gap-3 border-2 px-4 py-3 text-lg ${picked === i ? "border-cobalt bg-white" : "border-rule hover:border-ink"}`}
                  >
                    <input type="radio" name={q.id} checked={picked === i} onChange={() => setAnswer(i)} className="size-5 accent-cobalt" />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-8 flex items-center gap-6">
              {last ? (
                <button disabled={picked === null} onClick={() => submit(phase)} className={btn}>Save my score</button>
              ) : (
                <button disabled={picked === null} onClick={() => setPhase({ ...phase, index: phase.index + 1 })} className={btn}>Next question</button>
              )}
            </div>
          </section>
        );
      })()}

      {phase.name === "saving" && <p className="text-lg">Saving your score…</p>}

      {phase.name === "done" && (
        <section>
          <p className="text-ink/70">@{phase.username}</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Score saved</h1>
          <p className="mt-4 font-display text-7xl font-extrabold text-cobalt">
            {phase.score}<span className="text-ink/40">/{phase.total}</span>
          </p>
          <p className="mt-2 text-lg">in {formatDuration(phase.durationMs)}</p>
          <p className="mt-6 max-w-[34rem]">Your next play unlocks on {fmtDate(phase.nextAllowedAt)}.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/leaderboard" className={btn}>See the leaderboard</Link>
            <button onClick={logout} className="underline underline-offset-4">Sign out</button>
          </div>
        </section>
      )}
    </div>
  );
}
