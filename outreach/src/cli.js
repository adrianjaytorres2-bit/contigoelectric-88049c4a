#!/usr/bin/env node
import fs from "node:fs";
import { loadConfig, effectiveDailyCap, abVariantFor } from "./config.js";
import * as store from "./store.js";
import { csvToObjects } from "./csv.js";
import { auditSites } from "./audit.js";
import { draftEmail, draftFollowup, classifyReply } from "./writer.js";
import { transport, sendEmail, sleep, sentToday, toHtmlEmail, appendUnsubscribeFooter } from "./sender.js";
import { fetchReplies } from "./inbox.js";
import { findLeads } from "./leadgen.js";
import { writeReport } from "./report.js";

const { STATUS } = store;

function flag(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const val = args[i + 1];
  return val && !val.startsWith("--") ? val : true;
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const config = loadConfig();
  const db = store.load();

  switch (cmd) {
    case "import": {
      const file = args[0];
      if (!file || !fs.existsSync(file)) die("usage: outreach import <leads.csv>");
      const rows = csvToObjects(fs.readFileSync(file, "utf8"));
      let added = 0, skipped = 0;
      for (const r of rows) {
        const email = r.email || r["e-mail"];
        const website = store.normalizeUrl(r.website || r.url || r.site);
        if (!email || !website) { skipped++; continue; }
        const id = store.leadId(email, website);
        if (db.leads[id]) { skipped++; continue; } // dedupe across imports
        const dupeCompany = store.findByCompany(db, r.company || r.business);
        db.leads[id] = {
          id,
          name: r.name || r.contact || "",
          email,
          company: r.company || r.business || "",
          website,
          industry: r.industry || r.niche || "",
          languageOverride: r.language || null,
          status: STATUS.NEW,
          importedAt: new Date().toISOString(),
          notes: "",
          tags: [],
          followups: [],
        };
        if (dupeCompany) {
          console.log(`  ⚠ "${r.company || r.business}" looks like a duplicate of existing lead ${dupeCompany.email} — added anyway, review manually.`);
        }
        added++;
      }
      store.save(db);
      console.log(`Imported ${added} leads (${skipped} skipped as duplicate/incomplete).`);
      break;
    }

    case "addlead": {
      // Manually add a single lead without a CSV:
      //   outreach addlead --email a@b.com --name "Jane" --company "Jane's Cafe" --website https://... [--industry "..."]
      const email = flag(args, "--email");
      const name = flag(args, "--name") || "";
      const company = flag(args, "--company") || "";
      const website = store.normalizeUrl(flag(args, "--website") || "");
      const industry = flag(args, "--industry") || "";
      if (!email || typeof email !== "string") die("usage: outreach addlead --email a@b.com [--name] [--company] [--website] [--industry]");
      if (store.isSuppressed(db, email)) {
        console.log(`${email} is on your suppression list (unsubscribed) — not added. Use \`unsuppress\` first if this is a mistake.`);
        break;
      }
      const id = store.leadId(email, website);
      if (db.leads[id]) {
        console.log(`Lead already exists: ${email}`);
        break;
      }
      const dupeCompany = company ? store.findByCompany(db, company) : null;
      if (dupeCompany) {
        console.log(`⚠ "${company}" looks like a duplicate of existing lead ${dupeCompany.email} — adding anyway.`);
      }
      db.leads[id] = {
        id,
        name,
        email,
        company,
        website,
        industry,
        languageOverride: null,
        status: STATUS.NEW,
        importedAt: new Date().toISOString(),
        source: "manual",
        notes: "",
        tags: [],
        followups: [],
      };
      store.save(db);
      console.log(`Added lead: ${name || email} <${email}>${website ? ` (${website})` : ""}.`);
      break;
    }

    case "quicksend": {
      // Send a fully manual, one-off email immediately — no audit/draft pipeline.
      //   outreach quicksend --email a@b.com --subject "..." --body "..." [--name "Jane"] [--company "..."]
      const email = flag(args, "--email");
      const subject = flag(args, "--subject");
      const body = flag(args, "--body");
      if (!email || !subject || !body || typeof email !== "string")
        die('usage: outreach quicksend --email a@b.com --subject "..." --body "..." [--name] [--company]');
      if (store.isSuppressed(db, email)) die(`${email} is on your suppression list (unsubscribed) — refusing to send.`);
      const name = flag(args, "--name") || "";
      const company = flag(args, "--company") || "";
      const website = store.normalizeUrl(flag(args, "--website") || "");
      const id = store.leadId(email, website || email);
      const finalBody = appendUnsubscribeFooter(body, config);
      const t = transport();
      const messageId = await sendEmail(t, {
        to: email,
        subject,
        body: finalBody,
        ...(config.htmlEmails ? { html: toHtmlEmail(finalBody, config.senderName) } : {}),
      });
      db.leads[id] = {
        id,
        name,
        email,
        company,
        website,
        industry: "",
        status: STATUS.SENT,
        importedAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        messageId,
        source: "manual",
        notes: "",
        tags: [],
        draft: { subject, body, quality_score: null, flaws: [] },
        followups: [],
      };
      store.save(db);
      console.log(`Sent to ${email}.`);
      break;
    }

    case "audit": {
      const limit = Number(flag(args, "--limit") || Infinity);
      const pending = store.leadsByStatus(db, STATUS.NEW).slice(0, limit);
      if (!pending.length) return console.log("No new leads to audit.");
      console.log(`Auditing ${pending.length} site(s)...`);
      const results = await auditSites(pending, config, (l) =>
        console.log(`  → ${l.website}`)
      );
      for (const lead of pending) {
        const res = results.get(lead.id);
        if (res.ok) {
          lead.audit = { facts: res.facts, screenshotPath: res.screenshotPath };
          lead.status = STATUS.AUDITED;
        } else {
          lead.status = STATUS.SKIPPED;
          lead.skipReason = res.reason;
          console.log(`  ✗ ${lead.website}: ${res.reason} (no credit wasted — skipped)`);
        }
      }
      store.save(db);
      console.log(`Done. ${store.leadsByStatus(db, STATUS.AUDITED).length} audited, awaiting drafts.`);
      break;
    }

    case "setdraft": {
      // Manually override a lead's subject and/or body after drafting:
      //   outreach setdraft someone@example.com --subject "New subject" --body "New body text"
      const email = args[0];
      const subject = flag(args, "--subject");
      const body = flag(args, "--body");
      const lead = Object.values(db.leads).find((l) => l.email === email);
      if (!lead) die(`No lead found with email ${email}.`);
      if (!lead.draft) die(`${email} has no draft yet — run \`draft\` first.`);
      if (typeof subject === "string" && subject) lead.draft.subject = subject;
      if (typeof body === "string" && body) lead.draft.body = body;
      lead.edited = true;
      store.save(db);
      console.log(`Updated draft for ${email}.`);
      break;
    }

    case "draft": {
      const limit = Number(flag(args, "--limit") || Infinity);
      const audited = store.leadsByStatus(db, STATUS.AUDITED).slice(0, limit);
      if (!audited.length) return console.log("No audited leads to draft. Run `audit` first.");
      for (const lead of audited) {
        if (store.isSuppressed(db, lead.email)) {
          lead.status = STATUS.SKIPPED;
          lead.skipReason = "unsubscribed — on suppression list";
          console.log(`Skipping ${lead.email}: unsubscribed (no draft written, no cost).`);
          store.save(db);
          continue;
        }
        process.stdout.write(`Drafting for ${lead.company || lead.website}... `);
        try {
          let draftConfig = config;
          let variant = null;
          if (config.abTestEnabled) {
            variant = abVariantFor(lead.id);
            const variantStyle = variant === "A" ? config.abVariantAStyle : config.abVariantBStyle;
            draftConfig = { ...config, emailStyle: variantStyle };
          }
          const draft = await draftEmail(lead, draftConfig);
          if (variant) draft.variant = variant;
          lead.draft = draft;
          if (draft.quality_score < config.minQualityScore) {
            lead.status = STATUS.SKIPPED;
            lead.skipReason = `quality_score ${draft.quality_score} < threshold ${config.minQualityScore}`;
            console.log(`skipped (site too good: score ${draft.quality_score})`);
          } else {
            lead.status = STATUS.DRAFTED;
            console.log(`ok (score ${draft.quality_score})`);
          }
        } catch (err) {
          console.log(`error: ${err.message}`);
        }
        store.save(db);
      }
      break;
    }

    case "preview": {
      const drafted = args[0]
        ? Object.values(db.leads).filter((l) => l.email === args[0])
        : store.leadsByStatus(db, STATUS.DRAFTED);
      for (const l of drafted) {
        console.log(`\n─── ${l.name} <${l.email}> — ${l.website}`);
        console.log(`Score: ${l.draft?.quality_score}  Flaws: ${(l.draft?.flaws || []).join("; ")}`);
        console.log(`Subject: ${l.draft?.subject}\n`);
        console.log(l.draft?.body);
      }
      if (!drafted.length) console.log("Nothing drafted yet.");
      break;
    }

    case "send": {
      const dryRun = args.includes("--dry-run");
      const drafted = store.leadsByStatus(db, STATUS.DRAFTED);
      if (!drafted.length) return console.log("Nothing to send. Run `draft` first.");
      const suppressedCount = drafted.filter((l) => store.isSuppressed(db, l.email)).length;
      const sendable = drafted.filter((l) => l.email && !store.isSuppressed(db, l.email));
      const missing = drafted.length - sendable.length - suppressedCount;
      if (missing)
        console.log(
          `${missing} drafted lead(s) have no email address — skipping them. Add an email to those leads to reach them.`
        );
      if (suppressedCount) console.log(`${suppressedCount} drafted lead(s) are unsubscribed — skipping them.`);
      if (!sendable.length) return console.log("No drafted leads have an email address to send to.");
      const cap = effectiveDailyCap(config);
      const budget = cap - sentToday(db);
      if (budget <= 0)
        return console.log(
          `Daily send cap reached (${cap}${config.warmupEnabled ? ", warmup-limited" : ""}). Try again tomorrow.`
        );
      const batch = sendable.slice(0, budget);
      const t = dryRun ? null : transport();
      for (const lead of batch) {
        if (dryRun) {
          console.log(`[dry-run] would send to ${lead.email}: "${lead.draft.subject}"`);
          continue;
        }
        try {
          const finalBody = appendUnsubscribeFooter(lead.draft.body, config);
          const messageId = await sendEmail(t, {
            to: lead.email,
            subject: lead.draft.subject,
            body: finalBody,
            ...(config.htmlEmails ? { html: toHtmlEmail(finalBody, config.senderName) } : {}),
          });
          lead.status = STATUS.SENT;
          lead.sentAt = new Date().toISOString();
          lead.messageId = messageId;
          store.save(db);
          console.log(`✓ sent to ${lead.email}`);
          if (batch.indexOf(lead) < batch.length - 1) {
            await sleep(config.secondsBetweenSends * 1000);
          }
        } catch (err) {
          console.log(`✗ ${lead.email}: ${err.message}`);
          // Auth/connection failures affect every send — stop immediately
          // instead of hammering the server (which triggers IP rate limits).
          if (/535|invalid login|authentication|EAUTH|421|ECONNECTION|ENOTFOUND/i.test(err.message)) {
            console.log(
              "Stopping — this looks like a mail-server login/connection problem, not a per-lead issue. Fix your SMTP settings (host, username, password) and try again."
            );
            break;
          }
        }
      }
      break;
    }

    case "followup": {
      const dryRun = args.includes("--dry-run");
      const now = Date.now();
      const due = Object.values(db.leads).filter((l) => {
        if (l.status !== STATUS.SENT) return false; // replied leads are auto-paused
        if (store.isSuppressed(db, l.email)) return false;
        if ((l.followups || []).length >= config.maxFollowups) return false;
        const last = l.followups?.length
          ? l.followups[l.followups.length - 1].sentAt
          : l.sentAt;
        return now - Date.parse(last) > config.followupAfterDays * 86400_000;
      });
      if (!due.length) return console.log("No follow-ups due.");
      const budget = effectiveDailyCap(config) - sentToday(db);
      const batch = due.slice(0, Math.max(0, budget));
      const t = dryRun ? null : transport();
      for (const lead of batch) {
        const n = (lead.followups || []).length + 1;
        process.stdout.write(`Follow-up #${n} for ${lead.email}... `);
        try {
          const fu = await draftFollowup(lead, config, n);
          if (dryRun) {
            console.log(`[dry-run]\n  Subject: ${fu.subject}\n  ${fu.body.replace(/\n/g, "\n  ")}`);
            continue;
          }
          const fuBody = appendUnsubscribeFooter(fu.body, config);
          const messageId = await sendEmail(t, {
            to: lead.email,
            subject: fu.subject,
            body: fuBody,
            inReplyTo: lead.messageId,
            ...(config.htmlEmails ? { html: toHtmlEmail(fuBody, config.senderName) } : {}),
          });
          lead.followups.push({ ...fu, sentAt: new Date().toISOString(), messageId });
          store.save(db);
          console.log("sent");
          if (batch.indexOf(lead) < batch.length - 1) {
            await sleep(config.secondsBetweenSends * 1000);
          }
        } catch (err) {
          console.log(`error: ${err.message}`);
        }
      }
      break;
    }

    case "inbox": {
      const replies = await fetchReplies(db);
      if (!replies.length) return console.log("No new replies from known leads.");
      for (const { lead, text, subject } of replies) {
        const { intent, summary } = await classifyReply(lead, text);
        lead.status = STATUS.REPLIED;
        lead.reply = { intent, summary, subject, receivedAt: new Date().toISOString() };
        if (intent === "unsubscribe") store.suppress(db, lead.email, "requested via reply");
        store.save(db);
        const marker =
          intent === "interested" ? "🔥" : intent === "maybe_later" ? "⏳" : intent === "unsubscribe" ? "🚫" : "—";
        console.log(`${marker} ${lead.name} <${lead.email}> [${intent}]: ${summary}`);
      }
      break;
    }

    case "reply": {
      // Manual fallback when IMAP isn't configured:
      //   outreach reply someone@example.com --text "their reply text"
      const email = args[0];
      const text = flag(args, "--text");
      const lead = Object.values(db.leads).find((l) => l.email === email);
      if (!lead || typeof text !== "string") die("usage: outreach reply <email> --text \"...\"");
      const { intent, summary } = await classifyReply(lead, text);
      lead.status = STATUS.REPLIED;
      lead.reply = { intent, summary, receivedAt: new Date().toISOString() };
      if (intent === "unsubscribe") store.suppress(db, lead.email, "requested via reply");
      store.save(db);
      console.log(`Recorded reply from ${email}: [${intent}] ${summary}`);
      break;
    }

    case "suppress": {
      // Manually opt someone out permanently: outreach suppress a@b.com [--reason "..."]
      const email = args[0];
      const reason = flag(args, "--reason") || "manual";
      if (!email) die("usage: outreach suppress <email> [--reason \"...\"]");
      store.suppress(db, email, reason);
      store.save(db);
      console.log(`Suppressed ${email} — will never be emailed by this tool again unless unsuppressed.`);
      break;
    }

    case "unsuppress": {
      const email = args[0];
      if (!email) die("usage: outreach unsuppress <email>");
      store.unsuppress(db, email);
      store.save(db);
      console.log(`Removed ${email} from the suppression list.`);
      break;
    }

    case "note": {
      // outreach note a@b.com --text "..." [--append]
      const email = args[0];
      const text = flag(args, "--text");
      const append = args.includes("--append");
      const lead = Object.values(db.leads).find((l) => l.email === email);
      if (!lead || typeof text !== "string") die('usage: outreach note <email> --text "..." [--append]');
      lead.notes = append && lead.notes ? `${lead.notes}\n${text}` : text;
      store.save(db);
      console.log(`Updated notes for ${email}.`);
      break;
    }

    case "tag": {
      // outreach tag a@b.com --add tag1,tag2 --remove tag3
      const email = args[0];
      const lead = Object.values(db.leads).find((l) => l.email === email);
      if (!lead) die("usage: outreach tag <email> [--add tag1,tag2] [--remove tag3]");
      const toAdd = flag(args, "--add");
      const toRemove = flag(args, "--remove");
      const tags = new Set(lead.tags || []);
      if (typeof toAdd === "string") toAdd.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => tags.add(t));
      if (typeof toRemove === "string") toRemove.split(",").map((t) => t.trim()).forEach((t) => tags.delete(t));
      lead.tags = [...tags];
      store.save(db);
      console.log(`Tags for ${email}: ${lead.tags.join(", ") || "(none)"}`);
      break;
    }

    case "export": {
      // outreach export <out.csv> [--status drafted] [--emails a@b.com,c@d.com]
      const out = args[0];
      const statusFilter = flag(args, "--status");
      const emailFilter = flag(args, "--emails");
      if (!out) die("usage: outreach export <out.csv> [--status new|audited|drafted|sent|replied|skipped] [--emails a,b]");
      let leads = Object.values(db.leads);
      if (typeof statusFilter === "string") leads = leads.filter((l) => l.status === statusFilter);
      if (typeof emailFilter === "string") {
        const wanted = new Set(emailFilter.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
        leads = leads.filter((l) => wanted.has((l.email || "").toLowerCase()));
      }
      const cols = ["name", "email", "company", "website", "industry", "status", "score", "notes", "tags", "reply_intent"];
      const escCsv = (v) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = [cols.join(",")];
      for (const l of leads) {
        rows.push(
          [
            l.name,
            l.email,
            l.company,
            l.website,
            l.industry,
            l.status,
            l.draft?.quality_score ?? "",
            l.notes || "",
            (l.tags || []).join(";"),
            l.reply?.intent || "",
          ]
            .map(escCsv)
            .join(",")
        );
      }
      fs.writeFileSync(out, rows.join("\n"));
      console.log(`Exported ${leads.length} lead(s) to ${out}.`);
      break;
    }

    case "bulkdelete": {
      // outreach bulkdelete --emails a@b.com,c@d.com
      const list = flag(args, "--emails");
      if (typeof list !== "string") die("usage: outreach bulkdelete --emails a@b.com,c@d.com");
      const targets = new Set(list.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
      let removed = 0;
      for (const [id, lead] of Object.entries(db.leads)) {
        if (targets.has((lead.email || "").toLowerCase())) {
          delete db.leads[id];
          removed++;
        }
      }
      store.save(db);
      console.log(`Deleted ${removed} lead(s).`);
      break;
    }

    case "findleads": {
      const query = args[0];
      const location = args[1];
      if (!query || !location)
        die('usage: outreach findleads "<business type>" "<location>" [--limit N] [--no-scrape]');
      const limit = Number(flag(args, "--limit") || 50);
      const scrapeEmails = !args.includes("--no-scrape");
      const results = await findLeads({ query, location, limit, scrapeEmails }, (msg) =>
        console.log(msg)
      );
      let added = 0,
        dupe = 0,
        suppressed = 0,
        companyDupe = 0;
      for (const r of results) {
        const website = store.normalizeUrl(r.website);
        if (!r.email && !website) continue;
        if (r.email && store.isSuppressed(db, r.email)) {
          suppressed++;
          continue;
        }
        const id = store.leadId(r.email, website);
        if (db.leads[id]) {
          dupe++;
          continue;
        }
        if (store.findByCompany(db, r.company)) companyDupe++;
        db.leads[id] = {
          id,
          name: r.name,
          email: r.email || "",
          company: r.company,
          website,
          industry: query,
          phone: r.phone || "",
          status: STATUS.NEW,
          importedAt: new Date().toISOString(),
          source: "leadgen",
          notes: "",
          tags: [],
          followups: [],
        };
        added++;
      }
      store.save(db);
      const withEmail = results.filter((r) => r.email).length;
      console.log(
        `Added ${added} new lead(s) (${dupe} already in your list${suppressed ? `, ${suppressed} unsubscribed and skipped` : ""}${companyDupe ? `, ${companyDupe} possible company duplicates — review manually` : ""}). ${withEmail} have an email; the rest have a website you can audit and add an email to later.`
      );
      break;
    }

    case "override": {
      // Re-queue skipped leads so they get sent anyway. Only leads that already
      // have a written draft can be overridden (quality-threshold skips); leads
      // skipped because the site was broken/parked/unreachable have no email to
      // send and are reported as un-overridable.
      const email = args[0] && !args[0].startsWith("--") ? args[0] : null;
      const skipped = Object.values(db.leads).filter(
        (l) => l.status === STATUS.SKIPPED && (!email || l.email === email)
      );
      let requeued = 0;
      let blocked = 0;
      const noDraft = [];
      for (const l of skipped) {
        if (store.isSuppressed(db, l.email)) {
          blocked++;
          continue;
        }
        if (l.draft) {
          l.status = STATUS.DRAFTED;
          l.overridden = true;
          l.skipReason = null;
          requeued++;
        } else {
          noDraft.push(l);
        }
      }
      if (blocked) console.log(`${blocked} skipped lead(s) are unsubscribed and cannot be overridden.`);
      store.save(db);
      console.log(`Overrode ${requeued} skipped lead(s) — now queued to send.`);
      if (noDraft.length) {
        console.log(
          `${noDraft.length} skipped lead(s) have no draft (broken/parked site) and can't be sent:`
        );
        for (const l of noDraft) console.log(`  - ${l.email}: ${l.skipReason || "no audit"}`);
      }
      break;
    }

    case "report": {
      const out = writeReport(db);
      console.log(`Report written to ${out}`);
      break;
    }

    case "status": {
      const leads = Object.values(db.leads);
      const counts = {};
      for (const l of leads) counts[l.status] = (counts[l.status] || 0) + 1;
      console.log(`Leads: ${leads.length}`);
      for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(9)} ${v}`);
      console.log(`Sent today: ${sentToday(db)} / ${config.dailySendCap}`);
      break;
    }

    default:
      console.log(`outreach — personal website-audit cold outreach tool

Usage:
  outreach import <leads.csv>      Import leads (columns: name,email,company,website[,industry,language])
  outreach addlead --email a@b.com [--name] [--company] [--website] [--industry]
                                   Manually add a single lead
  outreach quicksend --email a@b.com --subject "..." --body "..." [--name] [--company]
                                   Write + send a one-off email immediately, no audit/draft needed
  outreach findleads "<type>" "<location>" [--limit N] [--no-scrape]
                                   Generate leads from OpenStreetMap (free) — e.g. "plumber" "Tampa, FL"
  outreach audit [--limit N]       Audit websites of new leads in headless Chromium
  outreach draft [--limit N]       Write personalized emails with Claude for audited leads
  outreach setdraft <email> [--subject "..."] [--body "..."]
                                   Manually edit a lead's drafted subject/body
  outreach preview [email]         Show drafted emails before sending
  outreach override [email]        Re-queue skipped leads (that have a draft) so they send anyway
  outreach send [--dry-run]        Send drafted emails via SMTP (throttled, daily cap)
  outreach followup [--dry-run]    Send due follow-ups to non-repliers
  outreach inbox                   Pull replies via IMAP and classify intent
  outreach reply <email> --text "" Record + classify a reply manually
  outreach suppress <email> [--reason "..."]   Permanently opt an address out (never emailed again)
  outreach unsuppress <email>      Remove an address from the suppression list
  outreach note <email> --text "..." [--append]   Set or append a note on a lead
  outreach tag <email> [--add tag1,tag2] [--remove tag3]   Manage tags on a lead
  outreach export <out.csv> [--status drafted]    Export leads to CSV
  outreach bulkdelete --emails a@b.com,c@d.com    Delete multiple leads at once
  outreach report                  Generate data/report.html pipeline overview
  outreach status                  Pipeline summary`);
  }
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
