// Free lead generation via OpenStreetMap — no API key required.
// Nominatim geocodes the location to a bounding box; Overpass finds businesses
// of the requested type within it; then we optionally scan each business's
// website for a public contact email. All endpoints are free and keyless, but
// ask for a descriptive User-Agent and light rate limiting.

const UA = "AT-DEV-GROUP-Outreach/0.1 (self-hosted outreach tool)";

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

function overpassQuery(term, box, limit) {
  const t = term.replace(/[\\"\n]/g, "").trim();
  const bbox = `${box.south},${box.west},${box.north},${box.east}`;
  // Match the term against common business classification tags and the name.
  return `[out:json][timeout:90];
(
  nwr["craft"~"${t}",i](${bbox});
  nwr["shop"~"${t}",i](${bbox});
  nwr["office"~"${t}",i](${bbox});
  nwr["amenity"~"${t}",i](${bbox});
  nwr["name"~"${t}",i](${bbox});
);
out center tags ${limit};`;
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
  onProgress(`Searching for "${query}" in ${box.display}…`);
  const elements = await overpass(overpassQuery(query, box, limit * 3));

  const seen = new Set();
  const leads = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name;
    if (!name) continue;
    let website = pick(tags, ["website", "contact:website", "url"]);
    const email = pick(tags, ["email", "contact:email"]);
    const phone = pick(tags, ["phone", "contact:phone"]);
    if (!website && !email) continue; // no way to reach them — skip
    if (website && !/^https?:\/\//.test(website)) website = "https://" + website;
    const key = (email || website || name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    leads.push({ name, company: name, website: website || "", email: email || "", phone: phone || "" });
    if (leads.length >= limit) break;
  }
  onProgress(`Found ${leads.length} candidate business(es) with a website or email.`);

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
