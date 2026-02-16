import React from 'react'
import './modal.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}) {
  if (!isOpen) return null

  return (
    <div className="shared-modal-backdrop" role="dialog" aria-modal="true">
      <div className={`shared-modal-panel shared-modal-${size}`}>
        {title && (
          <div className="shared-modal-header">
            <h3 className="shared-modal-title">{title}</h3>
            <button aria-label="Fechar" className="shared-modal-close" onClick={onClose}>✕</button>
          </div>
        )}
        <div className="shared-modal-body">{children}</div>
      </div>
    </div>
  )
}
