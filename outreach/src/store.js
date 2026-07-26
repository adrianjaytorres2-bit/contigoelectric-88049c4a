import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR } from "./config.js";

const DB_FILE = path.join(DATA_DIR, "db.json");

function empty() {
  return { leads: {}, suppressed: {}, meta: { createdAt: new Date().toISOString() } };
}

export function load() {
  if (!fs.existsSync(DB_FILE)) return empty();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  if (!db.suppressed) db.suppressed = {}; // upgrade older data files
  return db;
}

export function save(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function leadId(email, website, phone) {
  // Phone-only leads (no website, from Find Leads' "include no website"
  // option) have no email/website to hash — fall back to the phone number
  // so two different phone-only businesses don't collide onto the same ID
  // (the plain email+website hash below would be identical for both: "|").
  if (!email && !website && phone) {
    return crypto
      .createHash("sha1")
      .update(`phone|${String(phone).replace(/\D/g, "")}`)
      .digest("hex")
      .slice(0, 12);
  }
  return crypto
    .createHash("sha1")
    .update(`${(email || "").toLowerCase()}|${normalizeUrl(website)}`)
    .digest("hex")
    .slice(0, 12);
}

export function normalizeUrl(url) {
  if (!url) return "";
  let u = url.trim().toLowerCase();
  if (!/^https?:\/\//.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    return parsed.origin + parsed.pathname.replace(/\/$/, "");
  } catch {
    return u;
  }
}

// Lead lifecycle:
// new -> audited -> drafted -> sent -> (replied | followup_1..N | closed)
export const STATUS = {
  NEW: "new",
  AUDITED: "audited",
  SKIPPED: "skipped", // below quality threshold or broken site
  DRAFTED: "drafted",
  SENT: "sent",
  REPLIED: "replied",
  CLOSED: "closed",
};

export function leadsByStatus(db, status) {
  return Object.values(db.leads).filter((l) => l.status === status);
}

// ---------- suppression (permanent do-not-email list) ----------
// Separate from per-lead `status` — suppression survives re-imports, re-runs
// findleads, and manual re-adds, so an unsubscribed address never gets
// emailed again by this tool no matter how it re-enters the lead list.

export function isSuppressed(db, email) {
  return !!db.suppressed?.[(email || "").toLowerCase()];
}

export function suppress(db, email, reason = "manual") {
  if (!email) return;
  db.suppressed[email.toLowerCase()] = { addedAt: new Date().toISOString(), reason };
}

export function unsuppress(db, email) {
  if (!email) return;
  delete db.suppressed[email.toLowerCase()];
}

// ---------- company-level dedupe ----------
// Loose match: lowercase, strip common suffixes (LLC, Inc, Co, Corp...) and
// punctuation, so "Bob's Plumbing, LLC" and "Bob's Plumbing Inc." collide.

export function normalizeCompany(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[.,'’]/g, "")
    .replace(/\b(llc|inc|co|corp|corporation|ltd|company)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findByCompany(db, company) {
  const norm = normalizeCompany(company);
  if (!norm) return null;
  return Object.values(db.leads).find((l) => normalizeCompany(l.company) === norm) || null;
}
