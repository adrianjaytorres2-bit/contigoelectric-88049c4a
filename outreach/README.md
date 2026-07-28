# AT DEV GROUP Outreach Studio — your personal Swokei

## Desktop app (.exe)

The tool ships as a branded Electron desktop app: dashboard with one-click pipeline buttons (load lead CSV, audit, generate drafts, dry-run/send, follow-ups, inbox, report), a lead table, an email review screen, and full in-app setup (identity, Anthropic API key, SMTP/IMAP, browser install). All data stays on your machine.

**Get the .exe:** every push that touches `outreach/` runs the *Build Outreach Windows app* GitHub Actions workflow. Open the repo's **Actions** tab → latest run → download the `AT-DEV-GROUP-Outreach-windows` artifact. It contains a one-click installer and a portable `.exe` (no install needed).

**Build locally instead** (on a Windows machine, or any machine with normal internet):

```sh
cd outreach
npm install
npm run app        # run the desktop app in dev mode
npm run dist:win   # build installer + portable .exe into outreach/release/
```

First-time app setup: open **Settings**, fill in your name/pitch, Anthropic API key, and SMTP details, click **Install audit browser** once, then **Save**. The status dots in the sidebar turn green as each piece is configured.

### Auto-updates

The **installed** (NSIS) version has a **🔄 Check for updates** button in the sidebar. Click it and it checks the GitHub Releases feed on demand (nothing polls in the background) — showing live status right there (checking → downloading → ready, or "you're on the latest version"). When a new version finishes downloading, an "⬇️ Update ready — restart" button appears; click it to install and relaunch. This only works for real **Releases**, not the plain test artifacts from every branch push, and not the portable `.exe` (which you re-download manually).

**To cut a real release** (once you want the auto-updater to have something to find): bump the `version` in `outreach/package.json`, commit, then tag and push:

```sh
git tag v0.2.0
git push origin v0.2.0
```

That triggers `release-outreach.yml`, which builds and publishes a GitHub Release with the installer, portable exe, and the `latest.yml` metadata electron-updater reads. The portable `.exe` does not self-update (only the installed version does) — re-download it manually for updates.

## Find Leads (free lead generation)

The **Find Leads** page generates a lead list from **OpenStreetMap** — no API key, no credits. Enter a business type (e.g. `plumber`) and a location (e.g. `Tampa, FL`), and it pulls matching businesses (name, website, phone, and any listed email) via Nominatim + Overpass, optionally scanning each site's contact page for an email. Results drop straight into your Leads list, ready to audit.

CLI equivalent:
```sh
node src/cli.js findleads "roofing" "Miami, FL" --limit 50        # scan sites for emails
node src/cli.js findleads "dentist" "Austin, TX" --no-scrape      # faster, OSM data only
```
Coverage varies by area (it's community-mapped data), so try a few wordings if results are thin. Businesses without a public email still import with their website — you can audit them and add an email later.

## Redrafting with your own notes

If the AI fixates on a weak or irrelevant flaw instead of the real problem with a site, go to the **Emails** page — each drafted email has a "Tell the AI what to actually focus on" box underneath it. Type the real issue(s) you noticed, hit **🔄 Redraft with these notes**, and it rewrites the email prioritizing exactly what you said over its own judgment. This still goes through the AI (so it stays in your chosen voice/length/style) — it's different from directly editing the email text, which is also always available right above it.

CLI equivalent:
```sh
node src/cli.js setflaws jane@example.com --text "no HTTPS padlock; checkout broken on mobile"
node src/cli.js redraft jane@example.com
```

## Follow-ups & bounce protection

Every address is **re-verified right before its follow-up goes out** — the first email may have been sent weeks ago, and a nudge to an address that's since gone dead is a second avoidable bounce. Failing addresses are dropped from the sequence automatically.

If a send bounces (on the first send or a follow-up), follow-ups for that lead **stop immediately**. If the server explicitly says the mailbox doesn't exist, the address is also suppressed permanently. For vaguer rejections (spam-filter block, mailbox full) follow-ups stop but the address is kept — those happen to real prospects too.

To remove a lead by hand: **🔍 Details** → **⏸️ Stop follow-ups**. The lead keeps its history and can be resumed anytime. This is narrower and reversible, unlike **🚫 Unsubscribe** which blocks the address from all email permanently.

```sh
node src/cli.js nofollowup jane@example.com --reason "asked to stop"
node src/cli.js resumefollowup jane@example.com
node src/cli.js followup --dry-run    # shows which addresses would be dropped
```

## Deleting a lead you don't want

Each email card on the **Emails** page has a **🗑️ Not worth it — delete lead** button at the bottom, in its own separated row. It removes that one lead and its draft after a confirmation (works for already-sent emails too). Note that deleting does not stop the lead reappearing in a future Find Leads run — for that, use **🚫 Unsubscribe this lead** from the lead's Details panel instead.

CLI equivalent:
```sh
node src/cli.js deletelead jane@example.com              # delete one lead
node src/cli.js deletelead jane@example.com --suppress   # ...and never find it again
```

Unlike `bulkdelete` (which matches every lead sharing an email address), `deletelead` removes exactly one lead — two leads can legitimately share an email with different websites.

## Viewing a site and searching drafts

Every drafted email on the **Emails** page has a **🌐 View site** button next to its status badge that opens the actual website in your regular browser. A search bar above the list filters by name, company, email, subject, or body.

## Leads with no website

Check **"Only businesses with no website"** on the **Find Leads** page to hunt specifically for businesses with no site at all. This is an **exclusive** search — anything with a website is discarded, so you get a completely different list from a normal search, not a longer one. A match with an email gets a dedicated "you don't have a website" pitch instead of the usual audit-based one; a match with only a phone number is added but flagged call-manually since it can't be auto-emailed.

Caveats: on free OpenStreetMap data a missing website is often just an unmapped field rather than a business that genuinely has none, so expect false positives — a Google Places API key is far more reliable here. Expect mostly phone-only results, since businesses without a site usually don't list an email either.

CLI equivalent:
```sh
node src/cli.js findleads "plumber" "Tampa, FL" --only-no-website
```

## Adding something you found after drafting

Found something extra after an email was already written — a bad review, a news mention, anything relevant? On the **Emails** page, below the redraft box, is a second one: paste in what you found and hit **✨ Summarize & add to draft**. The AI turns it into one natural sentence and weaves it into the existing email — everything else stays as-is; it's a small targeted edit, not a full rewrite (see "Redrafting with your own notes" above for the full-rewrite version).

CLI equivalent:
```sh
node src/cli.js addfinding jane@example.com --text "left a 1-star review complaining about their 3-day response time"
```

## Email verification (reducing bounces)

Every email is checked automatically right before drafting: syntax, whether the domain even has a mail server (catches typos and dead/parked domains), and known disposable/throwaway domains. Failing addresses are skipped with a reason before any AI cost is spent — role addresses like `info@`/`contact@`/`sales@` are **not** filtered, since those are normal small-business inboxes. Turn this off, or add an optional deep-verification API key (e.g. AbstractAPI's email validation) for a real mailbox-existence check, in **Settings → Email verification**.

CLI equivalent:
```sh
node src/cli.js verifyleads --all   # re-check every lead's email at once
node src/cli.js draft               # also verifies automatically before drafting
```

## Facebook DMs (manual outreach queue)

The **Facebook DMs** page adds a second outreach channel for leads whose website links to a Facebook Page (captured automatically by Find Leads). Click **Generate DM drafts** to have Claude write a short, casual Messenger-style message per eligible lead, referencing the same real flaw found in that lead's website audit.

**This never sends anything automatically.** Facebook has no API for messaging a business you have no relationship with, and automating your personal account to send DMs violates their Terms of Service and risks a ban. Instead: click **Open Facebook Page** to pull up their Messenger, **Copy message**, paste it in yourself, and hit send — then mark it **Sent** or **Skip**. 10–15 real, human-sent messages a day is normal Messenger use and carries none of that risk.

CLI equivalent:
```sh
node src/cli.js fbdraft --limit 15   # write DM drafts for eligible leads
node src/cli.js fbqueue              # list drafts waiting to be sent
node src/cli.js fbsent <email>       # mark one as sent, after you send it yourself
```

## CLI (same engine, no UI)

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
