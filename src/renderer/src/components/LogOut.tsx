import CloseFolder from '../assets/CloseFolder.webp'
import '../assets/Cards.css'
import '../assets/App.css'
import { Tooltip } from 'react-tooltip'

interface LogOutProps {
  logOutFunction: () => void
}

function LogOut({ logOutFunction }: LogOutProps): React.JSX.Element {
  return (
    <>
      <div
        data-tooltip-id="close_library"
        className="clickable card"
        id="logOutButton"
        onClick={logOutFunction}
      >
        <img src={CloseFolder}></img>
      </div>
      <Tooltip id="close_library">Close this Library</Tooltip>
    </>
  )
}

export default LogOut
