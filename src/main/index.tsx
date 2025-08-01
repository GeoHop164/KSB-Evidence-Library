import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { existsSync, mkdirSync, readdirSync, unlink } from 'fs'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
// import { exec } from 'child_process'
import sharp from 'sharp'
import { randomUUID } from 'crypto'
import React from 'react'
import path from 'path'
import { createWriteStream } from 'fs'
import archiver from 'archiver'

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

let activeConfig

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../build/icon.ico'),
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

// async function evidenceIdExists(evidenceID: string): Promise<boolean> {
//   const activeConfig = join(userDataFolder, '.lib-config-active')
//   if (!existsSync(activeConfig)) {
//     throw new Error('No active configuration found.')
//   } else {
//     const configData = await fs.readFile(activeConfig, 'utf-8')
//     const targetFilepath = join(JSON.parse(configData).filePath, '.lib-config')
//     if (!existsSync(targetFilepath)) {
//       throw new Error('No valid library found in active configuration.')
//     }
//     const data = await fs.readFile(targetFilepath, 'utf-8')
//     const parsed = JSON.parse(data)
//     const evidence = parsed.evidence
//     return Object.prototype.hasOwnProperty.call(evidence, evidenceID)
//   }
// }

async function getActiveLibrary(): Promise<null | string> {
  // const activeConfigPath = join(userDataFolder, '.lib-config-active')
  // if (!existsSync(join(userDataFolder, '.lib-config-active'))) {
  //   return null
  // }
  // try {
  //   const configData = await fs.readFile(activeConfigPath, 'utf-8')
  //   const data = JSON.parse(configData)
  //   return data.filePath
  // } catch {
  //   return null
  // }
  return activeConfig ? activeConfig : null
}

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
    activeConfig = data.filePath
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
  activeConfig = selectedPath
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

      // if (process.platform === 'win32') {
      //   exec(`attrib +H "${join(filePath, '.lib-config')}"`, (error) => {
      //     if (error) {
      //       console.error('Failed to hide file:', error)
      //     } else {
      //       console.log('File hidden successfully.')
      //     }
      //   })
      // }

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
  activeConfig = null
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
    const parsed = JSON.parse(data)
    const evidence = parsed.evidence[evidenceId].criteria
    const obj = {
      ...evidence,
      description: parsed.evidence[evidenceId].description,
      evidenceDate: parsed.evidence[evidenceId].evidenceDate
    }
    return obj
  }
})

ipcMain.handle('getEvidenceImage', async function (_event, evidenceID) {
  const activeConfig = join(userDataFolder, '.lib-config-active')
  if (!existsSync(activeConfig)) {
    throw new Error('No active configuration found.')
  } else {
    const configData = await fs.readFile(activeConfig, 'utf-8')
    const activeDir = JSON.parse(configData).filePath
    const imagePath = join(activeDir, evidenceID)
    const imageBuffer = await fs.readFile(imagePath)
    const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`
    return base64
  }
})

ipcMain.handle('uploadImage', async function (): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    title: 'Select an image',
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] }],
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]

  try {
    const buffer = await sharp(filePath).png().toBuffer()

    const base64 = buffer.toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('Error converting image:', error)
    return null
  }
})

ipcMain.handle('submitEvidence', async (_event, formData): Promise<object> => {
  const [
    selectedK,
    selectedS,
    selectedB,
    selectedImage,
    description,
    evidenceDate,
    submittedEvidenceID
  ] = formData
  let evidenceID
  if (submittedEvidenceID == 'new') {
    evidenceID = randomUUID()
  } else {
    evidenceID = submittedEvidenceID
  }
  const activeDir = await getActiveLibrary()
  if (!activeDir) {
    return {
      success: false,
      message: 'No active library found'
    }
  }
  const evidenceObj = {
    criteria: {
      knowledge: selectedK,
      skill: selectedS,
      behaviour: selectedB
    },
    description: description,
    evidenceDate: evidenceDate
  }
  const base64Data = selectedImage.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  try {
    fs.writeFile(join(activeDir, evidenceID), buffer)
  } catch {
    return {
      success: false,
      message: `Could not save image file to ${join(activeDir, evidenceID)}`
    }
  }
  try {
    const libConfigFile = await fs.readFile(join(activeDir, '.lib-config'), 'utf-8')
    const libConfig = JSON.parse(libConfigFile)
    libConfig.evidence[evidenceID] = evidenceObj
    fs.writeFile(join(activeDir, '.lib-config'), JSON.stringify(libConfig, null, 4))
  } catch {
    return {
      success: false,
      message: `Could not save database at ${join(activeDir, '.lib-config')}`
    }
  }
  return { success: true }
})

interface EvidenceCriteria {
  knowledge: number[]
  skill: number[]
  behaviour: number[]
}

interface EvidenceEntry {
  criteria: EvidenceCriteria
  description: string
  evidenceDate: string
}

interface LibraryConfig {
  evidence: Record<string, EvidenceEntry>
}

// ipcMain.handle('getImages', async (_event, critera): Promise<object> => {
//   const [k, s, b] = critera
//   const activeDir = await getActiveLibrary()
//   if (activeDir) {
//     const libConfigFile = await fs.readFile(join(activeDir, '.lib-config'), 'utf-8')
//     const libConfig = JSON.parse(libConfigFile) as LibraryConfig
//     const evidenceData = libConfig.evidence

//     const result: Record<string, string> = {}

//     for (const [id, evidence] of Object.entries(evidenceData)) {
//       const { knowledge = [], skill = [], behaviour = [] } = evidence.criteria

//       const matches =
//         k.every((val: number) => knowledge.includes(val)) &&
//         s.every((val: number) => skill.includes(val)) &&
//         b.every((val: number) => behaviour.includes(val))

//       if (matches) {
//         try {
//           const imagePath = join(activeDir, id)
//           const imageBuffer = await fs.readFile(imagePath)
//           const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`
//           result[id] = base64
//         } catch (err) {
//           console.warn(`Failed to read image for ID ${id}:`, err)
//         }
//       }
//     }

//     return result
//   } else {
//     return {}
//   }
// })

ipcMain.handle('getImages', async (): Promise<object> => {
  const activeDir = await getActiveLibrary()
  if (!activeDir) return {}

  const libConfigFile = await fs.readFile(join(activeDir, '.lib-config'), 'utf-8')
  const libConfig = JSON.parse(libConfigFile) as LibraryConfig
  const evidenceData = libConfig.evidence

  const result: Record<
    string,
    { base64: string; criteria: { knowledge: number[]; skill: number[]; behaviour: number[] } }
  > = {}

  for (const [id, evidence] of Object.entries(evidenceData)) {
    try {
      const imagePath = join(activeDir, id)
      const imageBuffer = await fs.readFile(imagePath)
      const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`
      result[id] = {
        base64,
        criteria: evidence.criteria
      }
    } catch (err) {
      console.warn(`Failed to read image for ID ${id}:`, err)
    }
  }

  return result
})

ipcMain.handle('deleteEvidence', async (_event, evidenceID: string): Promise<object> => {
  const activeDir = await getActiveLibrary()
  if (!activeDir) {
    return {
      success: false,
      message: 'No active library found'
    }
  }

  const imagePath = join(activeDir, evidenceID)
  const configPath = join(activeDir, '.lib-config')

  try {
    await fs.unlink(imagePath)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      message: `Could not delete image file at ${imagePath}: ${message}`
    }
  }

  try {
    const libConfigFile = await fs.readFile(configPath, 'utf-8')
    const libConfig = JSON.parse(libConfigFile)

    if (!libConfig.evidence || !libConfig.evidence[evidenceID]) {
      return {
        success: false,
        message: `Evidence ID ${evidenceID} not found in database`
      }
    }

    delete libConfig.evidence[evidenceID]
    await fs.writeFile(configPath, JSON.stringify(libConfig, null, 4))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      message: `Could not update database at ${configPath}: ${message}`
    }
  }

  return { success: true }
})

interface Database {
  filePath: string
  criteria: {
    knowledge: string[]
    skill: string[]
    behaviour: string[]
  }
  evidence: {
    [key: string]: {
      evidenceDate: string
      criteria: {
        knowledge: number[]
        skill: number[]
        behaviour: number[]
      }
      description: string
    }
  }
}

interface EvidenceItem {
  imageId: string
  imageBuffer: Buffer | null
  description: string
  timestamp: string
}

interface CriterionItem {
  criterionText: string
  evidence: EvidenceItem[]
}

interface ProcessedData {
  knowledge: CriterionItem[]
  skill: CriterionItem[]
  behaviour: CriterionItem[]
}

import { renderToBuffer, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  mainHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a237e'
  },
  criteriaSection: {
    marginBottom: 25
  },
  criteriaHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3f51b5'
  },
  evidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10
  },
  evidenceImage: {
    width: 300,
    // height: 80,
    marginRight: 10,
    objectFit: 'cover'
  },
  evidenceTextContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  evidenceDescription: {
    fontSize: 10,
    color: '#424242',
    marginBottom: 5
  },
  evidenceTimestamp: {
    fontSize: 8,
    color: '#616161'
  },
  noEvidenceText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#757575'
  }
})

const formatTimestamp = (isoString: string): string => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const MyDocument = ({ data }: { data: ProcessedData }): React.JSX.Element => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Knowledge Section */}
      <Text style={styles.mainHeader}>Knowledge</Text>
      {data.knowledge.map((item, index) => (
        <View key={`k-${index}`} style={styles.criteriaSection}>
          <Text style={styles.criteriaHeader}>
            {index + 1}. {item.criterionText}
          </Text>
          {item.evidence.length > 0 ? (
            item.evidence.map(
              (evidence, eIndex) =>
                evidence.imageBuffer && (
                  <View key={`k-e-${eIndex}`} style={styles.evidenceContainer}>
                    <Image style={styles.evidenceImage} src={evidence.imageBuffer} />
                    <View style={styles.evidenceTextContainer}>
                      <Text style={styles.evidenceDescription}>
                        {evidence.description || 'No description provided.'}
                      </Text>
                      <Text style={styles.evidenceTimestamp}>
                        {formatTimestamp(evidence.timestamp)}
                      </Text>
                    </View>
                  </View>
                )
            )
          ) : (
            <Text style={styles.noEvidenceText}>No evidence for this KSB.</Text>
          )}
        </View>
      ))}

      {/* Skill Section */}
      <Text style={styles.mainHeader}>Skill</Text>
      {data.skill.map((item, index) => (
        <View key={`s-${index}`} style={styles.criteriaSection}>
          <Text style={styles.criteriaHeader}>
            {index + 1}. {item.criterionText}
          </Text>
          {item.evidence.length > 0 ? (
            item.evidence.map(
              (evidence, eIndex) =>
                evidence.imageBuffer && (
                  <View key={`s-e-${eIndex}`} style={styles.evidenceContainer}>
                    <Image style={styles.evidenceImage} src={evidence.imageBuffer} />
                    <View style={styles.evidenceTextContainer}>
                      <Text style={styles.evidenceDescription}>
                        {evidence.description || 'No description provided.'}
                      </Text>
                      <Text style={styles.evidenceTimestamp}>
                        {formatTimestamp(evidence.timestamp)}
                      </Text>
                    </View>
                  </View>
                )
            )
          ) : (
            <Text style={styles.noEvidenceText}>No evidence for this KSB.</Text>
          )}
        </View>
      ))}

      {/* Behaviour Section */}
      <Text style={styles.mainHeader}>Behaviour</Text>
      {data.behaviour.map((item, index) => (
        <View key={`b-${index}`} style={styles.criteriaSection}>
          <Text style={styles.criteriaHeader}>
            {index + 1}. {item.criterionText}
          </Text>
          {item.evidence.length > 0 ? (
            item.evidence.map(
              (evidence, eIndex) =>
                evidence.imageBuffer && (
                  <View key={`b-e-${eIndex}`} style={styles.evidenceContainer}>
                    <Image style={styles.evidenceImage} src={evidence.imageBuffer} />
                    <View style={styles.evidenceTextContainer}>
                      <Text style={styles.evidenceDescription}>
                        {evidence.description || 'No description provided.'}
                      </Text>
                      <Text style={styles.evidenceTimestamp}>
                        {formatTimestamp(evidence.timestamp)}
                      </Text>
                    </View>
                  </View>
                )
            )
          ) : (
            <Text style={styles.noEvidenceText}>No evidence for this KSB.</Text>
          )}
        </View>
      ))}
    </Page>
  </Document>
)

ipcMain.handle('export', async () => {
  const dbPath = path.join(activeConfig, '.lib-config')

  let db: Database
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8')
    db = JSON.parse(fileContent)
  } catch (error) {
    console.error(`Failed to read or parse database file at ${dbPath}:`, error)
    return { success: false, error: 'Could not load the database file.' }
  }

  /**
   * Processes the raw database into a structured format.
   * This is optimized to read each file only once.
   */
  const processData = async (database: Database): Promise<ProcessedData> => {
    const processed: ProcessedData = {
      knowledge: database.criteria.knowledge.map((text) => ({ criterionText: text, evidence: [] })),
      skill: database.criteria.skill.map((text) => ({ criterionText: text, evidence: [] })),
      behaviour: database.criteria.behaviour.map((text) => ({ criterionText: text, evidence: [] }))
    }

    // Use Promise.all to read all image files concurrently for better performance.
    const evidencePromises = Object.entries(database.evidence).map(
      async ([imageId, evidenceData]) => {
        const imagePath = path.join(activeConfig, imageId)
        let imageBuffer: Buffer | null = null
        try {
          imageBuffer = await fs.readFile(imagePath)
        } catch (err) {
          console.error(`Could not read image file: ${imagePath}`, err)
        }

        const evidenceItem: EvidenceItem = {
          imageId,
          imageBuffer,
          description: evidenceData.description,
          timestamp: evidenceData.evidenceDate
        }

        // Return the processed item along with its criteria for later distribution.
        return { evidenceItem, criteria: evidenceData.criteria }
      }
    )

    const allEvidence = await Promise.all(evidencePromises)

    // Distribute the processed evidence items into the correct criteria arrays.
    for (const { evidenceItem, criteria } of allEvidence) {
      criteria.knowledge.forEach((index) => {
        if (processed.knowledge[index]) processed.knowledge[index].evidence.push(evidenceItem)
      })
      criteria.skill.forEach((index) => {
        if (processed.skill[index]) processed.skill[index].evidence.push(evidenceItem)
      })
      criteria.behaviour.forEach((index) => {
        if (processed.behaviour[index]) processed.behaviour[index].evidence.push(evidenceItem)
      })
    }

    return processed
  }

  const structuredData = await processData(db)

  // --- PDF Save Dialog and Generation ---
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save PDF Report',
    defaultPath: `KSB-Evidence-Report-${Date.now()}.pdf`,
    filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
  })

  if (!filePath) {
    return { success: false, error: 'Save dialog cancelled.' }
  }

  try {
    const buffer = await renderToBuffer(<MyDocument data={structuredData} />)
    await fs.writeFile(filePath, buffer)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Failed to generate or save the PDF:', error)
    return { success: false, error: errorMessage }
  }

  // --- ZIP File Generation with PNG Conversion ---
  const zipPath = filePath.replace(/\.pdf$/, '.zip')
  try {
    console.log(`Generating ZIP archive with PNG conversion at: ${zipPath}`)

    const output = createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () =>
      console.log(`ZIP archive finalized. Total bytes: ${archive.pointer()}`)
    )
    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') throw err
      else console.warn(err)
    })
    archive.on('error', (err) => {
      throw err
    })
    archive.pipe(output)

    /**
     * Converts images to PNG and adds them to the ZIP archive.
     * This function is now async to handle image processing.
     */
    const addCategoryToZip = async (
      categoryName: 'Knowledge' | 'Skills' | 'Behaviours',
      prefix: 'K' | 'S' | 'B',
      items: CriterionItem[]
    ): Promise<void> => {
      for (const [criterionIndex, criterion] of items.entries()) {
        const sortedEvidence = [...criterion.evidence].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        // Process all image conversions for a criterion in parallel.
        const conversionPromises = sortedEvidence.map(async (evidence, evidenceIndex) => {
          if (!evidence.imageBuffer) return

          try {
            // Convert the original WebP buffer to a PNG buffer using sharp.
            const pngBuffer = await sharp(evidence.imageBuffer).png().toBuffer()

            const criterionNumber = criterionIndex + 1
            const evidenceLetter = String.fromCharCode(65 + evidenceIndex)
            // The new file will always have a .png extension.
            const newFileName = `${prefix}${criterionNumber}${evidenceLetter}.png`
            const pathInZip = path.join(categoryName, newFileName)

            // Append the newly created PNG buffer to the archive.
            archive.append(pngBuffer, { name: pathInZip })
          } catch (conversionError) {
            console.error(`Failed to convert image ${evidence.imageId} to PNG:`, conversionError)
          }
        })

        await Promise.all(conversionPromises)
      }
    }

    // Await the completion of all asynchronous ZIP operations.
    await addCategoryToZip('Knowledge', 'K', structuredData.knowledge)
    await addCategoryToZip('Skills', 'S', structuredData.skill)
    await addCategoryToZip('Behaviours', 'B', structuredData.behaviour)

    await archive.finalize()

    return { success: true, path: filePath, zipPath: zipPath }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Failed to generate or save the ZIP file:', error)
    return {
      success: true,
      path: filePath,
      error: `The PDF was saved, but the ZIP archive failed: ${errorMessage}`
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
