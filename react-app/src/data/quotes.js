/*
  Quote library for the Transition Ritual. Each entry needs `text`,
  `author`, and (optionally) `source`. Curated for tone: life, time,
  courage, focus, money/freedom, and living intentionally -- drawn
  primarily from the app's priority reading list, with a broader set
  of well-established quotes from the same genre (self-improvement,
  stoicism, money psychology, habit/behavior science, and classic
  philosophy) rounding things out.

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
  {
    text: 'Habits are the compound interest of self-improvement.',
    author: 'James Clear',
    source: 'Atomic Habits',
  },
  {
    text: 'Environment is the invisible hand that shapes human behavior. You do not have to be the victim of it -- you can also be the architect of it.',
    author: 'James Clear',
    source: 'Atomic Habits (paraphrased)',
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
  {
    text: 'Time management is really life management, personal management -- the management of yourself rather than of time or circumstances.',
    author: 'Brian Tracy',
    source: 'Master Your Time, Master Your Life (paraphrased)',
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
  {
    text: 'Enough is a fearless place to live.',
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
  {
    text: "The scout doesn't try to win. Instead, she tries to see what's really there, as honestly and accurately as she can, even if it's not pretty or convenient.",
    author: 'Julia Galef',
    source: 'The Scout Mindset (paraphrased)',
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
  {
    text: 'Human beings, it seems, are at their best when immersed deeply in something challenging.',
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
  {
    text: "You're not going to get rich renting out your time. You must own equity — a piece of a business — to gain your financial freedom.",
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant (paraphrased)',
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
  {
    text: 'Neurons that fire together wire together -- every repeated thought or action carves the very circuit that makes repeating it easier next time.',
    author: 'Norman Doidge',
    source: 'The Brain That Changes Itself (paraphrased)',
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
  {
    text: 'Your daily habits and routines, more than any single decision, are what quietly compound into either your greatest achievements or your undoing.',
    author: 'Darren Hardy',
    source: 'The Compound Effect (paraphrased)',
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
  {
    text: 'The whole point of having money is to enjoy it as much as you can while you still can, before you die.',
    author: 'Bill Perkins',
    source: 'Die With Zero (paraphrased)',
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

  // Essentialism -- Greg McKeown
  {
    text: "If you don't prioritize your life, someone else will.",
    author: 'Greg McKeown',
    source: 'Essentialism',
  },
  {
    text: 'The pursuit of less allows us to regain control of our own choices, so we can channel our time and energy into making the highest possible contribution.',
    author: 'Greg McKeown',
    source: 'Essentialism (paraphrased)',
  },

  // The Psychology of Money -- Morgan Housel
  {
    text: 'Spending money to show people how much money you have is the fastest way to have less money.',
    author: 'Morgan Housel',
    source: 'The Psychology of Money',
  },
  {
    text: "Wealth is what you don't see.",
    author: 'Morgan Housel',
    source: 'The Psychology of Money',
  },
  {
    text: 'Doing well with money has a little to do with how smart you are and a lot to do with how you behave.',
    author: 'Morgan Housel',
    source: 'The Psychology of Money',
  },

  // Rich Dad Poor Dad -- Robert Kiyosaki
  {
    text: "It's not how much money you make, but how much money you keep.",
    author: 'Robert Kiyosaki',
    source: 'Rich Dad Poor Dad',
  },

  // Think and Grow Rich -- Napoleon Hill
  {
    text: 'Whatever the mind can conceive and believe, it can achieve.',
    author: 'Napoleon Hill',
    source: 'Think and Grow Rich',
  },

  // The 7 Habits of Highly Effective People -- Stephen Covey
  {
    text: 'Begin with the end in mind.',
    author: 'Stephen Covey',
    source: 'The 7 Habits of Highly Effective People',
  },
  {
    text: 'The main thing is to keep the main thing the main thing.',
    author: 'Stephen Covey',
    source: 'The 7 Habits of Highly Effective People (paraphrased)',
  },

  // Grit -- Angela Duckworth
  {
    text: 'Enthusiasm is common. Endurance is rare.',
    author: 'Angela Duckworth',
    source: 'Grit',
  },
  {
    text: 'Our potential is one thing. What we do with it is quite another.',
    author: 'Angela Duckworth',
    source: 'Grit',
  },

  // Mindset -- Carol Dweck
  {
    text: 'Becoming is better than being.',
    author: 'Carol Dweck',
    source: 'Mindset',
  },

  // The Power of Habit -- Charles Duhigg
  {
    text: 'New habits are created by putting together a cue, a routine, and a reward, and then cultivating a craving that drives the loop.',
    author: 'Charles Duhigg',
    source: 'The Power of Habit (paraphrased)',
  },

  // Mastery -- Robert Greene
  {
    text: 'Everyone who has achieved mastery has a proclivity for their subject that has bordered on the obsessive.',
    author: 'Robert Greene',
    source: 'Mastery (paraphrased)',
  },

  // The Obstacle Is the Way -- Ryan Holiday
  {
    text: 'The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity to improve our condition.',
    author: 'Ryan Holiday',
    source: 'The Obstacle Is the Way',
  },

  // Ego Is the Enemy -- Ryan Holiday
  {
    text: 'The only relationship between work and success is through mastery.',
    author: 'Ryan Holiday',
    source: 'Ego Is the Enemy (paraphrased)',
  },

  // Start With Why -- Simon Sinek
  {
    text: "People don't buy what you do; they buy why you do it.",
    author: 'Simon Sinek',
    source: 'Start With Why',
  },

  // Daring Greatly -- Brené Brown
  {
    text: 'Vulnerability is not winning or losing; it is having the courage to show up and be seen when we have no control over the outcome.',
    author: 'Brené Brown',
    source: 'Daring Greatly',
  },

  // The Power of Now -- Eckhart Tolle
  {
    text: 'Realize deeply that the present moment is all you ever have.',
    author: 'Eckhart Tolle',
    source: 'The Power of Now',
  },

  // How to Win Friends and Influence People -- Dale Carnegie
  {
    text: 'You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you.',
    author: 'Dale Carnegie',
    source: 'How to Win Friends and Influence People (paraphrased)',
  },

  // Good to Great -- Jim Collins
  {
    text: 'Good is the enemy of great.',
    author: 'Jim Collins',
    source: 'Good to Great',
  },

  // Outliers -- Malcolm Gladwell
  {
    text: 'Success is not a random act. It arises out of a steady accumulation of advantages.',
    author: 'Malcolm Gladwell',
    source: 'Outliers (paraphrased)',
  },

  // The Alchemist -- Paulo Coelho
  {
    text: 'And, when you want something, all the universe conspires in helping you to achieve it.',
    author: 'Paulo Coelho',
    source: 'The Alchemist',
  },
  {
    text: "It's the possibility of having a dream come true that makes life interesting.",
    author: 'Paulo Coelho',
    source: 'The Alchemist',
  },

  // The War of Art -- Steven Pressfield
  {
    text: 'Resistance is experienced as fear; the degree of fear equates to the strength of Resistance.',
    author: 'Steven Pressfield',
    source: 'The War of Art (paraphrased)',
  },

  // Can't Hurt Me -- David Goggins
  {
    text: 'We are our own worst enemy, and once we conquer ourselves, life becomes so much easier.',
    author: 'David Goggins',
    source: "Can't Hurt Me (paraphrased)",
  },

  // The Untethered Soul -- Michael Singer
  {
    text: 'The only way to find total peace is to release the part of you that never has and never will be at peace.',
    author: 'Michael Singer',
    source: 'The Untethered Soul (paraphrased)',
  },

  // When Breath Becomes Air -- Paul Kalanithi
  {
    text: "You can't ever reach perfection, but you can believe in an asymptote toward which you are ceaselessly striving.",
    author: 'Paul Kalanithi',
    source: 'When Breath Becomes Air (paraphrased)',
  },

  // Zero to One -- Peter Thiel
  {
    text: 'The most contrarian thing of all is not to oppose the crowd but to think for yourself.',
    author: 'Peter Thiel',
    source: 'Zero to One',
  },
  {
    text: 'Every moment in business happens only once. The next Bill Gates will not build an operating system. The next Larry Page will not make a search engine.',
    author: 'Peter Thiel',
    source: 'Zero to One',
  },

  // Digital Minimalism -- Cal Newport
  {
    text: 'A deep life requires regular time carved out to sit alone with your thoughts.',
    author: 'Cal Newport',
    source: 'Digital Minimalism (paraphrased)',
  },
  {
    text: 'Solitude, in the sense that I define it in this book, is a subjective state in which your mind is free from input from other minds.',
    author: 'Cal Newport',
    source: 'Digital Minimalism (paraphrased)',
  },

  // Miracle Morning -- Hal Elrod
  {
    text: 'How you wake up each day and your morning routine dramatically affects your levels of success in every single area of your life.',
    author: 'Hal Elrod',
    source: 'The Miracle Morning (paraphrased)',
  },
  {
    text: 'The moment you take responsibility for everything in your life is the moment you can change anything in your life.',
    author: 'Hal Elrod',
    source: 'The Miracle Morning',
  },
  {
    text: 'Where you are is a result of who you were, but where you go depends entirely on who you choose to be from this moment on.',
    author: 'Hal Elrod',
    source: 'The Miracle Morning',
  },

  // Extreme Ownership -- Jocko Willink & Leif Babin
  {
    text: 'There are no bad teams, only bad leaders.',
    author: 'Jocko Willink & Leif Babin',
    source: 'Extreme Ownership',
  },
  {
    text: 'Discipline equals freedom.',
    author: 'Jocko Willink',
    source: 'Extreme Ownership',
  },
  {
    text: "It's not what you preach, it's what you tolerate.",
    author: 'Jocko Willink & Leif Babin',
    source: 'Extreme Ownership (paraphrased)',
  },

  // Make Your Bed -- Admiral William H. McRaven
  {
    text: 'If you make your bed every morning you will have accomplished the first task of the day. It will give you a small sense of pride, and it will encourage you to do another task, and another.',
    author: 'William H. McRaven',
    source: 'Make Your Bed',
  },
  {
    text: "If you want to change the world, start off by making your bed.",
    author: 'William H. McRaven',
    source: 'Make Your Bed',
  },
  {
    text: 'Life is a struggle and the potential for failure is ever present, but those who live in fear of failure, or hardship, or embarrassment will never achieve their potential.',
    author: 'William H. McRaven',
    source: 'Make Your Bed (paraphrased)',
  },

  // 12 Rules for Life -- Jordan Peterson
  {
    text: 'Compare yourself to who you were yesterday, not to who someone else is today.',
    author: 'Jordan Peterson',
    source: '12 Rules for Life',
  },
  {
    text: 'Stand up straight with your shoulders back.',
    author: 'Jordan Peterson',
    source: '12 Rules for Life',
  },
  {
    text: 'Pursue what is meaningful, not what is expedient.',
    author: 'Jordan Peterson',
    source: '12 Rules for Life',
  },
  {
    text: 'To straighten out your life, you must proceed on the assumption that the changes you make now are worthwhile, and will benefit you across the entirety of your life.',
    author: 'Jordan Peterson',
    source: '12 Rules for Life (paraphrased)',
  },

  // Getting Things Done -- David Allen
  {
    text: 'Your mind is for having ideas, not holding them.',
    author: 'David Allen',
    source: 'Getting Things Done',
  },
  {
    text: 'You can do anything, but not everything.',
    author: 'David Allen',
    source: 'Getting Things Done',
  },

  // The 4-Hour Workweek -- Tim Ferriss
  {
    text: 'A person who is good at creating pressure or fear in others is only good against those who allow themselves to feel pressure or fear.',
    author: 'Tim Ferriss',
    source: 'The 4-Hour Workweek',
  },
  {
    text: 'What we fear doing most is usually what we most need to do.',
    author: 'Tim Ferriss',
    source: 'The 4-Hour Workweek',
  },
  {
    text: 'Focus on being productive instead of busy.',
    author: 'Tim Ferriss',
    source: 'The 4-Hour Workweek',
  },

  // I Will Teach You to Be Rich -- Ramit Sethi
  {
    text: 'A rich life means using your money to fuel your unique interests and passions, whatever they are.',
    author: 'Ramit Sethi',
    source: 'I Will Teach You to Be Rich (paraphrased)',
  },
  {
    text: "It's not about being cheap, it's about spending extravagantly on the things you love, as long as you cut costs mercilessly on the things you don't.",
    author: 'Ramit Sethi',
    source: 'I Will Teach You to Be Rich (paraphrased)',
  },

  // The Simple Path to Wealth -- JL Collins
  {
    text: 'Spend less than you earn, invest the surplus, avoid debt.',
    author: 'JL Collins',
    source: 'The Simple Path to Wealth (paraphrased)',
  },
  {
    text: 'Complexity is the enemy of execution.',
    author: 'JL Collins',
    source: 'The Simple Path to Wealth',
  },

  // The Millionaire Next Door -- Thomas J. Stanley & William D. Danko
  {
    text: 'Wealth is not the same as income. If you make a good income each year and spend it all, you are not getting wealthier. You are just living high.',
    author: 'Thomas J. Stanley',
    source: 'The Millionaire Next Door (paraphrased)',
  },
  {
    text: 'Being frugal is the cornerstone of wealth-building.',
    author: 'Thomas J. Stanley',
    source: 'The Millionaire Next Door',
  },

  // The Richest Man in Babylon -- George S. Clason
  {
    text: 'A part of all you earn is yours to keep.',
    author: 'George S. Clason',
    source: 'The Richest Man in Babylon',
  },
  {
    text: 'Gold cometh gladly and in increasing quantity to any man who will put by not less than one-tenth of his earnings.',
    author: 'George S. Clason',
    source: 'The Richest Man in Babylon',
  },
  {
    text: 'Opportunity is a haughty goddess who wastes no time with those who are unprepared.',
    author: 'George S. Clason',
    source: 'The Richest Man in Babylon',
  },

  // The Total Money Makeover -- Dave Ramsey
  {
    text: 'You must gain control over your money or the lack of it will forever control you.',
    author: 'Dave Ramsey',
    source: 'The Total Money Makeover',
  },
  {
    text: 'We buy things we don\'t need with money we don\'t have to impress people we don\'t like.',
    author: 'Dave Ramsey',
    source: 'The Total Money Makeover (paraphrased)',
  },

  // The Millionaire Fastlane -- MJ DeMarco
  {
    text: 'Wealth is not a number; it is a lifestyle few understand and even fewer achieve.',
    author: 'MJ DeMarco',
    source: 'The Millionaire Fastlane (paraphrased)',
  },
  {
    text: "If you're serious about wealth, you'll need to alter your position from a road of a hundred lanes filled with millions of people to a road with two lanes, occupied by only a few.",
    author: 'MJ DeMarco',
    source: 'The Millionaire Fastlane (paraphrased)',
  },

  // Principles -- Ray Dalio
  {
    text: 'Pain plus reflection equals progress.',
    author: 'Ray Dalio',
    source: 'Principles',
  },
  {
    text: 'He who lives by the crystal ball will eat shattered glass.',
    author: 'Ray Dalio',
    source: 'Principles',
  },
  {
    text: 'Truth -- or, more precisely, an accurate understanding of reality -- is the essential foundation for any good outcome.',
    author: 'Ray Dalio',
    source: 'Principles',
  },

  // The Most Important Thing -- Howard Marks
  {
    text: "Being too far ahead of your time is indistinguishable from being wrong.",
    author: 'Howard Marks',
    source: 'The Most Important Thing',
  },
  {
    text: 'Experience is what you got when you didn\'t get what you wanted.',
    author: 'Howard Marks',
    source: 'The Most Important Thing (paraphrased)',
  },

  // The Intelligent Investor -- Benjamin Graham
  {
    text: 'The investor\'s chief problem -- and even his worst enemy -- is likely to be himself.',
    author: 'Benjamin Graham',
    source: 'The Intelligent Investor',
  },
  {
    text: 'In the short run, the market is a voting machine, but in the long run it is a weighing machine.',
    author: 'Benjamin Graham',
    source: 'The Intelligent Investor',
  },

  // Antifragile -- Nassim Nicholas Taleb
  {
    text: 'Wind extinguishes a candle and energizes fire. You want to be the fire and wish for the wind.',
    author: 'Nassim Nicholas Taleb',
    source: 'Antifragile',
  },
  {
    text: 'The best way to verify that you are alive is by checking if you like variations.',
    author: 'Nassim Nicholas Taleb',
    source: 'Antifragile',
  },
  {
    text: 'Some things benefit from shocks; they thrive and grow when exposed to volatility, randomness, disorder, and stressors.',
    author: 'Nassim Nicholas Taleb',
    source: 'Antifragile',
  },

  // The Black Swan -- Nassim Nicholas Taleb
  {
    text: "Absence of evidence is not evidence of absence.",
    author: 'Nassim Nicholas Taleb',
    source: 'The Black Swan',
  },
  {
    text: 'The strategy for the discoverers and entrepreneurs is to rely less on top-down planning and focus on maximum tinkering and recognizing opportunities when they arise.',
    author: 'Nassim Nicholas Taleb',
    source: 'The Black Swan (paraphrased)',
  },

  // Skin in the Game -- Nassim Nicholas Taleb
  {
    text: 'Don\'t tell me what you think, tell me what you have in your portfolio.',
    author: 'Nassim Nicholas Taleb',
    source: 'Skin in the Game',
  },
  {
    text: "You will never fully convince someone that he is wrong; only reality can.",
    author: 'Nassim Nicholas Taleb',
    source: 'Skin in the Game',
  },

  // Thinking, Fast and Slow -- Daniel Kahneman
  {
    text: 'Nothing in life is as important as you think it is while you are thinking about it.',
    author: 'Daniel Kahneman',
    source: 'Thinking, Fast and Slow',
  },
  {
    text: 'A reliable way to make people believe in falsehoods is frequent repetition, because familiarity is not easily distinguished from truth.',
    author: 'Daniel Kahneman',
    source: 'Thinking, Fast and Slow',
  },

  // Predictably Irrational -- Dan Ariely
  {
    text: 'We are pawns in a game whose forces we largely fail to comprehend.',
    author: 'Dan Ariely',
    source: 'Predictably Irrational',
  },
  {
    text: 'The elimination of an option can increase the desire to have it.',
    author: 'Dan Ariely',
    source: 'Predictably Irrational (paraphrased)',
  },

  // Influence -- Robert Cialdini
  {
    text: 'A well-known principle of human behavior says that when we ask someone to do us a favor we will be more successful if we provide a reason.',
    author: 'Robert Cialdini',
    source: 'Influence',
  },
  {
    text: 'We are more likely to be persuaded by people we like.',
    author: 'Robert Cialdini',
    source: 'Influence (paraphrased)',
  },

  // Switch -- Chip Heath & Dan Heath
  {
    text: 'What looks like resistance is often a lack of clarity.',
    author: 'Chip Heath & Dan Heath',
    source: 'Switch',
  },
  {
    text: 'Change is easier when you know where you\'re going and why it\'s worth it.',
    author: 'Chip Heath & Dan Heath',
    source: 'Switch (paraphrased)',
  },

  // Give and Take -- Adam Grant
  {
    text: "Success comes down to how we approach our interactions with other people.",
    author: 'Adam Grant',
    source: 'Give and Take (paraphrased)',
  },
  {
    text: 'The most meaningful way to succeed is to help other people succeed.',
    author: 'Adam Grant',
    source: 'Give and Take (paraphrased)',
  },

  // Originals -- Adam Grant
  {
    text: "Originality is the pursuit of the great unknown, and it can only exist if you're willing to be wrong along the way.",
    author: 'Adam Grant',
    source: 'Originals (paraphrased)',
  },
  {
    text: 'The people who are most likely to change the world are the ones who feel most comfortable being different.',
    author: 'Adam Grant',
    source: 'Originals (paraphrased)',
  },

  // Quiet -- Susan Cain
  {
    text: 'There\'s zero correlation between being the best talker and having the best ideas.',
    author: 'Susan Cain',
    source: 'Quiet',
  },
  {
    text: 'The secret to life is to put yourself in the right lighting.',
    author: 'Susan Cain',
    source: 'Quiet',
  },

  // Drive -- Daniel Pink
  {
    text: 'The secret to high performance and satisfaction is the deeply human need to direct our own lives, to learn and create new things, and to do better by ourselves and our world.',
    author: 'Daniel Pink',
    source: 'Drive',
  },
  {
    text: 'Autonomy, mastery, and purpose are the building blocks of a new way of doing things.',
    author: 'Daniel Pink',
    source: 'Drive (paraphrased)',
  },

  // When -- Daniel Pink
  {
    text: 'Timing is everything, but we don\'t know much about timing itself.',
    author: 'Daniel Pink',
    source: 'When (paraphrased)',
  },
  {
    text: 'Beginnings, midpoints, and endings all influence how we behave.',
    author: 'Daniel Pink',
    source: 'When (paraphrased)',
  },

  // Blink -- Malcolm Gladwell
  {
    text: 'We live in a world that assumes that the quality of a decision is directly related to the time and effort that went into making it.',
    author: 'Malcolm Gladwell',
    source: 'Blink',
  },
  {
    text: 'Truly successful decision making relies on a balance between deliberate and instinctive thinking.',
    author: 'Malcolm Gladwell',
    source: 'Blink (paraphrased)',
  },

  // David and Goliath -- Malcolm Gladwell
  {
    text: 'Giants are not as strong as they seem, and sometimes the shepherd boy has a sling in his pocket.',
    author: 'Malcolm Gladwell',
    source: 'David and Goliath (paraphrased)',
  },
  {
    text: 'What is advantageous can also be disadvantageous, and, more surprisingly, some of the things that are the most beautiful and appealing have within them the seeds of great weakness.',
    author: 'Malcolm Gladwell',
    source: 'David and Goliath',
  },

  // Linchpin -- Seth Godin
  {
    text: 'The only way to get what you\'re worth is to stand out, to exert emotional labor, to be seen as indispensable, and to produce interactions that organizations, and people, need.',
    author: 'Seth Godin',
    source: 'Linchpin (paraphrased)',
  },
  {
    text: 'Art is a personal gift that changes the recipient. The medium doesn\'t matter. The intent does.',
    author: 'Seth Godin',
    source: 'Linchpin',
  },

  // The Dip -- Seth Godin
  {
    text: 'If you\'re not able to be the best in the world at that particular niche market, you don\'t stop, you don\'t quit. Instead, you change markets, focus on a new niche.',
    author: 'Seth Godin',
    source: 'The Dip (paraphrased)',
  },
  {
    text: 'Winners quit fast, quit often, and quit without guilt -- until they commit to beating the right Dip for the right reasons.',
    author: 'Seth Godin',
    source: 'The Dip',
  },

  // Anything You Want -- Derek Sivers
  {
    text: 'If more information was the answer, then we\'d all be billionaires with perfect abs.',
    author: 'Derek Sivers',
    source: 'Anything You Want',
  },
  {
    text: 'What\'s your unusual thing? You need to know what makes you different in order to know what makes you great.',
    author: 'Derek Sivers',
    source: 'Anything You Want (paraphrased)',
  },

  // The Happiness of Pursuit -- Chris Guillebeau
  {
    text: 'A quest gives you a reason to get up in the morning that has nothing to do with how you make a living.',
    author: 'Chris Guillebeau',
    source: 'The Happiness of Pursuit',
  },
  {
    text: 'The pursuit of a big goal or dream is not just about the destination -- it\'s about the journey and who you become along the way.',
    author: 'Chris Guillebeau',
    source: 'The Happiness of Pursuit (paraphrased)',
  },

  // The $100 Startup -- Chris Guillebeau
  {
    text: 'If you\'re good at something and you enjoy it, there\'s almost always a way to connect it to helping other people.',
    author: 'Chris Guillebeau',
    source: 'The $100 Startup',
  },
  {
    text: 'You don\'t need an MBA, a business plan, or even employees. You need a product or service that springs from what you love to do, combined with a monetization strategy.',
    author: 'Chris Guillebeau',
    source: 'The $100 Startup (paraphrased)',
  },

  // Crush It! -- Gary Vaynerchuk
  {
    text: "Legacy is greater than currency.",
    author: 'Gary Vaynerchuk',
    source: 'Crush It!',
  },
  {
    text: 'Nobody wants to work but everybody wants money, and the only way you can get it is to actually put in the sweat.',
    author: 'Gary Vaynerchuk',
    source: 'Crush It! (paraphrased)',
  },

  // Lean In -- Sheryl Sandberg
  {
    text: 'What would you do if you weren\'t afraid?',
    author: 'Sheryl Sandberg',
    source: 'Lean In',
  },
  {
    text: 'Done is better than perfect.',
    author: 'Sheryl Sandberg',
    source: 'Lean In',
  },

  // Thrive -- Arianna Huffington
  {
    text: 'We need to accept that we won\'t always make the right decisions, that we\'ll screw up royally sometimes -- understanding that failure is not the opposite of success, it\'s part of success.',
    author: 'Arianna Huffington',
    source: 'Thrive',
  },
  {
    text: 'By living our lives from the inside out, we can navigate our world successfully.',
    author: 'Arianna Huffington',
    source: 'Thrive (paraphrased)',
  },

  // The Four Agreements -- Don Miguel Ruiz
  {
    text: 'Be impeccable with your word.',
    author: 'Don Miguel Ruiz',
    source: 'The Four Agreements',
  },
  {
    text: 'Don\'t take anything personally.',
    author: 'Don Miguel Ruiz',
    source: 'The Four Agreements',
  },
  {
    text: 'Don\'t make assumptions.',
    author: 'Don Miguel Ruiz',
    source: 'The Four Agreements',
  },
  {
    text: 'Always do your best.',
    author: 'Don Miguel Ruiz',
    source: 'The Four Agreements',
  },

  // A New Earth -- Eckhart Tolle
  {
    text: 'Some changes look negative on the surface but you will soon realize that space is being created in your life for something new to emerge.',
    author: 'Eckhart Tolle',
    source: 'A New Earth',
  },
  {
    text: 'Awareness is the greatest agent for change.',
    author: 'Eckhart Tolle',
    source: 'A New Earth',
  },

  // Peace Is Every Step -- Thich Nhat Hanh
  {
    text: 'The present moment is the only moment available to us, and it is the door to all moments.',
    author: 'Thich Nhat Hanh',
    source: 'Peace Is Every Step',
  },
  {
    text: 'Walk as if you are kissing the Earth with your feet.',
    author: 'Thich Nhat Hanh',
    source: 'Peace Is Every Step',
  },
  {
    text: 'Smile, breathe, and go slowly.',
    author: 'Thich Nhat Hanh',
    source: 'Peace Is Every Step',
  },

  // When Things Fall Apart -- Pema Chödrön
  {
    text: 'Nothing ever goes away until it has taught us what we need to know.',
    author: 'Pema Chödrön',
    source: 'When Things Fall Apart',
  },
  {
    text: 'The most difficult times for many of us are the ones we give ourselves.',
    author: 'Pema Chödrön',
    source: 'When Things Fall Apart',
  },
  {
    text: 'You are the sky. Everything else is just the weather.',
    author: 'Pema Chödrön',
    source: 'When Things Fall Apart (paraphrased)',
  },

  // Wherever You Go, There You Are -- Jon Kabat-Zinn
  {
    text: 'You can\'t stop the waves, but you can learn to surf.',
    author: 'Jon Kabat-Zinn',
    source: 'Wherever You Go, There You Are',
  },
  {
    text: 'The little things? The little moments? They aren\'t little.',
    author: 'Jon Kabat-Zinn',
    source: 'Wherever You Go, There You Are',
  },

  // Be Here Now -- Ram Dass
  {
    text: 'Be here now.',
    author: 'Ram Dass',
    source: 'Be Here Now',
  },
  {
    text: 'The quieter you become, the more you are able to hear.',
    author: 'Ram Dass',
    source: 'Be Here Now (paraphrased)',
  },

  // The Seven Spiritual Laws of Success -- Deepak Chopra
  {
    text: 'In the midst of movement and chaos, keep stillness inside of you.',
    author: 'Deepak Chopra',
    source: 'The Seven Spiritual Laws of Success',
  },
  {
    text: 'Every time you spend money, you\'re casting a vote for the kind of world you want.',
    author: 'Deepak Chopra',
    source: 'The Seven Spiritual Laws of Success (paraphrased)',
  },

  // The Power of Intention -- Wayne Dyer
  {
    text: 'You cannot always control what goes on outside. But you can always control what goes on inside.',
    author: 'Wayne Dyer',
    source: 'The Power of Intention',
  },
  {
    text: 'When you change the way you look at things, the things you look at change.',
    author: 'Wayne Dyer',
    source: 'The Power of Intention',
  },

  // You Can Heal Your Life -- Louise Hay
  {
    text: 'The point of power is always in the present moment.',
    author: 'Louise Hay',
    source: 'You Can Heal Your Life',
  },
  {
    text: 'Every thought we think is creating our future.',
    author: 'Louise Hay',
    source: 'You Can Heal Your Life',
  },

  // Loving What Is -- Byron Katie
  {
    text: 'I am a lover of what is, not because I am a spiritual person, but because it hurts when I argue with reality.',
    author: 'Byron Katie',
    source: 'Loving What Is',
  },
  {
    text: 'Whose business are you in? There are only three kinds of business in the universe: mine, yours, and God\'s.',
    author: 'Byron Katie',
    source: 'Loving What Is',
  },

  // A Return to Love -- Marianne Williamson
  {
    text: 'Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure.',
    author: 'Marianne Williamson',
    source: 'A Return to Love',
  },
  {
    text: 'As we let our own light shine, we unconsciously give other people permission to do the same.',
    author: 'Marianne Williamson',
    source: 'A Return to Love',
  },

  // The Art of Happiness -- Dalai Lama
  {
    text: 'Happiness is not something ready made. It comes from your own actions.',
    author: 'Dalai Lama',
    source: 'The Art of Happiness',
  },
  {
    text: 'Remember that not getting what you want is sometimes a wonderful stroke of luck.',
    author: 'Dalai Lama',
    source: 'The Art of Happiness',
  },

  // The Dhammapada -- Buddha
  {
    text: 'What we think, we become.',
    author: 'Buddha',
    source: 'The Dhammapada',
  },
  {
    text: 'The mind is everything. What you think you become.',
    author: 'Buddha',
    source: 'The Dhammapada',
  },
  {
    text: 'Peace comes from within. Do not seek it without.',
    author: 'Buddha',
    source: 'The Dhammapada (paraphrased)',
  },

  // The Art of War -- Sun Tzu
  {
    text: 'The supreme art of war is to subdue the enemy without fighting.',
    author: 'Sun Tzu',
    source: 'The Art of War',
  },
  {
    text: 'In the midst of chaos, there is also opportunity.',
    author: 'Sun Tzu',
    source: 'The Art of War',
  },
  {
    text: 'Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.',
    author: 'Sun Tzu',
    source: 'The Art of War',
  },

  // The Book of Five Rings -- Miyamoto Musashi
  {
    text: 'Today is victory over yourself of yesterday; tomorrow is your victory over lesser men.',
    author: 'Miyamoto Musashi',
    source: 'The Book of Five Rings',
  },
  {
    text: 'You must understand that there is more than one path to the top of the mountain.',
    author: 'Miyamoto Musashi',
    source: 'The Book of Five Rings (paraphrased)',
  },

  // Bhagavad Gita
  {
    text: 'You have the right to work, but never to the fruit of work.',
    author: 'The Bhagavad Gita',
  },
  {
    text: 'Set thy heart upon thy work, but never on its reward.',
    author: 'The Bhagavad Gita',
  },

  // The Prophet -- Kahlil Gibran
  {
    text: 'Your children are not your children. They are the sons and daughters of Life\'s longing for itself.',
    author: 'Kahlil Gibran',
    source: 'The Prophet',
  },
  {
    text: 'Work is love made visible.',
    author: 'Kahlil Gibran',
    source: 'The Prophet',
  },
  {
    text: 'Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.',
    author: 'Kahlil Gibran',
    source: 'The Prophet',
  },

  // Letters to a Young Poet -- Rainer Maria Rilke
  {
    text: 'Be patient toward all that is unsolved in your heart and try to love the questions themselves.',
    author: 'Rainer Maria Rilke',
    source: 'Letters to a Young Poet',
  },
  {
    text: 'Let everything happen to you: beauty and terror. Just keep going. No feeling is final.',
    author: 'Rainer Maria Rilke',
    source: 'Letters to a Young Poet',
  },

  // The Myth of Sisyphus -- Albert Camus
  {
    text: 'One must imagine Sisyphus happy.',
    author: 'Albert Camus',
    source: 'The Myth of Sisyphus',
  },
  {
    text: 'In the midst of winter, I found there was, within me, an invincible summer.',
    author: 'Albert Camus',
  },

  // Thus Spoke Zarathustra -- Friedrich Nietzsche
  {
    text: 'He who has a why to live can bear almost any how.',
    author: 'Friedrich Nietzsche',
    source: 'Twilight of the Idols (paraphrased)',
  },
  {
    text: 'You must have chaos within you to give birth to a dancing star.',
    author: 'Friedrich Nietzsche',
    source: 'Thus Spoke Zarathustra',
  },

  // Man's Search for Meaning -- Viktor Frankl
  {
    text: 'When we are no longer able to change a situation, we are challenged to change ourselves. Everything can be taken from a man but one thing: the last of the human freedoms -- to choose one\'s attitude in any given set of circumstances.',
    author: 'Viktor Frankl',
    source: "Man's Search for Meaning",
  },

  // Mamba Mentality -- Kobe Bryant
  {
    text: 'The most important thing is to try and inspire people so that they can be great in whatever they want to do.',
    author: 'Kobe Bryant',
    source: 'Mamba Mentality',
  },
  {
    text: 'I don\'t want to be the next Michael Jordan, I only want to be Kobe Bryant.',
    author: 'Kobe Bryant',
    source: 'Mamba Mentality',
  },

  // Relentless -- Tim Grover
  {
    text: 'Being relentless means demanding more of yourself than anyone else could ever demand of you, knowing that every time you stop, you can still do more.',
    author: 'Tim Grover',
    source: 'Relentless',
  },
  {
    text: 'Cleaners don\'t need to be motivated. They are self-generating.',
    author: 'Tim Grover',
    source: 'Relentless (paraphrased)',
  },

  // The Champion's Mind -- Jim Afremow
  {
    text: 'Champions never permit themselves to lose focus on what they can control -- their own effort and attitude.',
    author: 'Jim Afremow',
    source: "The Champion's Mind (paraphrased)",
  },
  {
    text: 'To be the best, you must be able to handle the worst.',
    author: 'Jim Afremow',
    source: "The Champion's Mind (paraphrased)",
  },

  // Never Finished -- David Goggins
  {
    text: 'You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.',
    author: 'David Goggins',
    source: 'Never Finished (paraphrased)',
  },
  {
    text: 'The most important conversations you\'ll ever have are the ones you\'ll have with yourself.',
    author: 'David Goggins',
    source: 'Never Finished',
  },

  // More Atomic Habits -- James Clear
  {
    text: 'Every habit is useful for solving a particular type of problem. The greater the number of tools you have at your disposal, the greater your odds of being able to solve any problem that comes your way.',
    author: 'James Clear',
    source: 'Atomic Habits (paraphrased)',
  },
  {
    text: 'What you do repeatedly, essentially, forms the person you are.',
    author: 'James Clear',
    source: 'Atomic Habits (paraphrased)',
  },

  // More The Compound Effect -- Darren Hardy
  {
    text: 'Successful people just have habits that are different from unsuccessful people.',
    author: 'Darren Hardy',
    source: 'The Compound Effect',
  },
  {
    text: 'The big magic in life is often found in the small decisions.',
    author: 'Darren Hardy',
    source: 'The Compound Effect (paraphrased)',
  },

  // More Grit -- Angela Duckworth
  {
    text: 'Effort counts twice: once to build a skill, and again to make the skill productive.',
    author: 'Angela Duckworth',
    source: 'Grit (paraphrased)',
  },

  // More Mindset -- Carol Dweck
  {
    text: "In the fixed mindset, everything is about the outcome. If you fail -- or if you're not the best -- it's all been wasted.",
    author: 'Carol Dweck',
    source: 'Mindset (paraphrased)',
  },
  {
    text: 'No matter what your ability is, effort is what ignites that ability and turns it into accomplishment.',
    author: 'Carol Dweck',
    source: 'Mindset',
  },

  // More The Power of Habit -- Charles Duhigg
  {
    text: 'Change might not be fast and it isn\'t always easy. But with time and effort, almost any habit can be reshaped.',
    author: 'Charles Duhigg',
    source: 'The Power of Habit',
  },

  // More Naval Ravikant
  {
    text: 'Learn to sell, learn to build. If you can do both, you will be unstoppable.',
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant',
  },
  {
    text: 'Escape competition through authenticity.',
    author: 'Naval Ravikant',
    source: 'The Almanack of Naval Ravikant',
  },

  // More Essentialism -- Greg McKeown
  {
    text: 'Only once you give yourself permission to stop trying to do it all, to stop saying yes to everyone, can you make your highest contribution towards the things that really matter.',
    author: 'Greg McKeown',
    source: 'Essentialism',
  },

  // More The Psychology of Money -- Morgan Housel
  {
    text: "The highest form of wealth is the ability to wake up every morning and say, 'I can do whatever I want today.'",
    author: 'Morgan Housel',
    source: 'The Psychology of Money',
  },

  // Same as Ever -- Morgan Housel
  {
    text: 'The stories we tell ourselves are the most powerful force in the world.',
    author: 'Morgan Housel',
    source: 'Same as Ever (paraphrased)',
  },
  {
    text: 'Compounding only works if you can give an asset years and years to grow. It\'s like planting an oak tree -- one year of patience doesn\'t show much progress.',
    author: 'Morgan Housel',
    source: 'Same as Ever (paraphrased)',
  },

  // More Rich Dad Poor Dad -- Robert Kiyosaki
  {
    text: 'The rich buy assets. The poor only have expenses. The middle class buys liabilities they think are assets.',
    author: 'Robert Kiyosaki',
    source: 'Rich Dad Poor Dad (paraphrased)',
  },
  {
    text: 'Winners are not afraid of losing. But losers are. Failure is part of the process of success.',
    author: 'Robert Kiyosaki',
    source: 'Rich Dad Poor Dad',
  },

  // More Think and Grow Rich -- Napoleon Hill
  {
    text: 'Do not wait; the time will never be "just right." Start where you stand, and work with whatever tools you may have at your command.',
    author: 'Napoleon Hill',
    source: 'Think and Grow Rich',
  },
  {
    text: 'Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.',
    author: 'Napoleon Hill',
    source: 'Think and Grow Rich',
  },

  // More The 7 Habits -- Stephen Covey
  {
    text: 'I am not a product of my circumstances. I am a product of my decisions.',
    author: 'Stephen Covey',
    source: 'The 7 Habits of Highly Effective People',
  },

  // Broader life / time / courage / dreams collection
  {
    text: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    source: 'On the Shortness of Life',
  },
  {
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    source: 'Letters from a Stoic (paraphrased)',
  },
  {
    text: 'Sometimes even to live is an act of courage.',
    author: 'Seneca',
    source: 'Letters from a Stoic',
  },
  {
    text: "No man is free who is not master of himself.",
    author: 'Epictetus',
    source: 'Discourses (paraphrased)',
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: 'Epictetus',
    source: 'Enchiridion (paraphrased)',
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
    text: 'Waste no more time arguing about what a good man should be. Be one.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
  },
  {
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
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
  {
    text: "Those who have a 'why' to live, can bear with almost any 'how'.",
    author: 'Viktor Frankl',
    source: "Man's Search for Meaning",
  },
  {
    text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
    author: 'Ralph Waldo Emerson',
  },
  {
    text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.',
    author: 'Ralph Waldo Emerson',
  },
  {
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
  },
  {
    text: 'The journey of a thousand miles begins with one step.',
    author: 'Lao Tzu',
    source: 'Tao Te Ching',
  },
  {
    text: 'That which does not kill us makes us stronger.',
    author: 'Friedrich Nietzsche',
    source: 'Twilight of the Idols',
  },
  {
    text: 'Knowing yourself is the beginning of all wisdom.',
    author: 'Aristotle',
  },
  {
    text: 'Lost time is never found again.',
    author: 'Benjamin Franklin',
    source: "Poor Richard's Almanack",
  },
  {
    text: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin',
    source: "Poor Richard's Almanack",
  },
  {
    text: 'It is not the critic who counts... The credit belongs to the man who is actually in the arena, who strives valiantly, who errs and comes short again and again, because there is no effort without error and shortcoming.',
    author: 'Theodore Roosevelt',
    source: '"Citizenship in a Republic" speech, 1910',
  },
  {
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
  },
  {
    text: 'It always seems impossible until it is done.',
    author: 'Nelson Mandela',
  },
  {
    text: 'You are never too old to set another goal or to dream a new dream.',
    author: 'C. S. Lewis',
  },
  {
    text: 'Not all those who wander are lost.',
    author: 'J. R. R. Tolkien',
    source: 'The Fellowship of the Ring',
  },
  {
    text: 'The wound is the place where the light enters you.',
    author: 'Rumi',
    source: '(paraphrased)',
  },
  {
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: 'Rumi',
    source: '(paraphrased)',
  },
  {
    text: 'Set your life on fire. Seek those who fan your flames.',
    author: 'Rumi',
  },

  // Civil rights / historical courage
  {
    text: "Whatever you can do, or dream you can, begin it. Boldness has genius, power, and magic in it.",
    author: 'Johann Wolfgang von Goethe',
  },
  {
    text: 'The best way to find yourself is to lose yourself in the service of others.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Be the change that you wish to see in the world.',
    author: 'Mahatma Gandhi',
    source: '(paraphrased)',
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: 'Mahatma Gandhi',
    source: '(paraphrased)',
  },
  {
    text: "Faith is taking the first step even when you don't see the whole staircase.",
    author: 'Martin Luther King Jr.',
    source: '(paraphrased)',
  },
  {
    text: "The time is always right to do what is right.",
    author: 'Martin Luther King Jr.',
  },
  {
    text: "Darkness cannot drive out darkness; only light can do that.",
    author: 'Martin Luther King Jr.',
    source: 'Strength to Love',
  },
  {
    text: "I don't think much of a man who is not wiser today than he was yesterday.",
    author: 'Abraham Lincoln',
  },
  {
    text: "Whatever you are, be a good one.",
    author: 'Abraham Lincoln',
  },
  {
    text: "The best thing about the future is that it comes only one day at a time.",
    author: 'Abraham Lincoln',
  },
  {
    text: "Once you learn to read, you will be forever free.",
    author: 'Frederick Douglass',
  },
  {
    text: "In spite of everything, I still believe that people are really good at heart.",
    author: 'Anne Frank',
    source: 'The Diary of a Young Girl',
  },
  {
    text: "Adventure is worthwhile in itself.",
    author: 'Amelia Earhart',
  },
  {
    text: "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: 'Amelia Earhart',
  },

  // Sports / mental toughness
  {
    text: "I've failed over and over and over again in my life and that is why I succeed.",
    author: 'Michael Jordan',
  },
  {
    text: "Champions keep playing until they get it right.",
    author: 'Billie Jean King',
    source: '(paraphrased)',
  },
  {
    text: "It ain't about how hard you hit. It's about how hard you can get hit and keep moving forward.",
    author: 'Rocky Balboa',
    source: 'Rocky Balboa (1976 film, paraphrased)',
  },
  {
    text: "Service to others is the rent you pay for your room here on earth.",
    author: 'Muhammad Ali',
  },
  {
    text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'",
    author: 'Muhammad Ali',
  },
  {
    text: "The impossible is just an opinion.",
    author: 'Muhammad Ali',
  },
  {
    text: "Great works are performed not by strength but by perseverance.",
    author: 'Samuel Johnson',
  },
  {
    text: "The only way to prove that you're a good sport is to lose.",
    author: 'Ernie Banks',
  },

  // Business icons
  {
    text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: 'Steve Jobs',
    source: '2005 Stanford commencement address',
  },
  {
    text: "Stay hungry, stay foolish.",
    author: 'Steve Jobs',
    source: '2005 Stanford commencement address',
  },
  {
    text: "If today were the last day of my life, would I want to do what I am about to do today?",
    author: 'Steve Jobs',
    source: '2005 Stanford commencement address (paraphrased)',
  },
  {
    text: "If you're not stubborn, you'll give up on experiments too soon.",
    author: 'Jeff Bezos',
  },
  {
    text: "What's dangerous is to not evolve.",
    author: 'Jeff Bezos',
  },
  {
    text: "Life is too short to hang out with people who aren't resourceful.",
    author: 'Jeff Bezos',
  },
  {
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    author: 'Elon Musk',
  },
  {
    text: "I think it is possible for ordinary people to choose to be extraordinary.",
    author: 'Elon Musk',
  },
  {
    text: "The stock market is a device for transferring money from the impatient to the patient.",
    author: 'Warren Buffett',
  },
  {
    text: "Someone is sitting in the shade today because someone planted a tree a long time ago.",
    author: 'Warren Buffett',
  },
  {
    text: "Risk comes from not knowing what you're doing.",
    author: 'Warren Buffett',
  },
  {
    text: "The big money is not in the buying and selling, but in the waiting.",
    author: 'Charlie Munger',
  },
  {
    text: "Spend each day trying to be a little wiser than you were when you woke up.",
    author: 'Charlie Munger',
  },
  {
    text: "The way to get worthwhile human trust is not by trying to acquire trustworthy-sounding credentials. It's by trying to deserve trust.",
    author: 'Charlie Munger',
  },
  {
    text: "Whether you think you can or you think you can't, you're right.",
    author: 'Henry Ford',
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: 'Thomas Edison',
  },
  {
    text: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: 'Thomas Edison',
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: 'Walt Disney',
  },
  {
    text: "All our dreams can come true, if we have the courage to pursue them.",
    author: 'Walt Disney',
  },
  {
    text: "You don't learn to walk by following rules. You learn by doing, and by falling over.",
    author: 'Richard Branson',
  },
  {
    text: "Business opportunities are like buses, there's always another one coming.",
    author: 'Richard Branson',
  },
  {
    text: "Your most unhappy customers are your greatest source of learning.",
    author: 'Bill Gates',
  },
  {
    text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.",
    author: 'Bill Gates',
  },
  {
    text: "It's fine to celebrate success, but it is more important to heed the lessons of failure.",
    author: 'Bill Gates',
  },

  // Poets and writers
  {
    text: "Two roads diverged in a wood, and I—I took the one less traveled by, and that has made all the difference.",
    author: 'Robert Frost',
    source: '"The Road Not Taken"',
  },
  {
    text: "In three words I can sum up everything I've learned about life: it goes on.",
    author: 'Robert Frost',
  },
  {
    text: "O me! O life!... The powerful play goes on, and you may contribute a verse.",
    author: 'Walt Whitman',
    source: '"O Me! O Life!"',
  },
  {
    text: "Keep your face always toward the sunshine, and shadows will fall behind you.",
    author: 'Walt Whitman',
  },
  {
    text: "I dwell in possibility.",
    author: 'Emily Dickinson',
  },
  {
    text: "That it will never come again is what makes life so sweet.",
    author: 'Emily Dickinson',
  },
  {
    text: "If you can fill the unforgiving minute with sixty seconds' worth of distance run, yours is the Earth and everything that's in it.",
    author: 'Rudyard Kipling',
    source: '"If—"',
  },
  {
    text: "If you can dream it, and not make dreams your master; if you can think it, and not make thoughts your aim.",
    author: 'Rudyard Kipling',
    source: '"If—"',
  },
  {
    text: "'Tis not too late to seek a newer world.",
    author: 'Alfred, Lord Tennyson',
    source: '"Ulysses"',
  },
  {
    text: "To strive, to seek, to find, and not to yield.",
    author: 'Alfred, Lord Tennyson',
    source: '"Ulysses"',
  },
  {
    text: "I am the master of my fate, I am the captain of my soul.",
    author: 'William Ernest Henley',
    source: '"Invictus"',
  },
  {
    text: "Out of the night that covers me, black as the pit from pole to pole, I thank whatever gods may be for my unconquerable soul.",
    author: 'William Ernest Henley',
    source: '"Invictus"',
  },
  {
    text: "Do not go gentle into that good night. Rage, rage against the dying of the light.",
    author: 'Dylan Thomas',
    source: '"Do Not Go Gentle Into That Good Night"',
  },
  {
    text: "We know what we are, but know not what we may be.",
    author: 'William Shakespeare',
    source: 'Hamlet',
  },
  {
    text: "This above all: to thine own self be true.",
    author: 'William Shakespeare',
    source: 'Hamlet',
  },
  {
    text: "We are such stuff as dreams are made on, and our little life is rounded with a sleep.",
    author: 'William Shakespeare',
    source: 'The Tempest',
  },

  // Philosophy: Socrates, Plato, Kierkegaard, Pascal
  {
    text: "The unexamined life is not worth living.",
    author: 'Socrates',
  },
  {
    text: "I cannot teach anybody anything. I can only make them think.",
    author: 'Socrates',
  },
  {
    text: "The beginning of wisdom is the definition of terms.",
    author: 'Socrates',
  },
  {
    text: "The measure of a man is what he does with power.",
    author: 'Plato',
  },
  {
    text: "Be kind, for everyone you meet is fighting a hard battle.",
    author: 'Plato',
    source: '(paraphrased)',
  },
  {
    text: "Life can only be understood backwards; but it must be lived forwards.",
    author: 'Søren Kierkegaard',
  },
  {
    text: "Anxiety is the dizziness of freedom.",
    author: 'Søren Kierkegaard',
    source: 'The Concept of Anxiety (paraphrased)',
  },
  {
    text: "The heart has its reasons which reason knows nothing of.",
    author: 'Blaise Pascal',
    source: 'Pensées',
  },
  {
    text: "All of humanity's problems stem from man's inability to sit quietly in a room alone.",
    author: 'Blaise Pascal',
    source: 'Pensées',
  },

  // Self-development speakers
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: 'Zig Ziglar',
  },
  {
    text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.",
    author: 'Zig Ziglar',
  },
  {
    text: "You were born to win, but to be a winner, you must plan to win, prepare to win, and expect to win.",
    author: 'Zig Ziglar',
  },
  {
    text: "If you don't design your own life plan, chances are you'll fall into someone else's plan. And guess what they have planned for you? Not much.",
    author: 'Jim Rohn',
  },
  {
    text: "We must all suffer from one of two pains: the pain of discipline or the pain of regret.",
    author: 'Jim Rohn',
  },
  {
    text: "Your life does not get better by chance, it gets better by change.",
    author: 'Jim Rohn',
  },
  {
    text: "Everything we do is infused with the energy with which we do it.",
    author: 'Marianne Williamson',
    source: 'A Return to Love (paraphrased)',
  },
  {
    text: "Whatever the mind dwells upon, that it becomes.",
    author: 'Earl Nightingale',
  },
  {
    text: "We become what we think about.",
    author: 'Earl Nightingale',
    source: 'The Strangest Secret',
  },
  {
    text: "Setting goals is the first step in turning the invisible into the visible.",
    author: 'Tony Robbins',
  },
  {
    text: "It's not the events of our lives that shape us, but our beliefs as to what those events mean.",
    author: 'Tony Robbins',
  },
  {
    text: "The path to success is to take massive, determined action.",
    author: 'Tony Robbins',
  },
  {
    text: "Change happens in a moment when you finally decide.",
    author: 'Brendon Burchard',
    source: 'The Motivation Manifesto (paraphrased)',
  },
  {
    text: "People who lack self-discipline will always find excuses.",
    author: 'John C. Maxwell',
  },
  {
    text: "A leader is one who knows the way, goes the way, and shows the way.",
    author: 'John C. Maxwell',
  },
  {
    text: "You don't have to see the whole staircase, just take the first step.",
    author: 'Les Brown',
    source: '(paraphrased)',
  },
  {
    text: "Too many of us are not living our dreams because we are living our fears.",
    author: 'Les Brown',
  },
  {
    text: "There are no traffic jams along the extra mile.",
    author: 'Roger Staubach',
  },
  {
    text: "Expect the best, plan for the worst, and prepare to be surprised.",
    author: 'Denis Waitley',
  },

  // Assorted well-established life / courage / creativity
  {
    text: "The two most important days in your life are the day you are born and the day you find out why.",
    author: 'Mark Twain',
  },
  {
    text: "Twenty years from now, you will be more disappointed by the things you didn't do than by the ones you did do.",
    author: 'Mark Twain',
    source: '(paraphrased)',
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: 'Mark Twain',
  },
  {
    text: "To live is the rarest thing in the world. Most people exist, that is all.",
    author: 'Oscar Wilde',
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: 'Oscar Wilde',
  },
  {
    text: "Life isn't about finding yourself. Life is about creating yourself.",
    author: 'George Bernard Shaw',
    source: '(paraphrased)',
  },
  {
    text: "A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.",
    author: 'George Bernard Shaw',
  },
  {
    text: "Try not to become a person of success, but rather try to become a person of value.",
    author: 'Albert Einstein',
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: 'Albert Einstein',
  },
  {
    text: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    author: 'Albert Einstein',
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: 'Aristotle Onassis',
    source: '(paraphrased)',
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: 'Leonardo da Vinci',
    source: '(paraphrased)',
  },
  {
    text: "Learning never exhausts the mind.",
    author: 'Leonardo da Vinci',
  },
  {
    text: "I would rather die of passion than of boredom.",
    author: 'Vincent van Gogh',
  },
  {
    text: "Great things are done by a series of small things brought together.",
    author: 'Vincent van Gogh',
  },
  {
    text: "Everything you can imagine is real.",
    author: 'Pablo Picasso',
  },
  {
    text: "It is not the mountain we conquer but ourselves.",
    author: 'Edmund Hillary',
    source: '(paraphrased)',
  },
  {
    text: "Nothing in life is to be feared, it is only to be understood.",
    author: 'Marie Curie',
  },
  {
    text: "Nothing happens until something moves.",
    author: 'Albert Einstein',
  },
  {
    text: "Freedom is nothing but a chance to be better.",
    author: 'Albert Camus',
  },
  {
    text: "I have learned over the years that when one's mind is made up, this diminishes fear.",
    author: 'Rosa Parks',
  },
  {
    text: "To bring about change, you must not be afraid to take the first step. We will fail when we fail to try.",
    author: 'Rosa Parks',
  },
  {
    text: "Nothing is impossible, the word itself says 'I'm possible'.",
    author: 'Audrey Hepburn',
  },
  {
    text: "The most beautiful people we have known are those who have known defeat, known suffering, and have found their way out of the depths.",
    author: 'Elisabeth Kübler-Ross',
    source: '(paraphrased)',
  },
  {
    text: "Courage is not the absence of fear, but rather the judgement that something else is more important than fear.",
    author: 'Ambrose Redmoon',
  },
  {
    text: "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
    author: 'Maya Angelou',
  },
  {
    text: "If you don't like something, change it. If you can't change it, change your attitude.",
    author: 'Maya Angelou',
  },
  {
    text: "There is no greater agony than bearing an untold story inside you.",
    author: 'Maya Angelou',
    source: 'I Know Why the Caged Bird Sings',
  },
  {
    text: "The unknown is disturbing, hence people prefer to end the tension by giving a definite answer, whatever it may be.",
    author: 'Erich Fromm',
    source: '(paraphrased)',
  },
  {
    text: "Love is the only sane and satisfactory answer to the problem of human existence.",
    author: 'Erich Fromm',
    source: 'The Art of Loving',
  },
  {
    text: "The great growling engine of change -- technology.",
    author: 'Alvin Toffler',
    source: 'Future Shock',
  },
  {
    text: "The illiterate of the 21st century will not be those who cannot read and write, but those who cannot learn, unlearn, and relearn.",
    author: 'Alvin Toffler',
    source: 'Future Shock',
  },

  // More money / wealth
  {
    text: "The size of your success is measured by the size of your desire; the size of your dream; and how you handle disappointment along the way.",
    author: 'Robert Kiyosaki',
    source: 'Rich Dad Poor Dad (paraphrased)',
  },
  {
    text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.",
    author: 'Dave Ramsey',
  },
  {
    text: "Rich people believe 'I create my life.' Poor people believe 'Life happens to me.'",
    author: 'T. Harv Eker',
    source: 'Secrets of the Millionaire Mind (paraphrased)',
  },
  {
    text: "How you do anything is how you do everything.",
    author: 'T. Harv Eker',
    source: 'Secrets of the Millionaire Mind',
  },
  {
    text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
    author: 'Philip Fisher',
  },
  {
    text: "Know what you own, and know why you own it.",
    author: 'Peter Lynch',
  },
  {
    text: "Time is your friend; impulse is your enemy.",
    author: 'John Bogle',
  },
  {
    text: "Don't look for the needle in the haystack. Just buy the haystack.",
    author: 'John Bogle',
  },
  {
    text: "Success comes from knowing that you did your best to become the best that you are capable of becoming.",
    author: 'John Wooden',
  },
  {
    text: "It's not what you have, it's what you use that makes a difference.",
    author: 'Zig Ziglar',
    source: '(paraphrased)',
  },
  {
    text: "The 10X Rule is simply this: Figure out what you think success requires and then multiply it by ten.",
    author: 'Grant Cardone',
    source: 'The 10X Rule (paraphrased)',
  },
  {
    text: "Average is a failing formula, and if you are seeking security rather than success, you will get neither.",
    author: 'Grant Cardone',
    source: 'The 10X Rule',
  },

  // More productivity / focus
  {
    text: "Becoming indistractable means learning to become the person you want to be.",
    author: 'Nir Eyal',
    source: 'Indistractable (paraphrased)',
  },
  {
    text: "If you don't plan your day, someone else will hijack it.",
    author: 'Nir Eyal',
    source: 'Indistractable (paraphrased)',
  },
  {
    text: "The average human lifespan is absurdly, terrifyingly, insultingly short. But that isn't a reason for despair. It's exhilarating.",
    author: 'Oliver Burkeman',
    source: 'Four Thousand Weeks (paraphrased)',
  },
  {
    text: "The day will never arrive when you have everything under control.",
    author: 'Oliver Burkeman',
    source: 'Four Thousand Weeks',
  },
  {
    text: "Nothing is particularly hard if you divide it into small jobs.",
    author: 'Henry Ford',
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: 'Robin Sharma',
  },
  {
    text: "Own your morning, elevate your life.",
    author: 'Robin Sharma',
    source: 'The 5AM Club',
  },

  // More mindfulness
  {
    text: "You can't stop the thoughts, but you can stop from letting them get you.",
    author: 'Sharon Salzberg',
  },
  {
    text: "Mindfulness isn't difficult, we just need to remember to do it.",
    author: 'Sharon Salzberg',
  },
  {
    text: "If your compassion does not include yourself, it is incomplete.",
    author: 'Jack Kornfield',
  },
  {
    text: "The trouble is, you think you have time.",
    author: 'Jack Kornfield',
    source: '(often attributed to Buddha, paraphrased)',
  },
  {
    text: "The feeling of being loved and the practice of loving are, in fact, two facets of the same jewel.",
    author: 'Sam Harris',
    source: 'Waking Up (paraphrased)',
  },
  {
    text: "Radical acceptance is simply this: bringing full acceptance to this moment, exactly as it is.",
    author: 'Tara Brach',
    source: 'Radical Acceptance (paraphrased)',
  },

  // More stoicism
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: 'Epictetus',
    source: 'Discourses',
  },
  {
    text: "Wealth consists not in having great possessions, but in having few wants.",
    author: 'Epictetus',
  },
  {
    text: "Only the educated are free.",
    author: 'Epictetus',
  },
  {
    text: "Begin at once to live, and count each separate day as a separate life.",
    author: 'Seneca',
    source: 'Letters from a Stoic',
  },
  {
    text: "While we wait for life, life passes.",
    author: 'Seneca',
    source: 'Letters from a Stoic (paraphrased)',
  },
  {
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: 'Seneca',
  },
  {
    text: "Confine yourself to the present.",
    author: 'Marcus Aurelius',
    source: 'Meditations',
  },
  {
    text: "The best revenge is to be unlike him who performed the injury.",
    author: 'Marcus Aurelius',
    source: 'Meditations',
  },
  {
    text: "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
    author: 'Marcus Aurelius',
    source: 'Meditations',
  },
  {
    text: "It is not death that a man should fear, but he should fear never beginning to live.",
    author: 'Marcus Aurelius',
    source: 'Meditations',
  },
  {
    text: "We suffer more in imagination than in reality, and it is our own thinking, more than external circumstance, that harms us.",
    author: 'William B. Irvine',
    source: 'A Guide to the Good Life (paraphrased)',
  },
  {
    text: "The stoic does not seek to extinguish emotion, but to master it.",
    author: 'Massimo Pigliucci',
    source: 'How to Be a Stoic (paraphrased)',
  },

  // Entrepreneurship memoirs
  {
    text: "Have the courage to follow your heart and intuition. They somehow already know what you truly want to become.",
    author: 'Steve Jobs',
    source: '2005 Stanford commencement address',
  },
  {
    text: "Sports are just games. Nike is not about sports. It's about the sport of business.",
    author: 'Phil Knight',
    source: 'Shoe Dog (paraphrased)',
  },
  {
    text: "Let everyone else call your idea crazy... just keep going. Don't stop. Don't even think about stopping until you get there, and don't give much thought to where 'there' is.",
    author: 'Phil Knight',
    source: 'Shoe Dog',
  },
  {
    text: "The Struggle is where character is built.",
    author: 'Ben Horowitz',
    source: 'The Hard Thing About Hard Things (paraphrased)',
  },
  {
    text: "There are no shortcuts to building a great company or a great career.",
    author: 'Ben Horowitz',
    source: 'The Hard Thing About Hard Things (paraphrased)',
  },
  {
    text: "Success is the process of overcoming the barriers that stand between where you are and where you want to go.",
    author: 'Sam Walton',
    source: '(paraphrased)',
  },
  {
    text: "High expectations are the key to everything.",
    author: 'Sam Walton',
  },
  {
    text: "Success is best when it's shared.",
    author: 'Howard Schultz',
    source: 'Pour Your Heart Into It',
  },

  // Courage / creativity
  {
    text: "Vulnerability is the birthplace of innovation, creativity, and change.",
    author: 'Brené Brown',
    source: 'Rising Strong (paraphrased)',
  },
  {
    text: "What we don't need in the midst of struggle is shame for being human.",
    author: 'Brené Brown',
    source: 'Rising Strong',
  },
  {
    text: "Owning our story and loving ourselves through that process is the bravest thing we will ever do.",
    author: 'Brené Brown',
    source: 'The Gifts of Imperfection (paraphrased)',
  },
  {
    text: "Curiosity is the enemy of fear.",
    author: 'Elizabeth Gilbert',
    source: 'Big Magic (paraphrased)',
  },
  {
    text: "You can measure your worth by your dedication to your path, not by your successes or failures.",
    author: 'Elizabeth Gilbert',
    source: 'Big Magic (paraphrased)',
  },
  {
    text: "It was my life, the one I was ready to start living.",
    author: 'Cheryl Strayed',
    source: 'Wild',
  },
  {
    text: "How wild it was, to let it be.",
    author: 'Cheryl Strayed',
    source: 'Wild',
  },

  // World literature
  {
    text: "If you want to be happy, be.",
    author: 'Leo Tolstoy',
  },
  {
    text: "Everyone thinks of changing the world, but no one thinks of changing himself.",
    author: 'Leo Tolstoy',
  },
  {
    text: "Man is not what he thinks he is, he is what he hides.",
    author: 'André Malraux',
  },
  {
    text: "Man is unhappy because he doesn't know he's happy. It's only that.",
    author: 'Fyodor Dostoevsky',
    source: 'Demons (paraphrased)',
  },
  {
    text: "To live without hope is to cease to live.",
    author: 'Fyodor Dostoevsky',
  },
  {
    text: "He who has a why to live for can bear almost any how.",
    author: 'Victor Hugo',
    source: '(commonly attributed, likely misattributed)',
  },
  {
    text: "Even the darkest night will end and the sun will rise.",
    author: 'Victor Hugo',
    source: 'Les Misérables',
  },
  {
    text: "Within you there is a stillness and a sanctuary to which you can retreat at any time and be yourself.",
    author: 'Hermann Hesse',
    source: 'Siddhartha',
  },
  {
    text: "Some of us think holding on makes us strong, but sometimes it is letting go.",
    author: 'Hermann Hesse',
  },
  {
    text: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.",
    author: 'Antoine de Saint-Exupéry',
    source: 'The Little Prince',
  },
  {
    text: "A goal without a plan is just a wish.",
    author: 'Antoine de Saint-Exupéry',
    source: '(paraphrased)',
  },

  // Habit / behavior science
  {
    text: "Help people do what they already want to do, but in a way that is easy.",
    author: 'BJ Fogg',
    source: 'Tiny Habits (paraphrased)',
  },
  {
    text: "When you want to change a habit, you must find a way to make it as easy as possible.",
    author: 'BJ Fogg',
    source: 'Tiny Habits (paraphrased)',
  },
  {
    text: "Habits form not because we consciously choose to engage in them time and again, but because of a psychological process that runs largely without our awareness.",
    author: 'Wendy Wood',
    source: 'Good Habits, Bad Habits (paraphrased)',
  },
  {
    text: "The days are long, but the years are short.",
    author: 'Gretchen Rubin',
    source: 'The Happiness Project',
  },
  {
    text: "What you do every day matters more than what you do once in a while.",
    author: 'Gretchen Rubin',
    source: 'Better Than Before',
  },

  // A few more, rounding out the collection
  {
    text: "Nothing will work unless you do.",
    author: 'Maya Angelou',
  },
  {
    text: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
    author: 'Ralph Waldo Emerson',
  },
  {
    text: "Nothing great was ever achieved without enthusiasm.",
    author: 'Ralph Waldo Emerson',
  },
  {
    text: "Fear defeats more people than any other one thing in the world.",
    author: 'Ralph Waldo Emerson',
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: 'Steve Jobs',
    source: '2005 Stanford commencement address',
  },
  {
    text: "Don't count the days, make the days count.",
    author: 'Muhammad Ali',
  },

  // A final rounding-out set
  {
    text: "What is not started today is never finished tomorrow.",
    author: 'Johann Wolfgang von Goethe',
  },
  {
    text: "By three methods we may learn wisdom: first, by reflection, which is noblest; second, by imitation, which is easiest; and third by experience, which is the bitterest.",
    author: 'Confucius',
  },
  {
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: 'Confucius',
  },
  {
    text: "He who conquers others is strong; he who conquers himself is mighty.",
    author: 'Lao Tzu',
    source: 'Tao Te Ching',
  },
  {
    text: "Nature does not hurry, yet everything is accomplished.",
    author: 'Lao Tzu',
    source: 'Tao Te Ching (paraphrased)',
  },
  {
    text: "A good traveler has no fixed plans and is not intent on arriving.",
    author: 'Lao Tzu',
    source: 'Tao Te Ching',
  },
  {
    text: "Pleasure in the job puts perfection in the work.",
    author: 'Aristotle',
  },
  {
    text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
    author: 'Aristotle',
  },
  {
    text: "The energy of the mind is the essence of life.",
    author: 'Aristotle',
  },
  {
    text: "Man's main task in life is to give birth to himself, to become what he potentially is.",
    author: 'Erich Fromm',
    source: 'Man for Himself',
  },
  {
    text: "Everything that is really great and inspiring is created by the individual who can labor in freedom.",
    author: 'Albert Einstein',
  },
  {
    text: "Effective leadership is not about making speeches or being liked; leadership is defined by results, not attributes.",
    author: 'Peter Drucker',
  },
  {
    text: "The best way to predict the future is to create it.",
    author: 'Peter Drucker',
  },
  {
    text: "What gets measured gets managed.",
    author: 'Peter Drucker',
  },
  {
    text: "Sticky ideas are simple, unexpected, concrete, credible, and emotional. And they usually tell a story.",
    author: 'Chip Heath & Dan Heath',
    source: 'Made to Stick (paraphrased)',
  },
  {
    text: "Feel the fear and do it anyway.",
    author: 'Susan Jeffers',
    source: 'Feel the Fear and Do It Anyway',
  },
  {
    text: "All you have to do to diminish your fear is to develop more trust in your ability to handle whatever comes your way.",
    author: 'Susan Jeffers',
    source: 'Feel the Fear and Do It Anyway (paraphrased)',
  },
  {
    text: "Your Upper Limit Problem is the cause of nearly all unnecessary struggle and suffering in your life.",
    author: 'Gay Hendricks',
    source: 'The Big Leap (paraphrased)',
  },
  {
    text: "The place of highest success in life is almost always found right next to the greatest challenges.",
    author: 'Gay Hendricks',
    source: 'The Big Leap (paraphrased)',
  },
  {
    text: "You cannot swim for new horizons until you have courage to lose sight of the shore.",
    author: 'William Faulkner',
  },
  {
    text: "The past is never dead. It's not even past.",
    author: 'William Faulkner',
    source: 'Requiem for a Nun',
  },
  {
    text: "Whatever you do, or dream you can do, begin it now.",
    author: 'W. H. Murray',
    source: 'The Scottish Himalayan Expedition (paraphrased)',
  },
  {
    text: "Do the thing you fear, and the death of fear is certain.",
    author: 'Ralph Waldo Emerson',
  },
  {
    text: "The years teach much which the days never knew.",
    author: 'Ralph Waldo Emerson',
  },
  {
    text: "There is a time for many words, and there is also a time for sleep.",
    author: 'Homer',
    source: 'The Odyssey',
  },
  {
    text: "It is not length of life, but depth of life.",
    author: 'Ralph Waldo Emerson',
  },
  {
    text: "Freedom lies in being bold.",
    author: 'Robert Frost',
  },
  {
    text: "I am not afraid of storms, for I am learning how to sail my ship.",
    author: 'Louisa May Alcott',
    source: 'Little Women',
  },
  {
    text: "Far away there in the sunshine are my highest aspirations. I may not reach them, but I can look up and see their beauty, believe in them, and try to follow where they lead.",
    author: 'Louisa May Alcott',
  },
  {
    text: "Tomorrow is always fresh, with no mistakes in it yet.",
    author: 'L. M. Montgomery',
    source: 'Anne of Green Gables (paraphrased)',
  },
  {
    text: "The best way out is always through.",
    author: 'Robert Frost',
    source: '"A Servant to Servants"',
  },
  {
    text: "Nothing splendid has ever been achieved except by those who dared believe that something inside them was superior to circumstance.",
    author: 'Bruce Barton',
  },
  {
    text: "You are always a student, never a master. You have to keep moving forward.",
    author: 'Conrad Hall',
    source: '(paraphrased)',
  },
  {
    text: "Perfection is not attainable, but if we chase perfection we can catch excellence.",
    author: 'Vince Lombardi',
    source: '(paraphrased)',
  },
  {
    text: "The man who moves a mountain begins by carrying away small stones.",
    author: 'Confucius',
  },
  {
    text: "Real knowledge is to know the extent of one's ignorance.",
    author: 'Confucius',
  },
  {
    text: "When it is obvious that the goals cannot be reached, don't adjust the goals, adjust the action steps.",
    author: 'Confucius',
    source: '(paraphrased)',
  },
];

export function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default quotes;
