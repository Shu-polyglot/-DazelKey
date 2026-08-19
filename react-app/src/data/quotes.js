/*
  Quote library for the Transition Ritual. Each entry needs `text`,
  `author`, and (optionally) `source`. Curated for tone: life, time,
  courage, focus, money/freedom, and living intentionally -- drawn
  primarily from the app's priority reading list, with a smaller set
  of well-established quotes on the same themes rounding things out.

  A few entries are clearly-labeled paraphrases (source ends with
  "(paraphrased)") rather than verbatim quotations, used where exact
  original wording couldn't be confidently verified. Add or edit
  freely, but keep that convention: don't put paraphrased wording in
  quotation marks without labeling it.
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

  // Master Your Time, Master Your Life -- Brian Tracy
  {
    text: 'Your highest paid, most important skill is your ability to think, before you act and while you are acting. It is your ability to choose what is more important and what is less important.',
    author: 'Brian Tracy',
    source: 'Master Your Time, Master Your Life',
  },
  {
    text: 'People with written goals and plans earn and accumulate, on average, ten times as much as other people with the same levels of intelligence and education.',
    author: 'Brian Tracy',
    source: 'Master Your Time, Master Your Life',
  },

  // Your Money or Your Life -- Vicki Robin & Joe Dominguez
  {
    text: 'Money is something we choose to trade our life energy for.',
    author: 'Vicki Robin',
    source: 'Your Money or Your Life',
  },
  {
    text: 'If you live for having it all, what you have is never enough.',
    author: 'Vicki Robin',
    source: 'Your Money or Your Life',
  },
  {
    text: 'Frugality is the user-friendly and earth-friendly lifestyle.',
    author: 'Vicki Robin',
    source: 'Your Money or Your Life',
  },

  // The Scout Mindset -- Julia Galef
  {
    text: "Accepting the possibility of failure in advance is liberating. It makes you bold, not timid. It's what gives you the courage to take the risks required to achieve something big.",
    author: 'Julia Galef',
    source: 'The Scout Mindset',
  },
  {
    text: 'Being in scout mindset means wanting your map — your perception of yourself and the world — to be as accurate as possible.',
    author: 'Julia Galef',
    source: 'The Scout Mindset',
  },
  {
    text: 'Discovering you were wrong is an update, not a failure, and your worldview is a living document meant to be revised.',
    author: 'Julia Galef',
    source: 'The Scout Mindset',
  },

  // Deep Work -- Cal Newport
  {
    text: 'Clarity about what matters provides clarity about what does not.',
    author: 'Cal Newport',
    source: 'Deep Work',
  },
  {
    text: 'The skillful management of attention is the sine qua non of the good life and the key to improving virtually every aspect of your experience.',
    author: 'Cal Newport',
    source: 'Deep Work',
  },

  // The Almanack of Naval Ravikant
  {
    text: 'Seek wealth, not money or status. Wealth is having assets that earn while you sleep.',
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant',
  },
  {
    text: 'The most important trick to being happy is to realize happiness is a skill you develop and a choice you make.',
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant',
  },
  {
    text: 'A calm mind, a fit body, and a house full of love. These things cannot be bought. They must be earned.',
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant',
  },
  {
    text: 'Play long-term games with long-term people.',
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant',
  },

  // The Brain That Changes Itself -- Norman Doidge
  {
    text: 'The brain is a far more open system than we ever imagined, and nature has gone very far to help us perceive and take in the world around us. It has given us a brain that survives in a changing world by changing itself.',
    author: 'Norman Doidge',
    source: 'The Brain That Changes Itself',
  },
  {
    text: 'Ironically, some of our most stubborn habits and disorders are products of our plasticity.',
    author: 'Norman Doidge',
    source: 'The Brain That Changes Itself',
  },

  // Livewired -- David Eagleman
  {
    text: "The greatest technology we have ever discovered on our planet is the three-pound organ carried in the vault of the skull. The magic of the brain is not found in the parts it's made of but in the way those parts unceasingly reweave themselves in an electric, living fabric.",
    author: 'David Eagleman',
    source: 'Livewired',
  },
  {
    text: 'Dropping into the world with a half-baked brain has proven a winning strategy for humans.',
    author: 'David Eagleman',
    source: 'Livewired',
  },

  // The Mind and the Brain -- Jeffrey Schwartz & Sharon Begley
  {
    text: "The mind can direct the brain's own rewiring — through deliberate, focused attention, we take part in sculpting the very circuits we think with.",
    author: 'Jeffrey Schwartz & Sharon Begley',
    source: 'The Mind and the Brain (paraphrased)',
  },

  // The Compound Effect -- Darren Hardy
  {
    text: 'Small, smart choices + consistency + time = radical difference.',
    author: 'Darren Hardy',
    source: 'The Compound Effect',
  },
  {
    text: 'You will never change your life until you change something you do daily. The secret of your success is found in your daily routine.',
    author: 'Darren Hardy',
    source: 'The Compound Effect',
  },

  // Do It Today -- Darius Foroux
  {
    text: 'Say no to a million things and yes to a few things that matter.',
    author: 'Darius Foroux',
    source: 'Do It Today',
  },
  {
    text: 'Your life stops when learning stops.',
    author: 'Darius Foroux',
    source: 'Do It Today',
  },

  // Die With Zero -- Bill Perkins
  {
    text: 'In the end, the business of life is the acquisition of memories.',
    author: 'Bill Perkins',
    source: 'Die With Zero',
  },
  {
    text: "Your biggest fear ought to be wasting your life and time, not 'Am I going to have X number of dollars when I'm 80?'",
    author: 'Bill Perkins',
    source: 'Die With Zero',
  },

  // Focus on What Matters -- Darius Foroux
  {
    text: 'Instead of beating yourself up and being your own antagonist, be your own comedian.',
    author: 'Darius Foroux',
    source: 'Focus on What Matters',
  },
  {
    text: 'We must concern ourselves absolutely with the things that are under our control and entrust the things not in our control to the universe.',
    author: 'Darius Foroux',
    source: 'Focus on What Matters',
  },

  // The Power of Your Subconscious Mind -- Joseph Murphy
  {
    text: 'Change your thoughts, and you change your destiny.',
    author: 'Joseph Murphy',
    source: 'The Power of Your Subconscious Mind',
  },
  {
    text: 'Within your subconscious mind you will find the solution for every problem, and the cause for every effect.',
    author: 'Joseph Murphy',
    source: 'The Power of Your Subconscious Mind',
  },

  // Manifest Your True Essence -- Estelle Bingham
  {
    text: 'Healing begins the moment you stop performing a life and start living from your true essence.',
    author: 'Estelle Bingham',
    source: 'Manifest Your True Essence (paraphrased)',
  },

  // Broader life / time / courage / dreams collection
  {
    text: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    source: 'On the Shortness of Life',
  },
  {
    text: 'I learned this, at least, by my experiment: that if one advances confidently in the direction of his dreams, and endeavors to live the life which he has imagined, he will meet with a success unexpected in common hours.',
    author: 'Henry David Thoreau',
    source: 'Walden',
  },
  {
    text: 'You must do the thing you think you cannot do.',
    author: 'Eleanor Roosevelt',
    source: 'You Learn by Living',
  },
  {
    text: 'Tell me, what is it you plan to do with your one wild and precious life?',
    author: 'Mary Oliver',
    source: '"The Summer Day"',
  },
  {
    text: "Life shrinks or expands in proportion to one's courage.",
    author: 'Anaïs Nin',
  },
  {
    text: 'Life is either a daring adventure or nothing at all.',
    author: 'Helen Keller',
  },
  {
    text: 'How we spend our days is, of course, how we spend our lives.',
    author: 'Annie Dillard',
    source: 'The Writing Life',
  },
  {
    text: 'Either you run the day, or the day runs you.',
    author: 'Jim Rohn',
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: 'Steve Jobs',
    source: '2005 Stanford commencement address',
  },
  {
    text: 'As for the future, your task is not to foresee it, but to enable it.',
    author: 'Antoine de Saint-Exupéry',
    source: 'Wind, Sand and Stars',
  },
  {
    text: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
  },
  {
    text: "You can't use up creativity. The more you use, the more you have.",
    author: 'Maya Angelou',
  },
  {
    text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.",
    author: 'H. Jackson Brown Jr.',
    source: 'P.S. I Love You',
  },
  {
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
    source: 'The Story of Philosophy',
  },
  {
    text: 'When we are no longer able to change a situation, we are challenged to change ourselves.',
    author: 'Viktor Frankl',
    source: "Man's Search for Meaning",
  },
];

export function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default quotes;
