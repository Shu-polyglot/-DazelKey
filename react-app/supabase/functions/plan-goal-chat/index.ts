// Realize's "🪄 Ask AI" goal-planning assistant -- called from
// src/components/Strategy/GoalPlanChat.jsx via supabase.functions.invoke.
//
// Runs server-side (not in the browser) for one reason: the Gemini API
// key has to stay a secret, and anything shipped to the browser bundle
// is public by definition. This function reads GEMINI_API_KEY from its
// own environment (set as an Edge Function secret in the Supabase
// dashboard -- never committed, never sent to the client) and is the
// only thing that ever calls Gemini directly.
//
// Two phases, chosen by the request body's `phase` field:
//  - 'questions': given just the goal title, asks Gemini for a short
//    list of clarifying questions -- the specifics that would most
//    change the cost estimate or checklist for *this* goal (destination,
//    quality tier, duration, ...). The person answers them in a form
//    (see GoalPlanChat) rather than free-typing into a chat.
//  - 'plan': given the goal title plus those questions and the person's
//    answers, asks Gemini for a JSON object matching PLAN_SCHEMA -- see
//    GoalPlanChat's own comment for how that maps onto a Realize goal's
//    doingGoalAmount/doingChecklist fields.
//
// Requires the caller to be a logged-in DazelKey user (checked against
// their own Supabase session below) purely to keep this key from being
// usable by anyone who finds the URL -- it doesn't otherwise care who's
// asking or read/write any of their data.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// A function, not a constant, so every request grounds the model in the
// actual current date -- without this, cost estimates drift toward
// whatever prices were common in Gemini's training data instead of
// today's, and that gap only grows over time.
function buildSystemInstruction(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `You are the goal-planning assistant inside DazelKey, an app where people track
"Realize" goals -- Bucket List items with a total cost in yen and an
optional checklist of steps/milestones toward it.

Today's date is ${today}. Estimate costs using real-world, present-day
pricing, not figures that may be years out of date.

You work in two steps for a given goal:
1. First you're asked for a short list of clarifying questions -- the
   handful of specifics (destination, quality tier, duration, group
   size, timeline, etc.) that would most change the cost estimate or
   checklist for *this exact* goal, not generic ones any goal could get.
2. Then, given the person's answers -- some may be left blank, in which
   case use your best judgment -- you produce the final plan: an
   estimated total cost and an ordered checklist. If the goal itself
   sounds likely to cause burnout or is still too vague to plan even
   with the answers given, say so gently in the plan's summary rather
   than estimating blindly.

Yen estimates are easy to get wrong by a whole order of magnitude
(confusing 万円 and 十万円, or thousands and tens of thousands). Before
finalizing an amount, sanity-check its scale against a comparable
everyday purchase.

Respond in the same language as the goal title.`;
}

const QUESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      description:
        '2-4 short, specific questions whose answers would most change the cost estimate or checklist for this exact goal.',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'A single, specific question about this goal.' },
          placeholder: {
            type: 'string',
            description:
              'A short example answer for this question, shown as input placeholder text, in the same language as the goal title.',
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
    goalAmount: {
      type: 'integer',
      description: 'Estimated total cost in yen for the whole goal.',
    },
    checklist: {
      type: 'array',
      description: 'Ordered steps or milestones toward the goal, roughly 2-6 items.',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          isMilestone: {
            type: 'boolean',
            description: 'True for a major checkpoint worth celebrating, false for a routine step.',
          },
        },
        required: ['label', 'isMilestone'],
      },
    },
    summary: {
      type: 'string',
      description: 'One encouraging sentence summarizing the plan, in the same language as the conversation.',
    },
  },
  required: ['goalAmount', 'checklist', 'summary'],
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

    const { goalTitle, phase, answers } = await req.json();
    if (!goalTitle || (phase !== 'questions' && phase !== 'plan')) {
      return new Response(JSON.stringify({ error: 'goalTitle and a valid phase are required.' }), {
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

    let contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    let generationConfig: Record<string, unknown>;

    if (phase === 'questions') {
      contents = [
        {
          role: 'user',
          parts: [
            {
              text: `The goal is: "${goalTitle}". What are the clarifying questions you'd ask before planning it?`,
            },
          ],
        },
      ];
      generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: QUESTIONS_SCHEMA,
      };
    } else {
      contents = [
        // The goal title as the opening turn of context, followed by each
        // question/answer pair as its own model/user turn -- mirrors how
        // this would read as a real back-and-forth, even though the
        // person actually answered them all at once in a form.
        { role: 'user', parts: [{ text: `The goal is: "${goalTitle}"` }] },
        { role: 'model', parts: [{ text: "Got it — let's plan that out." }] },
        ...(answers as Array<{ question: string; answer: string }>).flatMap(({ question, answer }) => [
          { role: 'model', parts: [{ text: question }] },
          { role: 'user', parts: [{ text: answer?.trim() ? answer : '(left blank -- use your best judgment)' }] },
        ]),
        { role: 'user', parts: [{ text: 'Please finalize the plan now based on everything discussed.' }] },
      ];
      generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: PLAN_SCHEMA,
        // Finalizing is a numeric-estimate task, not a creative one -- a
        // low temperature keeps repeated plan calls for the same answers
        // from swinging wildly on goalAmount.
        temperature: 0.3,
      };
    }

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction() }] },
        contents,
        generationConfig,
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

    // Gemini's structured-output mode guarantees valid JSON matching the
    // schema's types, not sane values -- an empty question list or a
    // malformed plan (zero/negative amount, empty checklist) would
    // otherwise flow straight into the UI unchecked.
    if (phase === 'questions') {
      const isValid = Array.isArray(parsed?.questions) && parsed.questions.length > 0;
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Gemini did not return any questions.' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ questions: parsed.questions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isValidPlan =
      Number.isFinite(parsed?.goalAmount) &&
      parsed.goalAmount > 0 &&
      Array.isArray(parsed?.checklist) &&
      parsed.checklist.length > 0;
    if (!isValidPlan) {
      return new Response(JSON.stringify({ error: 'Gemini returned an incomplete plan.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ plan: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
