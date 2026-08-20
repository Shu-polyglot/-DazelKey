import { DIMENSIONS } from './traits';

/*
  18 questions, 3 per dimension, in DIMENSIONS order -- self-contained
  and separate from the scoring logic (lib/traitQuiz.js) so wording or
  question count can change here without touching how answers are
  scored.
*/
export const QUIZ_QUESTIONS = [
  { dimension: 'Mind', text: "I love learning something new, even when it's not useful right away." },
  { dimension: 'Mind', text: 'I enjoy taking an idea apart to see how it really works.' },
  { dimension: 'Mind', text: "I'd rather read one more page than turn off the light." },

  { dimension: 'Body', text: "I feel best after I've pushed my body — a workout, a walk, a stretch." },
  { dimension: 'Body', text: "I notice when I haven't moved enough in a day." },
  { dimension: 'Body', text: 'I bounce back quickly after a hard physical day.' },

  { dimension: 'Craft', text: "I'm happiest when I'm making something with my hands or my mind." },
  { dimension: 'Craft', text: "I'd rather build my own version than use someone else's." },
  { dimension: 'Craft', text: "I lose track of time when I'm working on something creative." },

  { dimension: 'Will', text: "I keep going even when I don't feel like it." },
  { dimension: 'Will', text: 'I finish what I start, even the boring parts.' },
  { dimension: 'Will', text: "I'd rather do a little every day than a lot all at once." },

  { dimension: 'Heart', text: 'I notice when people around me need something, before they ask.' },
  { dimension: 'Heart', text: "I'd give up my own plans if a friend really needed me." },
  { dimension: 'Heart', text: 'I find it easy to let go of a grudge.' },

  { dimension: 'Spirit', text: 'I make space in my day just to be still.' },
  { dimension: 'Spirit', text: 'I notice the small good things, even on hard days.' },
  { dimension: 'Spirit', text: 'I feel most like myself when things are quiet.' },
];

// Sanity check for whoever edits QUIZ_QUESTIONS above -- scoring assumes
// every dimension is represented.
DIMENSIONS.forEach((dimension) => {
  if (!QUIZ_QUESTIONS.some((question) => question.dimension === dimension)) {
    throw new Error(`traitQuiz: no questions for dimension "${dimension}"`);
  }
});

export const QUIZ_SCALE = [
  { value: 1, label: 'Not like me' },
  { value: 2, label: 'A little like me' },
  { value: 3, label: 'Somewhat like me' },
  { value: 4, label: 'Like me' },
  { value: 5, label: 'Very like me' },
];

// How many top-scoring dimensions the quiz suggests traits from.
export const TOP_DIMENSIONS_COUNT = 2;
