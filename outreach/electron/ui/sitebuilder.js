// Website Build Assist — option catalogue + prompt assembler.
//
// Runs entirely in the renderer with no AI call and no network: the output is
// a prompt that Lovable/Base44's own model consumes, so spending an Anthropic
// call to pre-polish it would be redundant. Instant, free, works offline.
//
// Loaded before app.js so these globals are available to it.

const SITE_TYPES = [
  { id: "local-service", label: "Local service / trades", detail: "plumber, electrician, HVAC, roofing, landscaping",
    sections: ["Services offered with real specifics", "Service area map or list of towns covered", "Licensing / insurance / certifications", "Before-and-after work photos", "Emergency or same-day availability", "Straightforward contact with phone prominent"] },
  { id: "restaurant", label: "Restaurant / café / bar", detail: "menus, hours, reservations",
    sections: ["Menu (real dishes and prices, not placeholders)", "Hours and location with map", "Reservation or order-online path", "Atmosphere photography", "Private events / catering if relevant"] },
  { id: "professional", label: "Professional services", detail: "law, accounting, consulting, insurance",
    sections: ["Practice areas / service lines", "Credentials, bar admissions, certifications", "Team bios with real photos", "Case results or client outcomes", "Consultation booking"] },
  { id: "medical", label: "Medical / dental / clinic", detail: "practices, specialists, care providers",
    sections: ["Services and treatments", "Provider bios and credentials", "Insurance accepted", "New patient forms / intake", "Appointment booking", "Office hours and directions"] },
  { id: "real-estate", label: "Real estate / property", detail: "agents, brokerages, rentals",
    sections: ["Current listings with real photos", "Neighborhood guides", "Agent profile and track record", "Home valuation or inquiry tool", "Buying/selling process explained"] },
  { id: "ecommerce", label: "E-commerce / online store", detail: "physical or digital products",
    sections: ["Product grid with real photography", "Individual product detail pages", "Cart and checkout", "Shipping and returns policy", "Size/spec details", "Customer reviews"] },
  { id: "saas", label: "SaaS / software product", detail: "web apps, tools, platforms",
    sections: ["What it does, stated plainly above the fold", "Real product screenshots or a short demo", "Pricing tiers with actual numbers", "Integrations", "Docs or getting-started link", "Signup / trial path"] },
  { id: "portfolio", label: "Portfolio / creative showcase", detail: "designers, photographers, writers, makers",
    sections: ["Work as the primary content, large", "Individual project case studies", "Short about with a real point of view", "Client list or press", "Direct contact / commission inquiry"] },
  { id: "agency", label: "Agency / studio", detail: "marketing, design, dev shops",
    sections: ["Services with actual deliverables", "Selected work with measurable results", "Process explained honestly", "Team", "Pricing posture or engagement models", "Inquiry form that qualifies"] },
  { id: "fitness", label: "Fitness / gym / studio", detail: "gyms, yoga, martial arts, training",
    sections: ["Class schedule / timetable", "Membership tiers with real prices", "Trainer bios", "Facility photos", "Free trial or intro offer", "Location and parking"] },
  { id: "salon", label: "Salon / spa / beauty", detail: "hair, nails, skincare, barbers",
    sections: ["Service menu with prices and durations", "Stylist/tech portfolios", "Online booking", "Product lines carried", "Interior photography", "Cancellation policy"] },
  { id: "nonprofit", label: "Nonprofit / community org", detail: "charities, churches, clubs, associations",
    sections: ["Mission stated concretely", "Programs and measurable impact", "Ways to help (donate, volunteer, attend)", "Financial transparency", "Upcoming events", "Board / leadership"] },
  { id: "events", label: "Event / venue / wedding", detail: "venues, planners, conferences",
    sections: ["Venue or event photography, large", "Capacity, layouts, and what's included", "Pricing or package structure", "Availability calendar", "Tour or consultation request", "Vendor list / FAQs"] },
  { id: "education", label: "Education / courses / tutoring", detail: "schools, instructors, training",
    sections: ["Programs or curriculum", "Instructor credentials", "Outcomes / where students end up", "Schedule and format (in person, online)", "Tuition and financial aid", "Enrollment or application"] },
  { id: "automotive", label: "Automotive", detail: "dealers, repair, detailing, custom shops",
    sections: ["Services or inventory", "Certifications and warranties", "Work gallery", "Quote request", "Shop hours and location", "Financing if applicable"] },
];

const UI_STYLES = [
  { id: "editorial", label: "Editorial / magazine", detail: "Large headline type, asymmetric multi-column grid, generous margins, pull quotes. Content-forward like a print feature." },
  { id: "swiss", label: "Swiss / International", detail: "Strict mathematical grid, heavy use of whitespace, left-aligned sans type, no decoration. Rigorous and calm." },
  { id: "brutalist", label: "Brutalist / raw", detail: "Hard 1-2px borders, exposed structural blocks, system-ish type, near-zero border radius, deliberately unpolished." },
  { id: "industrial", label: "Industrial / utilitarian", detail: "Sturdy blocky layout, condensed uppercase headings, high contrast, stencil or workwear feel. Suits trades and heavy service." },
  { id: "boutique", label: "Boutique luxury", detail: "High-contrast serif display type, wide letter-spacing, sparse content per screen, lots of negative space, restrained palette." },
  { id: "photo-immersive", label: "Photo-led immersive", detail: "Full-bleed imagery driving each section, minimal text overlaid, image quality carries the design." },
  { id: "warm-organic", label: "Warm organic", detail: "Soft irregular shapes, hand-drawn or textured accents, humanist type, warm neutral base. Approachable, not corporate." },
  { id: "premium-dark", label: "Premium dark", detail: "Deep charcoal/ink background, one restrained metallic or saturated accent, fine hairline rules, high-contrast type." },
  { id: "retro-modern", label: "Retro-modern", detail: "1970s-influenced geometry and palette reinterpreted cleanly — rounded slab type, warm saturated tones, bold simple shapes." },
  { id: "heritage", label: "Neo-classical / heritage", detail: "Traditional serif type, symmetrical structure, engraved or crest-like marks, understated. Reads established and trustworthy." },
  { id: "print-textured", label: "Textured / print-inspired", detail: "Paper grain, halftone or risograph texture, slight misregistration, ink-like color. Tactile rather than screen-slick." },
  { id: "playful-geometric", label: "Playful geometric", detail: "Bold primitive shapes, confident flat color blocking, chunky type, purposeful asymmetry. Energetic without being childish." },
  { id: "mono-minimal", label: "Minimal mono-type", detail: "One typeface at several weights, tight vertical rhythm, near-monochrome, restraint as the whole idea." },
  { id: "poster", label: "Bold poster style", detail: "Oversized type as the primary visual, dramatic scale contrast, few elements per screen, graphic and loud." },
  { id: "data-dense", label: "Structured / data-dense", detail: "Tables, specs, and comparison layouts treated as the design. Information-rich and efficient, suits technical buyers." },
];

const COLOR_SCHEMES = [
  { id: "ink-bone", label: "Ink & bone", detail: "near-black #14110F on warm off-white #F6F2EA, single muted accent" },
  { id: "forest-cream", label: "Deep forest & cream", detail: "#1E3A2F forest, #F3EFE4 cream, #C0703C warm accent" },
  { id: "navy-brass", label: "Navy & brass", detail: "#16233C navy, #E9E4D8 bone, #B08A46 brass" },
  { id: "terracotta-sand", label: "Terracotta & sand", detail: "#B4553A terracotta, #EFE0CE sand, #3E3630 deep brown text" },
  { id: "charcoal-orange", label: "Charcoal & safety orange", detail: "#242424 charcoal, #F4F4F2 off-white, #FF5C1A safety orange" },
  { id: "oxblood-ecru", label: "Oxblood & ecru", detail: "#5C1F26 oxblood, #EDE6DA ecru, #2A2422 near-black" },
  { id: "slate-pale", label: "Slate blue & pale grey", detail: "#465B72 slate, #EDF0F2 pale grey, #1D2630 text" },
  { id: "olive-mustard", label: "Olive & mustard", detail: "#4A5233 olive, #F0EAD8 bone, #D9A21B mustard" },
  { id: "plum-blush", label: "Plum & blush", detail: "#4A2B45 plum, #F7E8E6 blush, #2B1C28 text" },
  { id: "teal-copper", label: "Teal & copper", detail: "#14504F teal, #F2EDE6 warm white, #B4653C copper" },
  { id: "mono-accent", label: "Greyscale + one accent", detail: "full greyscale ramp #111 to #F5F5F5, exactly one saturated accent used sparingly" },
  { id: "warm-neutral", label: "Warm neutrals", detail: "#8C7A66 camel, #E8DFD2 cream, #3A332B taupe-black, no bright color at all" },
  { id: "black-lime", label: "Black & electric lime", detail: "#0C0C0C black, #F2F2F2 white, #C9F227 electric lime used only for emphasis" },
  { id: "rose-graphite", label: "Dusty rose & graphite", detail: "#C08B84 dusty rose, #F4EEEC off-white, #33302F graphite" },
  { id: "seaglass-driftwood", label: "Sea glass & driftwood", detail: "#8FB0A9 sea glass, #EFE9DE driftwood, #35403D deep green-grey" },
];

const SITE_GOALS = [
  { id: "calls", label: "Get phone calls", detail: "phone number persistently visible, click-to-call on mobile, urgency framing" },
  { id: "forms", label: "Get quote/contact form submissions", detail: "short qualifying form, visible above the fold and repeated at natural decision points" },
  { id: "bookings", label: "Book appointments online", detail: "booking flow reachable in one click from anywhere, real availability" },
  { id: "sales", label: "Sell products directly", detail: "frictionless path to cart and checkout, trust signals near the buy button" },
  { id: "signups", label: "Collect email signups", detail: "one clear value-based opt-in, no aggressive popups or exit-intent traps" },
  { id: "credibility", label: "Look established and legitimate", detail: "credentials, real photography, specifics over adjectives, no stock-photo filler" },
  { id: "showcase", label: "Showcase past work", detail: "work presented large with context on what the problem and outcome were" },
  { id: "local-seo", label: "Rank in local search", detail: "semantic headings, city/service naming in real copy, LocalBusiness schema, fast load, crawlable text not images" },
  { id: "qualify", label: "Filter out bad-fit inquiries", detail: "state pricing posture, scope, and who this is not for, plainly" },
  { id: "foot-traffic", label: "Drive visits to a physical location", detail: "address, map, hours, parking, and what to expect on arrival" },
  { id: "trials", label: "Get free trial / demo signups", detail: "let people see the product working before asking for anything" },
  { id: "explain", label: "Explain something complex simply", detail: "progressive disclosure, concrete examples, plain language over jargon" },
  { id: "applications", label: "Collect applications", detail: "requirements stated up front, clear stages, realistic timeline" },
  { id: "launch", label: "Promote a specific event or launch", detail: "date, time, place, and the single action, unmistakable" },
  { id: "replace", label: "Replace an outdated existing site", detail: "keep whatever was working, fix mobile, speed, and clarity first" },
];

// The heart of it. These are the specific, recognizable tells that make an
// AI-generated site read as generic slop — stated as prohibitions because
// vague instructions like "make it look good" get ignored.
const ANTI_SLOP = `## Non-negotiable: avoid the generic AI-website look

Do NOT produce the default look these tools fall into. Specifically:

**Banned copy patterns**
- No vague benefit-speak headlines: "Empower Your Business", "Elevate Your Experience", "Transform The Way You...", "Unlock Your Potential", "Solutions Tailored To You".
- No "Welcome to [Company]" as a hero headline.
- No "Get Started" / "Learn More" as the only CTAs — write what actually happens ("Get a quote in 24 hours", "See this week's menu", "Call for same-day service").
- No invented statistics, fake client logos, fake testimonials, or made-up awards. If real content isn't provided, use an obvious placeholder and say so — never fabricate credibility.
- No em dashes as a stylistic tic, and no "it's not just X, it's Y" constructions.
- Write specifics over adjectives. "Licensed master plumber, 22 years, same-day emergency service" beats "Trusted, professional, reliable service you can count on".

**Banned visual patterns**
- No purple/blue/indigo gradient hero. No gradient text. No mesh or blob gradients.
- No glassmorphism (frosted translucent cards with backdrop-blur).
- No emoji used as feature icons.
- No row of three identical feature cards each with a generic icon, a two-word title, and one filler sentence.
- No everything-centered, perfectly symmetrical page. Use deliberate asymmetry and real hierarchy.
- No uniform large border-radius on every element. No drop shadows on everything. No glow effects.
- No fade-in-on-scroll applied to every section. Motion should be rare and purposeful.
- No default Inter/Poppins/Montserrat pairing unless it genuinely fits the chosen direction — pick typefaces that match the stated visual direction and set them with real attention to size, weight, and line height.
- No generic stock imagery of smiling people in offices or handshakes.
- No dark-mode toggle unless it was explicitly requested.

**Positive requirements**
- Vary section structure. Consecutive sections should not share the same layout skeleton.
- Establish a real typographic scale and stick to it. Body copy should be genuinely readable (16px+, sensible measure, ~1.5-1.65 line height).
- Use the specified palette exactly. Do not introduce extra hues; get variation from tint, shade, and proportion instead.
- Mobile layout must be designed, not merely stacked — reconsider hierarchy at small widths.
- Meet accessible contrast on all text, and use semantic HTML with a single logical heading order.
- Every section must justify its existence. Fewer, denser, more specific sections beat many thin ones.`;

function buildSitePrompt(sel) {
  const type = SITE_TYPES.find((t) => t.id === sel.typeId);
  const ui = UI_STYLES.find((u) => u.id === sel.uiId);
  const color = COLOR_SCHEMES.find((c) => c.id === sel.colorId);
  const goals = (sel.goalIds || []).map((id) => SITE_GOALS.find((g) => g.id === id)).filter(Boolean);

  const typeLabel = sel.typeCustom || (type ? `${type.label} (${type.detail})` : "website");
  const uiLabel = sel.uiCustom || (ui ? `${ui.label} — ${ui.detail}` : "");
  const colorLabel = sel.colorCustom || (color ? `${color.label} — ${color.detail}` : "");

  const goalLines = [
    ...goals.map((g, i) => `${i === 0 ? "**Primary:**" : "-"} ${g.label} — ${g.detail}`),
    ...(sel.goalCustom ? [`- ${sel.goalCustom}`] : []),
  ];

  const sections = sel.typeCustom ? [] : type?.sections || [];

  const parts = [];

  parts.push(`# Build brief: ${sel.companyName || "[Company name]"}`);
  parts.push(
    `Build a ${typeLabel} for **${sel.companyName || "[Company name]"}**.\n\n` +
      `**What the business actually does:** ${sel.whatTheyDo || "[describe the business — be specific]"}`
  );

  if (goalLines.length) {
    parts.push(
      `## What this site is for\n\nEvery design and copy decision should serve these, in order:\n\n${goalLines.join("\n")}`
    );
  }

  if (uiLabel || colorLabel) {
    const vis = ["## Visual direction"];
    if (uiLabel) vis.push(`**Layout & style:** ${uiLabel}`);
    if (colorLabel)
      vis.push(
        `**Palette:** ${colorLabel}\n\nUse these colors as the complete palette. If a hex is given, use it literally.`
      );
    parts.push(vis.join("\n\n"));
  }

  if (sections.length) {
    parts.push(
      `## Sections this type of site needs\n\n${sections.map((s) => `- ${s}`).join("\n")}\n\n` +
        `Include what genuinely applies and omit what doesn't. Do not pad the page with sections that have nothing real to say.`
    );
  }

  if (sel.mustHaves) parts.push(`## Specific requirements\n\n${sel.mustHaves}`);

  parts.push(ANTI_SLOP);

  parts.push(
    `## Content rule\n\n` +
      `Where you don't have real information (prices, staff names, testimonials, photos), insert a clearly marked placeholder such as [REAL PRICE NEEDED] rather than inventing something plausible. Fabricated detail is worse than an obvious gap because it ships to production unnoticed.`
  );

  parts.push(
    `## Build order\n\n` +
      `1. Structure and real content hierarchy first.\n` +
      `2. Then typography and the palette.\n` +
      `3. Then responsive behavior at 390px, 768px, and 1440px.\n` +
      `4. Motion and polish last, sparingly.\n\n` +
      `Make it fast: no heavy libraries for things CSS handles, images sized and lazy-loaded below the fold.`
  );

  return parts.join("\n\n---\n\n");
}
