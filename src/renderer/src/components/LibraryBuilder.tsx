import { useState } from 'react'
import CriteriaList from './CriteriaList'
import '../assets/Help.css'
import '../assets/Cards.css'

interface LibraryBuilderProps {
  setNewOpen: (open: boolean) => void
  setConfig: (open: string) => void
}

function LibraryBuilder({ setNewOpen, setConfig }: LibraryBuilderProps): React.JSX.Element {
  async function newLibrary(criteria: Object): Promise<string> {
    const config = await window.electron.ipcRenderer.invoke('selectLocation')
    setConfig(config)
    return config
  }
  const [knowledge, setKnowledge] = useState([])
  const [skill, setSkill] = useState([])
  const [behaviour, setBehaviour] = useState([])

  return (
    <div id="libraryBuilderBg">
      <div id="libraryBuilderFg" className='card'>
        <CriteriaList title={'Knowledge'} ksbs={knowledge}></CriteriaList>
        <CriteriaList title={'Skills'} ksbs={skill}></CriteriaList>
        <CriteriaList title={'Behaviours'} ksbs={behaviour}></CriteriaList>
        <button
          onClick={() => {
            setNewOpen(false)
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default LibraryBuilder
