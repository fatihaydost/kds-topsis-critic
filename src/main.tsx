import './styles/app.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, loadLanding } from './app/App'
import { initI18n } from './i18n'

initI18n()

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

const start = () =>
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

// The home page arrives prerendered (vite.config.ts). Load the landing chunk first, so React's first
// commit replaces that HTML with the same page instead of a blank loading frame.
if (root.hasChildNodes()) loadLanding().then(start, start)
else start()
