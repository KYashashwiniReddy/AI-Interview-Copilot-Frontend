const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure Electron bridge.
 * Exposes a minimal, typed API surface to the renderer process
 * via contextBridge — no raw ipcRenderer access is leaked.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow:    () => ipcRenderer.send('window:close'),
  setAlwaysOnTop: (value) => ipcRenderer.send('window:always-on-top', value),

  // Platform info
  platform: process.platform,

  // Version
  versions: {
    node:     process.versions.node,
    chrome:   process.versions.chrome,
    electron: process.versions.electron,
  },
});
