import React from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

export const AppChakraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
}

export default AppChakraProvider
