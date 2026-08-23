// Records a vertical (9:16) walkthrough of Life OS's "showcase" flow --
// boot -> add a Bucket -> complete it -> Log Money -> Share card -- as a
// single .webm, using Playwright's built-in video capture. Nothing here
// touches the app's own source; it only drives a browser against a dev
// server that's already running.
//
// Usage:
//   npm --prefix react-app run dev        # in one terminal
//   npm run record-reel                   # in another (repo root)
//
// Output:
//   reels/raw/<run-id>.webm             -- the raw capture
//   reels/raw/<run-id>.manifest.json    -- per-scene start/end seconds,
//                                          for build-reel.sh's --fast-ranges
//                                          and caption timing
//
// See reels/README.md for the full pipeline (this script only records --
// scripts/build-reel.sh does the ffmpeg pass).

import { chromium, devices } from 'playwright';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(REPO_ROOT, 'reels', 'raw');

const BASE_URL = process.env.REEL_BASE_URL || 'http://localhost:5173/bucket-list-app/';

// The exact copy the wizard uses as its own placeholder (see
// BucketStepEditor's title-step placeholder) -- reusing it keeps the
// recording honest about what a real first-time entry looks like.
const BUCKET_TITLE = 'Watch the Northern Lights in Iceland';
const BUCKET_MESSAGE = "Don't forget how badly you wanted this.";

/*
  Pre-seeds localStorage before the app's first script runs (via
  page.addInitScript), so the recording:
  - skips the name/age/photo setup wizard (profile.completed) and the
    first-run onboarding tutorial added separately (lifeos-onboarding-
    complete-v1) -- neither belongs in a feature-showcase reel
  - already has one active Realize/Doing goal, since Log Money's button
    only renders once a goal exists (see StrategyPage) and setting one
    up via "+ Add a Goal" isn't one of the six scenes this reel covers
  This runs inside the page, so it must be a plain, self-contained
  function -- no closures over anything outside `seed`.
*/
function seedLocalStorage(seed) {
  try {
    localStorage.setItem('lifeos-profile-v1', JSON.stringify(seed.profile));
    localStorage.setItem('lifeos-onboarding-complete-v1', 'true');
    localStorage.setItem('life-os-buckets-v2', JSON.stringify(seed.buckets));
  } catch (error) {
    console.warn('[record-reel] seed script could not write localStorage:', error);
  }
}

const SEED = {
  profile: { name: 'Alex Rivera', age: 29, completed: true },
  buckets: [
    {
      id: 9001,
      title: 'Save for a trip to Japan',
      mode: 'solo',
      when: 'thisYear',
      place: 'Tokyo, Japan',
      message: '',
      status: 'planned',
      completedDate: null,
      image: null,
      goalType: 'have',
      doingEnabled: true,
      doingGoalAmount: 200000,
      doingUnitHistory: [],
      doingChecklist: [],
      doingCompletedAt: null,
      createdAt: '2026-01-01',
    },
  ],
};

async function pause(page, ms) {
  await page.waitForTimeout(ms);
}

// ---------------------------------------------------------------------
// Scenes -- each takes the page and drives it to the end of that beat.
// Kept as a plain array of { name, run } so adding/reordering/removing a
// scene never touches the orchestration loop below.
// ---------------------------------------------------------------------

async function sceneBoot(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enter', exact: true }).click();
  // Quote card's own prompt text exists (opacity 0) before its 600ms
  // reveal delay -- wait for it in the DOM, then hold past that delay
  // so the click in sceneHome always lands on an armed handler.
  await page.getByText('Press Enter to continue').waitFor({ state: 'visible' });
  await pause(page, 1200);
}

async function sceneHome(page) {
  await page.keyboard.press('Enter');
  await page.locator('.bottom-nav').waitFor({ state: 'visible' });
  // Dashboard entrance choreography (see styles/motion's dashboardEntrance)
  // finishes staggering in well under this.
  await pause(page, 1400);
}

async function sceneAddBucket(page) {
  await page.getByText('+ Add to The Bucket List').click();
  await page.locator('.step-editor-modal').waitFor({ state: 'visible' });
  await pause(page, 500);

  await page.locator('#step-title-input').fill(BUCKET_TITLE);
  await pause(page, 500);
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // "When" step -- first chip (This year), which auto-advances itself.
  await page.getByText('When do you want to make it happen?').waitFor({ state: 'visible' });
  await pause(page, 400);
  await page.locator('.step-editor-chip-row .step-editor-chip').first().click();

  // "Mode" step -- first chip (Solo), same auto-advance.
  await page.getByText('Who is this with?').waitFor({ state: 'visible' });
  await pause(page, 400);
  await page.locator('.step-editor-chip-row .step-editor-chip').first().click();

  // "Message" step.
  await page.getByText('A message to the you who achieves this').waitFor({ state: 'visible' });
  await pause(page, 400);
  await page.locator('#step-message-input').fill(BUCKET_MESSAGE);
  await pause(page, 700);

  await page.getByRole('button', { name: 'Add to The Bucket List', exact: true }).click();
  await page.locator('.step-editor-modal').waitFor({ state: 'detached' });
  await pause(page, 1000);
}

async function sceneCompleteAchievement(page) {
  // Scoped to #bucket-list-section, not just `.bucket-card` globally --
  // every tab-page stays mounted at once (see App.css's .tab-page), and
  // ProfilePage renders its own second BucketListPanel (under
  // #profile-bucket-list-section) for the same buckets, so an unscoped
  // query resolves to two elements per card and Playwright's strict
  // mode rejects the click.
  const card = page.locator('#bucket-list-section .bucket-card', { hasText: BUCKET_TITLE });
  await card.getByText('Open').click();
  await page.locator('.achieve-prompt').waitFor({ state: 'visible' });
  await pause(page, 500);

  const today = new Date().toISOString().slice(0, 10);
  await page.locator('.achieve-date-field input[type="date"]').fill(today);
  await pause(page, 400);

  await page.getByRole('button', { name: 'Complete', exact: true }).click();
  await page.getByText('Achievement unlocked').waitFor({ state: 'visible' });
  // The single most "showcase" beat of the whole app -- hold on it.
  await pause(page, 2000);

  await page.getByText('Tap to continue').click();
  await pause(page, 800);

  // Completing a Bucket never clears ExpandedBucketCard's own open state
  // (see its onComplete prop -- only onClose does), so it's still open
  // underneath CompleteScreen and, unclosed, its full-viewport portal
  // would intercept every later click regardless of which tab is active.
  await page.locator('.icon-button[aria-label="Close"]').click();
  await pause(page, 500);
}

async function sceneLogMoney(page) {
  await page.getByRole('button', { name: 'Momentum', exact: true }).click();
  await page.locator('.strategy-log-money-button').waitFor({ state: 'visible' });
  await pause(page, 900);

  await page.locator('.strategy-log-money-button').click();
  await page.locator('.add-goal-bucket-row').first().waitFor({ state: 'visible' });
  await pause(page, 400);

  // Picking the (only, seeded) goal auto-advances to the amount step.
  await page.locator('.add-goal-bucket-row').first().click();
  await page.locator('.doing-quick-amounts').waitFor({ state: 'visible' });
  await pause(page, 500);

  // The moment this scene exists to capture: tapping a quick-add chip.
  await page.locator('.doing-quick-amounts .step-editor-chip').first().click();
  await pause(page, 1200);

  await page.locator('.icon-button[aria-label="Cancel"]').click(); // closes without finishing the log
  await pause(page, 600);
}

async function sceneShareCard(page) {
  await page.getByRole('button', { name: 'The Achievement', exact: true }).click();
  await page.locator('.achievements-shelf').waitFor({ state: 'visible' });
  await pause(page, 1000);

  // Same reasoning as sceneCompleteAchievement's card locator -- scope to
  // #achievements-section (AchievementsShelf) so ProfilePage's own
  // AchievementGallery, mounted underneath the Profile tab, never gets
  // picked up as a second match.
  const card = page.locator('#achievements-section .achievement-card', { hasText: BUCKET_TITLE });
  await card.waitFor({ state: 'visible' });
  await card.click();
  await pause(page, 700);

  await page.getByRole('button', { name: '↗ Share', exact: true }).click();
  await page.locator('.share-card-title').waitFor({ state: 'visible' });
  // The final frame -- the recording stops while this is on screen, so
  // give it real, undisturbed time before the loop ends.
  await pause(page, 2500);
}

const SCENES = [
  { name: '01-boot', run: sceneBoot },
  { name: '02-home', run: sceneHome },
  { name: '03-add-bucket', run: sceneAddBucket },
  { name: '04-complete-achievement', run: sceneCompleteAchievement },
  { name: '05-log-money', run: sceneLogMoney },
  { name: '06-share-card', run: sceneShareCard },
];

// ---------------------------------------------------------------------

async function assertServerReachable(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`received HTTP ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Could not reach ${url} (${error.message}).\n` +
        `Start the dev server first: npm --prefix react-app run dev\n` +
        `(or point REEL_BASE_URL at wherever it's already running)`,
    );
  }
}

async function main() {
  await assertServerReachable(BASE_URL);
  await mkdir(RAW_DIR, { recursive: true });

  const runId = new Date().toISOString().replace(/[:.]/g, '-');

  const browser = await chromium.launch();
  const iphone = devices['iPhone 14'];
  const context = await browser.newContext({
    ...iphone,
    recordVideo: { dir: RAW_DIR, size: iphone.viewport },
  });
  const page = await context.newPage();
  await page.addInitScript(seedLocalStorage, SEED);

  const video = page.video();
  const recordingStart = performance.now();
  const manifest = [];

  try {
    for (const scene of SCENES) {
      const startSec = (performance.now() - recordingStart) / 1000;
      console.log(`[record-reel] -> ${scene.name} (starting at ~${startSec.toFixed(2)}s)`);
      await scene.run(page);
      const endSec = (performance.now() - recordingStart) / 1000;
      manifest.push({ name: scene.name, startSec: Number(startSec.toFixed(2)), endSec: Number(endSec.toFixed(2)) });
      console.log(`[record-reel]    done at ~${endSec.toFixed(2)}s (${(endSec - startSec).toFixed(2)}s)`);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const rawPath = await video.path();
  const finalVideoPath = path.join(RAW_DIR, `${runId}.webm`);
  await rename(rawPath, finalVideoPath);

  const manifestPath = path.join(RAW_DIR, `${runId}.manifest.json`);
  await writeFile(manifestPath, JSON.stringify({ runId, baseUrl: BASE_URL, scenes: manifest }, null, 2));

  console.log('\n[record-reel] scene timeline:');
  for (const scene of manifest) {
    console.log(`  ${scene.name.padEnd(24)} ${scene.startSec.toFixed(2)}s -> ${scene.endSec.toFixed(2)}s`);
  }
  console.log(`\n[record-reel] video:    ${path.relative(REPO_ROOT, finalVideoPath)}`);
  console.log(`[record-reel] manifest: ${path.relative(REPO_ROOT, manifestPath)}`);
  console.log('\nNext: npm run build-reel -- --input ' + path.relative(REPO_ROOT, finalVideoPath));
}

main().catch((error) => {
  console.error('[record-reel] failed:', error.message);
  process.exitCode = 1;
});
