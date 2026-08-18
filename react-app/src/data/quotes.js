/*
  Quote library for the Transition Ritual. Add or edit freely — each
  entry just needs `text`, `author`, and `source`. These are placeholder
  quotes for wiring up the ritual; the real curated set gets dropped in
  later.
*/

const quotes = [
  {
    text: 'A great programmer is not defined by lines of code, but by the ideas they refuse to leave unbuilt.',
    author: 'Paul Graham',
    source: 'Hackers & Painters',
  },
  {
    text: 'Desire is a contract you make with yourself to be unhappy until you get what you want.',
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant',
  },
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    source: 'Atomic Habits',
  },
  {
    text: 'To produce at your peak level, you need to work for extended periods with full concentration on a single task free from distraction.',
    author: 'Cal Newport',
    source: 'Deep Work',
  },
  {
    text: 'Every action you take is a vote for the type of person you wish to become.',
    author: 'James Clear',
    source: 'Atomic Habits',
  },
];

export function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default quotes;
