import '../assets/Cards.css'
import '../assets/Init.css'
import NewIcon from '../assets/Init/new.webp'
import ExistingIcon from '../assets/Init/existing.webp'
import ImportIcon from '../assets/Init/Import.webp'

function InitSelector(): React.JSX.Element {
  return (
    <div id="initSelectors">
      <div className="initSelectorOption card clickable" id="init_New" style={{ backgroundColor: '#B89AE9' }}>
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

      <div className="initSelectorOption card clickable" id="init_New" style={{ backgroundColor: '#FFC68B' }}>
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

      <div className="initSelectorOption card clickable" id="init_New" style={{ backgroundColor: '#64C8C8' }}>
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
