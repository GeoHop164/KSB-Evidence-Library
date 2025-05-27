import React, { useEffect, useState } from 'react'
import App from '../Pages/App'
import Init from '../Pages/Init'

const RootController: React.FC = () => {
  const [config, setConfig] = useState<string | null>(null)

  useEffect(() => {
    window.electron.ipcRenderer.invoke('checkConfig').then(setConfig)
  }, [])

  if (config === null) return <div>Loading...</div>

  return config ? <App path={config} /> : <Init onConfigSet={setConfig} />
}

export default RootController
