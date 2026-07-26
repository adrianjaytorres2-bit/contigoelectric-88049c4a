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
      (lead.manualFlaws
        ? `\n\nIMPORTANT — a human reviewed this site themselves and identified these specific issue(s). These are confirmed real and take priority over anything else you notice; base the email primarily on these rather than picking your own angle:\n${lead.manualFlaws}`
        : "") +
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

const INSERT_FINDING_SCHEMA = {
  type: "object",
  properties: {
    body: {
      type: "string",
      description: "The full updated email body, ready to send. No placeholders.",
    },
  },
  required: ["body"],
  additionalProperties: false,
};

// Weaves something the sender found AFTER the fact (a review, a note about
// the business, anything relevant) into an already-drafted email — a small,
// targeted edit, not a full rewrite. Everything else in the email stays as
// close to untouched as possible; only what's needed to fit the addition in
// naturally changes.
export async function insertFinding(lead, rawFinding, config) {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 1536,
    thinking: { type: "adaptive" },
    system: `You are editing an already-written cold outreach email on behalf of ${config.senderName} of ${config.senderBusiness}, in this voice: ${EMAIL_STYLES[config.emailStyle]?.instruction || EMAIL_STYLES.natural.instruction}

The sender found something new after the email was drafted and wants it woven in. Your job:
- Summarize the raw finding into one concise, natural sentence or short addition (no bullet points, no "Also, I noticed" filler — write it like it always belonged there).
- Insert it wherever it reads best (often right after the opening observation, or wherever it fits the existing flow).
- Change nothing else about the email — same wording, same structure, same sign-off — except what's minimally needed to make the addition read naturally.
- Never invent details beyond what the finding actually says.

${ANTI_AI_TELLS}`,
    output_config: { format: { type: "json_schema", schema: INSERT_FINDING_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `Current email body:\n---\n${lead.draft.body}\n---\n\n` +
          `Something the sender found and wants added:\n---\n${rawFinding}\n---`,
      },
    ],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text).body;
}

const NO_WEBSITE_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", description: "Short, curiosity-driven subject line. No clickbait." },
    body: {
      type: "string",
      description: "The full plain-text email body, ready to send. No placeholders.",
    },
  },
  required: ["subject", "body"],
  additionalProperties: false,
};

// For leads found with no website at all (Find Leads' "include leads with
// no website" option) — no site to audit, so no screenshot/flaws. The pitch
// itself is the strongest possible one for a web-design business: they have
// no online presence at all. Never invent a website critique.
export async function draftNoWebsiteEmail(lead, config) {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 1536,
    thinking: { type: "adaptive" },
    system: `${systemPrompt(config)}

Special case: this prospect has NO WEBSITE AT ALL — there is nothing to audit and no site-specific flaw to reference. Do not pretend to have looked at a website or invent any detail about one. Instead, the pitch is simply that a business with no online presence is losing customers who search for, compare, or try to verify a business online before calling or visiting — and you can build them one from scratch. Keep it low-pressure and specific to their type of business, not generic.`,
    output_config: { format: { type: "json_schema", schema: NO_WEBSITE_SCHEMA } },
    messages: [
      {
        role: "user",
        content: `Prospect:\n${JSON.stringify(
          {
            name: lead.name,
            company: lead.company,
            industry: lead.industry || "unknown",
            phone: lead.phone || null,
          },
          null,
          2
        )}${lead.languageOverride ? `\n\nWrite this email in ${lead.languageOverride}.` : ""}`,
      },
    ],
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

const FB_DM_SCHEMA = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description:
        "A short Facebook Messenger DM, ready to paste and send as-is. No subject line, no email formatting.",
    },
  },
  required: ["message"],
  additionalProperties: false,
};

// Facebook DMs are read completely differently from email: shorter, more
// casual, no signature block, and it has to survive appearing in a stranger's
// "Message Requests" folder — so it opens with something unmistakably
// specific to them, fast.
export async function draftFbDm(lead, config) {
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
        { name: lead.name, company: lead.company, website: lead.website },
        null,
        2
      )}\n\nWebsite audit facts:\n${JSON.stringify(lead.audit?.facts || {}, null, 2)}`,
  });

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: `You are writing a Facebook Messenger DM on behalf of ${config.senderName} of ${config.senderBusiness}, sent from a personal account directly to this business's Facebook Page.
Their pitch: ${config.senderPitch}

This is a Messenger DM to someone who doesn't know you, so it lands in their "Message Requests" folder — it has to read as an obviously real, specific, human message or it gets ignored/deleted in a second.

Rules:
- 2-4 sentences max. Under 60 words.
- Open with the one specific, real flaw you saw on their website (from the audit facts) — no greeting fluff first.
- Casual Messenger tone: like a text, not an email. Contractions, no "Dear", no sign-off, no "Best regards".
- One soft, low-pressure question or ask at the end (e.g. "want me to send a quick example?").
- Never invent flaws not in the audit facts.

${ANTI_AI_TELLS}`,
    output_config: { format: { type: "json_schema", schema: FB_DM_SCHEMA } },
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text).message;
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
