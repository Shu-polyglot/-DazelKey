# DazelKey web app

## Supabase setup

1. Create a Supabase project and open its SQL Editor.
2. Run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Providers**, enable **Anonymous** sign-ins.
4. In **Project Settings → API**, copy the Project URL and publishable key.
5. For local development, copy `.env.example` to `.env.local` and fill in both values.
6. For GitHub Pages, add repository Actions variables named
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The deploy workflow
   passes them to the Vite build.

Only the publishable key belongs in these values. Never expose a Supabase
`service_role` or secret key in this frontend.

The app keeps local storage as an offline cache, and when Supabase is configured
it synchronizes every existing app store to the signed-in user's private
`user_state` rows. This preserves existing users' data during rollout.

## Development

Built with React 19 + Vite, linted with Oxlint.

```sh
npm install
npm run dev      # start the dev server (see .env.local setup above)
npm run lint      # oxlint
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```
