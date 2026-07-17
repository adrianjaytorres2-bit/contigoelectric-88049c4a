# Outreach — your personal Swokei

A self-hosted clone of [swokei.com](https://www.swokei.com/)'s core workflow: audit prospects' real websites, write personalized cold emails that reference actual flaws found, send them from your own address, follow up automatically, and sort replies by intent.

No credits, no subscription — your own Anthropic API key and SMTP account.

## How it works (the same pipeline Swokei runs)

1. **Import** — load leads from a CSV. Duplicates are deduped by email+website.
2. **Audit** — each website opens in headless Chromium. The tool captures a screenshot and extracts hard facts: title/meta description, mobile viewport + horizontal-overflow check, missing image alts, load time, stale copyright year, HTTPS, parked/broken-domain detection, etc. Broken/parked sites are skipped automatically.
3. **Draft** — Claude gets the screenshot + audit facts and writes a short, human email referencing 1–2 real flaws, plus a `quality_score` (how badly the site needs work). Sites below your threshold are skipped — you only email people who actually need you.
4. **Send** — via your own SMTP (Gmail app password, Outlook, anything), throttled with a delay between sends and a daily cap.
5. **Follow up** — 2–3 short nudges spaced days apart. Anyone who replied is automatically paused.
6. **Inbox** — pulls replies over IMAP and classifies each as `interested` / `maybe_later` / `not_now`.
7. **Report** — `data/report.html` shows the whole pipeline: scores, flaws found, drafts, replies.

## Setup

```sh
cd outreach
npm install
npx playwright install chromium   # once, for the audit browser

export ANTHROPIC_API_KEY=sk-ant-...

# SMTP (example: Gmail with an app password)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=you@gmail.com
export SMTP_PASS=your-app-password
export SMTP_FROM="Adrian <you@gmail.com>"

# IMAP for reply detection (optional — you can use `outreach reply` manually)
export IMAP_HOST=imap.gmail.com
export IMAP_USER=you@gmail.com
export IMAP_PASS=your-app-password
```

Personalize by creating `outreach/outreach.config.json` (all fields optional — see defaults in `src/config.js`):

```json
{
  "senderName": "Adrian",
  "senderBusiness": "Adrian Web Studio",
  "senderPitch": "I redesign outdated small-business websites into fast, mobile-friendly sites that win customers.",
  "language": "English",
  "minQualityScore": 40,
  "dailySendCap": 50,
  "secondsBetweenSends": 45,
  "followupAfterDays": 4,
  "maxFollowups": 2
}
```

## Usage

```sh
node src/cli.js import leads.csv     # CSV: name,email,company,website[,industry,language]
node src/cli.js audit
node src/cli.js draft
node src/cli.js preview              # read every email before anything goes out
node src/cli.js send --dry-run       # sanity check
node src/cli.js send
node src/cli.js followup             # run daily (cron it)
node src/cli.js inbox                # run daily; flags 🔥 interested replies
node src/cli.js report && open data/report.html
node src/cli.js status
```

All state lives in `outreach/data/db.json` (gitignored) — screenshots in `outreach/data/screenshots/`.

## Deliverability & legal notes

- Send from a real mailbox you own with SPF/DKIM/DMARC already set up (Gmail/Outlook handle this for you). Warm up slowly — keep `dailySendCap` low (20–50) for the first weeks.
- Cold email is regulated (CAN-SPAM, GDPR, CASL, etc. depending on where your recipients are). Include your real identity, honor opt-outs immediately (`not_now` replies should never be followed up — the tool pauses replied leads automatically), and only email business addresses with a legitimate reason.
- Read every draft with `preview` before your first sends — you're accountable for what goes out under your name.
