import React from 'react'
import { Box, Container, Skeleton, useColorModeValue } from '@chakra-ui/react'

type Props = {
  children: React.ReactNode
  isLoading?: boolean
}

export default function PageShell({ children, isLoading = false }: Props) {
  const bg = useColorModeValue('white', 'gray.800')

  return (
    <Box minH="100vh" bg={bg} p={{ base: 4, md: 8 }}>
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
