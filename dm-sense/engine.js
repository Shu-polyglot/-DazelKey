// DM Sense analysis engine.
//
// Pure, DOM-free logic: takes raw message text in, returns a structured
// analysis out. No UI code and no network calls live here on purpose --
// this is the piece a future browser extension's content script could
// import as-is and run against text scraped from a real DM thread.

export const SLANG_DICTIONARY = {
  ppl: "people",
  ngl: "not gonna lie",
  tbh: "to be honest",
  imo: "in my opinion",
  imho: "in my humble opinion",
  lol: "laughing out loud",
  lmao: "laughing my ass off",
  omg: "oh my god",
  idk: "I don't know",
  idc: "I don't care",
  smh: "shaking my head",
  fr: "for real",
  ikr: "I know, right",
  wyd: "what are you doing",
  wya: "where are you at",
  hmu: "hit me up",
  brb: "be right back",
  btw: "by the way",
  nvm: "never mind",
  rn: "right now",
  tbf: "to be fair",
  af: "very / as f***",
  gonna: "going to",
  wanna: "want to",
  gotta: "got to",
  kinda: "kind of",
  sorta: "sort of",
  lowkey: "a little / secretly",
  highkey: "very openly",
  deadass: "seriously",
  bet: "okay / for sure",
  bestie: "close friend",
  bruh: "casual exclamation (like \"dude\")",
  yall: "you all",
  ur: "your / you're",
  pls: "please",
  plz: "please",
  thx: "thanks",
  ty: "thank you",
  hbu: "how about you",
  wbu: "what about you",
  jk: "just kidding",
  fyi: "for your information",
};

// Ordered pattern rules. First match wins. Each rule captures a common
// DM "shape" and supplies a hand-tuned meaning + vibe + reply set, since
// that reads far more natural than anything a generic templating pass
// could produce.
const RULES = [
  {
    test: /compar(e|ing|ed)\s+(me|us)\s+to/i,
    meaning: "正直、みんな私のこと彼女と比べるんだよね",
    vibe: ["Casual", "Friendly", "Candid"],
    replies: [
      { tone: "Natural", text: "well your parents have good taste then haha" },
      { tone: "Playful", text: "now I kinda wanna see the resemblance" },
      { tone: "Flirty", text: "guess I'll have to decide for myself haha" },
    ],
  },
  {
    test: /\b(u|you)\s*up\b/i,
    meaning: "「起きてる?」っていう確認だけど、この時間だと「今から会えない?」の意味合いもある",
    vibe: ["Flirty", "Late-night", "Direct"],
    replies: [
      { tone: "Natural", text: "yeah what's up" },
      { tone: "Playful", text: "depends who's asking 👀" },
      { tone: "Flirty", text: "for you? always" },
    ],
  },
  {
    test: /\bwyd\b|what are you doing/i,
    meaning: "「今何してる?」っていう軽い確認、話しかけるきっかけ探り",
    vibe: ["Casual", "Curious", "Low-key interested"],
    replies: [
      { tone: "Natural", text: "nothing much, you?" },
      { tone: "Playful", text: "thinking about you actually" },
      { tone: "Flirty", text: "wishing you were here ngl" },
    ],
  },
  {
    test: /\bmiss (you|u)\b/i,
    meaning: "君のこと恋しい、会いたいなっていう素直な気持ち",
    vibe: ["Sincere", "Affectionate", "Vulnerable"],
    replies: [
      { tone: "Natural", text: "miss you too" },
      { tone: "Playful", text: "did you now 👀" },
      { tone: "Flirty", text: "come prove it then" },
    ],
  },
  {
    test: /\b(so|really|kinda)?\s*(pretty|cute|hot|gorgeous|beautiful)\b/i,
    meaning: "「可愛い/綺麗だね」っていう素直な褒め言葉",
    vibe: ["Complimentary", "Sincere", "Bold"],
    replies: [
      { tone: "Natural", text: "aw thank you, that's sweet" },
      { tone: "Playful", text: "I know 😌 jk, thank you" },
      { tone: "Flirty", text: "keep talking like that and I might blush" },
    ],
  },
  {
    test: /\b(weird|annoying|dumb|crazy)\b.*\b(lol|lmao|haha)?\b/i,
    meaning: "からかい半分で「変なやつ」「うざい(笑)」って言ってる、実は好意的なニュアンス",
    vibe: ["Teasing", "Playful", "Affectionate"],
    replies: [
      { tone: "Natural", text: "takes one to know one" },
      { tone: "Playful", text: "weird is my whole personality" },
      { tone: "Flirty", text: "you love it though" },
    ],
  },
  {
    test: /\b(hang out|grab (food|coffee|drinks)|come over|wanna (meet|hang))\b/i,
    meaning: "遊びに行かない?/ご飯行かない?っていう誘い",
    vibe: ["Inviting", "Casual", "Interested"],
    replies: [
      { tone: "Natural", text: "yeah I'm down, when?" },
      { tone: "Playful", text: "only if you're buying" },
      { tone: "Flirty", text: "as long as it ends with you" },
    ],
  },
  {
    test: /who('?s| is) that (guy|girl|boy)/i,
    meaning: "ストーリーとかに写ってる人が誰か軽く探りを入れてる、ちょっとヤキモチっぽい",
    vibe: ["Curious", "Slightly jealous", "Playful"],
    replies: [
      { tone: "Natural", text: "just a friend, why?" },
      { tone: "Playful", text: "jealous? 👀" },
      { tone: "Flirty", text: "aww were you checking up on me" },
    ],
  },
  {
    test: /sorry.*(busy|been (so )?slow|late reply)/i,
    meaning: "最近忙しくて連絡できてなくてごめんね、っていう軽い謝罪",
    vibe: ["Apologetic", "Reassuring", "Casual"],
    replies: [
      { tone: "Natural", text: "no worries, life happens" },
      { tone: "Playful", text: "you're forgiven... this time" },
      { tone: "Flirty", text: "make it up to me with a date then" },
    ],
  },
];

function findSlang(text) {
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  const seen = new Set();
  const hits = [];
  for (const word of words) {
    if (SLANG_DICTIONARY[word] && !seen.has(word)) {
      seen.add(word);
      hits.push({ term: word, meaning: SLANG_DICTIONARY[word] });
    }
  }
  return hits;
}

function inferVibe(text) {
  const vibe = new Set();
  if (/[!]{1,}/.test(text)) vibe.add("Enthusiastic");
  if (/\?/.test(text)) vibe.add("Curious");
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)) vibe.add("Playful");
  if (text === text.toLowerCase() && /[a-z]/.test(text)) vibe.add("Casual");
  if (vibe.size === 0) {
    vibe.add("Casual");
    vibe.add("Friendly");
  }
  return Array.from(vibe).slice(0, 4);
}

function fallbackAnalysis(text, slang) {
  const expandedNote = slang.length
    ? `くだけた表現(${slang.map((s) => s.term).join(", ")})を使った、フランクでリラックスした感じのメッセージ`
    : "フランクでリラックスした感じのメッセージ";

  return {
    meaning: `はっきり訳しきれない部分もあるけど、ニュアンスとしては: ${expandedNote}`,
    vibe: inferVibe(text),
    replies: [
      { tone: "Natural", text: "haha true, I get that" },
      { tone: "Playful", text: "okay now I'm curious 👀" },
      { tone: "Flirty", text: "careful, I might just show up then 😏" },
    ],
  };
}

/**
 * Analyze a single received DM and return everything the assistant panel
 * needs to render: meaning, vibe tags, slang glossary, and ready-to-send
 * replies grouped by tone.
 */
export function analyzeMessage(rawText) {
  const text = (rawText || "").trim();
  if (!text) return null;

  const slang = findSlang(text);
  const rule = RULES.find((r) => r.test.test(text));
  const base = rule ? rule : fallbackAnalysis(text, slang);

  return {
    original: text,
    meaning: base.meaning,
    vibe: base.vibe,
    slang,
    replies: base.replies,
  };
}
