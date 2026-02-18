import React from 'react'
import { Box, Heading, Text, Button, VStack, HStack, Card, CardBody } from '@chakra-ui/react'
import { FiCalendar, FiList, FiLogOut } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { logout } = useAuth()
  const { t } = useTranslation()

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={8}>
        <Box>
          <Heading as="h1" size="lg" mb={4}>
            {t('common.status.welcome') || 'Bem-vindo'}
          </Heading>
          <Text color="gray.600" fontSize="lg">
            {t('home.description') || 'Gerencie suas propriedades, reservas e disponibilidade'}
          </Text>
        </Box>

        <HStack spacing={6} justify="start">
          <Card boxShadow="md" maxW="300px" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
            <CardBody>
              <VStack spacing={4} align="start">
                <FiCalendar size={32} color="#3182CE" />
                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    {t('menu.calendar')}
                  </Heading>
                  <Text color="gray.600" fontSize="sm" mb={4}>
                    {t('home.calendar_description') || 'Visualize e gerencie suas reservas em um calendário interativo'}
                  </Text>
                </Box>
                <Button
                  as={RouterLink}
                  to="/calendar"
                  colorScheme="blue"
                  size="sm"
                  width="100%"
                >
                  {t('common.actions.view') || 'Visualizar'}
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card boxShadow="md" maxW="300px" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
            <CardBody>
              <VStack spacing={4} align="start">
                <FiList size={32} color="#38A169" />
                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    {t('menu.reservations')}
                  </Heading>
                  <Text color="gray.600" fontSize="sm" mb={4}>
                    {t('home.reservations_description') || 'Gerencie suas reservas com filtros e relatórios'}
                  </Text>
                </Box>
                <Button
                  as={RouterLink}
                  to="/reservations"
                  colorScheme="green"
                  size="sm"
                  width="100%"
                  isDisabled
                >
                  {t('common.status.coming_soon') || 'Em breve'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        <Box pt={6} borderTop="1px solid" borderColor="gray.200">
          <Button
            leftIcon={<FiLogOut />}
            onClick={logout}
            colorScheme="red"
            variant="outline"
          >
            {t('common.actions.logout') || 'Sair'}
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}

