# Numerix

Mock tests for university preparation.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign-in and registration use Supabase. Copy `.env.example` to `.env.local` and set the project URL and the publishable key before creating an account.

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the publishable key (`sb_publishable_…`).
3. In Authentication → URL Configuration, set Site URL to `https://numerix-umber.vercel.app` and add `https://numerix-umber.vercel.app/**` under Redirect URLs. Leave `http://localhost:3000` only if you still sign in locally.
4. In the Supabase SQL editor, run `supabase/schema.sql`.
5. Create an account in the app, then make it an admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Optional: set `ADMIN_EMAILS` and `SUPABASE_SERVICE_ROLE_KEY` so that email is promoted on sign-in. Keep the service role key on the server only.

## Deploy

Import the repo in Vercel and add the same environment variables. The app is a Next.js project, so no extra build settings are required.
