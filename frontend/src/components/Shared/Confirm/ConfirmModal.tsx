import React from 'react'
import Modal from '@components/Shared/Modal/Modal'
import './confirm-modal.css'
import { useTranslation } from 'react-i18next'

export default function ConfirmModal({ isOpen, title, message, onCancel, onConfirm, confirmLabel }: {
  isOpen: boolean
  title?: React.ReactNode
  message?: React.ReactNode
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
}) {
  const { t } = useTranslation()
  const confirmText = confirmLabel ?? t('confirm.confirm')

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title ?? t('confirm.title')} size="sm">
      <div className="confirm-message">{message}</div>
      <div className="confirm-actions">
        <button className="btn btn-ghost" onClick={onCancel}>{t('common.form.cancel')}</button>
        <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  )
}
