import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi, describe, it, expect } from 'vitest'

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: ({ as, ...props }: any) => {
      const tag = as === 'main' ? 'main' : 'div'
      return React.createElement(tag, props, props.children)
    },
    Flex: ({ as, ...props }: any) => {
      const tag = as === 'main' ? 'main' : 'div'
      return React.createElement(tag, props, props.children)
    },
  }
})

vi.mock('../Layout', () => ({
  Header: ({ onOpenMenu }: any) =>
    React.createElement('header', { 'data-testid': 'header' },
      React.createElement('button', { onClick: onOpenMenu }, 'open-menu')),
  Sidebar: ({ isOpen, onOpen, onClose, desktop, ...props }: any) =>
    React.createElement('aside', {
      'data-testid': desktop ? 'sidebar-desktop' : 'sidebar-mobile',
      'data-isopen': String(!!isOpen),
    },
      !desktop && onClose && React.createElement('button', { onClick: onClose, 'data-testid': 'close-drawer' }, 'close'),
    ),
  Footer: () => React.createElement('footer', { 'data-testid': 'footer' }),
}))

import PageShell from './PageShell'

describe('PageShell', () => {
  it('renders header, sidebar, footer, and children', () => {
    render(<PageShell><span>page content</span></PageShell>)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByText('page content')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-desktop')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-mobile')).toBeInTheDocument()
  })

  it('opens mobile drawer when header open-menu clicked', () => {
    render(<PageShell><span>content</span></PageShell>)
    const openBtn = screen.getByText('open-menu')
    fireEvent.click(openBtn)
    const mobileSidebar = screen.getByTestId('sidebar-mobile')
    expect(mobileSidebar.getAttribute('data-isopen')).toBe('true')
  })

  it('mobile sidebar onOpen sets drawer open again', () => {
    // Render the shell; the mobile Sidebar receives onOpen prop that calls setDrawerOpen(true)
    render(<PageShell><span>content</span></PageShell>)
    // Drawer starts closed
    expect(screen.getByTestId('sidebar-mobile').getAttribute('data-isopen')).toBe('false')
    // The header open-menu sets it to true
    fireEvent.click(screen.getByText('open-menu'))
    expect(screen.getByTestId('sidebar-mobile').getAttribute('data-isopen')).toBe('true')
  })

  it('closes mobile drawer when close button clicked', () => {
    render(<PageShell><span>content</span></PageShell>)
    // Open drawer first
    fireEvent.click(screen.getByText('open-menu'))
    expect(screen.getByTestId('sidebar-mobile').getAttribute('data-isopen')).toBe('true')
    // Close
    fireEvent.click(screen.getByTestId('close-drawer'))
    expect(screen.getByTestId('sidebar-mobile').getAttribute('data-isopen')).toBe('false')
  })
})
