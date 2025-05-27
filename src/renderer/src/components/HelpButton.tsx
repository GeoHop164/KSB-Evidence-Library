import '../assets/Help.css'

function HelpButton({helpOpen, setHelpOpen}): React.JSX.Element {
  return (
    <div
      id="helpButton"
      className="card"
      style={{ backgroundColor: '#EE8683', width: '5vh', height: '5vh' }}
      onClick={()=>{helpOpen? setHelpOpen(false) : setHelpOpen(true)}}
    >
      {helpOpen ? <p>X</p> : <p>?</p>}
    </div>
  )
}

export default HelpButton
