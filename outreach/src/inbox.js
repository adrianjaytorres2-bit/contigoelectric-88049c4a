import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { imapConfig } from "./config.js";

// Pulls unseen messages from the IMAP inbox and matches senders against
// leads we've emailed. Returns [{ lead, text, from, subject }].
export async function fetchReplies(db) {
  const cfg = imapConfig();
  if (!cfg) {
    throw new Error(
      "IMAP not configured. Set IMAP_HOST, IMAP_USER, IMAP_PASS (and optionally IMAP_PORT)."
    );
  }
  const byEmail = new Map(
    Object.values(db.leads)
      .filter((l) => l.sentAt)
      .map((l) => [l.email.toLowerCase(), l])
  );

  const client = new ImapFlow({ ...cfg, logger: false });
  const replies = [];
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    for await (const msg of client.fetch({ seen: false }, { source: true })) {
      const parsed = await simpleParser(msg.source);
      const from = (parsed.from?.value?.[0]?.address || "").toLowerCase();
      const lead = byEmail.get(from);
      if (!lead) continue;
      replies.push({
        lead,
        from,
        subject: parsed.subject || "",
        text: (parsed.text || "").trim(),
      });
      await client.messageFlagsAdd(msg.uid, ["\\Seen"], { uid: true });
    }
  } finally {
    lock.release();
    await client.logout();
  }
  return replies;
}
