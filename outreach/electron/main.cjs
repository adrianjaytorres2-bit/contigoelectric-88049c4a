const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");

const APP_ROOT = path.join(__dirname, "..");
const CLI = path.join(APP_ROOT, "src", "cli.js");

let win = null;

// ---------- settings ----------

const defaultSettings = {
  senderName: "",
  senderBusiness: "AT DEV GROUP",
  senderPitch:
    "We build and redesign websites for small businesses. Fast, mobile-friendly, and built to convert visitors into customers.",
  language: "English",
  subjectStyle: "",
  emailStyle: "natural",
  emailLength: "medium",
  htmlEmails: false,
  minQualityScore: 40,
  dailySendCap: 50,
  secondsBetweenSends: 45,
  followupAfterDays: 4,
  maxFollowups: 2,
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
};

function settingsFile() {
  return path.join(app.getPath("userData"), "settings.json");
}

function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsFile(), "utf8")) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(s) {
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify(s, null, 2));
  // Also write the generation config the engine reads.
  fs.writeFileSync(engineConfigFile(), JSON.stringify(engineConfig(s), null, 2));
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
    minQualityScore: Number(s.minQualityScore) || 40,
    dailySendCap: Number(s.dailySendCap) || 50,
    secondsBetweenSends: Number(s.secondsBetweenSends) || 45,
    followupAfterDays: Number(s.followupAfterDays) || 4,
    maxFollowups: Number(s.maxFollowups) || 2,
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
  };
}

// ---------- engine runner ----------

let running = null;

function runEngine(args, { nodeScript } = {}) {
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
      if (win && !win.isDestroyed()) win.webContents.send("engine:log", chunk.toString());
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

function readState() {
  const dbFile = path.join(dataDir(), "db.json");
  let leads = [];
  try {
    const db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
    leads = Object.values(db.leads);
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
    })),
    counts,
    sentToday,
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
  saveSettings({ ...loadSettings(), ...s });
  return { ok: true };
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
ipcMain.handle("lead:setDraft", (_e, { email, subject, body }) => {
  const args = ["setdraft", email];
  if (subject) args.push("--subject", subject);
  if (body) args.push("--body", body);
  return runEngine(args);
});
ipcMain.handle("leadgen:search", (_e, { query, location, limit, scrape }) => {
  const args = ["findleads", query, location, "--limit", String(limit || 50)];
  if (!scrape) args.push("--no-scrape");
  return runEngine(args);
});
ipcMain.handle("run:send", (_e, { dryRun }) => runEngine(dryRun ? ["send", "--dry-run"] : ["send"]));
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
  win.loadFile(path.join(__dirname, "ui", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
