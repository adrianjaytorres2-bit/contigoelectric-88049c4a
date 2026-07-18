import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

const EMAIL_SCHEMA = {
  type: "object",
  properties: {
    quality_score: {
      type: "integer",
      description:
        "How badly this website needs professional work, 0 (flawless) to 100 (severely outdated/broken).",
    },
    flaws: {
      type: "array",
      items: { type: "string" },
      description: "The 2-4 most compelling, concrete flaws observed, in plain language.",
    },
    subject: { type: "string", description: "Short, curiosity-driven subject line. No clickbait." },
    body: {
      type: "string",
      description: "The full plain-text email body, ready to send. No placeholders.",
    },
  },
  required: ["quality_score", "flaws", "subject", "body"],
  additionalProperties: false,
};

function client() {
  return new Anthropic();
}

// 7 tone presets. Each is a short, concrete instruction — not just a mood word —
// so the model actually writes differently rather than reusing one voice.
export const EMAIL_STYLES = {
  natural: {
    label: "Natural & Human (recommended)",
    instruction:
      "Write like a real person dashing off a genuine note between calls — plainspoken, a little imperfect, not polished marketing copy.",
  },
  casual: {
    label: "Casual & Friendly",
    instruction:
      "Write casually, like texting a friendly acquaintance — relaxed, first-name energy, contractions everywhere, maybe one light aside.",
  },
  professional: {
    label: "Professional & Polished",
    instruction:
      "Write in a professional but still warm register — respectful, clean, business-appropriate, the way a competent consultant emails a prospect.",
  },
  direct: {
    label: "Direct & No-Fluff",
    instruction:
      "Be blunt and efficient. Skip pleasantries and scene-setting — open on the observation, make the point, ask the question. Shorter sentences.",
  },
  story: {
    label: "Story-Driven Opener",
    instruction:
      "Open with a brief, concrete observation or mini-scene (what you saw when you pulled up their site) before pivoting to the point — like an anecdote, not a pitch.",
  },
  witty: {
    label: "Witty & Light Humor",
    instruction:
      "Allow one genuinely light, dry, or self-aware touch of humor — never a pun, never at the prospect's expense, and never forced. If nothing funny fits naturally, skip it rather than force it.",
  },
  consultative: {
    label: "Warm & Consultative",
    instruction:
      "Write like a trusted advisor who wants them to succeed regardless of whether they hire you — empathetic, focused on their outcome, low-pressure.",
  },
};

export const EMAIL_LENGTHS = {
  short: { label: "Short (~60–80 words)", target: "60-80 words. One flaw, one sentence of value, one CTA. No wasted words." },
  medium: { label: "Medium (~120–150 words)", target: "120-150 words — enough room for one specific flaw and a touch of context." },
  long: { label: "Longer (~180–220 words)", target: "180-220 words — room for 2 flaws and a bit more of a case, but still tight, no padding." },
};

// Baked in regardless of style: the specific tells that make outreach emails
// read as AI-written, which readers now recognize and instinctively distrust.
const ANTI_AI_TELLS = `Avoid the writing patterns that make emails read as AI-generated:
- No em dashes (—). Use a period, comma, or parentheses instead.
- No "it's not just X, it's Y" or other rule-of-three contrast constructions.
- No stock AI openers/fillers: "I hope this finds you well", "I wanted to reach out", "In today's digital age", "I noticed that", "I came across", used as a generic opener.
- No corporate buzzwords: "game-changer", "unlock", "seamless", "elevate", "leverage", "dive in", "circle back".
- Vary sentence length naturally — don't make every sentence the same tidy medium length. Contractions are good.
- No perfectly symmetrical three-item lists.`;

function systemPrompt(config) {
  const style = EMAIL_STYLES[config.emailStyle] || EMAIL_STYLES.natural;
  const length = EMAIL_LENGTHS[config.emailLength] || EMAIL_LENGTHS.medium;
  return `You are writing cold outreach emails on behalf of ${config.senderName} of ${config.senderBusiness}.
Their pitch: ${config.senderPitch}

You are given a real audit of a prospect's website: hard facts extracted from the page plus a screenshot. Critique the site like an experienced web designer would, then write ONE personalized email.

Voice: ${style.instruction}
Language: ${config.language}.
Length: ${length.target}

Rules for the email:
- Reference 1-2 SPECIFIC flaws you actually observed (from the facts/screenshot). Never invent flaws.
- Mention the prospect's name and company naturally.
- One clear, low-pressure call to action (a quick reply or a short call).
- No bullet lists, no hard sell, no attachments mentioned.
- Sign off as ${config.senderName}, ${config.senderBusiness}.
${config.subjectStyle ? `- Subject line requirement: ${config.subjectStyle}` : ""}

${ANTI_AI_TELLS}

Also score how much the site needs work (quality_score) so low-value prospects can be filtered out.`;
}

export async function draftEmail(lead, config) {
  const content = [];
  if (lead.audit?.screenshotPath && fs.existsSync(lead.audit.screenshotPath)) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: fs.readFileSync(lead.audit.screenshotPath).toString("base64"),
      },
    });
  }
  content.push({
    type: "text",
    text:
      `Prospect:\n${JSON.stringify(
        {
          name: lead.name,
          company: lead.company,
          website: lead.website,
          industry: lead.industry || "unknown",
        },
        null,
        2
      )}\n\nWebsite audit facts:\n${JSON.stringify(lead.audit.facts, null, 2)}` +
      (lead.languageOverride ? `\n\nWrite this email in ${lead.languageOverride}.` : ""),
  });

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: systemPrompt(config),
    output_config: { format: { type: "json_schema", schema: EMAIL_SCHEMA } },
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text);
}

const FOLLOWUP_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
  },
  required: ["subject", "body"],
  additionalProperties: false,
};

export async function draftFollowup(lead, config, followupNumber) {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: systemPrompt(config),
    output_config: { format: { type: "json_schema", schema: FOLLOWUP_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `Write follow-up #${followupNumber} (of max ${config.maxFollowups}) to this prospect who hasn't replied. ` +
          `Keep it to 2-3 sentences, reference the original email briefly, add one small new angle, stay friendly and easy to say no to. ` +
          `Reuse the original subject with "Re: " prefix unless a better one is obvious.\n\n` +
          `Prospect: ${lead.name} at ${lead.company}\n` +
          `Original email sent ${lead.sentAt}:\nSubject: ${lead.draft.subject}\n\n${lead.draft.body}`,
      },
    ],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text);
}

const INTENT_SCHEMA = {
  type: "object",
  properties: {
    intent: {
      type: "string",
      enum: ["interested", "maybe_later", "not_now", "unsubscribe"],
      description:
        "interested = wants to talk/asks questions; maybe_later = polite deferral, revisit later; not_now = rejection but no explicit opt-out request; unsubscribe = explicitly asks to be removed/stop emailing/opt out.",
    },
    summary: { type: "string", description: "One-sentence summary of the reply." },
  },
  required: ["intent", "summary"],
  additionalProperties: false,
};

export async function classifyReply(lead, replyText) {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 512,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: INTENT_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `Classify the intent of this reply to a cold outreach email.\n\n` +
          `We emailed ${lead.name} at ${lead.company} about improving their website.\n` +
          `Their reply:\n---\n${replyText.slice(0, 4000)}\n---`,
      },
    ],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text);
}
