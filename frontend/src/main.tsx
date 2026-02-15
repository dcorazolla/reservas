import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppChakraProvider from './design-system/ChakraProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppChakraProvider>
      <App />
    </AppChakraProvider>
  </StrictMode>,
)
