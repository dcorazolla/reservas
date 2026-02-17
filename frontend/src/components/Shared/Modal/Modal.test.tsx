import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('returns null when not open', () => {
    const { container } = render(<Modal isOpen={false} onClose={() => {}}>content</Modal>)
    expect(container.innerHTML).toBe('')
  })

  it('renders when open with children', () => {
    render(<Modal isOpen={true} onClose={() => {}}>Hello Modal</Modal>)
    expect(screen.getByText('Hello Modal')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders title and close button when title provided', () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} title="My Title">body</Modal>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
    const closeBtn = screen.getByLabelText('Fechar')
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render title area when title is not provided', () => {
    render(<Modal isOpen={true} onClose={() => {}}>body</Modal>)
    expect(screen.queryByLabelText('Fechar')).not.toBeInTheDocument()
  })

  it('applies size class', () => {
    const { container } = render(<Modal isOpen={true} onClose={() => {}} size="lg">big</Modal>)
    const panel = container.querySelector('.shared-modal-lg')
    expect(panel).toBeInTheDocument()
  })

  it('defaults to md size', () => {
    const { container } = render(<Modal isOpen={true} onClose={() => {}}>default</Modal>)
    const panel = container.querySelector('.shared-modal-md')
    expect(panel).toBeInTheDocument()
  })

  it('applies full size', () => {
    const { container } = render(<Modal isOpen={true} onClose={() => {}} size="full">full</Modal>)
    const panel = container.querySelector('.shared-modal-full')
    expect(panel).toBeInTheDocument()
  })

  it('applies sm size', () => {
    const { container } = render(<Modal isOpen={true} onClose={() => {}} size="sm">small</Modal>)
    const panel = container.querySelector('.shared-modal-sm')
    expect(panel).toBeInTheDocument()
  })
})
