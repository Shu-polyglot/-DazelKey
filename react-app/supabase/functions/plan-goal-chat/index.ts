// Realize's "🪄 Ask AI" goal-planning chat -- called from
// src/components/Strategy/GoalPlanChat.jsx via supabase.functions.invoke.
//
// Runs server-side (not in the browser) for one reason: the Gemini API
// key has to stay a secret, and anything shipped to the browser bundle
// is public by definition. This function reads GEMINI_API_KEY from its
// own environment (set as an Edge Function secret in the Supabase
// dashboard -- never committed, never sent to the client) and is the
// only thing that ever calls Gemini directly.
//
// Two modes, chosen by the request body's `finalize` flag:
//  - false (default): an ordinary back-and-forth chat turn. Takes the
//    conversation so far and returns Gemini's next free-text reply, so
//    the person can talk through their goal before committing to a plan.
//  - true: the person is done talking and wants the actual plan. Same
//    conversation history, but this call asks Gemini for a JSON object
//    matching PLAN_SCHEMA instead of prose -- see GoalPlanChat's own
//    comment for how that maps onto a Realize goal's doingGoalAmount/
//    doingChecklist fields.
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

const SYSTEM_INSTRUCTION = `You are the goal-planning assistant inside DazelKey, an app where people track
"Realize" goals -- Bucket List items with a total cost in yen and an
optional checklist of steps/milestones toward it.

Talk with the person about the specific goal they named. Help them think
through what it will actually cost and what steps get them there. Keep
replies short (a few sentences) and conversational -- this is a chat,
not an essay. Ask at most one question at a time. Be encouraging but
realistic: if a goal sounds likely to cause burnout or feels too vague
to plan, say so gently and suggest breaking it down further.

Respond in the same language the person is writing in.`;

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

    const { goalTitle, messages, finalize } = await req.json();
    if (!goalTitle || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'goalTitle and messages are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contents = [
      // The goal title as the opening turn of context -- not shown in
      // the visible chat history itself (see GoalPlanChat), just what
      // grounds every reply in the specific thing being planned.
      { role: 'user', parts: [{ text: `The goal is: "${goalTitle}"` }] },
      { role: 'model', parts: [{ text: "Got it — let's plan that out." }] },
      ...messages.map((message: { role: string; content: string }) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
    ];

    if (finalize) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Please finalize the plan now based on everything discussed.' }],
      });
    }

    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
    };
    if (finalize) {
      body.generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: PLAN_SCHEMA,
      };
    }

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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

    if (finalize) {
      const plan = JSON.parse(text);
      return new Response(JSON.stringify({ plan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
