# Reels

Records DazelKey's "showcase" flow with Playwright and turns it into a
vertical (1080x1920) MP4 sized for Instagram Reels / TikTok, entirely
with local, free tooling. Lives outside `react-app/` on purpose -- nothing
here is part of the app itself, and nothing here touches its source.

## Prerequisites

- Node.js (whatever the rest of the repo already assumes)
- [ffmpeg](https://ffmpeg.org) on `PATH` (`ffmpeg -version` should work) --
  `brew install ffmpeg` on macOS, your package manager elsewhere
- Playwright's Chromium build: `npm install && npx playwright install chromium`
  (run once, from the repo root)

## Running it

```sh
# terminal 1 -- the app under test
npm --prefix react-app run dev

# terminal 2 -- record, then build
npm run record-reel
npm run build-reel -- --input reels/raw/<the-run-id-it-printed>.webm \
  --fast-ranges "<start>-<end>" \
  --captions-file reels/captions.example.txt
```

`record-reel` prints a scene-by-scene timeline (and writes it to
`reels/raw/<run-id>.manifest.json`) once it finishes -- use those numbers
to pick `--fast-ranges` for the slower stretch (scene 03, the wizard
being filled in) and to place captions. `build-reel` prints its own
warning if the final clip lands outside 15-25s so you can adjust before
moving on.

If `--input` is omitted, `build-reel.sh` uses the most recently modified
file in `reels/raw/`. Output goes to `reels/output/YYYY-MM-DD-<scene-name>.mp4`
and never overwrites -- a repeat run gets `-2`, `-3`, etc. appended.

## Adding or reordering a scene

Every scene in `scripts/record-reel.js` is a `{ name, run }` entry in the
`SCENES` array, each `run` a plain `async (page) => { ... }` function.
Add a new one, drop one, or reorder the array -- the recording loop
itself never needs to change. Keep the same shape other scenes use:
wait for the thing you just triggered to actually be on screen (a
`waitFor`, not a blind sleep) before advancing, then a short
`page.waitForTimeout()` to let its entrance animation settle before the
next action starts.

## Why there's no audio

Nothing in this pipeline reads, generates, or bundles a soundtrack --
`build-reel.sh` never touches an audio stream at all. Licensed music
added programmatically is a rights problem waiting to happen, and
Reels/TikTok's own algorithms both favor posts built with a trending
sound from their *native* audio library over an externally-muxed track
anyway. Add music by hand, in the platform's own editor, after uploading
the silent MP4 this pipeline produces.

## Fonts

`--captions-file`'s captions render with `drawtext`, pointed at a real
font *file*. The app's own `--font-family-display` (see
`react-app/src/styles/tokens.css`) is a system-font stack --
`Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman",
serif` -- with no `@font-face` and no bundled font file anywhere in the
repo (checked; there isn't one to reuse). `build-reel.sh` defaults to
macOS's own `Georgia.ttf` at
`/System/Library/Fonts/Supplemental/Georgia.ttf` -- the actual first
choice in that stack -- overridable with `--font <path>` or
`REEL_FONT_PATH` (e.g. for CI/Linux, where that path won't exist).

## What this deliberately doesn't do

- No posting, scheduling, or uploading to any platform, automated or
  otherwise -- every video sits in `reels/output/` until a person looks
  at it and decides to post it themselves.
- No paid API, SaaS, or licensed asset of any kind -- Playwright and
  ffmpeg are both local, free, and everything they need (the browser
  binary, the font file) already lives on your machine.
