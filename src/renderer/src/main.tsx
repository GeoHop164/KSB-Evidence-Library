import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RootController from './components/RootController'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootController />
  </StrictMode>
)
