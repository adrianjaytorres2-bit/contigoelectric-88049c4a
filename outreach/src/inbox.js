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

  // ImapFlow re-emits low-level socket problems (timeouts, resets) as an
  // 'error' event on the client, fired asynchronously outside any awaited
  // call. An EventEmitter's 'error' event with no listener is fatal to the
  // whole Node process by default — so we must always listen, even just to
  // capture it and turn it into a normal, catchable rejection instead.
  let socketError = null;
  client.on("error", (err) => {
    socketError = err;
  });

  try {
    await client.connect();
  } catch (err) {
    throw new Error(`Couldn't connect to IMAP (${cfg.host}:${cfg.port}): ${err.message}`);
  }

  const lock = await client.getMailboxLock("INBOX");
  try {
    for await (const msg of client.fetch({ seen: false }, { source: true })) {
      if (socketError) throw socketError;
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
    try {
      await client.logout();
    } catch {
      /* connection may already be dead from the same error — nothing to clean up */
    }
  }

  if (socketError) {
    const hint = socketError.code === "ETIMEOUT" ? " (timed out — check your network or the IMAP host/port in Settings)" : "";
    throw new Error(`IMAP connection dropped while checking inbox: ${socketError.message}${hint}`);
  }
  return replies;
}
