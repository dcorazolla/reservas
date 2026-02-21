/**
 * Reservation Cancellation Modal Component
 * Handles preview and confirmation of reservation cancellations with refund calculation
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '@components/Shared/Modal/Modal'
import { cancellationService } from '@services/cancellations'
import type { RefundPreview, CancelResponse } from '@models/cancellation'
import type { CancellationModalState } from '@models/cancellation'
import './ReservationCancellationModal.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  reservation: {
    id: string
    guest_name: string
    check_in_date: string
    check_out_date: string
    total_price: number
    status: string
  }
}

export const ReservationCancellationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
}) => {
  const { t } = useTranslation()
  const [state, setState] = React.useState<CancellationModalState>('preview')
  const [reason, setReason] = useState('')
  const [preview, setPreview] = useState<RefundPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load preview on modal open
  useEffect(() => {
    if (isOpen && state === 'preview' && !preview && !error) {
      loadPreview()
    }
  }, [isOpen])

  const loadPreview = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const preview = await cancellationService.preview(reservation.id, reason || '')
      setPreview(preview)
      setState('preview')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cancellation preview'
      setError(message)
      setState('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value)
    setPreview(null) // Clear preview when reason changes
  }

  const handlePreview = async () => {
    if (!reason.trim()) {
      setError(t('cancellation.errors.reason_required'))
      return
    }
    await loadPreview()
  }

  const handleConfirmCancellation = async () => {
    if (!reason.trim()) {
      setError(t('cancellation.errors.reason_required'))
      return
    }

    setIsLoading(true)
    setError(null)
    setState('loading')

    try {
      const response: CancelResponse = await cancellationService.cancel(reservation.id, reason)

      if (response.success) {
        setState('success')
        // Call parent callback after successful cancellation
        onConfirm?.()
        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setError(response.message || t('cancellation.errors.cancellation_failed'))
        setState('error')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('cancellation.errors.cancellation_failed')
      setError(message)
      setState('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setPreview(null)
    setError(null)
    setState('preview')
    onClose()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('cancellation.modal_title')}
      aria-busy={isLoading}
    >
      <div className="cancellation-modal-container">
        {/* Guest and Reservation Info */}
        <div className="cancellation-info">
          <div className="info-item">
            <span className="info-label">{t('common.guest')}:</span>
            <span className="info-value">{reservation.guest_name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('common.check_in')}:</span>
            <span className="info-value">{formatDate(reservation.check_in_date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('common.check_out')}:</span>
            <span className="info-value">{formatDate(reservation.check_out_date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('common.total_price')}:</span>
            <span className="info-value">{formatCurrency(reservation.total_price)}</span>
          </div>
        </div>

        {/* Cancellation Reason Input */}
        <div className="form-group">
          <label htmlFor="cancellation-reason" className="form-label">
            {t('cancellation.reason')} *
          </label>
          <textarea
            id="cancellation-reason"
            className="form-textarea"
            placeholder={t('cancellation.reason_placeholder')}
            value={reason}
            onChange={handleReasonChange}
            disabled={isLoading || state === 'success'}
            rows={3}
            aria-label={t('cancellation.reason')}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Preview State - Show refund calculation */}
        {state === 'preview' && preview && (
          <div className="refund-preview">
            <h4 className="preview-title">{t('cancellation.refund_preview')}</h4>
            <div className="refund-breakdown">
              <div className="refund-row">
                <span className="refund-label">{t('cancellation.refund_percentage')}:</span>
                <span className="refund-value">{preview.refund_calculation.refund_percentage}%</span>
              </div>
              <div className="refund-row">
                <span className="refund-label">{t('cancellation.days_until_checkin')}:</span>
                <span className="refund-value">
                  {preview.refund_calculation.days_until_checkin} {t('common.days')}
                </span>
              </div>
              <div className="refund-row highlight">
                <span className="refund-label">{t('cancellation.refund_amount')}:</span>
                <span className="refund-value refund-amount">
                  {formatCurrency(preview.refund_calculation.refund_amount)}
                </span>
              </div>
            </div>
            <p className="preview-note">{t('cancellation.preview_note')}</p>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="success-message" role="status" aria-live="polite">
            <div className="success-icon">✓</div>
            <p>{t('cancellation.success_message')}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-spinner" role="status" aria-label={t('common.loading')}>
            <div className="spinner"></div>
            <p>{t('common.processing')}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-buttons">
          <button
            className="button button-secondary"
            onClick={handleClose}
            disabled={isLoading}
            type="button"
          >
            {t('common.close')}
          </button>

          {state === 'preview' && !preview && (
            <button
              className="button button-primary"
              onClick={handlePreview}
              disabled={!reason.trim() || isLoading}
              type="button"
            >
              {t('cancellation.preview_button')}
            </button>
          )}

          {state === 'preview' && preview && (
            <button
              className="button button-danger"
              onClick={handleConfirmCancellation}
              disabled={isLoading}
              type="button"
            >
              {t('cancellation.confirm_button')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ReservationCancellationModal
