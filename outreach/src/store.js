import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR } from "./config.js";

const DB_FILE = path.join(DATA_DIR, "db.json");

function empty() {
  return { leads: {}, meta: { createdAt: new Date().toISOString() } };
}

export function load() {
  if (!fs.existsSync(DB_FILE)) return empty();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

export function save(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function leadId(email, website) {
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
