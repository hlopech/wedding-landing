import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainScreen from './MainScreen.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainScreen />
  </StrictMode>,
)
