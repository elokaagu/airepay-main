# Supabase — new project + migrations

## 1. Create a project

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and create a project.
2. Wait until the database is ready.
3. Copy from **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Put them in `.env` at the repo root (see `.env.example`), then restart `npm run dev`.

## 2. Auth redirects

In **Authentication → URL configuration**:

- **Site URL**: `http://localhost:3000` (and your production URL when deployed).
- **Redirect URLs**: add `http://localhost:3000/**` and your production callback URLs.

## Troubleshooting: `gen_random_bytes` does not exist

Bond invite tokens use `gen_random_bytes()` from **pgcrypto**. On Supabase, `pgcrypto` usually lives in the **`extensions`** schema, so the migration uses **`extensions.gen_random_bytes(...)`** in the column default (plain `gen_random_bytes` can fail even when the extension exists).

Enable **pgcrypto** under Database → Extensions if needed, then run `npm run supabase:push` again.

### Do not paste SQL into the terminal shell

Migration SQL belongs in `.sql` files (or the Supabase SQL editor), not typed directly into `zsh` — otherwise you get `command not found: create`.

## 3. Link CLI and push migrations

Install deps (`npm install`), then:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run supabase:push
```

`YOUR_PROJECT_REF` is the short id in the project URL (e.g. `https://YOUR_PROJECT_REF.supabase.co`).

`supabase link` writes `project_id` into `supabase/config.toml`.

## 4. Edge functions (optional)

If you use `supabase/functions/wishlist-verdict`, deploy separately:

```bash
npx supabase functions deploy wishlist-verdict
```

Set any secrets the function expects in the Supabase dashboard or via `supabase secrets`.

## Note on migration `20260417224718`

That migration auto-confirms **all** user emails. It is convenient for local dev but **unsafe for production**. For a production project, remove or replace that migration before going live, or run a one-off SQL to undo over-broad confirmations.
