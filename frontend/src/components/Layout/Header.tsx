import React, { useRef, useState, useEffect } from 'react'
import './header.css'
import { Flex, IconButton, HStack, Box, Text, VStack, Button } from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@components/LanguageSelector'
import { DateTimeClock}  from '@components/DateTimeClock'
import { useAuth } from '@contexts/AuthContext'
import { decodeJwtPayload } from '@utils/jwt'

type Props = {
  onOpenMenu: () => void
}

export default function Header({ onOpenMenu }: Props) {
  const { token, logout } = useAuth()
  const { t } = useTranslation('common')
  const payload: any = decodeJwtPayload(token)
  const property = payload?.property_name ?? null
  const userName: string | null = payload?.name ?? null
  const userEmail: string | null = payload?.email ?? null

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      py={3}
      px={{ base: 3, md: 6 }}
      bg="gray.50"
      borderBottom="1px solid"
      borderColor="gray.200"
    >
      <HStack spacing={4} align="center">
        <IconButton aria-label="Open menu" icon={<FiMenu />} onClick={onOpenMenu} display={{ base: 'inline-flex', md: 'none' }} variant="ghost" />

        <HStack spacing={3} align="center">
          <Box as={RouterLink} to="/" _hover={{ textDecoration: 'none', opacity: 0.8 }} transition="opacity 0.2s">
            <Text as="span" fontSize={{ base: 'md', md: 'lg' }} fontWeight={700} color="gray.800">
              {property ?? 'Reservas'}
            </Text>
            <Text as="span" ml={2} fontSize="sm" color="gray.600">
              {t('header.subtitle', 'gestão de reservas')}
            </Text>
          </Box>

          {/* property initials removed (avatar for user is on the right) */}
        </HStack>
      </HStack>

      <HStack spacing={3} align="center">
        <DateTimeClock />
        <LanguageSelector />

        {/* user avatar + menu */}
        <Box position="relative" ref={menuRef}>
          <Box
            as="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((s) => !s)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setMenuOpen((s) => !s)
              }
            }}
            onMouseEnter={() => setMenuOpen(true)}
            className="header-user-button"
          >
            <Box className="header-user-avatar" bg="gray.200" color="gray.700" fontWeight={600} fontSize="sm" aria-hidden>
              {userName ? String(userName).split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase() : 'U'}
            </Box>
          </Box>

          {menuOpen && (
            <Box position="absolute" right={0} mt={2} w="220px" bg="white" boxShadow="md" borderRadius="md" zIndex={60} p={3} role="menu" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
              <VStack align="stretch" spacing={2}>
                <Box>
                  <Text fontWeight={700}>{userName ?? t('header.user_fallback', 'Usuário')}</Text>
                  <Text fontSize="sm" color="gray.600">{userEmail ?? ''}</Text>
                </Box>
                <Box>
                  <Button size="sm" colorScheme="red" onClick={() => { logout(); }} aria-label={t('header.logout', 'Logout')}>
                    {t('header.logout', 'Sair')}
                  </Button>
                </Box>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Flex>
  )
}
