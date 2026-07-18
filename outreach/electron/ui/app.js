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
// Mirror engine output to the dashboard log and (when present) the Find Leads log.
function appendLog(text) {
  for (const el of [consoleEl, $("#lg-console")]) {
    if (el) {
      el.textContent += text;
      el.scrollTop = el.scrollHeight;
    }
  }
}
window.outreach.onLog((chunk) => appendLog(chunk));
window.outreach.onDone(() => refresh());
$("#btn-clear-log").addEventListener("click", () => (consoleEl.textContent = ""));

function log(line) {
  appendLog(line + "\n");
}

// ---------- actions ----------
const actionButtons = [
  "#btn-import", "#btn-import-2", "#btn-audit", "#btn-draft",
  "#btn-send", "#btn-send-dry", "#btn-followup", "#btn-inbox", "#btn-report",
  "#btn-install-browser", "#btn-override", "#btn-findleads",
  "#btn-add-lead", "#btn-quick-send",
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

$("#btn-findleads").addEventListener("click", () => {
  const query = $("#lg-query").value.trim();
  const location = $("#lg-location").value.trim();
  if (!query || !location) {
    alert("Enter a business type (e.g. plumber) and a location (e.g. Tampa, FL).");
    return;
  }
  const limit = Number($("#lg-limit").value) || 50;
  const scrape = $("#lg-scrape").checked;
  if ($("#lg-console")) $("#lg-console").textContent = "";
  runAction(`Finding "${query}" in ${location}…`, () =>
    window.outreach.findLeads({ query, location, limit, scrape })
  );
});

// ---------- Add Lead / Quick Send modals ----------
function openModal(id) {
  $(`#${id}`).classList.remove("hidden");
}
function closeModal(el) {
  el.closest(".modal-overlay").classList.add("hidden");
}
$$("[data-close-modal]").forEach((b) => b.addEventListener("click", () => closeModal(b)));
$$(".modal-overlay").forEach((overlay) =>
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.add("hidden");
  })
);

$("#btn-add-lead").addEventListener("click", () => openModal("modal-add-lead"));
$("#btn-quick-send").addEventListener("click", () => openModal("modal-quick-send"));

$("#form-add-lead").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const params = {
    email: f.email.value.trim(),
    name: f.name.value.trim(),
    company: f.company.value.trim(),
    website: f.website.value.trim(),
    industry: f.industry.value.trim(),
  };
  if (!params.email) return alert("Email is required.");
  f.closest(".modal-overlay").classList.add("hidden");
  f.reset();
  await runAction(`Adding ${params.email}…`, () => window.outreach.addLead(params));
  showView("leads");
});

$("#form-quick-send").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const params = {
    email: f.email.value.trim(),
    name: f.name.value.trim(),
    company: f.company.value.trim(),
    subject: f.subject.value.trim(),
    body: f.body.value.trim(),
  };
  if (!params.email || !params.subject || !params.body) return alert("Email, subject, and body are required.");
  if (!confirm(`Send this email to ${params.email} right now?`)) return;
  f.closest(".modal-overlay").classList.add("hidden");
  f.reset();
  await runAction(`Sending to ${params.email}…`, () => window.outreach.quickSend(params));
  showView("leads");
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
        (l) => `<div class="email-card" data-email="${esc(l.email)}">
      <div class="head">
        <span class="to">${esc(l.name)} <small>&lt;${esc(l.email)}&gt; · ${esc(l.company)}</small></span>
        <span class="badge ${esc(l.status)}">${esc(l.status)}</span>
      </div>
      <label class="field-label">Subject</label>
      <input class="subject-input" value="${esc(l.subject)}" ${l.status === "sent" ? "disabled" : ""} />
      <label class="field-label">Body</label>
      <textarea class="body-input" rows="8" ${l.status === "sent" ? "disabled" : ""}>${esc(l.body)}</textarea>
      <div class="email-card-footer">
        <span class="flaws">Score ${l.score ?? "—"} · Flaws: ${esc((l.flaws || []).join("; "))}</span>
        ${
          l.status === "sent"
            ? `<span class="hint" style="margin:0;">Already sent — locked</span>`
            : `<button class="btn tiny save-draft">💾 Save changes</button><span class="save-ok"></span>`
        }
      </div>
    </div>`
      )
      .join("") || `<div class="empty">No drafts yet — run steps 1–3 on the Dashboard.</div>`;

  $$("#emails-list .save-draft").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const card = btn.closest(".email-card");
      const email = card.dataset.email;
      const subject = card.querySelector(".subject-input").value.trim();
      const body = card.querySelector(".body-input").value.trim();
      btn.disabled = true;
      btn.textContent = "Saving…";
      await window.outreach.setDraft({ email, subject, body });
      btn.disabled = false;
      btn.textContent = "💾 Save changes";
      const ok = card.querySelector(".save-ok");
      ok.textContent = "Saved ✓";
      setTimeout(() => (ok.textContent = ""), 2000);
    })
  );
}

// ---------- settings ----------
const form = $("#settings-form");

async function loadSettingsForm() {
  const s = await window.outreach.getSettings();
  for (const el of form.elements) {
    if (!el.name || s[el.name] === undefined) continue;
    if (el.type === "checkbox") el.checked = !!s[el.name];
    else el.value = s[el.name];
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const s = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    s[el.name] = el.type === "checkbox" ? el.checked : el.value;
  }
  await window.outreach.saveSettings(s);
  $("#save-status").textContent = "Saved ✓";
  setTimeout(() => ($("#save-status").textContent = ""), 2500);
  refresh();
});

// ---------- init ----------
loadSettingsForm();
refresh();
log("AT DEV GROUP Outreach Studio ready.");
