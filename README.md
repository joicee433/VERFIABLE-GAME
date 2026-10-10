# Verified Weekly Challenge

Next.js 16 + Tailwind 4 + Sign in with Discord (OAuth2) + Supabase. Free to run and free to play. No wallet, no browser extension.

Flow: landing page, one-click Discord sign-in, play one 5-question quiz, score and play time saved in Supabase, public leaderboard.
Rule: a verified username can play again only 7 days after its last score was saved. Earlier attempts are blocked and
show the exact next allowed date. No localStorage, no passwords.

## How trust works

1. Discord confirms who the player is (scope `identify` only: no email, no servers). The server exchanges the code for a token, reads the public profile, then discards the token.
2. We store only the lowercase Discord username and Discord's numeric account id.
3. The session is a signed httpOnly cookie (2 hours). The browser never supplies a username.
4. Scores are graded on the server. Play duration is measured on the server from a signed attempt token.
5. The 7-day rule is enforced in Postgres (`submit_score`, with an advisory lock) so concurrent requests cannot bypass it.
6. All database access is server-side with the service-role key. Tables have RLS on and no public grants.

## Deploy (all free tiers)

### A. Supabase
1. supabase.com > New project.
2. SQL Editor > New query. Paste all of `supabase/schema.sql`. Run. Expect "Success. No rows returned".
3. Project Settings > API Keys (older dashboards: API). Copy Project URL -> `SUPABASE_URL`, and the service_role (or secret) key -> `SUPABASE_SERVICE_ROLE_KEY`. Server only.

### B. Vercel (first deploy, to get your URL)
1. Push this folder to a GitHub repo.
2. vercel.com > Add New > Project > import the repo. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` (`openssl rand -base64 48`). Deploy and note your URL, for example `https://your-app.vercel.app`.

### C. Discord application
1. discord.com/developers/applications > New Application.
2. OAuth2 page: copy the Client ID, then Reset Secret and copy the Client Secret (shown once).
3. OAuth2 > Redirects > Add Redirect: `https://YOUR-DOMAIN/api/auth/discord/callback` (must match exactly, then Save Changes).
4. In Vercel add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`, then Redeploy.

You can add several redirects, so add `http://localhost:3000/api/auth/discord/callback` too for local testing.

## Local run
`cp .env.example .env.local`, fill it in, `npm install`, `npm run dev`.

## Test the 7-day rule
After one play, press "Start the quiz" again: you get the block screen with the next allowed date.
To reset a test user: `delete from scores where username = 'someone';` in the Supabase SQL Editor.
