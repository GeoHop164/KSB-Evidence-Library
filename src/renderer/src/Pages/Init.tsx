import { useState } from 'react'
import Header from '../components/Header'
import InitSelector from '../components/InitSelector'
import HelpButton from '../components/HelpButton'
import LibraryIntro from '../components/LibraryIntro'
import LibraryBuilder from '../components/LibraryBuilder'

interface InitProps {
  onConfigSet: (config: string) => void
}

function Init({ onConfigSet }: InitProps): React.JSX.Element {
  const [helpOpen, setHelpOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  return (
    <>
      <Header main={false}></Header>
      <InitSelector setConfig={onConfigSet} setNewOpen={setNewOpen}></InitSelector>
      {!newOpen && <HelpButton helpOpen={helpOpen} setHelpOpen={setHelpOpen}></HelpButton>}
      {helpOpen && <LibraryIntro></LibraryIntro>}
      {newOpen && <LibraryBuilder setNewOpen={setNewOpen} setConfig={onConfigSet}></LibraryBuilder>}
    </>
  )
}

export default Init
