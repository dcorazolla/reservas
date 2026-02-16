import React from 'react'
import { Box, Heading, List, ListItem, Text, Button } from '@chakra-ui/react'
import './properties.css'

type Property = {
  id: string
  name: string
  city: string
}

const SAMPLE: Property[] = [
  { id: 'p-1', name: 'Pousada Sol', city: 'Lisboa' },
  { id: 'p-2', name: 'Hotel Mar', city: 'Porto' },
]

export default function PropertiesPage() {
  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Propriedades</Heading>
        <Button colorScheme="blue" size="sm">Nova propriedade</Button>
      </Box>

      <List className="properties-list">
        {SAMPLE.map((p) => (
          <ListItem key={p.id} className="property-row">
            <Box>
              <Text fontWeight={600}>{p.name}</Text>
              <Text fontSize="sm" color="gray.600">{p.city}</Text>
            </Box>
            <Box>
              <Button size="sm" variant="ghost">Editar</Button>
              <Button size="sm" colorScheme="red" variant="ghost">Remover</Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
