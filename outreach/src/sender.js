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

export async function sendEmail(t, { to, subject, body, inReplyTo }) {
  const info = await t.mailer.sendMail({
    from: t.from,
    to,
    subject,
    text: body,
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
