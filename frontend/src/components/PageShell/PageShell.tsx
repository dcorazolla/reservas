import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { Header, Sidebar, Footer } from '../Layout'

type Props = {
  children: React.ReactNode
  isLoading?: boolean
}

export default function PageShell({ children }: Props) {
  // Sidebar drawer will be controlled via state in header; use a simple
  // pattern by exposing a synthetic handler that toggles a mobile drawer.
  const [isDrawerOpen, setDrawerOpen] = React.useState(false)

  return (
    <Box minH="100vh" pb="64px"> {/* reserve footer height */}
      <Box position="sticky" top={0} zIndex={10}>
        <Header onOpenMenu={() => setDrawerOpen(true)} />
      </Box>

      <Flex as="main" align="stretch">
        <Box display={{ base: 'none', md: 'block' }} aria-hidden={false}>
          <Sidebar desktop />
        </Box>

        <Box flex="1" px={{ base: 4, md: 6 }} py={4} ml={{ base: 0, md: 'var(--app-sidebar-left, 55px)' }}>
          {children}
        </Box>
      </Flex>

      {/* Sidebar drawer for mobile: reuse Sidebar component which owns its own drawer trigger when not desktop. */}
      <Box display={{ md: 'none' }}>
        <Sidebar isOpen={isDrawerOpen} onOpen={() => setDrawerOpen(true)} onClose={() => setDrawerOpen(false)} />
      </Box>

      <Footer />
    </Box>
  )
}
