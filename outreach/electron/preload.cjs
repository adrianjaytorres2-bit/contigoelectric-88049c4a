const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("outreach", {
  getState: () => ipcRenderer.invoke("state:get"),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (s) => ipcRenderer.invoke("settings:save", s),
  importLeads: () => ipcRenderer.invoke("leads:importDialog"),
  runAudit: () => ipcRenderer.invoke("run:audit"),
  runDraft: () => ipcRenderer.invoke("run:draft"),
  runOverride: (email) => ipcRenderer.invoke("run:override", email),
  findLeads: (params) => ipcRenderer.invoke("leadgen:search", params),
  runSend: (dryRun) => ipcRenderer.invoke("run:send", { dryRun }),
  runFollowup: (dryRun) => ipcRenderer.invoke("run:followup", { dryRun }),
  runInbox: () => ipcRenderer.invoke("run:inbox"),
  openReport: () => ipcRenderer.invoke("report:open"),
  installBrowser: () => ipcRenderer.invoke("browser:install"),
  onLog: (cb) => ipcRenderer.on("engine:log", (_e, chunk) => cb(chunk)),
  onDone: (cb) => ipcRenderer.on("engine:done", (_e, info) => cb(info)),
});
