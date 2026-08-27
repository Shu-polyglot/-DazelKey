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

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
