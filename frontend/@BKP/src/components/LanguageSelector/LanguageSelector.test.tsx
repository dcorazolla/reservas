import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const changeLanguage = vi.fn()
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage } }) }))

import LanguageSelector from './LanguageSelector'

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  test('renders options and changes language', () => {
    render(<LanguageSelector />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    // change to pt-BR
    fireEvent.change(select, { target: { value: 'pt-BR' } })
    expect(changeLanguage).toHaveBeenCalledWith('pt-BR')
    expect(localStorage.getItem('locale')).toBe('pt-BR')
  })
})
