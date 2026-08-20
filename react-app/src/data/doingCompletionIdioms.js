/*
  Strategy's biggest ritual -- a Doing goal's own money target actually
  reached, not just a milestone along the way. Kept separate from
  milestoneIdioms.js so the two pools can be tuned independently; this
  one is meant to feel rarer and more final.
*/

const doingCompletionIdioms = [
  "It's real now.",
  'You did it.',
  'Another chapter closed.',
  'The dream, delivered.',
  'You made it happen.',
];

export function getRandomCompletionIdiom() {
  return doingCompletionIdioms[Math.floor(Math.random() * doingCompletionIdioms.length)];
}

export default doingCompletionIdioms;
