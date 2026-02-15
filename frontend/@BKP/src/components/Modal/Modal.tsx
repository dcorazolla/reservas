import React from 'react'

type Props = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  titleId?: string;
  closeOnBackdrop?: boolean;
  className?: string;
};

export default function Modal({ open, title, children, onClose, closeOnBackdrop = true, titleId }: Props) {
  if (!open) return null

  function onOverlayClick(e: React.MouseEvent) {
    if (!closeOnBackdrop) return
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={`modal-overlay`} onClick={onOverlayClick} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className={`modal-content ${title ? 'has-title' : ''} ${'modal--custom'}`} style={{ background: 'white', borderRadius: 6, maxWidth: '900px', width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', maxHeight: '90vh', overflow: 'auto' }}>
        {title && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 id={titleId} style={{ margin: 0 }}>{title}</h2>
            <button aria-label="Fechar" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 18 }}>&times;</button>
          </div>
        )}

        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  )
}
