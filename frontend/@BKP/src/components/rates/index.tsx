import React from 'react';
import Modal from '../Modal/Modal';

type CommonModalProps<T> = {
  open: boolean;
  initial?: T;
  onClose: () => void;
  onSave: (values: T) => Promise<void> | void;
  title?: string;
};

export function RatePeriodModal({ open, initial = {}, onClose, onSave, title = 'Rate Period' }: CommonModalProps<any>) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p>Editor de período — formulário mínimo de fallback.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="primary" onClick={async () => { await onSave(initial); onClose(); }}>Salvar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

export function CategoryRatePeriodModal({ open, initial = {}, onClose, onSave, title = 'Category Rate Period' }: CommonModalProps<any>) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p>Editor de período por categoria — fallback simples.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="primary" onClick={async () => { await onSave(initial); onClose(); }}>Salvar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

export function PropertyPricingModal({ open, initial = {}, onClose, onSave, title = 'Property Pricing' }: CommonModalProps<any>) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p>Editar tarifas da propriedade (fallback).</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="primary" onClick={async () => { await onSave(initial); onClose(); }}>Salvar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}
export const RateModal = RatePeriodModal;
export const CategoryRateModal = CategoryRatePeriodModal;
export const PropertyPricing = PropertyPricingModal;

export default {
  RateModal,
  CategoryRateModal,
  PropertyPricing
};
