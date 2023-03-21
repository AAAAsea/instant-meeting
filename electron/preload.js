import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer,
  onStartRemote: (callback) => ipcRenderer.on('start', callback),
  onUpdateMessage: (callback) => ipcRenderer.on('updateMessage', callback),
  onAwakenByWeb: (callback) => ipcRenderer.on('awakeApp', callback),
});

