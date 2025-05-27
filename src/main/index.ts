import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const userDataFolder = app.getPath('userData')

const defaultConfig = {
  filePath: '',
  KSBs: {
    k: [],
    s: [],
    b: []
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

async function isValidDir(folderpath: string): Promise<boolean> {
  const sidecar = join(folderpath, '.lib-config')
  if (!existsSync(sidecar)) {
    return false
  } else {
    try {
      const configData = await fs.readFile(join(userDataFolder, '.lib-config'), 'utf-8')
      const data = JSON.parse(configData)

      return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.standard === 'string' &&
        Array.isArray(data.evidence)
      )
    } catch {
      return false
    }
  }
}

ipcMain.handle('checkConfig', async function () {
  if (!existsSync(join(userDataFolder, 'lib.config'))) {
    console.log(`Config file at ${join(userDataFolder, 'lib.config')} doesn't exist!`)
    return false
  } else {
    const configData = await fs.readFile(join(userDataFolder, 'lib.config'), 'utf-8')
    const data = JSON.parse(configData)
    return data.filePath
  }
})

ipcMain.handle('selectLocation', async function () {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  let selectedPath = result.filePaths[0]
  if (readdirSync(selectedPath).length !== 0) {
    selectedPath = join(selectedPath, 'KSB-Library')
    try {
      mkdirSync(selectedPath, { recursive: true })
      const newConf = defaultConfig
      newConf.filePath = selectedPath
      fs.writeFile(join(selectedPath, '.lib-config'), JSON.stringify(newConf))
      return selectedPath
    } catch {
      console.log('Error')
      return false
    }
  }

  return selectedPath
})

ipcMain.handle('openExisting', async function () {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
    properties: ['openDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return {
      state: false,
      path: null,
      message: 'File selector cancelled'
    }
  }
  const selectedPath = result.filePaths[0]
  const selectedValidDir = await isValidDir(selectedPath)
  if (selectedValidDir) {
    fs.writeFile(join(userDataFolder, 'lib.config'), selectedPath)
    return {
      state: true,
      path: selectedPath,
      message: 'Path valid'
    }
  } else {
    return {
      state: false,
      path: null,
      message: 'Directory does not contain valid .lib-config'
    }
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
