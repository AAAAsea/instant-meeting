import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer,
  onStartRemote: (callback) => ipcRenderer.on('start', callback)
});

