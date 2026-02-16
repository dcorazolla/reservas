import React from 'react'
import ConfirmModal from '@components/Shared/Confirm/ConfirmModal'
import { useTranslation } from 'react-i18next'

export default function ConfirmDeleteModal({ isOpen, name, onClose, onConfirm }: { isOpen: boolean; name?: string | null; onClose: () => void; onConfirm: () => void }) {
  const { t } = useTranslation()
  const message = (
    <span>
      {t('properties.confirm.delete_message_prefix')} <strong>{name}</strong>? {t('properties.confirm.delete_message_suffix')}
    </span>
  )
  return (
    <ConfirmModal isOpen={!!isOpen} onCancel={onClose} onConfirm={onConfirm} title={t('properties.confirm.delete_title')} message={message} confirmLabel={t('properties.confirm.delete_confirm')} />
  )
}
