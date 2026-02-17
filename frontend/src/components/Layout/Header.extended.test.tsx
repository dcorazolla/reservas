import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ---- mocks ----

const mockLogout = vi.fn()
vi.mock('@contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'eyJhbGciOiJIUzI1NiJ9.' +
      btoa(JSON.stringify({ name: 'Diogo Costa', email: 'd@test.com', property_name: 'Hotel X', exp: 9999999999 })) +
      '.sig',
    logout: mockLogout,
  }),
}))

vi.mock('@utils/jwt', () => ({
  decodeJwtPayload: () => ({ name: 'Diogo Costa', email: 'd@test.com', property_name: 'Hotel X' }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => fallback ?? k,
  }),
}))

vi.mock('@components/LanguageSelector', () => ({
  LanguageSelector: () => React.createElement('div', { 'data-testid': 'lang' }),
}))
vi.mock('@components/DateTimeClock', () => ({
  DateTimeClock: () => React.createElement('div', { 'data-testid': 'clock' }),
}))

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Flex: (props: any) => React.createElement('div', props, props.children),
    HStack: (props: any) => React.createElement('div', props, props.children),
    Box: React.forwardRef(({ as, ...props }: any, ref: any) => {
      const tag = as === 'header' ? 'header' : as === 'button' ? 'button' : 'div'
      return React.createElement(tag, { ...props, ref }, props.children)
    }),
    VStack: (props: any) => React.createElement('div', props, props.children),
    Text: ({ as, ...props }: any) => React.createElement(as ?? 'span', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
    IconButton: (props: any) => React.createElement('button', { ...props, 'aria-label': props['aria-label'] }, props.children),
  }
})

vi.mock('react-icons/fi', () => {
  const React = require('react')
  return {
    FiMenu: (props: any) => React.createElement('span', props, '☰'),
  }
})

import Header from './Header'

describe('Header extended (menu interactions)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens menu on button click', () => {
    render(<Header onOpenMenu={vi.fn()} />)
    // find user button (it shows initials "DC")
    const avatar = screen.getByText('DC')
    const userBtn = avatar.closest('button')!
    fireEvent.click(userBtn)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Diogo Costa')).toBeInTheDocument()
    expect(screen.getByText('d@test.com')).toBeInTheDocument()
  })

  it('opens menu on mouse enter', () => {
    render(<Header onOpenMenu={vi.fn()} />)
    const avatar = screen.getByText('DC')
    const userBtn = avatar.closest('button')!
    fireEvent.mouseEnter(userBtn)
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('closes menu on mouse leave from dropdown', () => {
    render(<Header onOpenMenu={vi.fn()} />)
    const avatar = screen.getByText('DC')
    const userBtn = avatar.closest('button')!
    fireEvent.mouseEnter(userBtn)
    const menu = screen.getByRole('menu')
    fireEvent.mouseEnter(menu)
    fireEvent.mouseLeave(menu)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes menu on outside click', () => {
    render(<Header onOpenMenu={vi.fn()} />)
    const avatar = screen.getByText('DC')
    const userBtn = avatar.closest('button')!
    fireEvent.click(userBtn)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    // click outside
    act(() => {
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('toggles menu on Enter key', () => {
    render(<Header onOpenMenu={vi.fn()} />)
    const avatar = screen.getByText('DC')
    const userBtn = avatar.closest('button')!
    fireEvent.keyDown(userBtn, { key: 'Enter' })
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(userBtn, { key: 'Enter' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('toggles menu on Space key', () => {
    render(<Header onOpenMenu={vi.fn()} />)
    const avatar = screen.getByText('DC')
    const userBtn = avatar.closest('button')!
    fireEvent.keyDown(userBtn, { key: ' ' })
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('calls logout when logout button clicked', () => {
    render(<Header onOpenMenu={vi.fn()} />)
    const avatar = screen.getByText('DC')
    const userBtn = avatar.closest('button')!
    fireEvent.click(userBtn)
    const logoutBtn = screen.getByLabelText('Logout')
    fireEvent.click(logoutBtn)
    expect(mockLogout).toHaveBeenCalled()
  })

  it('calls onOpenMenu when menu icon clicked', () => {
    const onOpenMenu = vi.fn()
    render(<Header onOpenMenu={onOpenMenu} />)
    const menuBtn = screen.getByLabelText('Open menu')
    fireEvent.click(menuBtn)
    expect(onOpenMenu).toHaveBeenCalled()
  })
})
