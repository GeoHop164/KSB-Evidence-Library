import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Pages/App'
import Init from './Pages/Init'

const config = await window.electron.ipcRenderer.invoke('checkConfig')
console.log(config)

createRoot(document.getElementById('root')!).render(
  <StrictMode>{config ? <App /> : <Init />}</StrictMode>
)
