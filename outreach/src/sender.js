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
