// Classifies one Bucket into five coarse axes the app uses to match
// "how much free time is there this week" against "which Buckets could
// actually happen in it" -- see src/lib/digitalOpportunityLoss.js, the
// Weekly Opportunity card's own selection logic. Called from
// src/hooks/useBucketDifficulty.js in the background, a few Buckets at
// a time, never blocking the UI on a result.
//
// Deliberately only five small enums, not a free-form estimate --
// `**DazelKey — Social Impact**.md`'s own DOL formula and this app's
// engineering conventions both push toward the smallest schema that
// still answers "does this fit in tonight's free evening, right now,
// nearby" rather than trying to model every real-world variable.
// `goalShape` is the one axis that isn't about feasibility at all, but
// about how a Bucket should even be *described* once picked as an
// example -- see describeOpportunityExample's own comment for why a
// "become" Bucket (e.g. "Score 900 on the TOEIC") showing "x5" instead
// of "10h toward it" reads as nonsense, not encouragement.
//
// Same secret-key-stays-server-side reasoning as plan-goal-chat and
// execute-plan (see their own header comments) -- GEMINI_API_KEY never
// reaches the browser.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_INSTRUCTION = `You classify a single Bucket List item (a future experience someone
wants to have) along four coarse axes, so an app can later match it
against how much free time someone actually has this week.

- timeCommitment: "quick" (fits in a single evening, roughly under 3
  hours, including travel), "halfDay", "fullDay", or "multiDay"
  (requires an overnight stay or more).
- costTier: "free", "low", "medium", or "high", for the typical
  present-day cost to do this once.
- seasonality: "winter", "spring", "summer", or "fall" ONLY if this
  genuinely only makes sense in that season (e.g. seeing snow, cherry
  blossoms, fireworks); null for anything doable year-round -- most
  Buckets should get null, don't force a season onto something generic.
- travelRequired: "local" (same city/area), "domestic" (elsewhere in
  the same country), or "international".
- goalShape: "do" for something that happens once and is then finished
  (a trip, an event, a one-time challenge -- "Go to Kyoto", "See the
  Northern Lights"), or "become" for an ongoing pursuit toward a
  threshold or skill that no single sitting completes ("Score 900 on
  the TOEIC", "Run a marathon", "Learn to speak Spanish", "Lose 5kg").
  Most Buckets are "do" -- only mark "become" when finishing it clearly
  takes sustained effort over multiple sessions, not just one longer one.

Use your best real-world judgment from the title alone (plus place/
notes if given) -- when genuinely ambiguous, prefer the more common,
less extreme interpretation rather than the most elaborate one.`;

const DIFFICULTY_SCHEMA = {
  type: 'object',
  properties: {
    timeCommitment: { type: 'string', enum: ['quick', 'halfDay', 'fullDay', 'multiDay'] },
    costTier: { type: 'string', enum: ['free', 'low', 'medium', 'high'] },
    seasonality: { type: 'string', enum: ['winter', 'spring', 'summer', 'fall', 'none'] },
    travelRequired: { type: 'string', enum: ['local', 'domestic', 'international'] },
    goalShape: { type: 'string', enum: ['do', 'become'] },
  },
  required: ['timeCommitment', 'costTier', 'seasonality', 'travelRequired', 'goalShape'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not signed in.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'Server is missing GEMINI_API_KEY.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { title, place, message } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: 'title is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const descriptionParts = [`Title: ${title}`];
    if (place) descriptionParts.push(`Place: ${place}`);
    if (message) descriptionParts.push(`Notes: ${message}`);

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: 'user', parts: [{ text: descriptionParts.join('\n') }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: DIFFICULTY_SCHEMA,
          temperature: 0.2,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(JSON.stringify({ error: `Gemini request failed: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = JSON.parse(text);

    const isValid =
      ['quick', 'halfDay', 'fullDay', 'multiDay'].includes(parsed?.timeCommitment) &&
      ['free', 'low', 'medium', 'high'].includes(parsed?.costTier) &&
      ['winter', 'spring', 'summer', 'fall', 'none'].includes(parsed?.seasonality) &&
      ['local', 'domestic', 'international'].includes(parsed?.travelRequired) &&
      ['do', 'become'].includes(parsed?.goalShape);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Gemini returned an incomplete classification.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // "none" reads better as null once this lands in the Bucket's own
    // data -- easier for lib/digitalOpportunityLoss.js's season match to
    // treat "no restriction" as falsy than as a fifth string to check.
    return new Response(
      JSON.stringify({
        difficulty: {
          timeCommitment: parsed.timeCommitment,
          costTier: parsed.costTier,
          seasonality: parsed.seasonality === 'none' ? null : parsed.seasonality,
          travelRequired: parsed.travelRequired,
          goalShape: parsed.goalShape,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
