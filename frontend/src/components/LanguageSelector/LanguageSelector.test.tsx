import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageSelector from './LanguageSelector'
import AppChakraProvider from '@design/ChakraProvider'

const resources = {
  'pt-BR': {
    common: {
      language: {
        pt: 'Português',
        en: 'Inglês',
        es: 'Espanhol',
        fr: 'Francês',
      },
      login: { change_language: 'Mudar idioma' },
    },
  },
  en: {
    common: {
      language: {
        pt: 'Portuguese',
        en: 'English',
        es: 'Spanish',
        fr: 'French',
      },
      login: { change_language: 'Change language' },
    },
  },
}

describe('LanguageSelector', () => {
  let i18n: i18next.i18n

  beforeAll(async () => {
    i18n = i18next.createInstance()
    await i18n.use(initReactI18next).init({
      resources,
      lng: 'pt-BR',
      fallbackLng: 'pt-BR',
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    })

    ;(global as any).window = (global as any).window || {}
    ;(global as any).window.i18next = i18n
  })

  afterAll(() => {
    ;(global as any).window.i18next = undefined
  })

  it('shows translated labels and updates when language changes', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <AppChakraProvider>
          <LanguageSelector />
        </AppChakraProvider>
      </I18nextProvider>,
    )

    // initial label should be in pt-BR
    const toggle = await screen.findByRole('button', { name: /Português|Inglês|English/i })
    expect(toggle.textContent).toContain('Português')

    // open dropdown
    fireEvent.click(toggle)

    // click the option that represents English in the current UI language (pt-BR shows "Inglês")
    const enOption = await screen.findByText(/Inglês|English/)
    fireEvent.click(enOption)

    await waitFor(() => {
      expect(screen.getByRole('button').textContent).toContain('English')
    })
  })
})
