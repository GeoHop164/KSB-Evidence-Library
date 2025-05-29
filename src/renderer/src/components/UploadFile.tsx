import '../assets/UploadFile.css'
import Tick from '../assets/Upload/Tick.webp'
import Close from '../assets/Upload/Close.webp'
import KsbToggle from '../components/KsbToggle'
import loading from '../assets/loading.svg'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface UploadFileProps {
  setUploadVisible: (visible: string | null) => void
  criteria: string[][]
  uploadVisible: string | null
}

interface ExistingData {
  knowledge: number[]
  skill: number[]
  behaviour: number[]
  evidenceDate: Date | null
  description: string
}

function UploadFile({
  setUploadVisible,
  criteria,
  uploadVisible
}: UploadFileProps): React.JSX.Element {
  const [selectedK, setSelectedK] = useState<number[]>([])
  const [selectedS, setSelectedS] = useState<number[]>([])
  const [selectedB, setSelectedB] = useState<number[]>([])
  const [description, setDescription] = useState<string>('')
  const [evidenceDate, setEvidenceDate] = useState<Date | null>(new Date())
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState<boolean>(false)

  useEffect(() => {
    if (uploadVisible && uploadVisible !== 'new') {
      setImageUploading(true)
      window.electron.ipcRenderer.invoke('getEvidenceImage', uploadVisible).then((data: string) => {
        setSelectedImage(data)
        setImageUploading(false)
      })
      window.electron.ipcRenderer
        .invoke('getEvidenceData', uploadVisible)
        .then((data: ExistingData) => {
          setSelectedK(data.knowledge || [])
          setSelectedS(data.skill || [])
          setSelectedB(data.behaviour || [])
          setEvidenceDate(data.evidenceDate || new Date())
          setDescription(data.description || '')
        })
    }
  }, [uploadVisible])

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
  function closeWindow(): void {
    setUploadVisible(null)
  }

  function handleImageClick(): void {
    setImageUploading(true)
    window.electron.ipcRenderer.invoke('uploadImage').then((data: string) => {
      setSelectedImage(data)
      setImageUploading(false)
    })
  }

  async function uploadEvidence(): Promise<void> {
    console.log('Submitting:')
    console.log([selectedK, selectedS, selectedB, selectedImage, description, evidenceDate])
    if (!selectedImage) {
      alert('Please upload an image first!')
      return
    }
    if (JSON.stringify([selectedK, selectedS, selectedB]) == JSON.stringify([[], [], []])) {
      alert("You haven't selected any KSBs")
      return
    }
    const result = await window.electron.ipcRenderer.invoke('submitEvidence', [
      selectedK,
      selectedS,
      selectedB,
      selectedImage,
      description,
      evidenceDate
    ])
    if (result.success) {
      console.log('Evidence Submitted')
      setUploadVisible(null)
      setSelectedK([])
      setSelectedS([])
      setSelectedB([])
      setEvidenceDate(null)
      setDescription('')
    } else {
      alert(result.message)
    }
  }

  return (
    <div id="uploadBackground">
      <div id="uploadGrid">
        <div id="imagePreviewContainerContainer">
          <div id="imagePreviewContainer" className={!selectedImage ? 'noImage' : ''}>
            {!selectedImage &&
              (!imageUploading ? (
                <div className="uploadImageButton" onClick={handleImageClick}>
                  Upload Image
                </div>
              ) : (
                <img id="loadingIcon" src={loading} />
              ))}
            {selectedImage && (
              <img id="loadedImage" src={selectedImage} onClick={handleImageClick}></img>
            )}
          </div>
        </div>
        <div id="uploadFormWindow">
          <h1>Criteria</h1>
          <KsbToggle
            toggleFunction={toggle}
            criteria={criteria}
            selected={[selectedK, selectedS, selectedB]}
          ></KsbToggle>
          <h1>Evidence Date</h1>
          <DatePicker
            id="datePicker"
            selected={evidenceDate}
            onChange={(date) => setEvidenceDate(date)}
            dateFormat={'dd/MM/YYYY'}
          ></DatePicker>
          <h1>Description</h1>
          <textarea
            className="card"
            style={{
              marginLeft: '1vh',
              width: '99%',
              flexGrow: '1',
              marginBottom: '1vh',
              resize: 'none',
              fontSize: '2em'
            }}
            placeholder="What the image shows, how it meets the criteria, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="uploadActionButton" id="uploadClose" onClick={closeWindow}>
          <img className="actionImage" src={Close} />
        </div>
        <div className="uploadActionButton" id="uploadSubmit" onClick={uploadEvidence}>
          <img className="actionImage" src={Tick} />
        </div>
      </div>
    </div>
  )
}

export default UploadFile
