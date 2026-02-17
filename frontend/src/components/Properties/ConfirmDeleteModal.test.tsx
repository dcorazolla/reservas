import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'common.confirm.delete_title': 'Confirmação de exclusão',
        'common.confirm.delete_confirm': 'Remover',
        'common.confirm.delete_message_prefix': 'Deseja remover',
        'common.confirm.delete_message_suffix': 'Esta ação não pode ser desfeita.',
        'common.actions.cancel': 'Cancelar',
      }
      return map[k] ?? k
    },
  }),
}))

import ConfirmDeleteModal from './ConfirmDeleteModal'

describe('ConfirmDeleteModal', () => {
  it('renders with name and confirm/cancel buttons', () => {
    render(<ConfirmDeleteModal isOpen={true} name="Test Item" onClose={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.getByText('Confirmação de exclusão')).toBeInTheDocument()
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('Remover')).toBeInTheDocument()
  })

  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn()
    render(<ConfirmDeleteModal isOpen={true} name="X" onClose={onClose} onConfirm={vi.fn()} />)
    await userEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm clicked', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDeleteModal isOpen={true} name="X" onClose={vi.fn()} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByText('Remover'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(<ConfirmDeleteModal isOpen={false} name="X" onClose={vi.fn()} onConfirm={vi.fn()} />)
    expect(container.querySelector('.shared-modal-backdrop')).not.toBeInTheDocument()
  })
})
