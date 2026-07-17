import fs from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./config.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function writeReport(db) {
  const leads = Object.values(db.leads).sort(
    (a, b) => (b.draft?.quality_score || 0) - (a.draft?.quality_score || 0)
  );
  const counts = {};
  for (const l of leads) counts[l.status] = (counts[l.status] || 0) + 1;

  const rows = leads
    .map(
      (l) => `<tr>
  <td>${esc(l.name)}<br><small>${esc(l.company)}</small></td>
  <td><a href="${esc(l.website)}">${esc(l.website)}</a></td>
  <td><span class="badge ${esc(l.status)}">${esc(l.status)}</span>${
        l.reply ? `<br><small>${esc(l.reply.intent)}</small>` : ""
      }</td>
  <td>${l.draft?.quality_score ?? "—"}</td>
  <td>${(l.draft?.flaws || []).map((f) => `• ${esc(f)}`).join("<br>")}${
        l.skipReason ? `<small>${esc(l.skipReason)}</small>` : ""
      }</td>
  <td>${l.draft ? `<details><summary>${esc(l.draft.subject)}</summary><pre>${esc(l.draft.body)}</pre></details>` : "—"}</td>
</tr>`
    )
    .join("\n");

  const html = `<!doctype html>
<meta charset="utf-8">
<title>Outreach pipeline</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #1a1a1a; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid #ddd; vertical-align: top; }
  .badge { padding: .1rem .5rem; border-radius: 999px; font-size: .8rem; background: #eee; }
  .badge.sent { background: #cfe8ff; } .badge.replied { background: #c9f7c5; }
  .badge.drafted { background: #fff3bf; } .badge.skipped { background: #f1f3f5; color: #868e96; }
  pre { white-space: pre-wrap; background: #f8f9fa; padding: .75rem; border-radius: 6px; }
  .stats span { margin-right: 1.5rem; }
</style>
<h1>Outreach pipeline</h1>
<p class="stats">${Object.entries(counts)
    .map(([k, v]) => `<span><strong>${v}</strong> ${esc(k)}</span>`)
    .join("")}</p>
<table>
<tr><th>Lead</th><th>Website</th><th>Status</th><th>Score</th><th>Flaws found</th><th>Email</th></tr>
${rows}
</table>`;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const out = path.join(DATA_DIR, "report.html");
  fs.writeFileSync(out, html);
  return out;
}
