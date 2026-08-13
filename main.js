const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'hiddenInset', // Mac native feel
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const isDev = process.env.NODE_ENV !== 'production';
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : 'https://adswish.vercel.app'; // Replace with live URL if deployed

  mainWindow.loadURL(startUrl);

  if (isDev) {
    // mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler for native video compression
ipcMain.handle('dialog:selectAndCompressVideo', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'avi'] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { error: 'No file selected' };
  }

  const inputPath = result.filePaths[0];
  const outputPath = path.join(path.dirname(inputPath), `compressed_${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-vcodec libx264',
        '-crf 28', // Compress slightly (higher CRF = lower quality, 28 is good balance)
        '-preset fast',
        '-c:a aac',
        '-b:a 128k'
      ])
      .on('progress', (progress) => {
        // Send progress to renderer
        if (progress.percent) {
          event.sender.send('compression:progress', Math.round(progress.percent));
        }
      })
      .on('end', () => {
        resolve({ success: true, outputPath });
      })
      .on('error', (err) => {
        console.error('FFmpeg Error:', err);
        resolve({ error: err.message });
      })
      .save(outputPath);
  });
});
