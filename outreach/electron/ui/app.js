const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

// ---------- navigation ----------
function showView(name) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $$(".nav-btn").forEach((b) => b.classList.remove("active"));
  $(`#view-${name}`).classList.add("active");
  $(`.nav-btn[data-view="${name}"]`).classList.add("active");
  if (name !== "settings") refresh();
  // The queue fetches its own payload from the engine rather than riding on
  // readState, so it needs an explicit load when the view opens.
  if (name === "queue") renderQueue();
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
  "#btn-export-all", "#btn-fb-generate", "#btn-verify-leads",
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

$("#lg-independent").addEventListener("change", (e) => {
  $("#lg-maxreviews-wrap").classList.toggle("hidden", !e.target.checked);
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
  const independent = $("#lg-independent").checked;
  const maxReviews = independent && $("#lg-maxreviews").value ? Number($("#lg-maxreviews").value) : null;
  const onlyNoWebsite = $("#lg-nowebsite").checked;
  if ($("#lg-console")) $("#lg-console").textContent = "";
  runAction(`Finding "${query}" in ${location}…`, () =>
    window.outreach.findLeads({ query, location, limit, scrape, independent, maxReviews, onlyNoWebsite })
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

// ---------- emails search ----------
let emailQuery = "";
$("#email-search").addEventListener("input", (e) => {
  emailQuery = e.target.value.toLowerCase().trim();
  renderEmails(lastState);
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
      <td>${
        l.website
          ? `<a href="${esc(l.website)}" target="_blank">${esc(l.website.replace(/^https?:\/\//, ""))}</a>`
          : l.phone
          ? `<span class="hint" style="margin:0;">📞 ${esc(l.phone)} (no website)</span>`
          : `<span class="hint" style="margin:0;">—</span>`
      }</td>
      <td><span class="badge ${esc(l.status)}">${esc(l.status)}</span>${
          l.reply ? `<br><span class="badge ${esc(l.reply.intent)}">${esc(l.reply.intent)}</span>` : ""
        }${l.variant ? `<br><span class="badge">variant ${esc(l.variant)}</span>` : ""}${
          l.emailVerified?.status === "invalid"
            ? `<br><span class="badge skipped" title="${esc(l.emailVerified.reason || "")}">⚠ bounce risk</span>`
            : l.emailVerified?.status === "risky"
            ? `<br><span class="badge maybe_later" title="${esc(l.emailVerified.reason || "")}">⚠ risky</span>`
            : l.emailVerified?.status === "valid"
            ? `<br><span class="badge sent" title="${esc(l.emailVerified.reason || "")}">✓ verified</span>`
            : ""
        }${
          l.followupsPaused
            ? `<br><span class="badge skipped" title="${esc(l.followupsPausedReason || "")}">⏸️ no follow-ups</span>`
            : ""
        }</td>
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

$("#btn-verify-leads").addEventListener("click", () => {
  runAction("Checking emails for bounce risk…", () => window.outreach.verifyLeads({ all: true }));
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
    lead.followupsPaused ? ["Follow-ups", `⏸️ stopped — ${lead.followupsPausedReason || "manually excluded"}`] : null,
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

  // follow-up toggle reflects current state
  const fuBtn = $("#btn-toggle-followups");
  fuBtn.dataset.key = lead.id || email;
  fuBtn.dataset.paused = lead.followupsPaused ? "1" : "";
  fuBtn.textContent = lead.followupsPaused ? "▶️ Resume follow-ups" : "⏸️ Stop follow-ups";

  openModal("modal-lead-detail");
}

$("#btn-toggle-followups").addEventListener("click", async () => {
  const btn = $("#btn-toggle-followups");
  const key = btn.dataset.key;
  const paused = !!btn.dataset.paused;
  $("#modal-lead-detail").classList.add("hidden");
  if (paused) {
    await runAction("Resuming follow-ups…", () => window.outreach.resumeFollowup(key));
  } else {
    await runAction("Stopping follow-ups…", () =>
      window.outreach.noFollowup({ key, reason: "manually excluded" })
    );
  }
});

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

let lastState = null;

async function refresh() {
  const state = await window.outreach.getState();
  lastState = state;

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
  renderEmails(state);
}

function visibleEmails(state) {
  const withDrafts = state.leads.filter((l) => l.subject);
  if (!emailQuery) return withDrafts;
  return withDrafts.filter((l) => {
    const haystack = [l.name, l.company, l.email, l.subject, l.body];
    return haystack.some((v) => String(v || "").toLowerCase().includes(emailQuery));
  });
}

function renderEmails(state) {
  const withDrafts = visibleEmails(state);
  $("#emails-list").innerHTML =
    withDrafts
      .map(
        (l) => `<div class="email-card" data-email="${esc(l.email)}" data-id="${esc(l.id)}">
      <div class="head">
        <span class="to">${esc(l.name)} <small>&lt;${esc(l.email)}&gt; · ${esc(l.company)}</small></span>
        <span style="display:flex;align-items:center;gap:8px;">
          ${l.website ? `<a href="${esc(l.website)}" target="_blank" class="btn tiny">🌐 View site</a>` : ""}
          <span class="badge ${esc(l.status)}">${esc(l.status)}</span>
        </span>
      </div>
      <label class="field-label">Subject</label>
      <input class="subject-input" value="${esc(l.subject)}" ${l.status === "sent" ? "disabled" : ""} />
      <label class="field-label">Body</label>
      <textarea class="body-input" rows="8" ${l.status === "sent" ? "disabled" : ""}>${esc(l.body)}</textarea>
      <div class="email-card-footer">
        <span class="flaws">Score ${l.score ?? "—"} · AI's flaws: ${esc((l.flaws || []).join("; ") || "—")}</span>
        ${
          l.status === "sent"
            ? `<span class="hint" style="margin:0;">Already sent — locked</span>`
            : `<button class="btn tiny save-draft">💾 Save changes</button><span class="save-ok"></span>`
        }
      </div>
      ${
        l.status === "sent"
          ? ""
          : `<div class="redraft-panel">
        <label class="field-label">Tell the AI what to actually focus on (optional — overrides its own judgment on redraft)</label>
        <textarea class="flaws-input" rows="2" placeholder="e.g. no HTTPS padlock; checkout button broken on mobile; stock photo everywhere">${esc(l.manualFlaws)}</textarea>
        <div class="email-card-footer">
          <button class="btn tiny save-flaws">💾 Save notes</button>
          <button class="btn tiny primary redraft">🔄 Redraft with these notes</button>
          <span class="redraft-status"></span>
        </div>
      </div>
      <div class="redraft-panel">
        <label class="field-label">Found something else after drafting? Paste it and add it to this email</label>
        <textarea class="finding-input" rows="2" placeholder="e.g. a 1-star review complaining about their 3-day response time"></textarea>
        <div class="email-card-footer">
          <button class="btn tiny primary add-finding">✨ Summarize &amp; add to draft</button>
          <span class="finding-status"></span>
        </div>
      </div>`
      }
      <div class="delete-row">
        <button class="btn tiny danger delete-lead">🗑️ Not worth it — delete lead</button>
      </div>
    </div>`
      )
      .join("") ||
    `<div class="empty">${
      emailQuery ? "No drafts match your search." : "No drafts yet — run steps 1–3 on the Dashboard."
    }</div>`;

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

  $$("#emails-list .save-flaws").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const card = btn.closest(".email-card");
      const email = card.dataset.email;
      const text = card.querySelector(".flaws-input").value.trim();
      btn.disabled = true;
      await window.outreach.setFlaws({ email, text });
      btn.disabled = false;
      const status = card.querySelector(".redraft-status");
      status.textContent = "Saved ✓";
      setTimeout(() => (status.textContent = ""), 2000);
    })
  );

  $$("#emails-list .redraft").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const card = btn.closest(".email-card");
      const email = card.dataset.email;
      const text = card.querySelector(".flaws-input").value.trim();
      const status = card.querySelector(".redraft-status");
      btn.disabled = true;
      status.textContent = "Saving notes…";
      await window.outreach.setFlaws({ email, text });
      status.textContent = "Redrafting…";
      await window.outreach.redraftLead(email);
      btn.disabled = false;
      status.textContent = "";
      refresh();
    })
  );

  $$("#emails-list .delete-lead").forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = btn.closest(".email-card");
      const key = card.dataset.id || card.dataset.email;
      const email = card.dataset.email;
      if (!confirm(`Delete this lead (${email}) and its draft? This can't be undone.\n\nNote: if you don't want it turning up again in a future Find Leads run, unsubscribe it from the Leads page instead — that keeps it permanently blocked.`)) return;
      runAction(`Deleting ${email}…`, () => window.outreach.deleteLead({ key }));
    })
  );

  $$("#emails-list .add-finding").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const card = btn.closest(".email-card");
      const email = card.dataset.email;
      const input = card.querySelector(".finding-input");
      const text = input.value.trim();
      const status = card.querySelector(".finding-status");
      if (!text) {
        status.textContent = "Type something first.";
        setTimeout(() => (status.textContent = ""), 2000);
        return;
      }
      btn.disabled = true;
      status.textContent = "Adding…";
      await window.outreach.addFinding({ email, text });
      btn.disabled = false;
      status.textContent = "";
      refresh();
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

// ---------- updates (manual check) ----------
const updateStatusEl = $("#update-status");
const checkBtn = $("#btn-check-updates");

function setUpdateStatus(text, cls = "") {
  updateStatusEl.textContent = text || "";
  updateStatusEl.className = "update-status" + (cls ? " " + cls : "");
}

$("#btn-check-updates").addEventListener("click", async () => {
  checkBtn.disabled = true;
  setUpdateStatus("Checking…");
  const res = await window.outreach.checkForUpdates();
  // For dev/portable the main process replies immediately via update:status;
  // for a real check, the status events drive the rest and re-enable below.
  if (res && res.ok === false && res.reason !== "error") checkBtn.disabled = false;
});

window.outreach.onUpdateStatus((s) => {
  switch (s.state) {
    case "checking":
      checkBtn.disabled = true;
      setUpdateStatus("Checking for updates…");
      break;
    case "available":
      setUpdateStatus(`Update ${s.version ? "v" + s.version + " " : ""}found — downloading…`, "info");
      break;
    case "downloading":
      setUpdateStatus(`Downloading… ${s.percent ?? 0}%`, "info");
      break;
    case "ready":
      setUpdateStatus(`Update ${s.version ? "v" + s.version + " " : ""}ready.`, "ok");
      checkBtn.disabled = false;
      $("#update-banner").classList.remove("hidden");
      break;
    case "not-available":
      setUpdateStatus("You're on the latest version. ✓", "ok");
      checkBtn.disabled = false;
      break;
    case "unsupported":
      setUpdateStatus(
        s.reason === "portable"
          ? "Portable build — download new versions manually."
          : "Updates only work in the installed app.",
        "muted"
      );
      checkBtn.disabled = false;
      break;
    case "error":
      setUpdateStatus(`Check failed: ${s.message || "unknown error"}`, "err");
      checkBtn.disabled = false;
      break;
  }
});

$("#update-banner").addEventListener("click", () => {
  if (!confirm("Restart now to install the update?")) return;
  window.outreach.restartToUpdate();
});

// ---------- theme ----------
// "midnight" is the built-in :root default (no data-theme attribute).
function applyTheme(theme) {
  if (!theme || theme === "midnight") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}
// Live preview: recolor instantly as the user browses the dropdown.
$("#theme-select").addEventListener("change", (e) => applyTheme(e.target.value));

// ---------- send queue ----------
// The queue comes from the engine's `queue --json`, which shares
// store.nextSendBatch with the real send command — so what's shown here is
// provably what would go out, not a re-derived guess.
let queueData = null;

async function renderQueue() {
  const res = await window.outreach.getQueue();
  if (!res || !res.ok) {
    $("#queue-stats").innerHTML = "";
    $("#queue-note").textContent = "";
    $("#queue-list").innerHTML = `<div class="empty">${esc(res?.error || "Couldn't load the send queue.")}</div>`;
    $("#queue-extras").innerHTML = "";
    return;
  }
  const q = (queueData = res.queue);

  const risky = q.batch.filter((l) => l.emailVerified?.status === "invalid" || l.emailVerified?.status === "risky").length;
  const unverified = q.batch.filter((l) => !l.emailVerified).length;
  $("#queue-stats").innerHTML = [
    ["Sending next", q.batch.length],
    ["Today's cap", `${q.sentToday} / ${q.cap}${q.warmupActive ? " 🌱" : ""}`],
    ["Waiting for tomorrow", q.queuedBeyondBudget.length],
    ["On hold", q.heldBack.length],
    ["Flagged addresses", risky],
    ["Unverified", unverified],
  ]
    .map(([label, n]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join("");

  $("#queue-note").innerHTML = q.batch.length
    ? `These ${q.batch.length} go out in this order on the next Send.${
        unverified ? ` <b>${unverified} haven't been address-checked yet</b> — hit “Verify all addresses” to catch bounces before they happen.` : ""
      }`
    : "Nothing is queued to send right now.";

  const card = (l, held) => `<div class="q-card${held ? " held" : ""}" data-id="${esc(l.id)}" data-email="${esc(l.email)}">
      <div class="q-head">
        <span class="q-pos">${held ? "⏸" : l.position}</span>
        <div class="q-who">
          <b>${esc(l.company || l.name || l.email)}</b>
          <span>${esc(l.email)}${l.name && l.company ? ` · ${esc(l.name)}` : ""}</span>
        </div>
        <div class="q-badges">
          ${
            l.emailVerified?.status === "invalid"
              ? `<span class="badge skipped" title="${esc(l.emailVerified.reason || "")}">⚠ bounce risk</span>`
              : l.emailVerified?.status === "risky"
              ? `<span class="badge maybe_later" title="${esc(l.emailVerified.reason || "")}">⚠ risky</span>`
              : l.emailVerified?.status === "valid"
              ? `<span class="badge sent">✓ verified</span>`
              : `<span class="badge">? unverified</span>`
          }
          ${l.score != null ? `<span class="badge">score ${l.score}</span>` : ""}
          ${l.edited ? `<span class="badge drafted">edited</span>` : ""}
          ${l.website ? `<a href="${esc(l.website)}" target="_blank" class="btn tiny">🌐 Site</a>` : ""}
        </div>
      </div>
      ${held && l.sendHoldReason ? `<p class="hint" style="margin:6px 0 0;">On hold — ${esc(l.sendHoldReason)}</p>` : ""}
      <div class="q-subject">${esc(l.subject)}</div>
      <pre class="q-body">${esc(l.body)}</pre>
      <div class="q-actions">
        ${
          held
            ? `<button class="btn tiny primary q-unhold">▶️ Release into queue</button>`
            : `<button class="btn tiny q-hold">⏸️ Hold this one</button>`
        }
        <button class="btn tiny q-verify">✅ Verify address</button>
        <button class="btn tiny q-redraft-toggle">✍️ Redraft with notes</button>
        <button class="btn tiny danger q-delete">🗑️ Delete lead</button>
        <span class="q-status"></span>
      </div>
      <div class="q-redraft hidden">
        <label class="field-label">What should the AI focus on instead?</label>
        <textarea class="q-flaws" rows="2" placeholder="e.g. no HTTPS padlock; checkout broken on mobile — ignore the copyright year">${esc(l.manualFlaws)}</textarea>
        <div class="q-actions">
          <button class="btn tiny primary q-redraft-go">🔄 Redraft now</button>
        </div>
      </div>
    </div>`;

  $("#queue-list").innerHTML =
    q.batch.map((l) => card(l, false)).join("") ||
    `<div class="empty">Nothing queued. Draft some emails on the Dashboard first.</div>`;

  const extras = [];
  if (q.heldBack.length)
    extras.push(
      `<h3 class="fb-section-title">On hold (${q.heldBack.length}) — excluded until you release them</h3>` +
        q.heldBack.map((l) => card(l, true)).join("")
    );
  if (q.queuedBeyondBudget.length)
    extras.push(
      `<h3 class="fb-section-title">Waiting for tomorrow's cap (${q.queuedBeyondBudget.length})</h3>` +
        q.queuedBeyondBudget.map((l) => card(l, false)).join("")
    );
  if (q.noEmailCount || q.suppressedCount)
    extras.push(
      `<p class="hint">Also excluded: ${q.noEmailCount} drafted lead(s) with no email address, ${q.suppressedCount} unsubscribed.</p>`
    );
  $("#queue-extras").innerHTML = extras.join("");

  wireQueueCards();
}

function wireQueueCards() {
  const flash = (card, msg, ms = 2200) => {
    const el = card.querySelector(".q-status");
    el.textContent = msg;
    if (ms) setTimeout(() => (el.textContent = ""), ms);
  };

  $$("#view-queue .q-hold").forEach((b) =>
    b.addEventListener("click", () => {
      const card = b.closest(".q-card");
      runAction(`Holding ${card.dataset.email}…`, () =>
        window.outreach.holdLead({ key: card.dataset.id, reason: "held for review" })
      ).then(renderQueue);
    })
  );
  $$("#view-queue .q-unhold").forEach((b) =>
    b.addEventListener("click", () => {
      const card = b.closest(".q-card");
      runAction(`Releasing ${card.dataset.email}…`, () => window.outreach.unholdLead(card.dataset.id)).then(renderQueue);
    })
  );
  $$("#view-queue .q-verify").forEach((b) =>
    b.addEventListener("click", async () => {
      const card = b.closest(".q-card");
      b.disabled = true;
      flash(card, "Checking…", 0);
      await window.outreach.verifyLeads({ emails: [card.dataset.email] });
      b.disabled = false;
      renderQueue();
    })
  );
  $$("#view-queue .q-redraft-toggle").forEach((b) =>
    b.addEventListener("click", () => {
      b.closest(".q-card").querySelector(".q-redraft").classList.toggle("hidden");
    })
  );
  $$("#view-queue .q-redraft-go").forEach((b) =>
    b.addEventListener("click", async () => {
      const card = b.closest(".q-card");
      const text = card.querySelector(".q-flaws").value.trim();
      b.disabled = true;
      flash(card, "Saving notes…", 0);
      await window.outreach.setFlaws({ email: card.dataset.email, text });
      flash(card, "Redrafting…", 0);
      await window.outreach.redraftLead(card.dataset.email);
      b.disabled = false;
      renderQueue();
    })
  );
  $$("#view-queue .q-delete").forEach((b) =>
    b.addEventListener("click", () => {
      const card = b.closest(".q-card");
      if (!confirm(`Delete ${card.dataset.email} and its draft? This can't be undone.`)) return;
      runAction(`Deleting ${card.dataset.email}…`, () =>
        window.outreach.deleteLead({ key: card.dataset.id })
      ).then(renderQueue);
    })
  );
}

$("#btn-queue-refresh").addEventListener("click", renderQueue);
$("#btn-queue-verify").addEventListener("click", () => {
  runAction("Verifying every queued address…", () => window.outreach.verifyLeads({ all: true })).then(renderQueue);
});

// ---------- site builder ----------
// Pure local prompt assembly (see sitebuilder.js) — no AI call, no network.
const sbSel = { typeId: null, uiId: null, colorId: null, goalIds: [] };

function sbRenderGrid(containerId, options, { multi = false } = {}) {
  const el = $(`#${containerId}`);
  el.innerHTML = options
    .map(
      (o) => `<button type="button" class="sb-opt" data-id="${esc(o.id)}">
      <b>${esc(o.label)}</b>${o.detail ? `<span>${esc(o.detail)}</span>` : ""}
      ${multi ? `<i class="sb-order"></i>` : ""}
    </button>`
    )
    .join("");
  $$(`#${containerId} .sb-opt`).forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (multi) {
        const i = sbSel.goalIds.indexOf(id);
        if (i === -1) sbSel.goalIds.push(id);
        else sbSel.goalIds.splice(i, 1);
      } else {
        const key = containerId === "sb-types" ? "typeId" : containerId === "sb-uis" ? "uiId" : "colorId";
        sbSel[key] = sbSel[key] === id ? null : id;
      }
      sbSyncSelection(containerId, multi);
    })
  );
}

function sbSyncSelection(containerId, multi) {
  $$(`#${containerId} .sb-opt`).forEach((btn) => {
    const id = btn.dataset.id;
    let on = false;
    if (multi) {
      const idx = sbSel.goalIds.indexOf(id);
      on = idx !== -1;
      const marker = btn.querySelector(".sb-order");
      // Order matters for goals: first pick is the primary goal, so show rank.
      if (marker) marker.textContent = on ? (idx === 0 ? "PRIMARY" : String(idx + 1)) : "";
    } else {
      const key = containerId === "sb-types" ? "typeId" : containerId === "sb-uis" ? "uiId" : "colorId";
      on = sbSel[key] === id;
    }
    btn.classList.toggle("selected", on);
  });
}

sbRenderGrid("sb-types", SITE_TYPES);
sbRenderGrid("sb-uis", UI_STYLES);
sbRenderGrid("sb-colors", COLOR_SCHEMES);
sbRenderGrid("sb-goals", SITE_GOALS, { multi: true });

function sbCollect() {
  return {
    ...sbSel,
    companyName: $("#sb-company").value.trim(),
    whatTheyDo: $("#sb-what").value.trim(),
    typeCustom: $("#sb-type-custom").value.trim(),
    uiCustom: $("#sb-ui-custom").value.trim(),
    colorCustom: $("#sb-color-custom").value.trim(),
    goalCustom: $("#sb-goal-custom").value.trim(),
    mustHaves: $("#sb-must").value.trim(),
  };
}

function sbFlash(msg, ms = 2500) {
  $("#sb-status").textContent = msg;
  if (ms) setTimeout(() => ($("#sb-status").textContent = ""), ms);
}

$("#btn-sb-generate").addEventListener("click", () => {
  const sel = sbCollect();
  if (!sel.companyName) return sbFlash("Add a company name first.");
  if (!sel.whatTheyDo) return sbFlash("Describe what the business does — that's what makes the prompt specific.");
  if (!sel.typeId && !sel.typeCustom) return sbFlash("Pick a website type (or describe one).");
  $("#sb-output").value = buildSitePrompt(sel);
  $("#sb-output-wrap").classList.remove("hidden");
  $("#sb-output-wrap").scrollIntoView({ behavior: "smooth", block: "start" });
  sbFlash("");
});

$("#btn-sb-copy").addEventListener("click", async () => {
  // Grab the button up front: event.currentTarget is nulled once synchronous
  // dispatch ends, so reading it after the await would throw.
  const btn = $("#btn-sb-copy");
  const prev = btn.textContent;
  await navigator.clipboard.writeText($("#sb-output").value);
  btn.textContent = "Copied ✓";
  setTimeout(() => (btn.textContent = prev), 1600);
});

$("#btn-sb-save").addEventListener("click", () => {
  const sel = sbCollect();
  runAction("Saving build prompt…", () =>
    window.outreach.savePrompt({
      text: $("#sb-output").value,
      suggestedName: `${(sel.companyName || "site").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-build-prompt.md`,
    })
  );
});

$("#btn-sb-random").addEventListener("click", () => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
  sbSel.typeId = pick(SITE_TYPES);
  sbSel.uiId = pick(UI_STYLES);
  sbSel.colorId = pick(COLOR_SCHEMES);
  sbSel.goalIds = [pick(SITE_GOALS)];
  sbSyncSelection("sb-types", false);
  sbSyncSelection("sb-uis", false);
  sbSyncSelection("sb-colors", false);
  sbSyncSelection("sb-goals", true);
  sbFlash("Randomized the style picks — your company details are untouched.");
});

$("#btn-sb-reset").addEventListener("click", () => {
  sbSel.typeId = sbSel.uiId = sbSel.colorId = null;
  sbSel.goalIds = [];
  ["sb-company", "sb-what", "sb-type-custom", "sb-ui-custom", "sb-color-custom", "sb-goal-custom", "sb-must", "sb-output"].forEach(
    (id) => ($(`#${id}`).value = "")
  );
  ["sb-types", "sb-uis", "sb-colors"].forEach((c) => sbSyncSelection(c, false));
  sbSyncSelection("sb-goals", true);
  $("#sb-output-wrap").classList.add("hidden");
  sbFlash("Cleared.");
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
  applyTheme(s.theme);
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
