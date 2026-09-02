// Execute -- DazelKey's "turn a Bucket into a real, bookable plan"
// assistant. Called from src/components/Execute/ExecutePlanFlow.jsx via
// supabase.functions.invoke('execute-plan'). Separate from Realize (see
// plan-goal-chat, an unrelated feature that estimates a money goal for a
// Doing Bucket) -- this one exists to turn "I want to go camping" into an
// actual dated itinerary at a real place.
//
// Runs server-side for the same reason plan-goal-chat does: the Gemini
// API key must stay a secret, so this is the only thing that ever calls
// Gemini directly, using its own GEMINI_API_KEY Edge Function secret
// (shared with plan-goal-chat -- no new secret needed).
//
// Two phases, chosen by the request body's `phase` field:
//  - 'questions': given the Bucket's title and whatever's already known
//    about it (place/mode/when), asks Gemini for the handful of details
//    that actually change the plan (timing, starting point, budget,
//    group size, ...) -- skipping anything already known, and skipping
//    the step entirely (empty array) when the title alone is plannable.
//  - 'plan': given the title plus those questions and the person's
//    answers, does the actual work in two Gemini calls rather than one:
//      1. A grounded research call (Google Search tool, free-text) that
//         finds real candidate venues/prices/hours/access/booking info
//         for this exact goal. Its `groundingMetadata` is the only
//         source of truth for URLs below -- Gemini's structured-output
//         mode can't be combined with tool use in the same call, and a
//         model asked to *write* a URL from memory in the structuring
//         call below cannot be trusted not to invent one.
//      2. A structuring call (no tools, responseSchema=PLAN_SCHEMA) that
//         turns step 1's research text into the JSON shape the UI
//         renders -- told explicitly to use only what step 1 found, and
//         to mark anything uncertain (a price, a booking rule) as
//         needing to be confirmed rather than stating it as fact. If
//         step 1 turned up nothing usable, this can come back with
//         status: 'needs_input' and follow-up questions instead of a
//         plan, rather than fabricating one.
//    The response's `sources` is then rebuilt server-side from step 1's
//    actual grounding chunks (falling back to whatever the model listed
//    only if grounding returned none) -- never trusting step 2's own
//    copy of a URL over the real one.
//
// Requires a logged-in DazelKey user, same as plan-goal-chat and for the
// same reason (keeps the key from being usable by anyone who finds the
// URL) -- it doesn't otherwise read or write any of their data.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// A function, not a constant, so every request grounds the model in
// today's actual date -- without this, "this weekend" or a proposed
// plan date drifts toward whatever the training data happened to
// contain instead of being anchored to when the person is really asking.
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildKnownFacts(place?: string, mode?: string, when?: string): string {
  const facts: string[] = [];
  if (place) {
    facts.push(`Place already noted on this Bucket: ${place}`);
  }
  if (mode) {
    facts.push(`Mode: ${mode === 'together' ? 'with other people' : 'solo'}`);
  }
  if (when) {
    facts.push(`Horizon: ${when === 'thisYear' ? 'sometime this year' : 'no fixed deadline (someday before I die)'}`);
  }
  return facts.length ? facts.join('\n') : '(nothing else is known yet)';
}

const QUESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      description:
        '0-4 short, specific questions whose answers would most change the concrete plan for this exact Bucket -- e.g. timing, starting point/current location, group size, budget ceiling. Skip anything already given as a known fact. Return an empty array if the title plus known facts is already enough to plan from.',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'A single, specific question, in the same language as the Bucket title.' },
          placeholder: {
            type: 'string',
            description: 'A short example answer for this question, shown as input placeholder text, same language as the question.',
          },
        },
        required: ['question', 'placeholder'],
      },
    },
  },
  required: ['questions'],
};

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['ready', 'needs_input'],
      description:
        '"ready" if a concrete plan could be built from the research text. "needs_input" if the research turned up nothing usable (e.g. too vague, nothing real found) -- in that case fill `questions` instead of `recommendations`/`plan`.',
    },
    summary: { type: 'string', description: 'One or two sentence plain-language summary of the outcome, same language as the Bucket title.' },
    questions: {
      type: 'array',
      description: 'Only used when status is "needs_input": follow-up questions that would unblock planning.',
      items: { type: 'string' },
    },
    recommendations: {
      type: 'array',
      description:
        'Real, named candidate options found via search (venues, routes, providers -- whatever fits the goal), 1-4 of them. Only used when status is "ready".',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          location: { type: 'string' },
          price: { type: 'string', description: 'Price as found, or "要確認" / "confirm on official site" if uncertain -- never a guessed number stated as fact.' },
          access: { type: 'string', description: 'How to get there / access info.' },
          reason: { type: 'string', description: 'One sentence on why this one is recommended, or a tradeoff to know about it.' },
          url: { type: 'string', description: 'Must be exactly one of the URLs provided in the research text below -- never invented.' },
        },
        required: ['name', 'location', 'price', 'access', 'reason', 'url'],
      },
    },
    plan: {
      type: 'object',
      description: 'The single concrete recommended plan. Only used when status is "ready".',
      properties: {
        date: { type: 'string', description: 'Proposed date as YYYY-MM-DD, chosen to fit the timing the person gave (or a reasonable near-term guess if they left it open).' },
        destination: { type: 'string', description: 'The one place/destination this plan commits to, matching the top recommendation.' },
        schedule: {
          type: 'array',
          description: 'Ordered itinerary items for the day(s), each a 24h HH:MM clock time plus a short free-text description.',
          items: {
            type: 'object',
            properties: {
              time: { type: 'string', description: '24-hour "HH:MM".' },
              text: { type: 'string' },
            },
            required: ['time', 'text'],
          },
        },
        budget: { type: 'string', description: 'Total estimated budget as found, or "要確認" if the real total is uncertain.' },
        thingsToBring: { type: 'array', items: { type: 'string' } },
        nextActions: {
          type: 'array',
          description: '2-5 concrete next steps the person should actually do to make this happen (e.g. "Book via the official site", "Reserve a rental car"), same language as the Bucket title.',
          items: { type: 'string' },
        },
      },
      required: ['date', 'destination', 'schedule', 'budget', 'thingsToBring', 'nextActions'],
    },
    sources: {
      type: 'array',
      description: 'Every URL from the research text that was actually used above -- title plus the exact url, copied verbatim.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          url: { type: 'string' },
        },
        required: ['title', 'url'],
      },
    },
  },
  required: ['status', 'summary'],
};

type ChatTurn = { role: string; parts: Array<{ text: string }> };

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
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
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

    const { bucketTitle, place, mode, when, phase, answers } = await req.json();
    if (!bucketTitle || (phase !== 'questions' && phase !== 'plan')) {
      return new Response(JSON.stringify({ error: 'bucketTitle and a valid phase are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (phase === 'plan' && !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: 'answers are required to build a plan.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const knownFacts = buildKnownFacts(place, mode, when);

    if (phase === 'questions') {
      const systemInstruction = `You are Execute, the part of DazelKey (an app for turning Bucket List
items into real, dated plans) that figures out what still needs to be
asked before a Bucket can be planned. Today's date is ${today()}.

Ask only for what would actually change the plan -- never ask about
something already given as a known fact, and return an empty array if
the title plus known facts is already plannable (e.g. it names a
specific real place already). Keep it to the fewest questions that
matter, not an exhaustive intake form.

Respond in the same language as the Bucket title.`;

      const contents: ChatTurn[] = [
        {
          role: 'user',
          parts: [
            {
              text: `Bucket: "${bucketTitle}"\n\nKnown facts:\n${knownFacts}\n\nWhat clarifying questions (if any) do you need answered before you could build a concrete, real-world plan for this?`,
            },
          ],
        },
      ];

      const { text } = await callGemini(geminiKey, {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { responseMimeType: 'application/json', responseSchema: QUESTIONS_SCHEMA },
      });
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed?.questions)) {
        return new Response(JSON.stringify({ error: 'Gemini did not return a valid questions list.' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ questions: parsed.questions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // phase === 'plan' -----------------------------------------------

    const qaText = (answers as Array<{ question: string; answer: string }>)
      .map(({ question, answer }) => `Q: ${question}\nA: ${answer?.trim() ? answer : '(left blank -- use your best judgment)'}`)
      .join('\n\n');

    // Step 1: grounded research. No responseSchema here -- Gemini's tool
    // use and structured-output modes can't be combined in one call.
    const researchSystemInstruction = `You are researching a real-world plan for a DazelKey Bucket List item.
Today's date is ${today()}. Use Google Search to find REAL, currently
existing options -- named venues/providers, actual prices, opening
hours/days, access directions, typical duration, booking method, and
requirements. Do not rely on prior knowledge for anything that could be
out of date (prices, hours, whether a place still operates) -- search
for it. If you can't find something, say so plainly rather than
guessing. List every source URL you actually used.`;

    const researchPrompt = `Bucket: "${bucketTitle}"

Known facts:
${knownFacts}

Answers to clarifying questions:
${qaText || '(none asked)'}

Find 1-4 real candidate options for this, with their concrete details
and source URLs.`;

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

    // Step 2: structure the research into PLAN_SCHEMA. Told explicitly
    // to treat step 1's text as the only source of truth, and to only
    // ever reuse a URL from `sourceList` verbatim.
    const structuringSystemInstruction = `You are Execute, DazelKey's Bucket-to-plan assistant. Turn the research
below into the required JSON shape. Use ONLY facts stated in the
research text -- never add a price, hours, or detail that isn't there.
Where the research is uncertain about a number (price, duration), say so
in that field (e.g. "要確認" / "confirm on official site") instead of
stating a guess as fact. Any "url" field you fill must be copied
verbatim from this exact list of sources found -- never write a URL
from memory:
${sourceList}

If the research didn't turn up anything real and usable, return
status: "needs_input" with follow-up questions instead of forcing a
plan. Respond in the same language as the Bucket title.`;

    const structuringPrompt = `Bucket: "${bucketTitle}"

Known facts:
${knownFacts}

Answers to clarifying questions:
${qaText || '(none asked)'}

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
        return new Response(JSON.stringify({ error: 'Gemini could not build a plan and gave no follow-up questions.' }), {
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

    // Rebuild `sources` from the real grounding chunks rather than
    // trusting step 2's own copy -- only falls back to the model's list
    // if grounding genuinely returned nothing (still filtered against
    // the model inventing a URL never actually retrieved).
    const groundedUrls = new Set(research.groundingChunks.map((chunk) => chunk.uri));
    const sources = research.groundingChunks.length
      ? research.groundingChunks.map((chunk) => ({ title: chunk.title || chunk.uri, url: chunk.uri }))
      : (Array.isArray(parsed.sources) ? parsed.sources : []).filter(
          (source: { url?: string }) => typeof source.url === 'string' && groundedUrls.has(source.url),
        );

    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter(
          (rec: { url?: string }) => typeof rec.url !== 'string' || !rec.url || groundedUrls.has(rec.url) || sources.some((s: { url: string }) => s.url === rec.url),
        )
      : [];

    return new Response(
      JSON.stringify({
        status: 'ready',
        summary: parsed.summary || '',
        recommendations,
        plan: parsed.plan,
        sources,
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
