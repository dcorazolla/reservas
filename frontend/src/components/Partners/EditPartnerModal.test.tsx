import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
    Modal: (props: any) => {
      if (!props.isOpen) return null
      return React.createElement('div', { role: 'dialog' }, props.children)
    },
    ModalOverlay: (props: any) => React.createElement('div', props, props.children),
    ModalContent: (props: any) => React.createElement('div', props, props.children),
    ModalHeader: (props: any) => React.createElement('header', props, props.children),
    ModalBody: (props: any) => React.createElement('div', props, props.children),
    ModalFooter: (props: any) => React.createElement('footer', props, props.children),
    ModalCloseButton: () => null,
    Heading: (props: any) => React.createElement('h1', props, props.children),
    Text: (props: any) => React.createElement('p', props, props.children),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

import EditPartnerModal from './EditPartnerModal'

describe('EditPartnerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create modal when isOpen=true and partner=null', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(<EditPartnerModal isOpen={true} partner={null} onSave={onSave} onClose={onClose} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders edit modal with partner data', () => {
    const partner = {
      id: '1',
      name: 'Test Partner',
      email: 'test@example.com',
      phone: '123456',
    }
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(<EditPartnerModal isOpen={true} partner={partner} onSave={onSave} onClose={onClose} />)
    expect(screen.getByDisplayValue('Test Partner')).toBeInTheDocument()
  })

  it('hides modal when isOpen=false', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const { rerender } = render(<EditPartnerModal isOpen={true} partner={null} onSave={onSave} onClose={onClose} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    rerender(<EditPartnerModal isOpen={false} partner={null} onSave={onSave} onClose={onClose} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

