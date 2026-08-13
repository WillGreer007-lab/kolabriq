const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectAndCompressVideo: () => ipcRenderer.invoke('dialog:selectAndCompressVideo'),
  onCompressionProgress: (callback) => ipcRenderer.on('compression:progress', (_event, value) => callback(value)),
  removeCompressionProgressListener: () => ipcRenderer.removeAllListeners('compression:progress')
});
