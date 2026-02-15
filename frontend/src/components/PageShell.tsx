import React from 'react'
import { Box, Container, Skeleton } from '@chakra-ui/react'

type Props = {
  children: React.ReactNode
  isLoading?: boolean
}

export default function PageShell({ children, isLoading = false }: Props) {
  return (
    <Box minH="100vh" p={{ base: 4, md: 8 }}>
      <Container maxW="container.lg">
        {isLoading ? (
          <Skeleton height="200px" borderRadius="md" />
        ) : (
          children
        )}
      </Container>
    </Box>
  )
}
