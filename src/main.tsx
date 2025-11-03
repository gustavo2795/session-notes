import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SessionNote from './pages/session-note.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionNote />
  </StrictMode>,
)
