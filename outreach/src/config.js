import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, "..");
export const DATA_DIR = process.env.OUTREACH_DATA_DIR || path.join(ROOT, "data");

const DEFAULTS = {
  // Who you are — used in every generated email.
  senderName: "Your Name",
  senderBusiness: "Your Studio",
  senderPitch:
    "I build and redesign websites for small businesses — fast, mobile-friendly, and built to convert visitors into customers.",
  // Email generation
  language: "English",
  tone: "warm, human, direct — like a note from a real person, not a marketing blast",
  // Optional extra instruction for how subject lines should be written, e.g.
  // "Always include the business name" or "Keep under 6 words, no punctuation."
  // Leave blank to let the model choose freely per lead.
  subjectStyle: "",
  // Voice preset (see EMAIL_STYLES in writer.js) and target length.
  emailStyle: "natural",
  emailLength: "medium",
  // Send as lightly-styled HTML instead of plain text. Off by default —
  // plain text generally reads as more human and often delivers better
  // for cold outreach.
  htmlEmails: false,
  // Only email sites whose audit score (how much the site needs work, 0-100)
  // is at or above this threshold.
  minQualityScore: 40,
  // Sending
  dailySendCap: 50,
  secondsBetweenSends: 45,
  // Follow-ups
  followupAfterDays: 4,
  maxFollowups: 2,
  // Audit
  auditTimeoutMs: 45000,
  screenshot: true,
  // Optional physical mailing address included in the unsubscribe footer.
  // Commercial email law (CAN-SPAM) requires a real postal address; leave
  // blank only if you're aware of that requirement and accept the risk.
  physicalAddress: "",
  // Warmup — gradually ramps the daily send cap instead of using
  // dailySendCap at full strength from day one, to protect sender reputation
  // on a new domain/mailbox.
  warmupEnabled: false,
  warmupStartDate: null, // ISO date, set automatically the first time warmup is enabled
  warmupStartCap: 5,
  warmupTargetCap: 50,
  warmupStepAmount: 5,
  warmupStepDays: 3,
  // Email verification — free syntax/MX/disposable-domain checks run
  // automatically before drafting to catch the addresses most likely to
  // bounce, before any AI cost is spent on them. An optional paid API key
  // (EMAIL_VERIFY_API_KEY env var, like GOOGLE_API_KEY) adds a real
  // mailbox-existence check on top.
  emailVerifyEnabled: true,
  // A/B testing — alternates two email-voice styles across a drafting batch
  // (stable per lead, so re-drafting the same lead keeps its variant) so
  // reply rates can be compared in Analytics.
  abTestEnabled: false,
  abVariantAStyle: "natural",
  abVariantBStyle: "direct",
};

// The cap actually enforced today. Ramps linearly from warmupStartCap to
// warmupTargetCap in warmupStepAmount increments every warmupStepDays days,
// starting from warmupStartDate. Falls back to the plain dailySendCap when
// warmup is off or hasn't been started yet.
export function effectiveDailyCap(config, now = Date.now()) {
  if (!config.warmupEnabled || !config.warmupStartDate) return config.dailySendCap;
  const startCap = Number(config.warmupStartCap) || 5;
  const targetCap = Number(config.warmupTargetCap) || config.dailySendCap;
  const stepAmount = Number(config.warmupStepAmount) || 5;
  const stepDays = Number(config.warmupStepDays) || 3;
  const daysElapsed = Math.floor((now - Date.parse(config.warmupStartDate)) / 86400000);
  if (daysElapsed < 0) return startCap;
  const steps = Math.floor(daysElapsed / stepDays);
  const cap = startCap + steps * stepAmount;
  return Math.max(startCap, Math.min(cap, targetCap));
}

// Stable A/B variant for a lead — same lead always gets the same variant
// across re-drafts, and the split is ~50/50 across a batch.
export function abVariantFor(leadId) {
  let hash = 0;
  for (let i = 0; i < leadId.length; i++) hash = (hash * 31 + leadId.charCodeAt(i)) | 0;
  return Math.abs(hash) % 2 === 0 ? "A" : "B";
}

export function loadConfig() {
  const file = process.env.OUTREACH_CONFIG_FILE || path.join(ROOT, "outreach.config.json");
  let user = {};
  if (fs.existsSync(file)) {
    user = JSON.parse(fs.readFileSync(file, "utf8"));
  }
  return { ...DEFAULTS, ...user };
}

export function smtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    from: SMTP_FROM || SMTP_USER,
  };
}

export function imapConfig() {
  const { IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS } = process.env;
  if (!IMAP_HOST || !IMAP_USER || !IMAP_PASS) return null;
  return {
    host: IMAP_HOST,
    port: Number(IMAP_PORT || 993),
    secure: true,
    auth: { user: IMAP_USER, pass: IMAP_PASS },
  };
}
