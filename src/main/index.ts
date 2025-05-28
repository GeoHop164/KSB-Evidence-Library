import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { existsSync, mkdirSync, readdirSync, unlink } from 'fs'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

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
    icon: '../assets/Icon.png',
    title: 'KSB Library',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
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
    console.log("File doesn't exist")
    return false
  } else {
    // try {
    const configData = await fs.readFile(sidecar, 'utf-8')
    const data = JSON.parse(configData)
    return typeof data === 'object' && data !== null && typeof data.standard === 'string'
    // } catch {
    //   return false
    // }
  }
}

ipcMain.handle('checkConfig', async function () {
  if (!existsSync(join(userDataFolder, '.lib-config-active'))) {
    console.log(`Config file at ${join(userDataFolder, '.lib-config-active')} doesn't exist!`)
    return false
  } else {
    const configData = await fs.readFile(join(userDataFolder, '.lib-config-active'), 'utf-8')
    const data = JSON.parse(configData)
    console.log(`Found filePath in config: ${data.filePath}`)
    if (data.filePath != null || data.filePath != '') {
      return data.filePath
    } else {
      return false
    }
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
      // fs.writeFile(join(selectedPath, '.lib-config'), JSON.stringify(newConf, null, 4))
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
  const newConfig = defaultConfig
  newConfig.filePath = selectedPath
  if (selectedValidDir) {
    fs.writeFile(join(userDataFolder, '.lib-config-active'), JSON.stringify(newConfig, null, 4))
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

ipcMain.handle('loadStandard', async function () {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
    title: 'Select a File',
    buttonLabel: 'Open',
    properties: ['openFile'],
    filters: [{ name: 'Custom Files', extensions: ['KSB-standard'] }]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const jsonData = JSON.parse(fileContent)
    const criteria = jsonData.criteria
    return [criteria.knowledge, criteria.skill, criteria.behaviour, jsonData.standard]
  } catch (error) {
    console.error('Failed to read or parse file:', error)
    return { error: 'Failed to load file' }
  }
})

ipcMain.handle(
  'newLibrary',
  async function (_event, [knowledge, skill, behaviour, standard, filePath]) {
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      return {
        stat: false,
        message: 'Please select a valid folder',
        path: null
      }
    }
    const sidecar = join(filePath, '.lib-config')
    if (existsSync(sidecar)) {
      return {
        stat: false,
        message: 'This folder already contains a KSB library!',
        path: null
      }
    }
    if (knowledge.length > 0 && skill.length > 0 && behaviour.length > 0) {
      const configFile = {
        filePath: filePath,
        standard: standard,
        criteria: {
          knowledge: knowledge,
          skill: skill,
          behaviour: behaviour
        }
      }
      await fs.writeFile(
        join(userDataFolder, '.lib-config-active'),
        JSON.stringify(configFile, null, 4)
      )
      configFile['evidence'] = {}
      await fs.writeFile(join(filePath, '.lib-config'), JSON.stringify(configFile, null, 4))

      if (process.platform === 'win32') {
        exec(`attrib +H "${join(filePath, '.lib-config')}"`, (error) => {
          if (error) {
            console.error('Failed to hide file:', error)
          } else {
            console.log('File hidden successfully.')
          }
        })
      }

      return {
        stat: true,
        message: 'Library initialised!',
        path: filePath
      }
    } else {
      return {
        stat: false,
        message: 'At least one K, S, and B are needed!',
        path: null
      }
    }
  }
)

ipcMain.handle('getCriteria', async function (_event, path) {
  const sidecar = join(path, '.lib-config')
  if (!existsSync(sidecar)) {
    return {
      ok: false,
      message: 'Config file does not exist in folder!',
      criteria: [null, null, null]
    }
  } else {
    const configData = await fs.readFile(sidecar, 'utf-8')
    const data = JSON.parse(configData)

    return {
      ok: true,
      message: 'Loaded criteria',
      criteria: [data.criteria.knowledge, data.criteria.skill, data.criteria.behaviour]
    }
  }
})

ipcMain.handle('logOut', async function () {
  const targetFile = join(userDataFolder, '.lib-config-active')
  unlink(targetFile, (err) => {
    if (err) throw err
    console.log(`Deleted ${targetFile}`)
  })
})

ipcMain.handle('getEvidenceData', async function (_event, evidenceId) {
  const activeConfig = join(userDataFolder, '.lib-config-active')
  if (!existsSync(activeConfig)) {
    throw new Error('No active configuration found.')
  } else {
    const configData = await fs.readFile(activeConfig, 'utf-8')
    const targetFilepath = join(JSON.parse(configData).filePath, '.lib-config')
    if (!existsSync(targetFilepath)) {
      throw new Error('No valid library found in active configuration.')
    }
    const data = await fs.readFile(targetFilepath, 'utf-8')
    return JSON.parse(data).evidence[evidenceId] || {}
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
