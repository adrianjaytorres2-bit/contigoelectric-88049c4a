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
$("#btn-override").addEventListener("click", () => {
  if (!confirm("Re-queue all skipped leads (that have a draft) so they send on the next Send?")) return;
  runAction("Overriding skipped leads…", () => window.outreach.runOverride());
});

// ---------- lead navigator (search + status filter) ----------
let leadState = [];
let leadFilter = "all";
let leadQuery = "";

$("#lead-search").addEventListener("input", (e) => {
  leadQuery = e.target.value.toLowerCase().trim();
  renderLeads();
});
$$("#lead-filters .chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    $$("#lead-filters .chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    leadFilter = chip.dataset.filter;
    renderLeads();
  })
);

function renderLeads() {
  const rows = leadState
    .filter((l) => leadFilter === "all" || l.status === leadFilter)
    .filter((l) => {
      if (!leadQuery) return true;
      return [l.name, l.company, l.email, l.website].some((v) =>
        String(v || "").toLowerCase().includes(leadQuery)
      );
    });
  $("#leads-count").textContent = `${rows.length} of ${leadState.length} lead(s)`;
  $("#leads-table tbody").innerHTML =
    rows
      .map(
        (l) => `<tr>
      <td>${esc(l.name) || "—"}<br><small>${esc(l.company)} · ${esc(l.email)}</small></td>
      <td><a href="${esc(l.website)}" target="_blank">${esc(l.website.replace(/^https?:\/\//, ""))}</a></td>
      <td><span class="badge ${esc(l.status)}">${esc(l.status)}</span>${
          l.reply ? `<br><span class="badge ${esc(l.reply.intent)}">${esc(l.reply.intent)}</span>` : ""
        }</td>
      <td>${l.score ?? "—"}</td>
      <td><small>${esc(l.skipReason || (l.flaws || []).slice(0, 2).join("; ") || (l.reply?.summary ?? ""))}</small></td>
      <td>${
        l.status === "skipped" && l.subject
          ? `<button class="btn tiny override" data-override="${esc(l.email)}">Send anyway</button>`
          : ""
      }</td>
    </tr>`
      )
      .join("") || `<tr><td colspan="6" class="empty">No leads match — adjust the search or filter.</td></tr>`;

  $$("#leads-table [data-override]").forEach((b) =>
    b.addEventListener("click", () =>
      runAction(`Overriding ${b.dataset.override}…`, () => window.outreach.runOverride(b.dataset.override))
    )
  );
}

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

  // override button: show when skipped leads still have a draft to send
  const overridable = state.leads.filter((l) => l.status === "skipped" && l.subject).length;
  $("#btn-override").classList.toggle("hidden", overridable === 0);
  $("#override-hint").classList.toggle("hidden", overridable === 0);
  if (overridable) {
    $("#override-hint").textContent = `${overridable} lead(s) were skipped for scoring too well — their emails are already written.`;
  }

  // leads navigator
  leadState = state.leads;
  renderLeads();

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
