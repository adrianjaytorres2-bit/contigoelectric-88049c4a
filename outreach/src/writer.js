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

function systemPrompt(config) {
  return `You are writing cold outreach emails on behalf of ${config.senderName} of ${config.senderBusiness}.
Their pitch: ${config.senderPitch}

You are given a real audit of a prospect's website: hard facts extracted from the page plus a screenshot. Critique the site like an experienced web designer would, then write ONE personalized email.

Rules for the email:
- Write in ${config.language}. Tone: ${config.tone}.
- Reference 1-2 SPECIFIC flaws you actually observed (from the facts/screenshot). Never invent flaws.
- Mention the prospect's name and company naturally.
- Keep it under 130 words. One clear, low-pressure call to action (a quick reply or a 10-minute call).
- No bullet lists, no "I hope this finds you well", no hard sell, no attachments mentioned.
- Sign off as ${config.senderName}, ${config.senderBusiness}.

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
      enum: ["interested", "maybe_later", "not_now"],
      description:
        "interested = wants to talk/asks questions; maybe_later = polite deferral, revisit later; not_now = rejection or unsubscribe.",
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
