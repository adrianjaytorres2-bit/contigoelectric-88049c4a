import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { DATA_DIR } from "./config.js";

const PARKED_MARKERS = [
  "this domain is for sale",
  "buy this domain",
  "domain is parked",
  "godaddy.com/park",
  "sedoparking",
  "parkingcrew",
  "hugedomains",
  "afternic",
];

// Opens each site in headless Chromium, captures a screenshot, and extracts
// objective facts about design/SEO/mobile quality. Returns:
//   { ok: true, facts, screenshotPath }  on a usable site
//   { ok: false, reason }                on broken/parked/unreachable sites
export async function auditSites(leads, config, onProgress = () => {}) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
    // Point at a system Chromium instead of `npx playwright install` if needed.
    ...(process.env.OUTREACH_CHROMIUM ? { executablePath: process.env.OUTREACH_CHROMIUM } : {}),
  });
  const results = new Map();
  try {
    for (const lead of leads) {
      onProgress(lead);
      results.set(lead.id, await auditOne(browser, lead, config));
    }
  } finally {
    await browser.close();
  }
  return results;
}

async function auditOne(browser, lead, config) {
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  try {
    const started = Date.now();
    let response;
    try {
      response = await page.goto(lead.website, {
        waitUntil: "domcontentloaded",
        timeout: config.auditTimeoutMs,
      });
    } catch (err) {
      return { ok: false, reason: `unreachable: ${err.message.split("\n")[0]}` };
    }
    const status = response ? response.status() : 0;
    if (status >= 400) return { ok: false, reason: `http_${status}` };

    await page.waitForTimeout(2500);
    const loadMs = Date.now() - started;

    const facts = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : "";
      const imgs = [...document.querySelectorAll("img")];
      const links = [...document.querySelectorAll("a[href]")];
      const metaDesc = document.querySelector('meta[name="description"]');
      const viewport = document.querySelector('meta[name="viewport"]');
      const yearMatches = text.match(/(?:©|\(c\)|copyright)\s*(\d{4})/i);
      return {
        title: document.title || "",
        metaDescription: metaDesc ? metaDesc.getAttribute("content") : null,
        hasViewportMeta: !!viewport,
        h1Count: document.querySelectorAll("h1").length,
        imageCount: imgs.length,
        imagesMissingAlt: imgs.filter((i) => !i.getAttribute("alt")).length,
        linkCount: links.length,
        hasFavicon: !!document.querySelector('link[rel*="icon"]'),
        wordCount: text.split(/\s+/).filter(Boolean).length,
        copyrightYear: yearMatches ? Number(yearMatches[1]) : null,
        usesTables: document.querySelectorAll("table").length,
        hasFlash: !!document.querySelector('object[type*="flash"], embed[type*="flash"]'),
        fontFamilies: [
          ...new Set(
            [...document.querySelectorAll("h1,h2,p,body")]
              .slice(0, 30)
              .map((el) => getComputedStyle(el).fontFamily.split(",")[0].trim())
          ),
        ].slice(0, 5),
        bodyText: text.slice(0, 1500),
      };
    });

    const lower = (facts.title + " " + facts.bodyText).toLowerCase();
    if (PARKED_MARKERS.some((m) => lower.includes(m))) {
      return { ok: false, reason: "parked_domain" };
    }

    // Mobile check: reload at phone width, look for horizontal overflow.
    let mobileOverflow = false;
    try {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(1000);
      mobileOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 5
      );
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(500);
    } catch {
      // non-fatal
    }

    let screenshotPath = null;
    if (config.screenshot) {
      const dir = path.join(DATA_DIR, "screenshots");
      fs.mkdirSync(dir, { recursive: true });
      screenshotPath = path.join(dir, `${lead.id}.jpeg`);
      await page.screenshot({ path: screenshotPath, type: "jpeg", quality: 60 });
    }

    return {
      ok: true,
      screenshotPath,
      facts: {
        ...facts,
        bodyText: undefined,
        textSample: facts.bodyText,
        https: lead.website.startsWith("https://") && status < 300,
        httpStatus: status,
        loadMs,
        mobileOverflow,
        currentYear: new Date().getFullYear(),
      },
    };
  } finally {
    await ctx.close();
  }
}
