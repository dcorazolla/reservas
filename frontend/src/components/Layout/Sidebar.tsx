import React, { useState, KeyboardEvent, useEffect } from 'react'
import {
  Box,
  VStack,
  Link as ChakraLink,
  Text,
  useDisclosure,
  Button,
} from '@chakra-ui/react'
import { FiCalendar, FiSettings, FiChevronDown, FiChevronRight, FiList, FiChevronLeft, FiHome, FiBox, FiUsers, FiBriefcase, FiTag, FiDollarSign, FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type NavItem = {
  labelKey: string
  to?: string
  icon?: string | any
  children?: NavItem[]
}

const ICON_MAP: Record<string, any> = {
  calendar: FiCalendar,
  reservations: FiList,
  settings: FiSettings,
  properties: FiHome,
  rooms: FiBox,
  users: FiUsers,
  partners: FiBriefcase,
  rates: FiTag,
  base: FiDollarSign,
  roomRate: FiHome,
  period: FiClock,
}

const nav: NavItem[] = [
  { labelKey: 'menu.calendar', to: '/calendar', icon: 'calendar' },
  { labelKey: 'menu.reservations', to: '/reservations', icon: 'reservations' },
  {
    labelKey: 'menu.settings.label',
    icon: 'settings',
    children: [
      { labelKey: 'menu.settings.properties', to: '/settings/properties', icon: 'properties' },
      { labelKey: 'menu.settings.rooms', to: '/settings/rooms', icon: 'rooms' },
      { labelKey: 'menu.settings.users', to: '/settings/users', icon: 'users' },
      { labelKey: 'menu.settings.partners', to: '/settings/partners', icon: 'partners' },
      {
        labelKey: 'menu.settings.rates.label',
        icon: 'rates',
        children: [
          { labelKey: 'menu.settings.rates.base', to: '/settings/rates/base', icon: 'base' },
          { labelKey: 'menu.settings.rates.room', to: '/settings/rates/room', icon: 'roomRate' },
          { labelKey: 'menu.settings.rates.period', to: '/settings/rates/period', icon: 'period' },
        ],
      },
    ],
  },
]

export default function Sidebar({ desktop, isOpen, onOpen, onClose, expandAll = false }: { desktop?: boolean; isOpen?: boolean; onOpen?: () => void; onClose?: () => void; expandAll?: boolean }) {
  const { t } = useTranslation('common')
  const internal = useDisclosure()
  const isOpenActual = typeof isOpen === 'boolean' ? isOpen : internal.isOpen
  const onOpenActual = onOpen ?? internal.onOpen
  const onCloseActual = onClose ?? internal.onClose

  // compute initial open set (optional expandAll to render sublevels expanded)
  function collectKeys(items: NavItem[], parentKey?: string, acc: Record<string, boolean> = {}) {
    items.forEach((it, idx) => {
      const key = parentKey ? `${parentKey}-${idx}` : `${idx}`
      if (it.children && it.children.length > 0) {
        acc[key] = true
        collectKeys(it.children, key, acc)
      }
    })
    return acc
  }

  const [openSet, setOpenSet] = useState<Record<string, boolean>>(() => (expandAll ? collectKeys(nav) : {}))
  const [compact, setCompact] = useState<boolean>(!!desktop)
  const [hoverExpanded, setHoverExpanded] = useState(false)
  const [headerHeight, setHeaderHeight] = useState<number>(0)

  useEffect(() => {
    function updateHeader() {
      const el = document.querySelector('header') as HTMLElement | null
      const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0
      setHeaderHeight(h)
    }
    updateHeader()
    window.addEventListener('resize', updateHeader)
    return () => window.removeEventListener('resize', updateHeader)
  }, [])

  // expose closed sidebar width to the app so the main content can reserve space
  useEffect(() => {
    const CLOSED_WIDTH = '55px'
    if (desktop) {
      document.documentElement.style.setProperty('--app-sidebar-left', CLOSED_WIDTH)
    } else {
      document.documentElement.style.removeProperty('--app-sidebar-left')
    }
    return () => {
      document.documentElement.style.removeProperty('--app-sidebar-left')
    }
  }, [desktop])

  // Small helper component to safely render icons (handles module default interop)
  const IconRenderer = ({ icon, size }: { icon?: any; size?: number }) => {
    const resolved = typeof icon === 'string' ? ICON_MAP[icon] : icon
    const candidate = resolved?.default ?? resolved
    const sz = size ?? 18
    if (typeof candidate === 'function') {
      const Comp = candidate as React.ElementType
      return React.createElement(Comp, { 'aria-hidden': true, size: sz })
    }
    return React.createElement(FiList, { 'aria-hidden': true, size: sz })
  }

  function toggleKey(key: string) {
    setOpenSet((s) => ({ ...s, [key]: !s[key] }))
  }

  function onKeyToggle(e: KeyboardEvent, key: string, hasChildren: boolean) {
    if (!hasChildren) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleKey(key)
    }
  }

  function renderList(items: NavItem[], parentKey?: string) {
    return (
      <Box as="ul" role={parentKey ? 'menu' : undefined} pl={0} m={0}>
        {items.map((item, i) => {
          const key = parentKey ? `${parentKey}-${i}` : `${i}`
          const hasChildren = !!item.children && item.children.length > 0
          const submenuId = `submenu-${key}`
          return (
            <Box as="li" key={key} listStyleType="none">
              <Box
                display="flex"
                alignItems="center"
                  px={compact ? 3 : 4}
                  py={2}
                  minH="44px"
                tabIndex={0}
                role={item.to ? undefined : 'button'}
                aria-expanded={hasChildren ? !!openSet[key] : undefined}
                aria-controls={hasChildren ? submenuId : undefined}
                onKeyDown={(e) => onKeyToggle(e, key, hasChildren)}
                onClick={() => {
                  if (hasChildren) {
                    if (compact) {
                      setCompact(false)
                    } else {
                      toggleKey(key)
                    }
                  }
                }}
                cursor={hasChildren || item.to ? 'pointer' : 'default'}
                _hover={{ bg: 'gray.50' }}
                _focus={{ boxShadow: 'outline' }}
                borderBottom="1px"
                borderColor="gray.100"
                transition="background-color 120ms ease, box-shadow 120ms ease"
              >
                {item.icon && (
                  <Box mr={compact ? 3 : 4} display="flex" alignItems="center" justifyContent="center" minW="24px" color={compact ? 'gray.700' : 'gray.600'}>
                    <IconRenderer icon={item.icon} size={18} />
                  </Box>
                )}

                {compact ? (
                  item.to ? (
                    <ChakraLink as={Link} to={item.to} _hover={{ textDecoration: 'none' }} flex="1" display="block" aria-label={t(item.labelKey)} title={t(item.labelKey)} onClick={(e) => e.stopPropagation()}>
                      <Box />
                    </ChakraLink>
                  ) : (
                    <Box flex="1" aria-label={t(item.labelKey)} title={t(item.labelKey)} />
                  )
                ) : item.to ? (
                  <ChakraLink as={Link} to={item.to} _hover={{ textDecoration: 'none' }} flex="1">
                    <Text>{t(item.labelKey)}</Text>
                  </ChakraLink>
                ) : (
                  <Text flex="1">{t(item.labelKey)}</Text>
                )}

                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('menu.toggle')}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleKey(key)
                    }}
                  >
                    {openSet[key] ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
                  </Button>
                )}
              </Box>

              {hasChildren && openSet[key] && (
                <Box id={submenuId} pl={0}>
                  {renderList(item.children!, key)}
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    )
  }

  // Desktop
  if (desktop) {
    const topOffset = headerHeight || 0
    const sidebarWidth = compact ? '55px' : '220px'
    const isExpanded = !compact
    return (
      <>
        {isExpanded && (
          <Box
            position="fixed"
            left={sidebarWidth}
            top={`${topOffset}px`}
            right={0}
            bottom={0}
            bg="blackAlpha.200"
            zIndex={59}
            pointerEvents="none"
          />
        )}

        <Box
          as="nav"
          width={sidebarWidth}
          aria-label={t('menu.navigation')}
          transition="width 180ms ease, transform 160ms ease"
          overflow="hidden"
          position="fixed"
          left={0}
          top={`${topOffset}px`}
          height={headerHeight ? `calc(100vh - ${topOffset}px)` : '100vh'}
          zIndex={60}
          bg="gray.100"
          boxShadow={compact ? 'sm' : 'lg'}
          borderRight={compact ? '1px' : undefined}
          borderColor={compact ? 'gray.100' : undefined}
          onMouseEnter={() => {
            if (compact) {
              setCompact(false)
              setHoverExpanded(true)
            }
          }}
          onMouseLeave={() => {
            if (hoverExpanded) {
              setCompact(true)
              setHoverExpanded(false)
            }
          }}
        >
          <VStack align="stretch" spacing={0}>
            {renderList(nav)}
          </VStack>
        </Box>
      </>
    )
  }

  // Mobile
  return (
    <>
      <Button display={{ md: 'none' }} onClick={onOpenActual} aria-label={t('menu.open')} size="sm">
        {t('menu.open')}
      </Button>

      {isOpenActual && (
        <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={60}>
          <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onCloseActual} />

          <Box position="absolute" top={0} left={0} h="100%" w={{ base: '80%', sm: '60%', md: '320px' }} bg="white" boxShadow="lg" p={4} overflowY="auto">
            <VStack align="stretch" spacing={0} mt={2}>
              {renderList(nav)}
            </VStack>
          </Box>
        </Box>
      )}
    </>
  )
}

