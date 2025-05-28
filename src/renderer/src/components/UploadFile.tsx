import '../assets/UploadFile.css'
import Tick from '../assets/Upload/Tick.webp'
import Close from '../assets/Upload/Close.webp'
import KsbToggle from '../components/KsbToggle'
import { useState } from 'react'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

interface UploadFileProps {
  setUploadVisible: (visible: boolean) => void
  criteria: string[][]
}
function UploadFile({ setUploadVisible, criteria }: UploadFileProps): React.JSX.Element {
  const [selectedK, setSelectedK] = useState<number[]>([])
  const [selectedS, setSelectedS] = useState<number[]>([])
  const [selectedB, setSelectedB] = useState<number[]>([])

  const [startDate, setStartDate] = useState(new Date())

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
    setUploadVisible(false)
  }

  return (
    <div id="uploadBackground">
      <div id="uploadGrid">
        <div id="imagePreviewContainer"></div>
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
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            locale="en-GB"
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
          ></textarea>
        </div>
        <div className="uploadActionButton" id="uploadClose" onClick={closeWindow}>
          <img className="actionImage" src={Close} />
        </div>
        <div className="uploadActionButton" id="uploadSubmit">
          <img className="actionImage" src={Tick} />
        </div>
      </div>
    </div>
  )
}

export default UploadFile
