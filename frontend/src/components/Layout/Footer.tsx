import React from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation('common')
  return (
    <Flex as="footer" role="contentinfo" width="100%" position="fixed" bottom={0} left={0} bg="gray.50" borderTop="1px solid" borderColor="gray.200" py={3} px={{ base: 4, md: 8 }} justify="center">
      <Box maxW="container.lg" width="100%">
        <Text textAlign="center" fontSize="sm" color="gray.600">
          {t('footer.copy', '© 2026 Reservas. Todos os direitos reservados.')}
        </Text>
      </Box>
    </Flex>
  )
}
