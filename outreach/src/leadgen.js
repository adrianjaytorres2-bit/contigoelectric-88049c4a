// Free lead generation via OpenStreetMap — no API key required.
// Nominatim geocodes the location to a bounding box; Overpass finds businesses
// of the requested type within it; then we optionally scan each business's
// website for a public contact email. All endpoints are free and keyless, but
// ask for a descriptive User-Agent and light rate limiting.

import Anthropic from "@anthropic-ai/sdk";

const UA = "AT-DEV-GROUP-Outreach/0.1 (self-hosted outreach tool)";
const TAG_MODEL = "claude-haiku-4-5"; // cheap: just maps a phrase to OSM tags

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    location
  )}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Location lookup failed (HTTP ${res.status}).`);
  const data = await res.json();
  if (!data.length) throw new Error(`Couldn't find location "${location}". Try "City, State".`);
  const b = data[0].boundingbox.map(Number); // [south, north, west, east]
  return { south: b[0], north: b[1], west: b[2], east: b[3], display: data[0].display_name };
}

// Heuristic fallback: stem the term and match it against the common business
// classification tags. Used only when the AI tag-mapper is unavailable.
function expandTerm(term) {
  const t = term.toLowerCase().replace(/[\\"\n]/g, "").trim();
  const variants = new Set([t]);
  const stem = t.replace(/(ing|ers|er|s)$/, "");
  if (stem.length >= 4) variants.add(stem);
  return [...variants].map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

const TAG_SCHEMA = {
  type: "object",
  properties: {
    filters: {
      type: "array",
      description:
        "OpenStreetMap tag filters that identify this business type. Include every reasonable key/value.",
      items: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "OSM key: shop, craft, amenity, office, healthcare, leisure, or tourism",
          },
          value: { type: "string", description: "OSM value, e.g. pet_grooming, plumber, restaurant" },
        },
        required: ["key", "value"],
        additionalProperties: false,
      },
    },
    name_keywords: {
      type: "array",
      items: { type: "string" },
      description: "Lowercase words likely to appear in such a business's name (for a name fallback match).",
    },
  },
  required: ["filters", "name_keywords"],
  additionalProperties: false,
};

// Ask Claude to translate any plain-English business type into OSM tag filters.
// Works for anything — plumbers, electricians, dog groomers, med spas — without
// a hardcoded list. Falls back to the stem heuristic if no API key / on error.
async function osmSpecFor(term) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("no api key");
    const client = new Anthropic();
    const res = await client.messages.create({
      model: TAG_MODEL,
      max_tokens: 400,
      output_config: { format: { type: "json_schema", schema: TAG_SCHEMA } },
      messages: [
        {
          role: "user",
          content:
            `Map this business type to OpenStreetMap tags for a search: "${term}".\n` +
            `Return the OSM tag filters that identify these businesses (e.g. a plumber is craft=plumber; ` +
            `a dog groomer is shop=pet_grooming; a dentist is amenity=dentist and healthcare=dentist; ` +
            `an electrician is craft=electrician), plus lowercase keywords likely in their business names. ` +
            `Include all reasonable values so the search has good recall.`,
        },
      ],
    });
    const block = res.content.find((b) => b.type === "text");
    const spec = JSON.parse(block.text);
    if (Array.isArray(spec.filters) && (spec.filters.length || spec.name_keywords?.length)) return spec;
  } catch {
    /* fall through to heuristic */
  }
  // Heuristic fallback — match stems against the classification tags + name.
  const stems = expandTerm(term);
  return {
    filters: ["craft", "shop", "office", "amenity"].flatMap((key) =>
      stems.map((v) => ({ key, value: v, regex: true }))
    ),
    name_keywords: stems,
  };
}

function overpassFromSpec(spec, box, limit) {
  const bbox = `${box.south},${box.west},${box.north},${box.east}`;
  const lines = [];
  for (const f of spec.filters || []) {
    const key = String(f.key || "").replace(/[^a-z_:]/gi, "");
    const value = String(f.value || "").replace(/[\\"\n]/g, "");
    if (!key || !value) continue;
    // exact match for AI-supplied tags; regex for the heuristic fallback stems
    lines.push(f.regex ? `  nwr["${key}"~"${value}",i](${bbox});` : `  nwr["${key}"="${value}"](${bbox});`);
  }
  const kws = (spec.name_keywords || [])
    .map((s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);
  if (kws.length) lines.push(`  nwr["name"~"${kws.join("|")}",i](${bbox});`);
  if (!lines.length) lines.push(`  nwr["shop"](${bbox});`);
  return `[out:json][timeout:90];\n(\n${lines.join("\n")}\n);\nout center tags ${limit};`;
}

async function overpass(query) {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Business search failed (Overpass HTTP ${res.status}).`);
  const data = await res.json();
  return data.elements || [];
}

function pick(tags, keys) {
  for (const k of keys) if (tags[k]) return tags[k];
  return null;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JUNK_EMAIL = /(example\.|sentry|wixpress|\.png|\.jpg|\.gif|@2x|godaddy|wordpress|schema\.org)/i;

async function scrapeEmail(website) {
  const base = website.replace(/\/+$/, "");
  const candidates = [base, base + "/contact", base + "/contact-us", base + "/about"];
  let siteDomain = "";
  try {
    siteDomain = new URL(base).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  for (const url of candidates) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: ctrl.signal,
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const html = await res.text();
      const found = [...new Set((html.match(EMAIL_RE) || []).filter((e) => !JUNK_EMAIL.test(e)))];
      if (found.length) {
        // Prefer an address on the site's own domain (info@theirsite.com).
        const onDomain = found.find(
          (e) => siteDomain && e.toLowerCase().endsWith("@" + siteDomain)
        );
        return (onDomain || found[0]).toLowerCase();
      }
    } catch {
      /* timeout / network / bad URL — try the next candidate */
    }
  }
  return null;
}

export async function findLeads(
  { query, location, limit = 50, scrapeEmails = true },
  onProgress = () => {}
) {
  onProgress(`Locating "${location}"…`);
  const box = await geocode(location);
  onProgress(`Figuring out how "${query}" is categorized on the map…`);
  const spec = await osmSpecFor(query);
  onProgress(`Searching for "${query}" in ${box.display}…`);
  const elements = await overpass(overpassFromSpec(spec, box, limit * 3));

  const seen = new Set();
  const leads = [];
  let named = 0;
  let noContact = 0;
  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name;
    if (!name) continue;
    named++;
    let website = pick(tags, ["website", "contact:website", "url"]);
    const email = pick(tags, ["email", "contact:email"]);
    const phone = pick(tags, ["phone", "contact:phone"]);
    if (!website && !email) {
      noContact++;
      continue; // no website/email — nothing to audit or email
    }
    if (website && !/^https?:\/\//.test(website)) website = "https://" + website;
    const key = (email || website || name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    leads.push({ name, company: name, website: website || "", email: email || "", phone: phone || "" });
    if (leads.length >= limit) break;
  }
  onProgress(
    `Matched ${named} business(es) on the map; ${leads.length} have a website or email to work with` +
      (noContact ? ` (${noContact} were listed with no website/email and skipped).` : ".")
  );
  if (!leads.length && named === 0) {
    onProgress(
      `Tip: OpenStreetMap has thin coverage of local businesses in many US areas. Try a broader area (a bigger nearby city), a different wording, or a paid data source for better lists.`
    );
  }

  if (scrapeEmails) {
    let i = 0;
    for (const lead of leads) {
      i++;
      if (lead.email || !lead.website) continue;
      onProgress(`(${i}/${leads.length}) scanning ${lead.website} for an email…`);
      lead.email = (await scrapeEmail(lead.website)) || "";
      await sleep(300); // be polite to the sites we're scanning
    }
    const withEmail = leads.filter((l) => l.email).length;
    onProgress(`Done. ${withEmail}/${leads.length} now have an email address.`);
  }

  return leads;
}
