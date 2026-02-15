import React from 'react'
import { Heading, Text, Button, VStack } from '@chakra-ui/react'

export default function Login() {
  return (
    <VStack align="start" spacing={4}>
      <Heading as="h1" size="lg">Login</Heading>
      <Text>Placeholder de Login. Implementar com react-hook-form e zod.</Text>
      <Button colorScheme="blue">Entrar (demo)</Button>
    </VStack>
  )
}
