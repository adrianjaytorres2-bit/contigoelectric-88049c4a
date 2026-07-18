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
// Filter out placeholder/template/library emails that show up in page source.
const JUNK_EMAIL =
  /(example\.(com|org|net)|mycompany\.com|yourcompany|yourdomain|yoursite|yourname|domain\.com|email\.com|test@|user@|name@|sentry|wixpress|\.png|\.jpg|\.gif|@2x|godaddy|wordpress|schema\.org|astigmatic\.com|googlefonts|fontawesome|@sentry)/i;

// A business's own Facebook Page link, when one is on the site (usually a
// header/footer social icon). We only ever read this public URL — nothing is
// fetched from facebook.com itself, so there's no scraping/automation of FB.
const FB_RE = /https?:\/\/(?:www\.|m\.)?facebook\.com\/[A-Za-z0-9_.\-/]+/gi;
const FB_JUNK = /(sharer|share\.php|plugins|dialog|login|help|policies|privacy|tr\?|l\.php|\/ads\/|business\/help|\.php)/i;

function pickFacebookUrl(html) {
  for (const raw of html.match(FB_RE) || []) {
    const clean = raw.replace(/["'<>)\s].*$/, "").replace(/\/$/, "");
    if (FB_JUNK.test(clean)) continue;
    const path = clean.replace(/^https?:\/\/(?:www\.|m\.)?facebook\.com\//i, "");
    if (!path || path.length < 2) continue;
    return clean;
  }
  return null;
}

async function scrapeContactInfo(website) {
  const base = website.replace(/\/+$/, "");
  const candidates = [base, base + "/contact", base + "/contact-us", base + "/about"];
  let siteDomain = "";
  try {
    siteDomain = new URL(base).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  let email = null;
  let facebookUrl = null;
  for (const url of candidates) {
    if (email && facebookUrl) break;
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
      if (!email) {
        const found = [...new Set((html.match(EMAIL_RE) || []).filter((e) => !JUNK_EMAIL.test(e)))];
        if (found.length) {
          // Prefer an address on the site's own domain (info@theirsite.com).
          const onDomain = found.find(
            (e) => siteDomain && e.toLowerCase().endsWith("@" + siteDomain)
          );
          email = (onDomain || found[0]).toLowerCase();
        }
      }
      if (!facebookUrl) facebookUrl = pickFacebookUrl(html);
    } catch {
      /* timeout / network / bad URL — try the next candidate */
    }
  }
  return { email, facebookUrl };
}

// Google Places (New) Text Search — full US business coverage. Needs a
// GOOGLE_API_KEY. Returns name + website + phone (Google does not expose email,
// so we still scrape the site for that). Pages up to `limit` results.
async function googlePlaces(query, location, limit, onProgress) {
  const key = process.env.GOOGLE_API_KEY;
  const out = [];
  let pageToken = null;
  const textQuery = `${query} in ${location}`;
  do {
    const body = { textQuery, pageSize: Math.min(20, Math.max(1, limit - out.length)) };
    if (pageToken) body.pageToken = pageToken;
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.displayName,places.websiteUri,places.nationalPhoneNumber,places.formattedAddress,places.userRatingCount,nextPageToken",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.json())?.error?.message || "";
      } catch {
        /* ignore */
      }
      throw new Error(`Google Places error (HTTP ${res.status}). ${detail}`.trim());
    }
    const data = await res.json();
    for (const p of data.places || []) {
      out.push({
        name: p.displayName?.text || "",
        website: p.websiteUri || "",
        email: "",
        phone: p.nationalPhoneNumber || "",
        reviewCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
        isChainTag: false, // no OSM brand-tag equivalent from Google
      });
    }
    pageToken = data.nextPageToken || null;
    if (pageToken && out.length < limit) await sleep(1500);
  } while (pageToken && out.length < limit);
  onProgress(`Google Places returned ${out.length} business(es).`);
  return out.slice(0, limit);
}

// A repeated exact business name across a single search area is a strong,
// free signal of a chain/franchise (same brand, multiple locations) even
// before any AI or tag data is involved.
function normalizeBizName(name) {
  return (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

const CHAIN_SCHEMA = {
  type: "object",
  properties: {
    is_chain: {
      type: "array",
      items: { type: "boolean" },
      description:
        "Same order and length as the input list. true = recognizable national/regional chain, franchise, or big-box retailer; false = independently owned local business.",
    },
  },
  required: ["is_chain"],
  additionalProperties: false,
};

// AI chain classifier — generalizes to any business type/brand without a
// hardcoded blocklist. Runs as a single batched call regardless of how many
// businesses are being checked. Fails open (assumes independent) on any
// error so a classifier hiccup never silently drops real leads.
async function classifyIndependent(names, location) {
  if (!names.length) return [];
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("no api key");
    const client = new Anthropic();
    const list = names.map((n, i) => `${i + 1}. ${n}`).join("\n");
    const res = await client.messages.create({
      model: TAG_MODEL,
      max_tokens: Math.max(400, names.length * 6),
      output_config: { format: { type: "json_schema", schema: CHAIN_SCHEMA } },
      messages: [
        {
          role: "user",
          content:
            `These businesses were found in ${location}. For each one, say whether it's a recognizable national ` +
            `or regional chain, franchise, or big-box retailer (true) or an independently owned local business ` +
            `(false). When genuinely unsure, prefer false (assume independent).\n\n${list}`,
        },
      ],
    });
    const block = res.content.find((b) => b.type === "text");
    const parsed = JSON.parse(block.text);
    if (Array.isArray(parsed.is_chain) && parsed.is_chain.length === names.length) return parsed.is_chain;
  } catch {
    /* fall through */
  }
  return names.map(() => false);
}

export async function findLeads(
  { query, location, limit = 50, scrapeEmails = true, preferIndependent = false, maxReviews = null },
  onProgress = () => {}
) {
  const useGoogle = !!process.env.GOOGLE_API_KEY;
  // Pull extra headroom when filtering chains, since some candidates will
  // get filtered out and we still want to reach the requested limit.
  const fetchLimit = preferIndependent ? limit * 2 : limit;
  let candidates = [];

  if (useGoogle) {
    onProgress(`Searching Google Places for "${query}" in ${location}…`);
    candidates = await googlePlaces(query, location, fetchLimit * 2, onProgress);
  } else {
    onProgress(`Locating "${location}"…`);
    const box = await geocode(location);
    onProgress(`Figuring out how "${query}" is categorized on the map…`);
    const spec = await osmSpecFor(query);
    onProgress(`Searching OpenStreetMap for "${query}" in ${box.display}…`);
    const elements = await overpass(overpassFromSpec(spec, box, fetchLimit * 3));
    for (const el of elements) {
      const tags = el.tags || {};
      if (!tags.name) continue;
      candidates.push({
        name: tags.name,
        website: pick(tags, ["website", "contact:website", "url"]) || "",
        email: pick(tags, ["email", "contact:email"]) || "",
        phone: pick(tags, ["phone", "contact:phone"]) || "",
        isChainTag: !!tags.brand, // OSM mappers tag franchise locations with brand=...
        reviewCount: null,
      });
    }
  }

  if (preferIndependent) {
    // Free signal #1: reviews (Google only) — chains rack up hundreds+.
    if (maxReviews != null) {
      const before = candidates.length;
      candidates = candidates.filter((c) => c.reviewCount == null || c.reviewCount <= maxReviews);
      if (before !== candidates.length)
        onProgress(`Filtered out ${before - candidates.length} business(es) with more than ${maxReviews} reviews.`);
    }
    // Free signal #2: OSM brand tag — mapped as a known franchise/chain.
    const beforeBrand = candidates.length;
    candidates = candidates.filter((c) => !c.isChainTag);
    if (beforeBrand !== candidates.length)
      onProgress(`Filtered out ${beforeBrand - candidates.length} business(es) tagged as a known franchise.`);
    // Free signal #3: the same business name appears at multiple locations
    // in this search — a strong sign of a chain even with no other data.
    const nameCounts = {};
    for (const c of candidates) nameCounts[normalizeBizName(c.name)] = (nameCounts[normalizeBizName(c.name)] || 0) + 1;
    const beforeDupe = candidates.length;
    candidates = candidates.filter((c) => nameCounts[normalizeBizName(c.name)] < 2);
    if (beforeDupe !== candidates.length)
      onProgress(`Filtered out ${beforeDupe - candidates.length} business(es) appearing at multiple locations here.`);
  }

  // Dedupe and keep only businesses we can actually reach (website or email).
  const seen = new Set();
  let leads = [];
  let noContact = 0;
  for (const c of candidates) {
    if (!c.name) continue;
    let website = c.website;
    if (website && !/^https?:\/\//.test(website)) website = "https://" + website;
    if (!website && !c.email) {
      noContact++;
      continue;
    }
    const key = (c.email || website || c.name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    leads.push({
      name: c.name,
      company: c.name,
      website: website || "",
      email: c.email || "",
      phone: c.phone || "",
      facebookUrl: "",
    });
    if (leads.length >= fetchLimit) break;
  }

  if (preferIndependent && leads.length) {
    onProgress(`Checking ${leads.length} business(es) for chain/franchise names…`);
    const flags = await classifyIndependent(leads.map((l) => l.name), location);
    const beforeAi = leads.length;
    leads = leads.filter((_, i) => !flags[i]);
    if (beforeAi !== leads.length)
      onProgress(`AI filtered out ${beforeAi - leads.length} more likely chain(s) by name — ${leads.length} independent-looking business(es) left.`);
  }
  leads = leads.slice(0, limit);

  onProgress(
    `${candidates.length} business(es) found via ${useGoogle ? "Google Places" : "OpenStreetMap"}; ` +
      `${leads.length} have a website or email` +
      (noContact ? ` (${noContact} had no website/email and were skipped).` : ".")
  );
  if (!leads.length && !useGoogle) {
    onProgress(
      `Tip: OpenStreetMap coverage is thin in many US areas. Add a Google Places API key in Settings for full coverage, or try a bigger nearby city.`
    );
  }

  if (scrapeEmails) {
    let i = 0;
    for (const lead of leads) {
      i++;
      if ((lead.email && lead.facebookUrl) || !lead.website) continue;
      onProgress(`(${i}/${leads.length}) scanning ${lead.website} for contact info…`);
      const info = await scrapeContactInfo(lead.website);
      if (!lead.email) lead.email = info.email || "";
      if (!lead.facebookUrl) lead.facebookUrl = info.facebookUrl || "";
      await sleep(300); // be polite to the sites we're scanning
    }
    const withEmail = leads.filter((l) => l.email).length;
    const withFb = leads.filter((l) => l.facebookUrl).length;
    onProgress(`Done. ${withEmail}/${leads.length} now have an email address, ${withFb}/${leads.length} have a Facebook Page link.`);
  }

  return leads;
}
