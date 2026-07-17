const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

// ---------- navigation ----------
function showView(name) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $$(".nav-btn").forEach((b) => b.classList.remove("active"));
  $(`#view-${name}`).classList.add("active");
  $(`.nav-btn[data-view="${name}"]`).classList.add("active");
  if (name !== "settings") refresh();
}
$$(".nav-btn").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
document.addEventListener("click", (e) => {
  const goto = e.target.closest("[data-goto]");
  if (goto) { e.preventDefault(); showView(goto.dataset.goto); }
});

// ---------- console log ----------
const consoleEl = $("#console");
window.outreach.onLog((chunk) => {
  consoleEl.textContent += chunk;
  consoleEl.scrollTop = consoleEl.scrollHeight;
});
window.outreach.onDone(() => refresh());
$("#btn-clear-log").addEventListener("click", () => (consoleEl.textContent = ""));

function log(line) {
  consoleEl.textContent += line + "\n";
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// ---------- actions ----------
const actionButtons = [
  "#btn-import", "#btn-import-2", "#btn-audit", "#btn-draft",
  "#btn-send", "#btn-send-dry", "#btn-followup", "#btn-inbox", "#btn-report",
  "#btn-install-browser",
];
function setBusy(busy) {
  actionButtons.forEach((sel) => { const b = $(sel); if (b) b.disabled = busy; });
}

async function runAction(label, fn) {
  setBusy(true);
  log(`\n▶ ${label}`);
  try {
    const res = await fn();
    if (res && res.ok === false && res.output) log(res.output);
  } catch (err) {
    log(`Error: ${err.message}`);
  }
  setBusy(false);
  refresh();
}

$("#btn-import").addEventListener("click", () => runAction("Loading lead list…", window.outreach.importLeads));
$("#btn-import-2").addEventListener("click", () => runAction("Loading lead list…", window.outreach.importLeads));
$("#btn-audit").addEventListener("click", () => runAction("Auditing websites…", window.outreach.runAudit));
$("#btn-draft").addEventListener("click", () => runAction("Generating drafts with Claude…", window.outreach.runDraft));
$("#btn-send-dry").addEventListener("click", () => runAction("Send (dry run)…", () => window.outreach.runSend(true)));
$("#btn-send").addEventListener("click", () => {
  if (!confirm("Send all drafted emails now? They go out from your real mailbox.")) return;
  runAction("Sending emails…", () => window.outreach.runSend(false));
});
$("#btn-followup").addEventListener("click", () => {
  if (!confirm("Send due follow-ups now?")) return;
  runAction("Sending follow-ups…", () => window.outreach.runFollowup(false));
});
$("#btn-inbox").addEventListener("click", () => runAction("Checking inbox…", window.outreach.runInbox));
$("#btn-report").addEventListener("click", () => runAction("Building report…", window.outreach.openReport));
$("#btn-install-browser").addEventListener("click", () =>
  runAction("Installing audit browser (Chromium)…", window.outreach.installBrowser)
);

// ---------- state rendering ----------
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function refresh() {
  const state = await window.outreach.getState();

  // config status dots + banner
  $("#dot-identity").classList.toggle("on", state.configured.identity);
  $("#dot-anthropic").classList.toggle("on", state.configured.anthropic);
  $("#dot-smtp").classList.toggle("on", state.configured.smtp);
  $("#dot-imap").classList.toggle("on", state.configured.imap);
  const ready = state.configured.identity && state.configured.anthropic;
  $("#setup-banner").classList.toggle("hidden", ready);

  // stats
  const c = state.counts;
  $("#stats").innerHTML = [
    ["Total leads", state.leads.length],
    ["New", c.new || 0],
    ["Audited", c.audited || 0],
    ["Drafted", c.drafted || 0],
    ["Sent", c.sent || 0],
    ["Replied", c.replied || 0],
    ["Sent today", state.sentToday],
  ]
    .map(([label, n]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join("");

  // leads table
  $("#leads-count").textContent = `${state.leads.length} lead(s)`;
  $("#leads-table tbody").innerHTML =
    state.leads
      .map(
        (l) => `<tr>
      <td>${esc(l.name) || "—"}<br><small>${esc(l.company)} · ${esc(l.email)}</small></td>
      <td><a href="${esc(l.website)}" target="_blank">${esc(l.website.replace(/^https?:\/\//, ""))}</a></td>
      <td><span class="badge ${esc(l.status)}">${esc(l.status)}</span>${
          l.reply ? `<br><span class="badge ${esc(l.reply.intent)}">${esc(l.reply.intent)}</span>` : ""
        }</td>
      <td>${l.score ?? "—"}</td>
      <td><small>${esc(l.skipReason || (l.flaws || []).slice(0, 2).join("; ") || (l.reply?.summary ?? ""))}</small></td>
    </tr>`
      )
      .join("") || `<tr><td colspan="5" class="empty">No leads yet — load a CSV to get started.</td></tr>`;

  // emails
  const withDrafts = state.leads.filter((l) => l.subject);
  $("#emails-list").innerHTML =
    withDrafts
      .map(
        (l) => `<div class="email-card">
      <div class="head">
        <span class="to">${esc(l.name)} <small>&lt;${esc(l.email)}&gt; · ${esc(l.company)}</small></span>
        <span class="badge ${esc(l.status)}">${esc(l.status)}</span>
      </div>
      <div class="subject">Subject: ${esc(l.subject)}</div>
      <pre>${esc(l.body)}</pre>
      <div class="flaws">Score ${l.score ?? "—"} · Flaws: ${esc((l.flaws || []).join("; "))}</div>
    </div>`
      )
      .join("") || `<div class="empty">No drafts yet — run steps 1–3 on the Dashboard.</div>`;
}

// ---------- settings ----------
const form = $("#settings-form");

async function loadSettingsForm() {
  const s = await window.outreach.getSettings();
  for (const el of form.elements) {
    if (el.name && s[el.name] !== undefined) el.value = s[el.name];
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const s = {};
  for (const el of form.elements) if (el.name) s[el.name] = el.value;
  await window.outreach.saveSettings(s);
  $("#save-status").textContent = "Saved ✓";
  setTimeout(() => ($("#save-status").textContent = ""), 2500);
  refresh();
});

// ---------- init ----------
loadSettingsForm();
refresh();
log("AT DEV GROUP Outreach Studio ready.");
