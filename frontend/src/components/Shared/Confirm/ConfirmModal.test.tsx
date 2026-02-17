import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'confirm.confirm': 'Confirmar',
        'confirm.title': 'Confirmação',
        'common.actions.cancel': 'Cancelar',
      }
      return map[k] ?? k
    },
  }),
}))

import ConfirmModal from './ConfirmModal'

describe('ConfirmModal', () => {
  it('renders with custom title and confirm label', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Custom Title"
        message="Are you sure?"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        confirmLabel="Yes, delete"
      />
    )
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('uses fallback title and confirm label when not provided', () => {
    render(
      <ConfirmModal
        isOpen={true}
        message="msg"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByText('Confirmação')).toBeInTheDocument()
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
  })

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal isOpen={true} message="msg" onCancel={onCancel} onConfirm={vi.fn()} />
    )
    await userEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal isOpen={true} message="msg" onCancel={vi.fn()} onConfirm={onConfirm} />
    )
    await userEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmModal isOpen={false} message="msg" onCancel={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(container.querySelector('.shared-modal-backdrop')).not.toBeInTheDocument()
  })
})
