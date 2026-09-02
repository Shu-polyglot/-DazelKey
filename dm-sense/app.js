import { analyzeMessage } from "./engine.js";

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

const theirBubble = document.getElementById("theirBubble");
const theirMessageText = document.getElementById("theirMessageText");
const yourBubble = document.getElementById("yourBubble");
const yourReplyText = document.getElementById("yourReplyText");

const assistantEmpty = document.getElementById("assistantEmpty");
const assistantResult = document.getElementById("assistantResult");
const meaningText = document.getElementById("meaningText");
const vibeList = document.getElementById("vibeList");
const slangBlock = document.getElementById("slangBlock");
const slangList = document.getElementById("slangList");
const replyList = document.getElementById("replyList");

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const analysis = analyzeMessage(messageInput.value);
  if (!analysis) return;
  render(analysis);
});

function render(analysis) {
  theirMessageText.textContent = analysis.original;
  theirBubble.hidden = false;
  yourBubble.hidden = false;
  yourReplyText.textContent = "Pick a reply on the right to drop it in here";
  yourReplyText.classList.add("placeholder");

  meaningText.textContent = analysis.meaning;

  vibeList.innerHTML = "";
  for (const tag of analysis.vibe) {
    const li = document.createElement("li");
    li.className = "pill";
    li.textContent = tag;
    vibeList.appendChild(li);
  }

  slangList.innerHTML = "";
  if (analysis.slang.length) {
    slangBlock.hidden = false;
    for (const { term, meaning } of analysis.slang) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="slang-term">${term}</span> = ${meaning}`;
      slangList.appendChild(li);
    }
  } else {
    slangBlock.hidden = true;
  }

  replyList.innerHTML = "";
  for (const reply of analysis.replies) {
    replyList.appendChild(buildReplyCard(reply));
  }

  assistantEmpty.hidden = true;
  assistantResult.hidden = false;
}

function buildReplyCard(reply) {
  const card = document.createElement("div");
  card.className = "reply-card";

  const tone = document.createElement("span");
  tone.className = `reply-tone reply-tone--${reply.tone.toLowerCase()}`;
  tone.textContent = reply.tone;

  const text = document.createElement("p");
  text.className = "reply-text";
  text.textContent = reply.text;

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", () => copyReply(reply.text, copyBtn));

  card.appendChild(tone);
  card.appendChild(text);
  card.appendChild(copyBtn);
  return card;
}

async function copyReply(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }

  yourReplyText.textContent = text;
  yourReplyText.classList.remove("placeholder");

  const originalLabel = button.textContent;
  button.textContent = "Copied";
  button.classList.add("copy-btn--copied");
  clearTimeout(button._resetTimer);
  button._resetTimer = setTimeout(() => {
    button.textContent = originalLabel;
    button.classList.remove("copy-btn--copied");
  }, 1500);
}
