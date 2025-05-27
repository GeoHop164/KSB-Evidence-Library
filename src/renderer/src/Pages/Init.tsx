import { useState } from 'react'
import Header from '../components/Header'
import InitSelector from '../components/InitSelector'
import HelpButton from '../components/HelpButton'
import LibraryIntro from '../components/LibraryIntro'

function Init(): React.JSX.Element {
  const [helpOpen, setHelpOpen] = useState(false)
  console.log(`helpOpen: ${helpOpen}`);
  return (
    <>
      <Header></Header>
      <InitSelector></InitSelector>
      <HelpButton helpOpen={helpOpen} setHelpOpen={setHelpOpen}></HelpButton>
      {helpOpen && <LibraryIntro></LibraryIntro>}
    </>
  )
}

export default Init
