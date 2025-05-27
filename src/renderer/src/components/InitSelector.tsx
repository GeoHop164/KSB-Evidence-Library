import '../assets/Cards.css'
import '../assets/Init.css'
import NewIcon from '../assets/Init/new.webp'
import ExistingIcon from '../assets/Init/existing.webp'
import ImportIcon from '../assets/Init/Import.webp'

interface InitSelectorrProps {
  setNewOpen: (open: boolean) => void
  setConfig: (open: string) => void
}

function InitSelector({ setNewOpen, setConfig }: InitSelectorrProps): React.JSX.Element {
  async function openExisting(): Promise<void> {
    const result = await window.electron.ipcRenderer.invoke('openExisting')
    if (result.state == true) {
      setConfig(result.path)
    } else {
      alert(`Couldn't open directory: ${result.message}`)
    }
  }
  return (
    <div id="initSelectors">
      <div
        className="initSelectorOption card clickable"
        id="init_New"
        style={{ backgroundColor: '#B89AE9' }}
        onClick={() => {
          setNewOpen(true)
        }}
      >
        <div className="imageContainer">
          <img src={NewIcon} />
        </div>
        <div className="actionContainer">
          <p className="actionText">
            New
            <br />
            Library
          </p>
        </div>
      </div>

      <div
        className="initSelectorOption card clickable"
        id="init_New"
        style={{ backgroundColor: '#FFC68B' }}
        onClick={openExisting}
      >
        <div className="imageContainer">
          <img src={ExistingIcon} />
        </div>
        <div className="actionContainer">
          <p className="actionText">
            Open
            <br />
            Existing
          </p>
        </div>
      </div>

      <div
        className="initSelectorOption card clickable"
        id="init_New"
        style={{ backgroundColor: '#64C8C8' }}
      >
        <div className="imageContainer">
          <img src={ImportIcon} />
        </div>
        <div className="actionContainer">
          <p className="actionText">
            Import
            <br />
            Library
          </p>
        </div>
      </div>
    </div>
  )
}

export default InitSelector
