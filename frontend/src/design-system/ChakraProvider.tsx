import React from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = {
  // keep a minimal theme object for reference; v3 expects a system value.
  config,
}

export default function AppChakraProvider({ children }: { children: React.ReactNode }) {
  // v3 Chakra uses a `value` prop (the system). For now use the provided defaultSystem
  // so provider internals find `_config` and global styles. We keep `theme` variable
  // in the file for future merge with `mergeConfigs` if we want custom tokens.
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
    </ChakraProvider>
  )
}
