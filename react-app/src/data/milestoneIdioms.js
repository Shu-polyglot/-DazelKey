/*
  Strategy's milestone ritual pool -- short English idioms for "you grew,
  your life moved forward," deliberately not game language (no XP, no
  level, no title). Same spirit and file placement as quotes.js, just its
  own smaller set since these are shown far more often and shouldn't wear
  out as fast as a book quote would.
*/

const milestoneIdioms = [
  'One step closer.',
  'The story moves forward.',
  'Closer than yesterday.',
  'This is what growth looks like.',
  'A page turned.',
  'Further than you were.',
  'The life you are building.',
];

export function getRandomMilestoneIdiom() {
  return milestoneIdioms[Math.floor(Math.random() * milestoneIdioms.length)];
}

export default milestoneIdioms;
