import { useState, useRef, useEffect } from 'react'
import { Box, Button, VStack, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LANGS: { code: string; key: string; defaultLabel: string; country: string }[] = [
  { code: 'pt-BR', key: 'pt', defaultLabel: 'Português', country: 'br' },
  { code: 'en', key: 'en', defaultLabel: 'English', country: 'us' },
  { code: 'es', key: 'es', defaultLabel: 'Español', country: 'es' },
  { code: 'fr', key: 'fr', defaultLabel: 'Français', country: 'fr' },
]

function FlagIcon({ country }: { country: string }) {
  // `flag-icons` exposes class names like `fi fi-br` for Brazil
  return <i className={`fi fi-${country}`} aria-hidden style={{ width: 20 }} />
}

export default function LanguageSelector({ size = 'sm', className }: Props) {
  const { i18n, t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  function change(lang: string) {
    i18n?.changeLanguage?.(lang)
    setOpen(false)
  }

  const current = i18n?.language ?? 'pt-BR'
  const currentEntry = LANGS.find((l) => l.code === current) ?? LANGS[0]
  const currentLabel = t(`language.${currentEntry.key}`, currentEntry.defaultLabel)

  return (
    <Box position="relative" display="inline-block" ref={ref} className={className}>
      <Button size={size} onClick={() => setOpen((s) => !s)} aria-haspopup="listbox" aria-expanded={open}>
          <HStack spacing={3} align="center">
          <FlagIcon country={currentEntry.country} />
          <Text as="span">{currentLabel}</Text>
        </HStack>
      </Button>

      {open && (
        <Box position="absolute" right={0} mt={2} bg="white" boxShadow="md" borderRadius="md" zIndex={50} minW="140px">
          <VStack as="ul" align="stretch" spacing={0} role="listbox" aria-label={t('login.change_language', 'Change language')}>
            {LANGS.map((l) => (
              <Box as="li" key={l.code} listStyleType="none">
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  width="100%"
                  onClick={() => change(l.code)}
                  aria-selected={current === l.code}
                >
                  <HStack spacing={3} align="center">
                    <FlagIcon country={l.country} />
                    <Text>{t(`language.${l.key}`, l.defaultLabel)}</Text>
                  </HStack>
                </Button>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
