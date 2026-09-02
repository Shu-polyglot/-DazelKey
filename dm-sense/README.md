# DM Sense

Your AI copilot for English DMs. Paste a message you received, and DM Sense
shows what it really means, the social vibe, any slang, and three
ready-to-send replies (Natural / Playful / Flirty) you can copy in one tap.

This is a standalone static MVP -- plain HTML/CSS/JS, no build step, no
backend, no auth. Open `index.html` directly or serve the folder:

```sh
npx serve dm-sense
```

## How it's organized

- `engine.js` -- pure analysis logic (`analyzeMessage(text)` in, a
  `{ meaning, vibe, slang, replies }` object out). No DOM access, no network
  calls. Kept separate on purpose: the eventual browser-extension version
  (a content script that finds the current DM on screen and shows DM Sense
  next to it) can reuse this file unchanged.
- `app.js` -- wires the engine's output into the two-panel UI: renders the
  simulated conversation on the left and the assistant's analysis + reply
  cards on the right, and handles the copy-to-clipboard interaction.
- `index.html` / `style.css` -- the two-column desktop layout that stacks
  (message input -> Analyze -> analysis -> replies) on mobile.

## What this MVP is not

No authentication, database, payments, social API integrations, browser
extension, automatic sending, or extra settings -- all deliberately out of
scope for now. The "AI" here is a small rule-based matcher over common DM
patterns plus a generic fallback, not a live model call.
