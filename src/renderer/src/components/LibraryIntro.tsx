import '../assets/Help.css'

function LibraryIntro(): React.JSX.Element {
  return (
    <div id="libraryIntroBg">
      <div id="libraryIntro" className="card">
        <div className="title card">
          <h1>How do libraries work?</h1>
        </div>
        <p className="longText">
          A library is a collection of KSB evidence - you store it locally on your device for a
          security-first approach. You can choose a folder to set up a new library, open an existing
          library, or import a library you exported on another device.
        </p>
        <br />
        <h2 className="longText" style={{ fontWeight: 'bold' }}>
          What if I want my Library accessible on other devices?
        </h2>
        <p className="longText">
          To sync your library in the cloud, simply select a folder within a cloud location, like
          OneDrive, or Google Drive - then choose "Open Existing" on the other device.
        </p>
      </div>
    </div>
  )
}

export default LibraryIntro
