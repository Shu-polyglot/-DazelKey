# DazelKey

DazelKey is a "life archive" PWA for tracking life goals as buckets — plan
them, work them, and look back on what's done. It has friends, an explore
feed, achievements, and a year-progress calendar, backed by Supabase.

The live app is built and deployed from [`react-app/`](./react-app) via
[GitHub Pages](./.github/workflows/deploy.yml) on every push to `main`.
Start there for setup, environment variables, and Supabase configuration.

## Repository layout

- [`react-app/`](./react-app) -- the actual app (React + Vite, deployed to
  GitHub Pages). See [`react-app/README.md`](./react-app/README.md) for
  local development and Supabase setup.
- [`reels/`](./reels) -- a Playwright + ffmpeg pipeline that records the
  app's showcase flow into a vertical MP4 for Instagram Reels / TikTok.
  Lives outside `react-app/` on purpose: nothing here is part of the app or
  touches its source. See [`reels/README.md`](./reels/README.md).
- `index.html`, `style.css`, `script.js` -- an early static prototype,
  superseded by `react-app/` and not part of the deployed site. Kept for
  reference.
- [`dm-sense/`](./dm-sense) -- a standalone static MVP, unrelated to the
  life-archive app: "DM Sense", an AI copilot that reads an English DM's
  vibe and suggests replies. Plain HTML/CSS/JS, no build step. See
  [`dm-sense/README.md`](./dm-sense/README.md).

## Reel tooling quick start

The root [`package.json`](./package.json) only wires up the reel-recording
scripts (they need to run from the repo root):

```sh
npm install
npm run record-reel
npm run build-reel -- --input reels/raw/<run-id>.webm
```

See [`reels/README.md`](./reels/README.md) for the full workflow.
