import React, { useState } from 'react'
import {
  Box,
  VStack,
  Link as ChakraLink,
  Icon,
  Text,
  useDisclosure,
  Button,
} from '@chakra-ui/react'
import { FiHome, FiSettings, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type NavItem = {
  labelKey: string
  to?: string
  icon?: any
  children?: NavItem[]
}

const nav: NavItem[] = [
  { labelKey: 'menu.home', to: '/', icon: FiHome },
  {
    labelKey: 'menu.settings',
    icon: FiSettings,
    children: [
      { labelKey: 'menu.settings.profile', to: '/settings/profile' },
      { labelKey: 'menu.settings.account', to: '/settings/account' },
    ],
  },
]

export default function Sidebar({ desktop, isOpen, onOpen, onClose }: { desktop?: boolean; isOpen?: boolean; onOpen?: () => void; onClose?: () => void }) {
  const { t } = useTranslation('common')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const internal = useDisclosure()
  const isOpenActual = typeof isOpen === 'boolean' ? isOpen : internal.isOpen
  const onOpenActual = onOpen ?? internal.onOpen
  const onCloseActual = onClose ?? internal.onClose

  function renderItem(item: NavItem, idx: number) {
    const hasChildren = !!item.children && item.children.length > 0
    return (
      <Box key={idx} width="100%">
        <ChakraLink as={item.to ? Link : 'div'} to={item.to} _hover={{ textDecoration: 'none' }}>
          <Box display="flex" alignItems="center" px={3} py={2} role="button" aria-expanded={hasChildren ? openIndex === idx : undefined}>
            {item.icon && <Icon as={item.icon} mr={3} />}
            <Text flex="1">{t(item.labelKey)}</Text>
            {hasChildren && (
              <Box as="span" ml={2}>
                {openIndex === idx ? <FiChevronDown /> : <FiChevronRight />}
              </Box>
            )}
          </Box>
        </ChakraLink>

        {hasChildren && openIndex === idx && (
          <VStack align="stretch" pl={8} spacing={1}>
            {item.children!.map((c, i) => (
              <ChakraLink as={Link} to={c.to} key={i} px={3} py={2} _hover={{ textDecoration: 'none' }}>
                {t(c.labelKey)}
              </ChakraLink>
            ))}
          </VStack>
        )}
      </Box>
    )
  }

  // Desktop sidebar
  if (desktop) {
    return (
      <Box as="nav" width={{ base: 'full', md: '220px' }} aria-label={t('menu.navigation')}> 
        <VStack align="stretch" spacing={0}>
          {nav.map((n, i) => (
            <Box key={i}>
              <Box onClick={() => (n.children ? setOpenIndex(openIndex === i ? null : i) : undefined)}>
                {renderItem(n, i)}
              </Box>
            </Box>
          ))}
        </VStack>
      </Box>
    )
  }

  // Mobile: provide a simple overlay drawer replacement using positioned Boxes
  return (
    <>
      <Button display={{ md: 'none' }} onClick={onOpenActual} aria-label={t('menu.open')} size="sm">
        {t('menu.open')}
      </Button>

      {isOpenActual && (
        <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={60}>
          {/* semi-opaque overlay */}
          <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onCloseActual} />

          {/* side panel */}
          <Box position="absolute" top={0} left={0} h="100%" w={{ base: '80%', sm: '60%', md: '320px' }} bg="white" boxShadow="lg" p={4} overflowY="auto">
            <VStack align="stretch" spacing={0} mt={2}>
              {nav.map((n, i) => (
                <Box key={i}>
                  <Box onClick={() => (n.children ? setOpenIndex(openIndex === i ? null : i) : onCloseActual())}>{renderItem(n, i)}</Box>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      )}
    </>
  )
}
