import React, { useEffect, useState } from 'react'
import App from '../Pages/App'
import Init from '../Pages/Init'

const RootController: React.FC = () => {
  const [config, setConfig] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      const filePath = await window.electron.ipcRenderer.invoke('checkConfig')
      console.log(`Got filePath: ${filePath}`)
      setConfig(filePath)
    }

    fetchConfig()
  }, [])

  if (config === null) return <div>Loading...</div>

  return config ? <App path={config} onConfigSet={setConfig} /> : <Init onConfigSet={setConfig} />
}

export default RootController
