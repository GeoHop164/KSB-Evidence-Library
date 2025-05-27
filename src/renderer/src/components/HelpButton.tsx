import '../assets/Help.css'

interface HelpButtonProps {
  helpOpen: boolean
  setHelpOpen: (open: boolean) => void
}

function HelpButton({ helpOpen, setHelpOpen }: HelpButtonProps): React.JSX.Element {
  return (
    <div
      id="helpButton"
      className="card"
      style={{ backgroundColor: helpOpen ? '#80B790' : '#EE8683', width: '5vh', height: '5vh' }}
      onClick={() => {
        helpOpen ? setHelpOpen(false) : setHelpOpen(true)
      }}
    >
      {helpOpen ? <p>X</p> : <p>?</p>}
    </div>
  )
}

export default HelpButton
