// Recommend -- replaces Execute + Plan (see src/components/Execute/RecommendPlanFlow.jsx)
// for "do"-shaped Buckets (see classify-bucket-difficulty's goalShape --
// "become" Buckets like "Score 900 on the TOEIC" keep the plain manual
// Plan editor instead, a single dated itinerary doesn't fit an ongoing
// pursuit). One call, no clarifying-questions round-trip: everything
// Execute used to ask for up front is now either already known
// (difficulty classification, a detected free evening) or left to
// Gemini's own judgment, matching this app's Human Agency stance -- one
// confident recommendation to react to (edit, accept, or regenerate),
// not an intake form to fill out before getting anything back.
//
// Response shape is deliberately kept compatible with the old
// execute-plan's { status, summary, recommendations, plan, sources } so
// a Bucket's existing `executePlan` field (see lib/buckets.js) keeps
// working as the cache for either flow's result without a migration.
//
// Same secret-key-stays-server-side reasoning as the other Edge
// Functions -- GEMINI_API_KEY never reaches the browser.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type Difficulty = {
  timeCommitment?: string;
  costTier?: string;
  seasonality?: string | null;
  travelRequired?: string;
} | null;

// A pre-formatted label ("Today 18:00-21:00") rather than separate
// fields -- the client already has this exact formatting logic
// (lib/weeklyNudge.js's describeFreeEvening, shared with WeeklyNudgeCard)
// so this just reuses that string instead of duplicating day/time
// formatting rules on the server too.
type FreeEvening = { label?: string } | null;

// A detected free evening is only a usable hint for a "quick" Bucket --
// forcing a multi-day trip into "tonight 18:00-21:00" would be nonsense,
// so anything bigger than quick gets no time hint at all and Gemini
// picks its own near-term date, still respecting `seasonality` below.
function buildKnownFacts(
  place: string | undefined,
  mode: string | undefined,
  when: string | undefined,
  difficulty: Difficulty,
  freeEvening: FreeEvening,
  pastExperiences: string[],
): string {
  const facts: string[] = [];
  if (place) facts.push(`Place already noted on this Bucket: ${place}`);
  if (mode) facts.push(`Mode: ${mode === 'together' ? 'with other people' : 'solo'}`);
  if (when) facts.push(`Horizon: ${when === 'thisYear' ? 'sometime this year' : 'no fixed deadline (someday before I die)'}`);

  if (difficulty) {
    if (difficulty.costTier) facts.push(`Expected cost tier: ${difficulty.costTier}`);
    if (difficulty.seasonality) {
      facts.push(
        `This only really makes sense in ${difficulty.seasonality} -- the recommended date MUST fall within that season, even if that means it's not imminent.`,
      );
    }
    if (difficulty.travelRequired) facts.push(`Travel scope: ${difficulty.travelRequired}`);

    if (difficulty.timeCommitment === 'quick' && freeEvening?.label) {
      facts.push(
        `A free evening was detected: ${freeEvening.label}. ` +
          `Since this Bucket fits in a single evening, strongly prefer recommending exactly this slot unless the season fact above rules it out.`,
      );
    } else if (difficulty.timeCommitment && difficulty.timeCommitment !== 'quick') {
      facts.push(
        `This takes more than one evening (${difficulty.timeCommitment}) -- choose a sensible near-future date yourself (e.g. an upcoming weekend), don't try to fit it into a single evening.`,
      );
    }
  }

  if (pastExperiences.length > 0) {
    facts.push(
      `Experiences this person has already actually completed (for personalization, e.g. matching a style or avoiding an exact repeat, not for planning logistics): ${pastExperiences.join(', ')}`,
    );
  }

  return facts.length ? facts.join('\n') : '(nothing else is known yet)';
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['ready', 'needs_input'],
      description: '"ready" if a concrete plan could be built. "needs_input" if research turned up nothing usable.',
    },
    summary: { type: 'string', description: 'One or two sentence plain-language summary, same language as the Bucket title.' },
    questions: {
      type: 'array',
      description: 'Only used when status is "needs_input": the single most useful follow-up question.',
      items: { type: 'string' },
    },
    recommendations: {
      type: 'array',
      description: 'Real, named candidate options found via search, 1-4 of them. Only used when status is "ready".',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          location: { type: 'string' },
          price: { type: 'string', description: 'Price as found, or "要確認" if uncertain -- never a guessed number stated as fact.' },
          access: { type: 'string' },
          reason: { type: 'string', description: 'One sentence on why this one, or a tradeoff to know.' },
          url: { type: 'string', description: 'Must be exactly one of the URLs provided in the research text -- never invented.' },
        },
        required: ['name', 'location', 'price', 'access', 'reason', 'url'],
      },
    },
    plan: {
      type: 'object',
      description: 'The single concrete recommended plan. Only used when status is "ready".',
      properties: {
        date: { type: 'string', description: 'Proposed date as YYYY-MM-DD.' },
        destination: { type: 'string', description: 'The one place/destination this plan commits to.' },
        schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: { time: { type: 'string', description: '24-hour "HH:MM".' }, text: { type: 'string' } },
            required: ['time', 'text'],
          },
        },
        budget: { type: 'string', description: 'Total estimated budget as found, or "要確認" if uncertain.' },
        thingsToBring: { type: 'array', items: { type: 'string' } },
        nextActions: { type: 'array', items: { type: 'string' }, description: '2-5 concrete next steps, same language as the Bucket title.' },
      },
      required: ['date', 'destination', 'schedule', 'budget', 'thingsToBring', 'nextActions'],
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, url: { type: 'string' } },
        required: ['title', 'url'],
      },
    },
  },
  required: ['status', 'summary'],
};

async function callGemini(
  geminiKey: string,
  body: Record<string, unknown>,
): Promise<{ text: string; groundingChunks: Array<{ uri: string; title: string }> }> {
  const response = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Gemini request failed: ${await response.text()}`);
  }
  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') ?? '';
  const rawChunks = candidate?.groundingMetadata?.groundingChunks ?? [];
  const groundingChunks = rawChunks
    .map((chunk: { web?: { uri?: string; title?: string } }) => ({ uri: chunk.web?.uri || '', title: chunk.web?.title || '' }))
    .filter((chunk: { uri: string }) => chunk.uri);
  return { text, groundingChunks };
}

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

    const { bucketTitle, place, mode, when, difficulty, freeEvening, pastExperiences } = await req.json();
    if (!bucketTitle) {
      return new Response(JSON.stringify({ error: 'bucketTitle is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const knownFacts = buildKnownFacts(place, mode, when, difficulty ?? null, freeEvening ?? null, Array.isArray(pastExperiences) ? pastExperiences : []);

    const researchSystemInstruction = `You are researching a real-world plan for a DazelKey Bucket List item.
Today's date is ${today()}. Use Google Search to find REAL, currently
existing options -- named venues/providers, actual prices, opening
hours/days, access directions, typical duration, booking method, and
requirements. Do not rely on prior knowledge for anything that could be
out of date -- search for it. If you can't find something, say so
plainly rather than guessing. List every source URL you actually used.`;

    const researchPrompt = `Bucket: "${bucketTitle}"

Known facts:
${knownFacts}

Find 1-4 real candidate options for this, with their concrete details and source URLs.`;

    let research;
    try {
      research = await callGemini(geminiKey, {
        systemInstruction: { parts: [{ text: researchSystemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: researchPrompt }] }],
        tools: [{ googleSearch: {} }],
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: `Web search failed: ${String(err)}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!research.text.trim()) {
      return new Response(
        JSON.stringify({ status: 'needs_input', questions: ['Could you give a bit more detail, like a specific area or date range?'] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const sourceList = research.groundingChunks.length
      ? research.groundingChunks.map((chunk) => `- ${chunk.title || chunk.uri}: ${chunk.uri}`).join('\n')
      : '(no grounded sources were returned -- do not include any sources or URLs in your answer)';

    const structuringSystemInstruction = `You are Recommend, DazelKey's Bucket-to-plan assistant. Turn the
research below into the required JSON shape -- ONE confident
recommended plan, not several options to choose between (the
recommendations array is supporting detail, the plan itself is the
answer). Use ONLY facts stated in the research text -- never add a
price, hours, or detail that isn't there. Where the research is
uncertain about a number, say so (e.g. "要確認") instead of stating a
guess as fact. Any "url" field must be copied verbatim from this exact
list of sources found -- never write a URL from memory:
${sourceList}

If the research didn't turn up anything real and usable, return
status: "needs_input" with exactly one follow-up question instead of
forcing a plan. Respond in the same language as the Bucket title.`;

    const structuringPrompt = `Bucket: "${bucketTitle}"

Known facts:
${knownFacts}

Research findings:
${research.text}`;

    let structured;
    try {
      structured = await callGemini(geminiKey, {
        systemInstruction: { parts: [{ text: structuringSystemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: structuringPrompt }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: PLAN_SCHEMA, temperature: 0.3 },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: `Plan generation failed: ${String(err)}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(structured.text);
    } catch {
      return new Response(JSON.stringify({ error: 'Gemini returned malformed plan JSON.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (parsed.status === 'needs_input') {
      const isValid = Array.isArray(parsed.questions) && parsed.questions.length > 0;
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Gemini could not build a plan and gave no follow-up question.' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ status: 'needs_input', questions: parsed.questions, summary: parsed.summary || '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isValidPlan =
      parsed.status === 'ready' &&
      parsed.plan &&
      typeof parsed.plan.destination === 'string' &&
      parsed.plan.destination.trim().length > 0 &&
      Array.isArray(parsed.plan.schedule) &&
      Array.isArray(parsed.plan.thingsToBring) &&
      Array.isArray(parsed.plan.nextActions);
    if (!isValidPlan) {
      return new Response(JSON.stringify({ error: 'Gemini returned an incomplete plan.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const groundedUrls = new Set(research.groundingChunks.map((chunk) => chunk.uri));
    const sources = research.groundingChunks.length
      ? research.groundingChunks.map((chunk) => ({ title: chunk.title || chunk.uri, url: chunk.uri }))
      : (Array.isArray(parsed.sources) ? parsed.sources : []).filter(
          (source: { url?: string }) => typeof source.url === 'string' && groundedUrls.has(source.url),
        );

    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter(
          (rec: { url?: string }) =>
            typeof rec.url !== 'string' || !rec.url || groundedUrls.has(rec.url) || sources.some((s: { url: string }) => s.url === rec.url),
        )
      : [];

    return new Response(
      JSON.stringify({ status: 'ready', summary: parsed.summary || '', recommendations, plan: parsed.plan, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
