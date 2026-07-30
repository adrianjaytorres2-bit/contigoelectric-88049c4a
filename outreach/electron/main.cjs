const { app, BrowserWindow, ipcMain, dialog, shell, safeStorage } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");

// ---------- credential encryption ----------
// Secrets are encrypted at rest via the OS keychain/DPAPI/libsecret
// (Electron's safeStorage). Falls back to plaintext only when OS-level
// encryption isn't available on this machine. Encrypted values are tied to
// this machine/user — they won't decrypt if settings.json is copied
// elsewhere, which is expected.
const ENC_PREFIX = "enc:v1:";
const SECRET_FIELDS = ["anthropicApiKey", "smtpPass", "imapPass", "googleApiKey", "emailVerifyApiKey"];

function encryptField(v) {
  if (!v || typeof v !== "string" || v.startsWith(ENC_PREFIX)) return v;
  if (!safeStorage.isEncryptionAvailable()) return v;
  return ENC_PREFIX + safeStorage.encryptString(v).toString("base64");
}
function decryptField(v) {
  if (!v || typeof v !== "string" || !v.startsWith(ENC_PREFIX)) return v;
  try {
    return safeStorage.decryptString(Buffer.from(v.slice(ENC_PREFIX.length), "base64"));
  } catch {
    return ""; // corrupted, or written on a different machine/user — fail safe
  }
}
function encryptSecrets(s) {
  const out = { ...s };
  for (const f of SECRET_FIELDS) out[f] = encryptField(out[f]);
  return out;
}
function decryptSecrets(s) {
  const out = { ...s };
  for (const f of SECRET_FIELDS) out[f] = decryptField(out[f]);
  return out;
}

const APP_ROOT = path.join(__dirname, "..");
const CLI = path.join(APP_ROOT, "src", "cli.js");

let win = null;

// ---------- settings ----------

const defaultSettings = {
  theme: "midnight",
  senderName: "",
  senderBusiness: "AT DEV GROUP",
  senderPitch:
    "We build and redesign websites for small businesses. Fast, mobile-friendly, and built to convert visitors into customers.",
  language: "English",
  subjectStyle: "",
  emailStyle: "natural",
  emailLength: "medium",
  htmlEmails: false,
  physicalAddress: "",
  minQualityScore: 40,
  dailySendCap: 50,
  secondsBetweenSends: 45,
  followupAfterDays: 4,
  maxFollowups: 2,
  warmupEnabled: false,
  warmupStartDate: null,
  warmupStartCap: 5,
  warmupTargetCap: 50,
  warmupStepAmount: 5,
  warmupStepDays: 3,
  abTestEnabled: false,
  abVariantAStyle: "natural",
  abVariantBStyle: "direct",
  anthropicApiKey: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  imapHost: "",
  imapPort: "993",
  imapUser: "",
  imapPass: "",
  chromiumPath: "",
  googleApiKey: "",
  emailVerifyEnabled: true,
  emailVerifyApiKey: "",
};

function settingsFile() {
  return path.join(app.getPath("userData"), "settings.json");
}

function loadSettings() {
  try {
    const onDisk = JSON.parse(fs.readFileSync(settingsFile(), "utf8"));
    return decryptSecrets({ ...defaultSettings, ...onDisk });
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(s) {
  // Auto-set the warmup start date the first time warmup is turned on, so
  // the ramp begins counting from today rather than requiring the user to
  // pick a date themselves.
  if (s.warmupEnabled && !s.warmupStartDate) {
    s = { ...s, warmupStartDate: new Date().toISOString() };
  }
  if (!s.warmupEnabled) {
    s = { ...s, warmupStartDate: null };
  }
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify(encryptSecrets(s), null, 2));
  // Also write the generation config the engine reads.
  fs.writeFileSync(engineConfigFile(), JSON.stringify(engineConfig(s), null, 2));
  return s;
}

function engineConfigFile() {
  return path.join(app.getPath("userData"), "outreach.config.json");
}

function engineConfig(s) {
  return {
    senderName: s.senderName || "Your Name",
    senderBusiness: s.senderBusiness || "AT DEV GROUP",
    senderPitch: s.senderPitch,
    language: s.language,
    subjectStyle: s.subjectStyle || "",
    emailStyle: s.emailStyle || "natural",
    emailLength: s.emailLength || "medium",
    htmlEmails: !!s.htmlEmails,
    physicalAddress: s.physicalAddress || "",
    minQualityScore: Number(s.minQualityScore) || 40,
    dailySendCap: Number(s.dailySendCap) || 50,
    secondsBetweenSends: Number(s.secondsBetweenSends) || 45,
    followupAfterDays: Number(s.followupAfterDays) || 4,
    maxFollowups: Number(s.maxFollowups) || 2,
    warmupEnabled: !!s.warmupEnabled,
    warmupStartDate: s.warmupStartDate || null,
    warmupStartCap: Number(s.warmupStartCap) || 5,
    warmupTargetCap: Number(s.warmupTargetCap) || Number(s.dailySendCap) || 50,
    warmupStepAmount: Number(s.warmupStepAmount) || 5,
    warmupStepDays: Number(s.warmupStepDays) || 3,
    abTestEnabled: !!s.abTestEnabled,
    abVariantAStyle: s.abVariantAStyle || "natural",
    abVariantBStyle: s.abVariantBStyle || "direct",
    emailVerifyEnabled: s.emailVerifyEnabled !== false,
  };
}

function dataDir() {
  return path.join(app.getPath("userData"), "data");
}

function engineEnv(s) {
  return {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    OUTREACH_DATA_DIR: dataDir(),
    OUTREACH_CONFIG_FILE: engineConfigFile(),
    ...(s.anthropicApiKey ? { ANTHROPIC_API_KEY: s.anthropicApiKey } : {}),
    ...(s.smtpHost ? { SMTP_HOST: s.smtpHost } : {}),
    ...(s.smtpPort ? { SMTP_PORT: String(s.smtpPort) } : {}),
    ...(s.smtpUser ? { SMTP_USER: s.smtpUser } : {}),
    ...(s.smtpPass ? { SMTP_PASS: s.smtpPass } : {}),
    ...(s.smtpFrom ? { SMTP_FROM: s.smtpFrom } : {}),
    ...(s.imapHost ? { IMAP_HOST: s.imapHost } : {}),
    ...(s.imapPort ? { IMAP_PORT: String(s.imapPort) } : {}),
    ...(s.imapUser ? { IMAP_USER: s.imapUser } : {}),
    ...(s.imapPass ? { IMAP_PASS: s.imapPass } : {}),
    ...(s.chromiumPath ? { OUTREACH_CHROMIUM: s.chromiumPath } : {}),
    ...(s.googleApiKey ? { GOOGLE_API_KEY: s.googleApiKey } : {}),
    ...(s.emailVerifyApiKey ? { EMAIL_VERIFY_API_KEY: s.emailVerifyApiKey } : {}),
  };
}

// ---------- scheduled sends ----------
// Persisted to disk so schedules survive an app restart; timers are re-armed
// on startup. This only fires while the app is running — there is no
// background service, so a scheduled send waits (visibly, in the list) until
// you reopen the app if it was closed at the scheduled time.

// setTimeout delays beyond ~24.8 days silently overflow to firing immediately
// (Node/V8 32-bit int limit) — cap and self-reschedule to stay under that.
const MAX_TIMEOUT_MS = 20 * 24 * 60 * 60 * 1000;
const armedTimers = new Map(); // schedule id -> Timeout

function schedulesFile() {
  return path.join(app.getPath("userData"), "schedules.json");
}
function loadSchedules() {
  try {
    return JSON.parse(fs.readFileSync(schedulesFile(), "utf8"));
  } catch {
    return [];
  }
}
function saveSchedules(list) {
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(schedulesFile(), JSON.stringify(list, null, 2));
}

function armSchedule(entry) {
  const delay = Date.parse(entry.fireAt) - Date.now();
  if (delay > MAX_TIMEOUT_MS) {
    armedTimers.set(entry.id, setTimeout(() => armSchedule(entry), MAX_TIMEOUT_MS));
    return;
  }
  armedTimers.set(entry.id, setTimeout(() => fireSchedule(entry.id), Math.max(0, delay)));
}

async function fireSchedule(id) {
  armedTimers.delete(id);
  const entry = loadSchedules().find((e) => e.id === id);
  if (!entry) return;
  if (running) {
    // Something else is mid-run — don't drop the scheduled send, retry shortly.
    armedTimers.set(id, setTimeout(() => fireSchedule(id), 60000));
    return;
  }
  await runEngine([entry.type === "followup" ? "followup" : "send"]);
  saveSchedules(loadSchedules().filter((e) => e.id !== id));
  if (win && !win.isDestroyed()) win.webContents.send("schedule:fired", entry);
}

function armAllSchedules() {
  for (const entry of loadSchedules()) armSchedule(entry);
}

// ---------- engine runner ----------

let running = null;

// quiet: capture output without streaming it to the Activity log — for
// commands whose stdout is a machine-readable payload (e.g. `queue --json`)
// rather than something a human wants to read.
function runEngine(args, { nodeScript, quiet } = {}) {
  return new Promise((resolve) => {
    if (running) return resolve({ ok: false, output: "Another task is already running." });
    const s = loadSettings();
    saveSettings(s); // ensure engine config file exists
    const spawnArgs = nodeScript ? args : [CLI, ...args];
    const child = spawn(process.execPath, spawnArgs, {
      env: engineEnv(s),
      cwd: APP_ROOT,
    });
    running = child;
    let output = "";
    const emit = (chunk) => {
      output += chunk;
      if (!quiet && win && !win.isDestroyed()) win.webContents.send("engine:log", chunk.toString());
    };
    child.stdout.on("data", emit);
    child.stderr.on("data", emit);
    child.on("close", (code) => {
      running = null;
      if (win && !win.isDestroyed()) win.webContents.send("engine:done", { code });
      resolve({ ok: code === 0, output });
    });
  });
}

// ---------- state for the UI ----------

// Mirrors src/config.js effectiveDailyCap — duplicated (rather than imported)
// because this file is CommonJS and that module is ESM. Keep the two in sync
// if the ramp formula changes.
function effectiveDailyCap(config, now = Date.now()) {
  if (!config.warmupEnabled || !config.warmupStartDate) return config.dailySendCap;
  const startCap = Number(config.warmupStartCap) || 5;
  const targetCap = Number(config.warmupTargetCap) || config.dailySendCap;
  const stepAmount = Number(config.warmupStepAmount) || 5;
  const stepDays = Number(config.warmupStepDays) || 3;
  const daysElapsed = Math.floor((now - Date.parse(config.warmupStartDate)) / 86400000);
  if (daysElapsed < 0) return startCap;
  const steps = Math.floor(daysElapsed / stepDays);
  const cap = startCap + steps * stepAmount;
  return Math.max(startCap, Math.min(cap, targetCap));
}

function readState() {
  const dbFile = path.join(dataDir(), "db.json");
  let leads = [];
  let suppressedCount = 0;
  try {
    const db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
    leads = Object.values(db.leads);
    suppressedCount = Object.keys(db.suppressed || {}).length;
  } catch {
    /* no data yet */
  }
  const counts = {};
  for (const l of leads) counts[l.status] = (counts[l.status] || 0) + 1;
  const today = new Date().toISOString().slice(0, 10);
  const sentToday = leads.filter(
    (l) =>
      (l.sentAt && l.sentAt.startsWith(today)) ||
      (l.followups || []).some((f) => f.sentAt && f.sentAt.startsWith(today))
  ).length;
  const settings = loadSettings();
  const cap = effectiveDailyCap(settings);

  // Analytics: overall + A/B variant reply performance.
  const everSent = leads.filter((l) => l.sentAt);
  const replied = leads.filter((l) => l.reply);
  const byIntent = {};
  for (const l of replied) byIntent[l.reply.intent] = (byIntent[l.reply.intent] || 0) + 1;
  const variants = {};
  for (const l of leads) {
    const v = l.draft?.variant;
    if (!v) continue;
    variants[v] = variants[v] || { sent: 0, replied: 0, interested: 0 };
    if (l.sentAt) variants[v].sent++;
    if (l.reply) variants[v].replied++;
    if (l.reply?.intent === "interested") variants[v].interested++;
  }

  const fbQueue = leads
    .filter((l) => l.fb?.draft)
    .map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      email: l.email,
      website: l.website,
      facebookUrl: l.facebookUrl,
      draft: l.fb.draft,
      status: l.fb.status,
      generatedAt: l.fb.generatedAt || null,
      sentAt: l.fb.sentAt || null,
    }));
  const fbEligibleCount = leads.filter((l) => l.facebookUrl && l.audit && !l.fb?.draft).length;

  return {
    leads: leads.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      company: l.company,
      website: l.website,
      status: l.status,
      skipReason: l.skipReason || null,
      score: l.draft?.quality_score ?? null,
      flaws: l.draft?.flaws || [],
      subject: l.draft?.subject || null,
      body: l.draft?.body || null,
      sentAt: l.sentAt || null,
      followupCount: (l.followups || []).length,
      reply: l.reply || null,
      notes: l.notes || "",
      tags: l.tags || [],
      variant: l.draft?.variant || null,
      facebookUrl: l.facebookUrl || null,
      phone: l.phone || null,
      industry: l.industry || null,
      emailVerified: l.emailVerified || null,
      manualFlaws: l.manualFlaws || "",
      followupsPaused: !!l.followupsPaused,
      followupsPausedReason: l.followupsPausedReason || null,
    })),
    counts,
    sentToday,
    dailyCapToday: cap,
    warmupActive: !!settings.warmupEnabled,
    suppressedCount,
    fbQueue,
    fbEligibleCount,
    analytics: {
      totalSent: everSent.length,
      totalReplied: replied.length,
      replyRate: everSent.length ? replied.length / everSent.length : 0,
      byIntent,
      variants,
    },
    configured: {
      anthropic: !!settings.anthropicApiKey,
      smtp: !!(settings.smtpHost && settings.smtpUser && settings.smtpPass),
      imap: !!(settings.imapHost && settings.imapUser && settings.imapPass),
      identity: !!settings.senderName,
    },
    running: !!running,
  };
}

// ---------- IPC ----------

ipcMain.handle("state:get", () => readState());
ipcMain.handle("settings:get", () => loadSettings());
ipcMain.handle("settings:save", (_e, s) => {
  const saved = saveSettings({ ...loadSettings(), ...s });
  return { ok: true, settings: saved };
});

ipcMain.handle("leads:importDialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: "Load lead list (CSV)",
    filters: [{ name: "CSV files", extensions: ["csv"] }],
    properties: ["openFile"],
  });
  if (canceled || !filePaths.length) return { ok: false, output: "Cancelled." };
  return runEngine(["import", filePaths[0]]);
});

ipcMain.handle("run:audit", () => runEngine(["audit"]));
ipcMain.handle("run:draft", () => runEngine(["draft"]));
ipcMain.handle("run:override", (_e, email) => runEngine(email ? ["override", email] : ["override"]));
ipcMain.handle("lead:add", (_e, { email, name, company, website, industry }) => {
  const args = ["addlead", "--email", email];
  if (name) args.push("--name", name);
  if (company) args.push("--company", company);
  if (website) args.push("--website", website);
  if (industry) args.push("--industry", industry);
  return runEngine(args);
});
ipcMain.handle("lead:quickSend", (_e, { email, subject, body, name, company, website }) => {
  const args = ["quicksend", "--email", email, "--subject", subject, "--body", body];
  if (name) args.push("--name", name);
  if (company) args.push("--company", company);
  if (website) args.push("--website", website);
  return runEngine(args);
});
ipcMain.handle("lead:setDraft", (_e, { email, subject, body }) => {
  const args = ["setdraft", email];
  if (subject) args.push("--subject", subject);
  if (body) args.push("--body", body);
  return runEngine(args);
});
ipcMain.handle("lead:setFlaws", (_e, { email, text }) => runEngine(["setflaws", email, "--text", text ?? ""]));
ipcMain.handle("lead:redraft", (_e, email) => runEngine(["redraft", email]));
ipcMain.handle("lead:addFinding", (_e, { email, text }) => runEngine(["addfinding", email, "--text", text ?? ""]));
ipcMain.handle("leadgen:search", (_e, { query, location, limit, scrape, independent, maxReviews, onlyNoWebsite }) => {
  const args = ["findleads", query, location, "--limit", String(limit || 50)];
  if (!scrape) args.push("--no-scrape");
  if (independent) args.push("--independent");
  if (maxReviews) args.push("--max-reviews", String(maxReviews));
  if (onlyNoWebsite) args.push("--only-no-website");
  return runEngine(args);
});
ipcMain.handle("run:send", (_e, { dryRun }) => runEngine(dryRun ? ["send", "--dry-run"] : ["send"]));
ipcMain.handle("lead:sendOne", (_e, key) => runEngine(["sendone", key]));
ipcMain.handle("run:followup", (_e, { dryRun }) =>
  runEngine(dryRun ? ["followup", "--dry-run"] : ["followup"])
);
ipcMain.handle("run:inbox", () => runEngine(["inbox"]));

ipcMain.handle("report:open", async () => {
  const res = await runEngine(["report"]);
  const file = path.join(dataDir(), "report.html");
  if (fs.existsSync(file)) await shell.openPath(file);
  return res;
});

ipcMain.handle("browser:install", () => {
  const pwCli = path.join(APP_ROOT, "node_modules", "playwright", "cli.js");
  return runEngine([pwCli, "install", "chromium"], { nodeScript: true });
});

ipcMain.handle("lead:note", (_e, { email, text, append }) => {
  const args = ["note", email, "--text", text];
  if (append) args.push("--append");
  return runEngine(args);
});
ipcMain.handle("lead:tag", (_e, { email, add, remove }) => {
  const args = ["tag", email];
  if (add) args.push("--add", add);
  if (remove) args.push("--remove", remove);
  return runEngine(args);
});
ipcMain.handle("lead:suppress", (_e, { email, reason }) =>
  runEngine(["suppress", email, ...(reason ? ["--reason", reason] : [])])
);
ipcMain.handle("lead:unsuppress", (_e, email) => runEngine(["unsuppress", email]));
ipcMain.handle("lead:bulkDelete", (_e, emails) => runEngine(["bulkdelete", "--emails", emails.join(",")]));
ipcMain.handle("queue:get", async () => {
  const res = await runEngine(["queue", "--json"], { quiet: true });
  if (!res.ok) return { ok: false, error: res.output.trim() || "Couldn't read the send queue." };
  try {
    // The engine may print incidental lines before the payload; take the last
    // line that parses as our object rather than assuming stdout is pure JSON.
    const line = res.output
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("{") && l.endsWith("}"))
      .pop();
    if (!line) throw new Error("no JSON payload in output");
    return { ok: true, queue: JSON.parse(line) };
  } catch (err) {
    return { ok: false, error: `Couldn't parse the send queue: ${err.message}` };
  }
});
ipcMain.handle("lead:hold", (_e, { key, reason } = {}) =>
  runEngine(["hold", key, ...(reason ? ["--reason", reason] : [])])
);
ipcMain.handle("lead:unhold", (_e, key) => runEngine(["unhold", key]));
ipcMain.handle("lead:noFollowup", (_e, { key, reason } = {}) =>
  runEngine(["nofollowup", key, ...(reason ? ["--reason", reason] : [])])
);
ipcMain.handle("lead:resumeFollowup", (_e, key) => runEngine(["resumefollowup", key]));
ipcMain.handle("lead:delete", (_e, { key, suppress } = {}) =>
  runEngine(["deletelead", key, ...(suppress ? ["--suppress"] : [])])
);
ipcMain.handle("leads:verify", (_e, { limit, all, emails } = {}) => {
  const args = ["verifyleads"];
  if (limit) args.push("--limit", String(limit));
  if (all) args.push("--all");
  if (emails && emails.length) args.push("--emails", emails.join(","));
  return runEngine(args);
});

// Facebook DM queue — drafts only, never sent automatically. You copy each
// message and send it yourself from your own account.
ipcMain.handle("fb:generateDrafts", (_e, { limit } = {}) =>
  runEngine(limit ? ["fbdraft", "--limit", String(limit)] : ["fbdraft"])
);
ipcMain.handle("fb:markSent", (_e, email) => runEngine(["fbsent", email]));
ipcMain.handle("fb:markSkipped", (_e, email) => runEngine(["fbskip", email]));
ipcMain.handle("fb:openLink", (_e, url) => {
  if (typeof url === "string" && /^https:\/\/(www\.)?facebook\.com\//i.test(url)) shell.openExternal(url);
  return { ok: true };
});

ipcMain.handle("schedule:create", (_e, { fireAt, type }) => {
  const entry = {
    id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fireAt,
    type: type === "followup" ? "followup" : "send",
    createdAt: new Date().toISOString(),
  };
  const list = loadSchedules();
  list.push(entry);
  saveSchedules(list);
  armSchedule(entry);
  return { ok: true, entry };
});
ipcMain.handle("schedule:list", () => loadSchedules());
ipcMain.handle("schedule:cancel", (_e, id) => {
  saveSchedules(loadSchedules().filter((e) => e.id !== id));
  const t = armedTimers.get(id);
  if (t) {
    clearTimeout(t);
    armedTimers.delete(id);
  }
  return { ok: true };
});

// Save an arbitrary generated text file (the Site Builder's build prompt).
// Writes directly rather than going through the engine CLI — there's no lead
// data involved, it's just a file the user asked to keep.
ipcMain.handle("prompt:save", async (_e, { text, suggestedName } = {}) => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: "Save build prompt",
    defaultPath: suggestedName || "build-prompt.md",
    filters: [
      { name: "Markdown", extensions: ["md"] },
      { name: "Text", extensions: ["txt"] },
    ],
  });
  if (canceled || !filePath) return { ok: false, output: "Cancelled." };
  try {
    fs.writeFileSync(filePath, String(text ?? ""), "utf8");
    await shell.showItemInFolder(filePath);
    return { ok: true, output: `Saved to ${filePath}\n` };
  } catch (err) {
    return { ok: false, output: `Couldn't save: ${err.message}\n` };
  }
});

ipcMain.handle("leads:exportDialog", async (_e, { status, emails } = {}) => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: "Export leads to CSV",
    defaultPath: "leads-export.csv",
    filters: [{ name: "CSV files", extensions: ["csv"] }],
  });
  if (canceled || !filePath) return { ok: false, output: "Cancelled." };
  const args = ["export", filePath];
  if (status) args.push("--status", status);
  if (emails && emails.length) args.push("--emails", emails.join(","));
  const res = await runEngine(args);
  if (res.ok) await shell.showItemInFolder(filePath);
  return res;
});

// ---------- window ----------

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#0d1117",
    title: "AT DEV GROUP — Outreach",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.removeMenu();
  // Every target="_blank" link (lead website links, etc.) should open in the
  // user's real default browser, not a bare uncontrolled Electron window —
  // Electron denies new-window creation by default with no handler, so
  // without this, clicking those links silently does nothing.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.loadFile(path.join(__dirname, "ui", "index.html"));
}

// ---------- updates ----------
// Manual, user-driven: nothing checks in the background. The sidebar
// "Check for updates" button calls update:check, and every stage of the
// check reports back over the update:status channel so the button can show
// live feedback (checking / up to date / downloading / ready / error).
// Uses the GitHub Releases feed configured in package.json's build.publish.
// Only works for the installed (NSIS) build — the portable .exe can't
// self-replace (electron-builder sets PORTABLE_EXECUTABLE_DIR for it).
let autoUpdaterRef = null;

function sendUpdateStatus(state, extra = {}) {
  if (win && !win.isDestroyed()) win.webContents.send("update:status", { state, ...extra });
}

function getAutoUpdater() {
  if (autoUpdaterRef) return autoUpdaterRef;
  const { autoUpdater } = require("electron-updater");
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("checking-for-update", () => sendUpdateStatus("checking"));
  autoUpdater.on("update-available", (info) => sendUpdateStatus("available", { version: info && info.version }));
  autoUpdater.on("update-not-available", () => sendUpdateStatus("not-available"));
  autoUpdater.on("download-progress", (p) =>
    sendUpdateStatus("downloading", { percent: Math.round((p && p.percent) || 0) })
  );
  autoUpdater.on("update-downloaded", (info) => sendUpdateStatus("ready", { version: info && info.version }));
  autoUpdater.on("error", (err) => sendUpdateStatus("error", { message: (err && err.message) || String(err) }));
  autoUpdaterRef = autoUpdater;
  return autoUpdater;
}

ipcMain.handle("update:check", async () => {
  if (!app.isPackaged) {
    sendUpdateStatus("unsupported", { reason: "dev" });
    return { ok: false, reason: "dev" };
  }
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    sendUpdateStatus("unsupported", { reason: "portable" });
    return { ok: false, reason: "portable" };
  }
  try {
    await getAutoUpdater().checkForUpdates();
    return { ok: true };
  } catch (err) {
    sendUpdateStatus("error", { message: err.message });
    return { ok: false, reason: "error", message: err.message };
  }
});

ipcMain.handle("update:restart", () => {
  if (autoUpdaterRef) autoUpdaterRef.quitAndInstall();
});

app.whenReady().then(() => {
  createWindow();
  armAllSchedules();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
