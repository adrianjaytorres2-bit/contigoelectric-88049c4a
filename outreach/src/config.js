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
};

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
