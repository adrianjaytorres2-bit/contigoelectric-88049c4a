#!/usr/bin/env node
import fs from "node:fs";
import { loadConfig } from "./config.js";
import * as store from "./store.js";
import { csvToObjects } from "./csv.js";
import { auditSites } from "./audit.js";
import { draftEmail, draftFollowup, classifyReply } from "./writer.js";
import { transport, sendEmail, sleep, sentToday } from "./sender.js";
import { fetchReplies } from "./inbox.js";
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
          followups: [],
        };
        added++;
      }
      store.save(db);
      console.log(`Imported ${added} leads (${skipped} skipped as duplicate/incomplete).`);
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

    case "draft": {
      const limit = Number(flag(args, "--limit") || Infinity);
      const audited = store.leadsByStatus(db, STATUS.AUDITED).slice(0, limit);
      if (!audited.length) return console.log("No audited leads to draft. Run `audit` first.");
      for (const lead of audited) {
        process.stdout.write(`Drafting for ${lead.company || lead.website}... `);
        try {
          const draft = await draftEmail(lead, config);
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
      const budget = config.dailySendCap - sentToday(db);
      if (budget <= 0) return console.log("Daily send cap reached. Try again tomorrow.");
      const batch = drafted.slice(0, budget);
      const t = dryRun ? null : transport();
      for (const lead of batch) {
        if (dryRun) {
          console.log(`[dry-run] would send to ${lead.email}: "${lead.draft.subject}"`);
          continue;
        }
        try {
          const messageId = await sendEmail(t, {
            to: lead.email,
            subject: lead.draft.subject,
            body: lead.draft.body,
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
        }
      }
      break;
    }

    case "followup": {
      const dryRun = args.includes("--dry-run");
      const now = Date.now();
      const due = Object.values(db.leads).filter((l) => {
        if (l.status !== STATUS.SENT) return false; // replied leads are auto-paused
        if ((l.followups || []).length >= config.maxFollowups) return false;
        const last = l.followups?.length
          ? l.followups[l.followups.length - 1].sentAt
          : l.sentAt;
        return now - Date.parse(last) > config.followupAfterDays * 86400_000;
      });
      if (!due.length) return console.log("No follow-ups due.");
      const budget = config.dailySendCap - sentToday(db);
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
          const messageId = await sendEmail(t, {
            to: lead.email,
            subject: fu.subject,
            body: fu.body,
            inReplyTo: lead.messageId,
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
        store.save(db);
        const marker = intent === "interested" ? "🔥" : intent === "maybe_later" ? "⏳" : "—";
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
      store.save(db);
      console.log(`Recorded reply from ${email}: [${intent}] ${summary}`);
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
      const noDraft = [];
      for (const l of skipped) {
        if (l.draft) {
          l.status = STATUS.DRAFTED;
          l.overridden = true;
          l.skipReason = null;
          requeued++;
        } else {
          noDraft.push(l);
        }
      }
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
  outreach audit [--limit N]       Audit websites of new leads in headless Chromium
  outreach draft [--limit N]       Write personalized emails with Claude for audited leads
  outreach preview [email]         Show drafted emails before sending
  outreach override [email]        Re-queue skipped leads (that have a draft) so they send anyway
  outreach send [--dry-run]        Send drafted emails via SMTP (throttled, daily cap)
  outreach followup [--dry-run]    Send due follow-ups to non-repliers
  outreach inbox                   Pull replies via IMAP and classify intent
  outreach reply <email> --text "" Record + classify a reply manually
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
