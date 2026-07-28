import nodemailer from "nodemailer";
import { smtpConfig } from "./config.js";

export function transport() {
  const cfg = smtpConfig();
  if (!cfg) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_PORT, SMTP_FROM)."
    );
  }
  return {
    from: cfg.from,
    mailer: nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
    }),
  };
}

// Wraps plain-text body into clean, minimal HTML — proper paragraph spacing
// and a lightly styled sign-off, not a "designed" template. Cold email
// deliverability is generally better with plain text (it reads as a real
// person, not a mailer), so this is opt-in, not the default.
export function toHtmlEmail(body, senderName) {
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const nameEsc = senderName ? esc(senderName) : "";
  const html = paragraphs
    .map((p, i) => {
      // Bold the final sign-off paragraph if it starts with the sender's name.
      if (nameEsc && i === paragraphs.length - 1 && p.startsWith(senderName)) {
        return `<p style="margin:0 0 4px;font-weight:600;">${esc(p).replace(/\n/g, "<br>")}</p>`;
      }
      return `<p style="margin:0 0 14px;">${esc(p).replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  return `<div style="font-family:Georgia,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;">
${html}
</div>`;
}

// Every send appends this — not left to the AI draft — so it's always present
// regardless of edits. Commercial email law (e.g. CAN-SPAM) requires a clear
// opt-out and, for a fully compliant footer, a real postal address.
export function appendUnsubscribeFooter(body, config) {
  const lines = [
    "",
    "---",
    'Don\'t want future emails? Reply "unsubscribe" and you\'ll be removed immediately.',
  ];
  if (config.physicalAddress) lines.push(config.physicalAddress);
  return body.replace(/\s+$/, "") + "\n\n" + lines.join("\n").trim();
}

export async function sendEmail(t, { to, subject, body, inReplyTo, html }) {
  const info = await t.mailer.sendMail({
    from: t.from,
    to,
    subject,
    text: body,
    ...(html ? { html } : {}),
    ...(inReplyTo ? { inReplyTo, references: inReplyTo } : {}),
  });
  return info.messageId;
}

// Server/connection-level failures that affect EVERY send, not one lead —
// retrying the rest of the batch just hammers the server and can trigger
// IP-based rate limiting, so callers should abort the whole run.
export function isConnectionError(message = "") {
  return /535|invalid login|authentication|EAUTH|421|ECONNECTION|ENOTFOUND|ETIMEDOUT/i.test(message);
}

// Per-recipient rejections. Split deliberately into two levels:
//
//  - isHardBounce: the send was refused for this recipient. Safe to stop
//    follow-ups over, but NOT safe to permanently suppress on, because a bare
//    550 is also what many servers return for spam-filter blocks and
//    greylisting — a real, reachable prospect can produce one.
//  - isUnknownMailbox: the server explicitly said the mailbox doesn't exist.
//    Unambiguous, so it's safe to permanently suppress the address.
export function isHardBounce(message = "") {
  // Auth failures carry 5.x.x codes too ("535 5.7.8 Authentication ...").
  // Exclude them explicitly so this predicate is correct on its own rather
  // than only when callers happen to test isConnectionError first.
  if (isConnectionError(message)) return false;
  return /\b(550|551|552|553|554)\b|5\.[157]\.\d|rejected|blocked|denied|undeliverable|unavailable/i.test(message);
}

export function isUnknownMailbox(message = "") {
  return /5\.1\.[123]|user unknown|no such user|no such recipient|does not exist|doesn'?t exist|unknown recipient|invalid recipient|recipient not found|mailbox not found|address rejected/i.test(
    message
  );
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function sentToday(db) {
  const today = new Date().toISOString().slice(0, 10);
  return Object.values(db.leads).filter(
    (l) =>
      (l.sentAt && l.sentAt.startsWith(today)) ||
      (l.followups || []).some((f) => f.sentAt && f.sentAt.startsWith(today))
  ).length;
}
