import '../assets/UploadFile.css'
import { Dispatch, SetStateAction, useState, useCallback } from 'react'
import Close from '../assets/Upload/Close.webp'
import iconExport from '../assets/MainActions/export.webp'
import React from 'react'

// Define the component's props
interface ExportProps {
  setExportWindow: Dispatch<SetStateAction<boolean>>
}

// The main Export component, now simplified to trigger the main process.
function Export({ setExportWindow }: ExportProps): React.JSX.Element {
  const [isSaving, setIsSaving] = useState(false)

  // This function now just calls the main process and waits.
  const handleDownload = useCallback(async () => {
    setIsSaving(true)
    try {
      // Tell the main process to generate the PDF and show a save dialog.
      // We can pass any necessary data here in the future.
      const result = await window.electron.ipcRenderer.invoke('export')
      if (result.success) {
        console.log(`PDF saved to: ${result.path}`)
      } else {
        // Handle cancellation or errors
        console.log(result.error || 'PDF save was cancelled.')
      }
    } catch (error) {
      console.error('Failed to invoke PDF generation:', error)
    } finally {
      setIsSaving(false)
      // Optionally close the modal after saving/cancelling
      setExportWindow(false)
    }
  }, [setExportWindow])

  return (
    <div id="uploadBackground">
      <div id="exportWindow">
        <div id="exportWindowContent">
          <img
            src={iconExport}
            style={{ width: '25%', display: 'block', margin: '0 auto 1rem' }}
            alt="Export Icon"
          />
          <p>Generate a PDF report of your evidence.</p>

          <button
            className="uploadActionButton"
            onClick={handleDownload}
            disabled={isSaving}
            style={{
              height: '20%',
              width: 'auto',
              padding: '0 20px',
              backgroundColor: isSaving ? 'rgb(150, 150, 150)' : 'rgb(100, 128, 200)',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? 'Exporting...' : 'Generate PDF & ZIP'}
          </button>
        </div>
        <div id="closeExport" onClick={() => setExportWindow(false)}>
          <img className="actionImage" src={Close} alt="Close button" />
        </div>
      </div>
    </div>
  )
}

export default Export
