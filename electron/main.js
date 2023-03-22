import { app, BrowserWindow, ipcMain, dialog, desktopCapturer, BrowserView, shell, systemPreferences } from 'electron'
import fs from 'fs'
import path from 'path'
import robot from "robotjs";
import {autoUpdater} from "electron-updater"

const askForMediaAccess = ()=>{ 
  systemPreferences.askForMediaAccess('microphone');
  systemPreferences.askForMediaAccess('camera');
}
if(process.platform === 'darwin') askForMediaAccess();

const PROTOCOL = 'insm'
// 注册insm协议，用于网页唤醒app
if (!app.isDefaultProtocolClient(PROTOCOL)) {
  app.setAsDefaultProtocolClient(PROTOCOL)
}
// mac网页进行应用的调起后，会触发该事件
app.on('open-url', (event, urlStr) => {
  win && win.webContents.send('awakeApp',urlStr)
});

process.env.DIST_ELECTRON = path.join(__dirname, './')
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win
let childWin
let childWinPause = false;
let remoteWindows = [];
// Here, you can also use other preload
const preload = path.join(__dirname, './preload.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = path.join(process.env.DIST, './index.html')
const remoteHtml = path.join(process.env.DIST, './src/remote_control_page/index.html')
const childHtml = path.join(process.env.DIST, './src/canvas_page/index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'instant-meeting',
    icon: path.join(process.env.PUBLIC, 'favicon.ico'),
    width: 600,
    height: 720,
    minHeight: 720,
    minWidth: 600,
    show: false,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true,
    },
  })


  win.setMenu(null)
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url)
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
    // win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main-process-message', new Date().toLocaleString())
    autoUpdater.checkForUpdatesAndNotify();
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.once('ready-to-show', () => {
    win.show()
    // 通过web唤醒时argv的长度大于1
    if (process.argv.length > 1) {
      app.emit("second-instance", null, process.argv); // 将参数传递给该窗口
    }
  })

  win.on('close', () => {
    remoteWindows.forEach(win => {
      try { if (!win.isDestroyed()) win.close() } catch (e) { }
    })
    remoteWindows = [];
    try { if (!childWin.isDestroyed()) childWin.close() } catch (e) { }
  })
}

async function createSecondWindow(user) {
  let win = new BrowserWindow({
    title: 'Second window',
    icon: path.join(process.env.PUBLIC, 'favicon.ico'),
    show: false,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true,
    },
  })
  win.maximize()

  remoteWindows.push(win);
  win.setMenu(null)
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url + '/src/remote_control_page/index.html')
    win.webContents.openDevTools()
  } else {
    win.loadFile(remoteHtml)
    // win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('start', user)
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.once('ready-to-show', () => {
    win.show()
  })
  return win;
}

async function createChildWindow(user) {
  childWin = new BrowserWindow({
    title: 'Canvas window',
    icon: path.join(process.env.PUBLIC, 'favicon.ico'),
    fullscreen: true,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    alwaysOnTop: true,
    skipTaskbar: false, // 是否在任务栏中显示窗口
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true,
    },
  })
  childWin.setAlwaysOnTop(true, 'screen-saver')
  if (process.env.VITE_DEV_SERVER_URL) {
    childWin.loadURL(url + '/src/canvas_page/index.html')
    childWin.webContents.openDevTools()
  } else {
    childWin.loadFile(childHtml)
    // childWin.webContents.openDevTools()

  }
  return childWin;
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', (e, arg) => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
  // windows
  if (process.platform === 'win32') {
    win && win.webContents.send('awakeApp',arg[arg.length-1])
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// 文件持久化
const handleDirectoryOpen = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

// 获取窗口
const handleGetWindows = async () => {
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'], fetchWindowIcons: true })
  // 在渲染进程调用toPNG会报错
  sources.forEach(source => {
    if (source.thumbnail)
      source.thumbnail = source.thumbnail.toPNG();
    if (source.appIcon)
      source.appIcon = source.appIcon.toPNG();
  })
  return sources

}
ipcMain.handle('dialog:openDirectory', handleDirectoryOpen)
ipcMain.handle('getWindows', handleGetWindows)
ipcMain.on("downloadStart", (e, { fileName, directoryPath }) => {
  const filePath = directoryPath + '\\' + fileName;
  fileStream = fs.createWriteStream(filePath);
})
ipcMain.on("downloading", (e, buffer) => {
  fileStream.write(buffer)
})
ipcMain.on("downloadOver", (e) => {
  fileStream.end();
})
ipcMain.on("downloadCanceled", (e) => {
  fileStream.end();
  fs.unlink(fileStream.path, err => {
    console.log(err)
  });
})


ipcMain.on("remoteControlStart", (e, user) => {
  // console.log(user)
  createSecondWindow(user)
})
ipcMain.on("remoteControlClosed", (e) => {
  const webContents = e.sender
  webContents.close();
})

const { width: WIDTH, height: HEIGHT } = robot.getScreenSize();

const handleMouseMove = ({ x, y, width, height }) => {
  robot.moveMouse(x * WIDTH / width, y * HEIGHT / height);
}

const handleMouseClick = ({ x, y, width, height, detail }) => {
  robot.moveMouse(x * WIDTH / width, y * HEIGHT / height);
  robot.mouseClick(detail === 'click' ? 'left' : 'right', false)
}
const handleMouseWheel = ({ deltaX, deltaY }) => {
  robot.scrollMouse(deltaX, deltaY);
}
const handleKeyboard = ({ key, detail, modified }) => {
  try {
    robot.keyTap(key, modified)
  } catch (e) { }
}

ipcMain.on('openExternalUrl',(e,url)=>{
  shell.openExternal(url)
})

ipcMain.on('robot', (e, data) => {
  const { type } = data;
  if (type === 'mouse') {
    switch (data.detail) {
      case 'mousemove':
        handleMouseMove(data);
        break;
      case 'click':
        handleMouseClick(data);
        break;
      case 'contextmenu':
        handleMouseClick(data);
        break;
      case 'mousewheel':
        handleMouseWheel(data)
        break;
    }
  } else if (type === 'keyboard') {
    handleKeyboard(data)
  }
})

ipcMain.on('openCanvas', async () => {
  childWin = await createChildWindow();
})

ipcMain.on('pauseCanvas', (e, pause) => {
  childWinPause = pause;
  if (pause)
    childWin.setIgnoreMouseEvents(true, { forward: true });
  else
    childWin.setIgnoreMouseEvents(false);

})

ipcMain.on('quitCanvas', () => {
  childWin.close()
  try { if (!childWin.isDestroyed()) childWin.close() } catch (e) { console.log(e) }
})

ipcMain.on('mouseenter', () => {
  childWin.setIgnoreMouseEvents(false)
})

ipcMain.on('mouseleave', () => {
  if(childWinPause)
    childWin.setIgnoreMouseEvents(true, { forward: true })
  else
    childWin.setIgnoreMouseEvents(false)

})

ipcMain.handle('pickColor',()=>{
  // Get mouse position.
  const mouse = robot.getMousePos();
  // Get pixel color in hex format.
  const hex = robot.getPixelColor(mouse.x, mouse.y);
  return hex;
})

ipcMain.handle('getWorletJs',()=>!process.env.VITE_DEV_SERVER_URL ? path.join(process.env.DIST, './worklet.js') : '/worklet.js')

// 自动更新
function sendStatusToWindow(text) {
  win &&　win.webContents.send('updateMessage', text);
}

autoUpdater.autoDownload = false;

ipcMain.on('startUpdate',()=>{
  autoUpdater.downloadUpdate();
})

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow({type:'update-available',info});
})

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow({type:'update-not-available',info});
})

autoUpdater.on('error', (err) => {
  sendStatusToWindow({type:'error',info});
})

autoUpdater.on('download-progress', (progressObj) => {
  let info = `正在下载 ${progressObj.percent.toFixed(1)}%  ${formatSize(progressObj.bytesPerSecond)}/s`
  sendStatusToWindow({type:'download-progress',info});
})

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow({type:'update-downloaded',info});
  autoUpdater.quitAndInstall();
});

function parseNum(num, decimal) {
  if (!decimal) decimal = 1;
  return Math.round(num * 10 ** decimal) / (10 ** decimal)
}

function formatSize(size) {
  if (size < 1024)
    return ~~(size) + 'B'
  else if (size < 1024 * 1024)
    return ~~(size / 1024) + 'KB'
  else if (size < 1024 * 1024 * 1024)
    return parseNum(size / 1024 / 1024, 1) + 'M'
  else if (size < 1024 ** 4)
    return parseNum(size / 1024 / 1024 / 1024, 2) + 'G'
  else if (size < 1024 ** 5)
    return parseNum(size / 1024 / 1024 / 1024 / 1024, 2) + 'T'
}