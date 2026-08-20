/*
  The 30 traits Strategy lets someone activate, grouped into 6
  dimensions. Kept as plain data, deliberately separate from anything
  that reads it (the quiz, the radar chart, the trait picker), so the
  roster itself -- names, grouping, order -- can be edited here without
  touching any logic. English concept words only, on purpose: no
  translated labels alongside them.
*/
export const DIMENSIONS = ['Mind', 'Body', 'Craft', 'Will', 'Heart', 'Spirit'];

export const TRAITS_BY_DIMENSION = {
  Mind: ['Curious', 'Analytical', 'Well-Read', 'Strategic', 'Articulate'],
  Body: ['Strong', 'Enduring', 'Agile', 'Energetic', 'Resilient'],
  Craft: ['Imaginative', 'Expressive', 'Resourceful', 'Skilled', 'Original'],
  Will: ['Consistent', 'Focused', 'Patient', 'Driven', 'Organized'],
  Heart: ['Generous', 'Empathetic', 'Supportive', 'Forgiving', 'Warm'],
  Spirit: ['Calm', 'Grounded', 'Present', 'Grateful', 'Reflective'],
};

// One reverse lookup, built once -- every trait name is unique across
// the whole roster, so this is the single source of truth for "which
// dimension does this trait belong to" (used by the radar chart to
// aggregate votes, and anywhere else that only has a trait/Bucket title
// to work from).
const DIMENSION_BY_TRAIT = Object.fromEntries(
  DIMENSIONS.flatMap((dimension) => TRAITS_BY_DIMENSION[dimension].map((trait) => [trait, dimension])),
);

export function getDimensionForTrait(trait) {
  return DIMENSION_BY_TRAIT[trait] || null;
}

export function getAllTraits() {
  return DIMENSIONS.flatMap((dimension) => TRAITS_BY_DIMENSION[dimension]);
}

// The phrase every vote/ritual/card built from a trait reuses, so
// "Focused" always reads back the same way wherever it shows up --
// "Cast a vote for your Focused side.", "Your Focused side."
export function traitSidePhrase(trait) {
  return `your ${trait} side`;
}
