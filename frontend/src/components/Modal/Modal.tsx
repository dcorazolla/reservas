import React from 'react';
import './modal.css';
import { useId } from 'react';

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  titleId?: string;
  closeOnBackdrop?: boolean;
  className?: string;
};

export default function Modal({ open, title, children, onClose, titleId, closeOnBackdrop = true, className }: Props) {
  if (!open) return null;

  const autoId = useId();
  const titleElId = titleId ?? `modal-title-${autoId}`;

  return (
    <div className="modal-backdrop" onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        className={`modal ${className ?? ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleElId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id={titleElId}>{title}</h3>
          <button className="modal-close" aria-label="Fechar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
