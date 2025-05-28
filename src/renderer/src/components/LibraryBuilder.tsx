import { useState } from 'react'
import CriteriaList from './CriteriaList'
import '../assets/Help.css'
import '../assets/Cards.css'
import folderIcon from '../assets/folder.webp'
import tick from '../assets/tick.webp'

interface LibraryBuilderProps {
  setNewOpen: (open: boolean) => void
  setConfig: (open: string) => void
}

function LibraryBuilder({ setNewOpen, setConfig }: LibraryBuilderProps): React.JSX.Element {
  const [folder, setFolder] = useState(null)
  const [knowledge, setKnowledge] = useState<string[]>([])
  const [skill, setSkill] = useState<string[]>([])
  const [behaviour, setBehaviour] = useState<string[]>([])
  const [standard, setStandard] = useState<string>('[Custom]')

  async function handleFolder(): Promise<void> {
    const config = await window.electron.ipcRenderer.invoke('selectLocation')
    setFolder(config)
  }

  async function newLibrary(): Promise<void> {
    console.log(knowledge)
    console.log(skill)
    console.log(behaviour)
    if (
      knowledge.includes('[Enter Criteria]') ||
      skill.includes('[Enter Criteria]') ||
      behaviour.includes('[Enter Criteria]') ||
      knowledge.includes('') ||
      skill.includes('') ||
      behaviour.includes('')
    ) {
      alert('Make sure you enter a criteria point for each KSB!')
      return
    }
    const success = await window.electron.ipcRenderer.invoke('newLibrary', [
      knowledge,
      skill,
      behaviour,
      standard,
      folder
    ])
    if (success.stat) {
      console.log(success.message)
      setConfig(success.path)
    } else {
      alert(success.message)
    }
  }

  async function loadStandard(): Promise<void> {
    const [k, s, b, standard] = await window.electron.ipcRenderer.invoke('loadStandard')
    setKnowledge(k)
    setSkill(s)
    setBehaviour(b)
    setStandard(standard)
  }

  return (
    <div id="libraryBuilderBg">
      <div id="libraryBuilderFg" className="card">
        <div id="builderHeader">
          <div className="builderTitle">New Library</div>
          <button
            className="newLibraryClose"
            onClick={() => {
              setNewOpen(false)
            }}
          >
            X
          </button>
        </div>
        <div className="libraryBuilderGrid">
          <CriteriaList title={'Knowledge'} ksbs={knowledge} iterator={setKnowledge}></CriteriaList>
          <CriteriaList title={'Skills'} ksbs={skill} iterator={setSkill}></CriteriaList>
          <CriteriaList
            title={'Behaviours'}
            ksbs={behaviour}
            iterator={setBehaviour}
          ></CriteriaList>
          <div id="selectLibraryFolder" className="card clickable" onClick={handleFolder}>
            <img src={folderIcon} />
          </div>
          {folder ? (
            <p className="folderStatus">{folder}</p>
          ) : (
            <p className="folderStatus">Select a folder</p>
          )}
          <div
            id="createLibraryButton"
            className="card clickable"
            style={{ backgroundColor: '#80B790' }}
            onClick={newLibrary}
          >
            <img id="tick" src={tick}></img>
          </div>
          <div id="loadExistingStandard" className="clickable" onClick={loadStandard}>
            Load existing standard file
          </div>
        </div>
      </div>
    </div>
  )
}

export default LibraryBuilder
