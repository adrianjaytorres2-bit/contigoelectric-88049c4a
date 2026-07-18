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
  "#btn-add-lead", "#btn-quick-send", "#btn-bulk-export", "#btn-bulk-delete",
  "#btn-export-all", "#btn-fb-generate",
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

$("#btn-fb-generate").addEventListener("click", () =>
  runAction("Writing Facebook DM drafts…", () => window.outreach.fbGenerateDrafts())
);

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
let selectedEmails = new Set();

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

function visibleLeads() {
  return leadState
    .filter((l) => leadFilter === "all" || l.status === leadFilter)
    .filter((l) => {
      if (!leadQuery) return true;
      const haystack = [l.name, l.company, l.email, l.website, ...(l.tags || [])];
      return haystack.some((v) => String(v || "").toLowerCase().includes(leadQuery));
    });
}

function updateBulkBar() {
  const n = selectedEmails.size;
  $("#bulk-bar").classList.toggle("hidden", n === 0);
  $("#bulk-count").textContent = `${n} selected`;
}

function renderLeads() {
  const rows = visibleLeads();
  $("#leads-count").textContent = `${rows.length} of ${leadState.length} lead(s)`;
  $("#leads-table tbody").innerHTML =
    rows
      .map(
        (l) => `<tr>
      <td><input type="checkbox" class="row-check" data-email="${esc(l.email)}" ${selectedEmails.has(l.email) ? "checked" : ""} /></td>
      <td>${esc(l.name) || "—"}<br><small>${esc(l.company)} · ${esc(l.email)}</small></td>
      <td><a href="${esc(l.website)}" target="_blank">${esc(l.website.replace(/^https?:\/\//, ""))}</a></td>
      <td><span class="badge ${esc(l.status)}">${esc(l.status)}</span>${
          l.reply ? `<br><span class="badge ${esc(l.reply.intent)}">${esc(l.reply.intent)}</span>` : ""
        }${l.variant ? `<br><span class="badge">variant ${esc(l.variant)}</span>` : ""}</td>
      <td>${l.score ?? "—"}</td>
      <td><small>${esc(l.skipReason || (l.flaws || []).slice(0, 2).join("; ") || (l.reply?.summary ?? ""))}</small></td>
      <td>
        ${(l.tags || []).map((t) => `<span class="tag-pill">${esc(t)}</span>`).join("")}
        ${l.notes ? `<div class="notes-preview">${esc(l.notes.slice(0, 60))}${l.notes.length > 60 ? "…" : ""}</div>` : ""}
        <button class="btn tiny" data-detail="${esc(l.email)}">🔍 Details</button>
      </td>
      <td>${
        l.status === "drafted" && l.email
          ? `<button class="btn tiny primary" data-sendone="${esc(l.email)}">🚀 Send</button>`
          : l.status === "skipped" && l.subject
          ? `<button class="btn tiny override" data-override="${esc(l.email)}">Send anyway</button>`
          : ""
      }</td>
    </tr>`
      )
      .join("") || `<tr><td colspan="8" class="empty">No leads match — adjust the search or filter.</td></tr>`;

  $$("#leads-table [data-override]").forEach((b) =>
    b.addEventListener("click", () =>
      runAction(`Overriding ${b.dataset.override}…`, () => window.outreach.runOverride(b.dataset.override))
    )
  );
  $$("#leads-table [data-detail]").forEach((b) =>
    b.addEventListener("click", () => openLeadDetail(b.dataset.detail))
  );
  $$("#leads-table [data-sendone]").forEach((b) =>
    b.addEventListener("click", () => {
      const email = b.dataset.sendone;
      if (!confirm(`Send the drafted email to ${email} now? It goes out from your real mailbox immediately.`)) return;
      runAction(`Sending to ${email}…`, () => window.outreach.sendOne(email));
    })
  );
  $$("#leads-table .row-check").forEach((cb) =>
    cb.addEventListener("change", () => {
      if (cb.checked) selectedEmails.add(cb.dataset.email);
      else selectedEmails.delete(cb.dataset.email);
      updateBulkBar();
    })
  );

  const allVisible = rows.map((l) => l.email);
  $("#select-all-leads").checked = allVisible.length > 0 && allVisible.every((e) => selectedEmails.has(e));
  updateBulkBar();
}

$("#select-all-leads").addEventListener("change", (e) => {
  const rows = visibleLeads();
  if (e.target.checked) rows.forEach((l) => selectedEmails.add(l.email));
  else rows.forEach((l) => selectedEmails.delete(l.email));
  renderLeads();
});

$("#btn-bulk-clear").addEventListener("click", () => {
  selectedEmails.clear();
  renderLeads();
});

$("#btn-bulk-delete").addEventListener("click", async () => {
  const emails = [...selectedEmails];
  if (!emails.length) return;
  if (!confirm(`Permanently delete ${emails.length} lead(s)? This can't be undone.`)) return;
  await runAction(`Deleting ${emails.length} lead(s)…`, () => window.outreach.bulkDelete(emails));
  selectedEmails.clear();
});

$("#btn-bulk-export").addEventListener("click", () => {
  const emails = [...selectedEmails];
  if (!emails.length) return;
  runAction(`Exporting ${emails.length} lead(s)…`, () => window.outreach.exportLeads({ emails }));
});

$("#btn-export-all").addEventListener("click", () => {
  runAction("Exporting all leads…", () => window.outreach.exportLeads({}));
});

// ---------- lead detail modal (notes, tags, unsubscribe) ----------
function openLeadDetail(email) {
  const lead = leadState.find((l) => l.email === email);
  if (!lead) return;
  const form = $("#form-lead-detail");
  form.email.value = email;
  form.notes.value = lead.notes || "";
  form.tags.value = (lead.tags || []).join(", ");
  $("#ld-title").textContent = lead.name || email;
  $("#ld-meta").textContent = `${lead.company || ""} · ${email}`;

  // full info block
  const rows = [
    ["Email", lead.email || "—"],
    ["Company", lead.company || "—"],
    ["Website", lead.website || "—"],
    lead.phone ? ["Phone", lead.phone] : null,
    lead.industry ? ["Type", lead.industry] : null,
    ["Status", lead.status],
    ["Quality score", lead.score ?? "—"],
    lead.facebookUrl ? ["Facebook", lead.facebookUrl] : null,
    lead.sentAt ? ["Sent", new Date(lead.sentAt).toLocaleString()] : null,
    lead.followupCount ? ["Follow-ups sent", lead.followupCount] : null,
    lead.reply ? ["Reply", `${lead.reply.intent} — ${lead.reply.summary || ""}`] : null,
  ].filter(Boolean);
  $("#ld-info").innerHTML = rows
    .map(([k, v]) => `<div class="ld-row"><span>${esc(k)}</span><b>${esc(String(v))}</b></div>`)
    .join("");

  // draft preview + one-off send
  const hasDraft = !!lead.subject;
  $("#ld-draft").classList.toggle("hidden", !hasDraft);
  if (hasDraft) {
    $("#ld-subject").textContent = lead.subject;
    $("#ld-body").textContent = lead.body || "";
    const canSend = lead.status !== "sent" && !!lead.email;
    const btn = $("#btn-send-one");
    btn.classList.toggle("hidden", !canSend);
    btn.dataset.email = email;
  }
  openModal("modal-lead-detail");
}

$("#btn-send-one").addEventListener("click", async () => {
  const email = $("#btn-send-one").dataset.email;
  if (!email) return;
  if (!confirm(`Send this email to ${email} now? It goes out from your real mailbox immediately.`)) return;
  $("#modal-lead-detail").classList.add("hidden");
  await runAction(`Sending to ${email}…`, () => window.outreach.sendOne(email));
});

$("#form-lead-detail").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value;
  const notes = f.notes.value.trim();
  const tags = f.tags.value.trim();
  f.closest(".modal-overlay").classList.add("hidden");
  await window.outreach.setNote({ email, text: notes, append: false });
  await window.outreach.setTags({ email, add: tags, remove: "" });
  // Tags field is a full replacement in the UI's mental model — clear any tags
  // not present in the new list before re-adding, by diffing against current state.
  const lead = leadState.find((l) => l.email === email);
  const wanted = new Set(tags.split(",").map((t) => t.trim()).filter(Boolean));
  const toRemove = (lead?.tags || []).filter((t) => !wanted.has(t));
  if (toRemove.length) await window.outreach.setTags({ email, add: "", remove: toRemove.join(",") });
  refresh();
});

$("#btn-suppress-lead").addEventListener("click", async () => {
  const email = $("#form-lead-detail").email.value;
  if (!confirm(`Unsubscribe ${email}? They will never be emailed by this tool again unless you manually undo it.`)) return;
  $("#modal-lead-detail").classList.add("hidden");
  await runAction(`Unsubscribing ${email}…`, () => window.outreach.suppressLead({ email, reason: "manual" }));
});

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
    ["Sent today", `${state.sentToday} / ${state.dailyCapToday}`],
  ]
    .map(([label, n]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join("");

  // warmup hint
  $("#warmup-cap-hint").classList.toggle("hidden", !state.warmupActive);
  if (state.warmupActive) {
    $("#warmup-cap-hint").textContent = `🌱 Warmup active — today's cap is ${state.dailyCapToday}. See Analytics for the full ramp.`;
  }

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

  // analytics
  renderAnalytics(state);

  // facebook DM queue
  renderFacebook(state);

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

// ---------- analytics ----------
const STYLE_LABELS = {
  natural: "Natural & Human", casual: "Casual & Friendly", professional: "Professional & Polished",
  direct: "Direct & No-Fluff", story: "Story-Driven Opener", witty: "Witty & Light Humor",
  consultative: "Warm & Consultative",
};
const pct = (n) => `${Math.round(n * 100)}%`;

function renderAnalytics(state) {
  const a = state.analytics;
  $("#analytics-stats").innerHTML = [
    ["Emails sent (ever)", a.totalSent],
    ["Replies received", a.totalReplied],
    ["Reply rate", a.totalSent ? pct(a.replyRate) : "—"],
    ["Unsubscribed", state.suppressedCount],
  ]
    .map(([label, n]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join("");

  // A/B variant comparison
  const variants = a.variants || {};
  const hasVariants = variants.A || variants.B;
  $("#ab-card").classList.toggle("hidden", !hasVariants);
  if (hasVariants) {
    $("#ab-results").innerHTML = ["A", "B"]
      .map((v) => {
        const d = variants[v] || { sent: 0, replied: 0, interested: 0 };
        const rate = d.sent ? d.replied / d.sent : 0;
        return `<div style="margin-bottom:12px;">
        <b>Variant ${v}</b> <span style="color:var(--muted);font-size:12.5px;">(${d.sent} sent · ${d.replied} replied · ${d.interested} interested)</span>
        <div class="scale-bar" style="margin-top:6px;background:var(--panel-2);">
          <div style="height:100%;width:${Math.min(100, rate * 100)}%;background:var(--accent);border-radius:6px;"></div>
        </div>
        <span style="font-size:12.5px;color:var(--accent-2);">${pct(rate)} reply rate</span>
      </div>`;
      })
      .join("") + `<p class="note">Enable/configure variants in Settings → A/B testing.</p>`;
  }

  // warmup status
  if (state.warmupActive) {
    $("#warmup-card").classList.remove("hidden");
    $("#warmup-status").innerHTML = `<p>🌱 Warmup is active. Today's send cap is <b>${state.dailyCapToday}</b>. It steps up automatically over time — check back as you approach your target cap.</p>`;
  } else {
    $("#warmup-card").classList.add("hidden");
  }

  // reply intent breakdown
  const byIntent = a.byIntent || {};
  const intentLabels = { interested: "🔥 Interested", maybe_later: "⏳ Maybe later", not_now: "Not now", unsubscribe: "🚫 Unsubscribed" };
  const total = Object.values(byIntent).reduce((s, n) => s + n, 0);
  $("#intent-breakdown").innerHTML =
    total === 0
      ? `<p class="hint" style="margin:0;">No replies recorded yet.</p>`
      : Object.entries(intentLabels)
          .map(([key, label]) => {
            const n = byIntent[key] || 0;
            return `<div style="margin-bottom:8px;"><span>${label}: <b>${n}</b></span></div>`;
          })
          .join("");
}

// ---------- Facebook DM queue (manual send only) ----------
function renderFacebook(state) {
  const eligible = state.fbEligibleCount || 0;
  $("#fb-eligible-hint").textContent = eligible
    ? `${eligible} audited lead(s) have a Facebook Page link and are ready for a DM draft.`
    : `No leads waiting for a DM draft right now — leads need a website audit done and a Facebook Page link found by Find Leads first.`;

  const queue = state.fbQueue || [];
  const pending = queue.filter((q) => q.status === "pending");
  const done = queue.filter((q) => q.status !== "pending");

  const card = (q) => `<div class="fb-card" data-id="${esc(q.id)}">
      <div class="head">
        <span class="to">${esc(q.name) || esc(q.company)} <small>${esc(q.company)}</small></span>
        <span class="badge ${q.status === "sent" ? "sent" : q.status === "skipped" ? "skipped" : "drafted"}">${esc(q.status)}</span>
      </div>
      <textarea class="fb-draft-input" rows="4" ${q.status !== "pending" ? "disabled" : ""}>${esc(q.draft)}</textarea>
      <div class="email-card-footer">
        <a href="#" class="btn tiny fb-open" data-url="${esc(q.facebookUrl)}">🔗 Open Facebook Page</a>
        ${
          q.status === "pending"
            ? `<button class="btn tiny fb-copy">📋 Copy message</button>
               <button class="btn tiny primary fb-sent" data-id="${esc(q.id)}">✅ Mark sent</button>
               <button class="btn tiny fb-skip" data-id="${esc(q.id)}">⏭ Skip</button>`
            : `<span class="hint" style="margin:0;">${q.status === "sent" ? "Marked sent" : "Skipped"}${q.sentAt ? " · " + new Date(q.sentAt).toLocaleDateString() : ""}</span>`
        }
      </div>
    </div>`;

  $("#fb-queue").innerHTML =
    (pending.length ? `<h3 class="fb-section-title">Ready to send (${pending.length})</h3>${pending.map(card).join("")}` : `<div class="empty">No drafts waiting. Click “Generate DM drafts” above.</div>`) +
    (done.length ? `<h3 class="fb-section-title">History</h3>${done.map(card).join("")}` : "");

  $$("#fb-queue .fb-open").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (a.dataset.url) window.outreach.fbOpenLink(a.dataset.url);
    })
  );
  $$("#fb-queue .fb-copy").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const text = btn.closest(".fb-card").querySelector(".fb-draft-input").value;
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = "Copied ✓";
      setTimeout(() => (btn.textContent = prev), 1500);
    })
  );
  $$("#fb-queue .fb-sent").forEach((btn) =>
    btn.addEventListener("click", () => {
      const q = queue.find((x) => x.id === btn.dataset.id);
      if (q) runAction(`Marking ${q.name || q.company} sent…`, () => window.outreach.fbMarkSent(q.id));
    })
  );
  $$("#fb-queue .fb-skip").forEach((btn) =>
    btn.addEventListener("click", () => {
      const q = queue.find((x) => x.id === btn.dataset.id);
      if (q) runAction(`Skipping ${q.name || q.company}…`, () => window.outreach.fbMarkSkipped(q.id));
    })
  );
}

// ---------- schedule send ----------
let selectedPreset = null;

function nextWeekdayAt(hour, minute, weekdays) {
  const d = new Date();
  d.setSeconds(0, 0);
  for (let i = 1; i <= 8; i++) {
    const cand = new Date(d.getTime() + i * 86400000);
    cand.setHours(hour, minute, 0, 0);
    if (weekdays.includes(cand.getDay()) && cand > new Date()) return cand;
  }
  return d;
}
function tomorrowAt(hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return d;
}
function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

$("#btn-schedule").addEventListener("click", () => {
  openModal("modal-schedule");
  renderScheduledList();
});

$$(".preset-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".preset-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPreset = btn.dataset.preset;
    let when;
    if (selectedPreset === "tue-morning") when = nextWeekdayAt(9, 30, [2, 3, 4]);
    else if (selectedPreset === "early-morning") when = tomorrowAt(7, 0);
    else if (selectedPreset === "afternoon") when = tomorrowAt(13, 30);
    if (when) $("#form-schedule").when.value = toLocalInputValue(when);
  })
);

$("#form-schedule").addEventListener("submit", async (e) => {
  e.preventDefault();
  const when = e.target.when.value;
  if (!when) return alert("Pick a time (choose a preset above or set a custom time).");
  const fireAt = new Date(when).toISOString();
  if (new Date(fireAt) <= new Date()) return alert("Pick a time in the future.");
  await window.outreach.scheduleCreate({ fireAt, type: "send" });
  e.target.reset();
  $$(".preset-btn").forEach((b) => b.classList.remove("selected"));
  renderScheduledList();
});

async function renderScheduledList() {
  const list = await window.outreach.scheduleList();
  $("#scheduled-list").innerHTML =
    list
      .map(
        (s) => `<div class="scheduled-item">
      <span>🕒 ${new Date(s.fireAt).toLocaleString()} — ${esc(s.type)}</span>
      <button class="btn tiny danger" data-cancel-schedule="${esc(s.id)}">Cancel</button>
    </div>`
      )
      .join("") || `<p class="hint" style="margin:10px 0 0;">No sends scheduled.</p>`;
  $$("[data-cancel-schedule]").forEach((b) =>
    b.addEventListener("click", async () => {
      await window.outreach.scheduleCancel(b.dataset.cancelSchedule);
      renderScheduledList();
    })
  );
}

window.outreach.onScheduleFired((entry) => {
  log(`\n🕒 Scheduled ${entry.type} fired at ${new Date().toLocaleTimeString()}.`);
});

// ---------- auto-update ----------
window.outreach.onUpdateReady(() => {
  $("#update-banner").classList.remove("hidden");
});
$("#update-banner").addEventListener("click", () => {
  if (!confirm("Restart now to install the update?")) return;
  window.outreach.restartToUpdate();
});

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
