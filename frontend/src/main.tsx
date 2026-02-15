import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './i18n'
import AppChakraProvider from './design-system/ChakraProvider'
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
