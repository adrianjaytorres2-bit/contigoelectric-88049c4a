import dns from "node:dns/promises";

// Free, no-API checks — syntax, domain has mail servers at all, and known
// junk patterns. These catch the most common causes of bounces from scraped
// contact-page addresses: typo'd domains, dead/parked domains, throwaway
// inboxes, and auto-generated addresses that were never meant to receive
// mail from a human. Role addresses like info@/contact@/sales@ are NOT
// filtered — those are normal, actively-read inboxes for small businesses,
// exactly the kind of address lead-gen scraping is supposed to find.

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Addresses that are never a real outreach target — auto-generated or
// bounce-handling mailboxes, not a person or business inbox.
const AUTO_GENERATED_RE = /^(no-?reply|do-?not-?reply|mailer-daemon|bounces?|postmaster)$/i;

// A short, maintainable list of the most common disposable/throwaway email
// domains. Not exhaustive — the point is catching the handful that show up
// constantly, not building an ever-growing blocklist.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "temp-mail.org",
  "tempmail.com", "throwawaymail.com", "yopmail.com", "getnada.com",
  "trashmail.com", "fakeinbox.com", "sharklasers.com", "dispostable.com",
  "maildrop.cc", "mintemail.com", "mailnesia.com", "mytemp.email",
]);

const mxCache = new Map(); // domain -> boolean, avoids repeat DNS lookups in a batch

async function domainHasMx(domain) {
  if (mxCache.has(domain)) return mxCache.get(domain);
  let ok = false;
  try {
    const records = await dns.resolveMx(domain);
    ok = Array.isArray(records) && records.length > 0;
  } catch {
    ok = false; // NXDOMAIN, no MX record, timeout, etc. — all treated as unreachable
  }
  mxCache.set(domain, ok);
  return ok;
}

// Free checks only — synchronous-ish (one DNS lookup, cached per domain).
// Returns { ok, reason } — reason is set only when ok is false.
export async function checkEmailFree(email) {
  const e = (email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return { ok: false, reason: "invalid email format" };

  const [local, domain] = e.split("@");
  if (AUTO_GENERATED_RE.test(local)) return { ok: false, reason: "auto-generated address (no-reply/bounce)" };
  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, reason: "disposable/throwaway email domain" };

  const hasMx = await domainHasMx(domain);
  if (!hasMx) return { ok: false, reason: `domain "${domain}" has no mail server (likely a typo or dead domain)` };

  return { ok: true, reason: null };
}

// Optional paid deep verification via AbstractAPI's email validation
// endpoint — a real mailbox-existence check run from their infrastructure,
// not ours, so repeated checks never put our own sending IP's reputation at
// risk (unlike probing recipients' mail servers directly). Off by default;
// only runs when the free checks already passed and an API key is set.
export async function checkEmailApi(email, apiKey) {
  try {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);
    if (!res.ok) return { ok: true, reason: null, unknown: true }; // fail open — don't block leads on an API hiccup
    const data = await res.json();
    const deliverability = (data.deliverability || "UNKNOWN").toUpperCase();
    if (deliverability === "UNDELIVERABLE") return { ok: false, reason: "mailbox doesn't exist (verified)" };
    if (deliverability === "RISKY") return { ok: true, reason: "risky (catch-all or unconfirmed) — sent anyway", risky: true };
    return { ok: true, reason: null };
  } catch {
    return { ok: true, reason: null, unknown: true }; // network error — fail open
  }
}

// Combined check honoring config: free checks always run (unless disabled),
// paid API check only runs when the free checks pass and a key is present.
// The API key comes from EMAIL_VERIFY_API_KEY (same env-var pattern as
// GOOGLE_API_KEY) rather than the plaintext engine config file.
export async function verifyEmail(email, config = {}) {
  if (config.emailVerifyEnabled === false) return { status: "skipped", reason: null };

  const free = await checkEmailFree(email);
  if (!free.ok) return { status: "invalid", reason: free.reason };

  const apiKey = process.env.EMAIL_VERIFY_API_KEY;
  if (apiKey) {
    const api = await checkEmailApi(email, apiKey);
    if (!api.ok) return { status: "invalid", reason: api.reason };
    if (api.risky) return { status: "risky", reason: api.reason };
    if (api.unknown) return { status: "valid", reason: "checked (free only — API unavailable)" };
    return { status: "valid", reason: "checked (deep verification)" };
  }

  return { status: "valid", reason: "checked (free only)" };
}
