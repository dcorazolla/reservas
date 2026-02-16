import React from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { useAuth } from '@contexts/AuthContext'

export default function Home() {
  const { logout } = useAuth()

  return (
    <Box>
      <Heading as="h1" size="lg" mb={4}>
        Bem-vindo
      </Heading>
      <Text mb={4}>Esta é a página inicial protegida — o template básico após login.</Text>
      <Button onClick={logout} colorScheme="red">
        Sair
      </Button>
    </Box>
  )
}

