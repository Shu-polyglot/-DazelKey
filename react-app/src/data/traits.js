/*
  The 6 dimensions the Trait Quiz scores and the radar chart plots, each
  with a handful of example traits shown as flavor text in the quiz's
  results view. Purely descriptive at this point -- nothing in Strategy
  or Top 3 Priority reads this data; those goals are freeform text, not
  trait picks (see features/topPriority/AddPriorityFlow). Kept as plain
  data, deliberately separate from the quiz/scoring logic, so the roster
  itself -- names, grouping, order -- can be edited here without touching
  any logic. English concept words only, on purpose: no translated labels
  alongside them.
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
