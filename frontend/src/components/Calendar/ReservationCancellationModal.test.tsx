/**
 * ReservationCancellationModal Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReservationCancellationModal } from './ReservationCancellationModal'
import * as cancellationService from '@services/cancellations'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock Modal to render its children directly
vi.mock('@components/Shared/Modal/Modal', () => ({
  default: ({ isOpen, onClose, title, children, ...props }: any) => 
    isOpen ? (
      <div data-testid="modal" {...props}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    ) : null,
}))

// Mock cancellation service
vi.mock('@services/cancellations', () => ({
  cancellationService: {
    preview: vi.fn(),
    cancel: vi.fn(),
    getPolicy: vi.fn(),
  },
}))

const mockReservation = {
  id: 'res-123',
  guest_name: 'John Doe',
  check_in_date: '2026-03-01',
  check_out_date: '2026-03-05',
  total_price: 1000,
  status: 'confirmed',
}

const mockPreview = {
  reservation_id: 'res-123',
  reservation_status: 'confirmed',
  guest_name: 'John Doe',
  check_in_date: '2026-03-01',
  check_out_date: '2026-03-05',
  total_days: 4,
  total_price: 1000,
  cancellation_reason: 'Test reason',
  refund_calculation: {
    refund_percentage: 100,
    refund_amount: 1000,
    total_price: 1000,
    days_until_checkin: 10,
    matched_rule_id: 'rule-1',
    matched_rule_priority: 1,
  },
}

describe('ReservationCancellationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal when isOpen is true', () => {
    render(
      <ReservationCancellationModal
        isOpen={true}
        onClose={vi.fn()}
        reservation={mockReservation}
      />,
    )

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('cancellation.modal_title')).toBeInTheDocument()
  })

  it('does not render modal when isOpen is false', () => {
    render(
      <ReservationCancellationModal
        isOpen={false}
        onClose={vi.fn()}
        reservation={mockReservation}
      />,
    )

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('displays reservation info', () => {
    render(
      <ReservationCancellationModal
        isOpen={true}
        onClose={vi.fn()}
        reservation={mockReservation}
      />,
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows error when trying to preview without reason', async () => {
    const user = userEvent.setup()
    render(
      <ReservationCancellationModal
        isOpen={true}
        onClose={vi.fn()}
        reservation={mockReservation}
      />,
    )

    const previewButton = screen.getByText('cancellation.preview_button')
    await user.click(previewButton)

    await waitFor(() => {
      expect(screen.getByText('cancellation.errors.reason_required')).toBeInTheDocument()
    })
  })

  it('calls preview service when reason is provided and button clicked', async () => {
    const mockPreviewFn = vi.fn().mockResolvedValue(mockPreview)
    vi.mocked(cancellationService.cancellationService.preview).mockImplementation(mockPreviewFn)

    const user = userEvent.setup()
    render(
      <ReservationCancellationModal
        isOpen={true}
        onClose={vi.fn()}
        reservation={mockReservation}
      />,
    )

    const reasonTextarea = screen.getByLabelText('cancellation.reason')
    await user.type(reasonTextarea, 'Test reason')

    // Wait for state update and button to be available
    await waitFor(() => {
      expect(screen.getByText('cancellation.preview_button')).toBeInTheDocument()
    })

    const previewButton = screen.getByText('cancellation.preview_button')
    await user.click(previewButton)

    await waitFor(() => {
      expect(mockPreviewFn).toHaveBeenCalledWith('res-123', 'Test reason')
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(
      <ReservationCancellationModal
        isOpen={true}
        onClose={onClose}
        reservation={mockReservation}
      />,
    )

    const closeButton = screen.getByText('common.close')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })
})
