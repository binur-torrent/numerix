# Numerix

Mock tests for university preparation.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Until Supabase is connected, sign-in stays on this browser:

- `admin@numerix.app` and any password of 6+ characters opens the admin page
- any other email is a student

Edits made in admin are stored in `.data/store.json`.

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
3. In the Supabase SQL editor, run `supabase/schema.sql`.
4. Create an account in the app, then make it an admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Optional: set `ADMIN_EMAILS` and `SUPABASE_SERVICE_ROLE_KEY` so that email is promoted on sign-in. Keep the service role key on the server only.

## Deploy

Import the repo in Vercel and add the same environment variables. The app is a Next.js project, so no extra build settings are required.
