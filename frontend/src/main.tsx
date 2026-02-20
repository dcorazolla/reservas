import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './i18n'
import 'flag-icons/css/flag-icons.min.css'
// CSS base system with design tokens (colors, typography, spacing, etc.)
import './styles/base.css'
import './styles/themes.css'
import './styles/utilities.css'
import './styles/forms.css'
import AppChakraProvider from '@design/ChakraProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppChakraProvider>
        <App />
      </AppChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
