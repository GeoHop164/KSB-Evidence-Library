import { useState, useEffect } from 'react'
import '../assets/App.css'
import '../assets/Cards.css'
import Header from '../components/Header'
import KsbToggle from '../components/KsbToggle'
import LogOut from '../components/LogOut'
import UploadFile from '../components/UploadFile'
import ImageGrid from '../components/ImageGrid'
import { Tooltip } from 'react-tooltip'
import { preload } from 'react-dom'
import iconClear from '../assets/MainActions/clear.webp'
import iconExport from '../assets/MainActions/export.webp'
import iconUpload from '../assets/MainActions/upload.webp'
import Export from '../components/Export'

interface AppProps {
  path: string
  onConfigSet: (config: string | null) => void
}

function App({ path, onConfigSet }: AppProps): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedK, setSelectedK] = useState<number[]>([])
  const [selectedS, setSelectedS] = useState<number[]>([])
  const [selectedB, setSelectedB] = useState<number[]>([])
  const [k, setK] = useState<string[]>([])
  const [s, setS] = useState<string[]>([])
  const [b, setB] = useState<string[]>([])

  const [uploadVisible, setUploadVisible] = useState<string | null>(null)
  const [exportWindow, setExportWindow] = useState<boolean>(false)

  // const [loading, setLoading] = useState(true)

  async function logOutIPC(): Promise<void> {
    await window.electron.ipcRenderer.invoke('logOut')
    onConfigSet(null)
    window.location.reload()
  }

  useEffect(() => {
    preload('../assets/Upload/Tick.webp', { as: 'image' })
    preload('../assets/Upload/Close.webp', { as: 'image' })
    async function fetchCriteria(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('getCriteria', path)
      if (result.ok) {
        const [kData, sData, bData] = result.criteria
        setK(kData)
        setS(sData)
        setB(bData)
      } else {
        console.log('Failed to call IPC for getCriteria')
        alert(result.message)
      }

      // setLoading(false)
    }

    fetchCriteria()
  }, [path])

  function toggle(ksbType: string, index: number): void {
    const toggleIndex = (
      arr: number[],
      setArr: React.Dispatch<React.SetStateAction<number[]>>
    ): void => {
      if (arr.includes(index)) {
        setArr(arr.filter((i) => i !== index))
      } else {
        setArr([...arr, index])
      }
    }

    switch (ksbType.toLowerCase()) {
      case 'k':
        toggleIndex(selectedK, setSelectedK)
        break
      case 's':
        toggleIndex(selectedS, setSelectedS)
        break
      case 'b':
        toggleIndex(selectedB, setSelectedB)
        break
      default:
        console.warn(`Unknown KSB type: ${ksbType}`)
    }
  }

  return (
    <div id="appContainer">
      <div
        id="headerContainer"
        style={{
          width: '90%',
          display: 'flex',
          height: '10vh',
          marginBottom: '2.5%',
          marginTop: '1%',
          gap: '20px',
          alignItems: 'flex-end'
        }}
      >
        <LogOut logOutFunction={logOutIPC}></LogOut>
        <Header main></Header>
        <div id="actionsContainer">
          <div
            style={{ backgroundColor: '#EE8683' }}
            className="appAction"
            onClick={() => {
              setSelectedK([])
              setSelectedS([])
              setSelectedB([])
            }}
            data-tooltip-id="clear-filter"
          >
            <img src={iconClear} className="actionButton"></img>
          </div>
          <Tooltip id="clear-filter">Clear Filters</Tooltip>
          <div
            style={{ backgroundColor: '#6480C8' }}
            className="appAction"
            data-tooltip-id="export"
            onClick={() => setExportWindow(true)}
          >
            <img src={iconExport} className="actionButton"></img>
          </div>
          <Tooltip id="export">Export</Tooltip>
          <div
            style={{ backgroundColor: '#80B790' }}
            className="appAction"
            onClick={() => {
              setUploadVisible('new')
            }}
            data-tooltip-id="upload"
          >
            <img src={iconUpload} className="actionButton"></img>
          </div>
          <Tooltip id="upload">Upload Evidence</Tooltip>
        </div>
      </div>
      <KsbToggle
        toggleFunction={toggle}
        criteria={[k, s, b]}
        selected={[selectedK, selectedS, selectedB]}
      ></KsbToggle>

      <ImageGrid
        criteria={[selectedK, selectedS, selectedB]}
        loading={loading}
        setLoading={setLoading}
        imageClicked={setUploadVisible}
        refreshKey={refreshKey}
      ></ImageGrid>

      {uploadVisible && (
        <UploadFile
          uploadVisible={uploadVisible}
          setUploadVisible={setUploadVisible}
          criteria={[k, s, b]}
          onUploadComplete={() => setRefreshKey((prev) => prev + 1)}
        ></UploadFile>
      )}

      {exportWindow && <Export setExportWindow={setExportWindow} />}
    </div>
  )
}

export default App
