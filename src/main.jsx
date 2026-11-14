import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { useAppStore } from './store/useAppStore.js'

// Apply persisted preferences before the first paint to avoid theme flashing.
const { theme, language } = useAppStore.getState()
document.documentElement.classList.toggle('dark', theme === 'dark')
document.documentElement.lang = language

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
