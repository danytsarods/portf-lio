import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyRemoteContent, fetchRemoteContent } from './content/remote'
import '@fontsource-variable/inter-tight/index.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import './index.css'

// Textos e trabalhos editados no painel /admin entram antes da primeira renderização.
fetchRemoteContent().then((remote) => {
  if (remote) applyRemoteContent(remote)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
