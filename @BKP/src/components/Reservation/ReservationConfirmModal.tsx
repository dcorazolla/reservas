import { useState } from "react";
import Modal from "@components/Modal/Modal";
import type { AvailabilityItem } from "@api/availability";
import { formatMoney } from "@utils/money";

type Props = {
  open: boolean;
  item: AvailabilityItem | null;
  checkin: string;
  checkout: string;
  guestName: string;
  email?: string;
  phone?: string;
  onClose: () => void;
  onConfirm: (guestName: string, email?: string, phone?: string) => Promise<void>;
};

export default function ReservationConfirmModal({ open, item, checkin, checkout, guestName, email, phone, onClose, onConfirm }: Props) {
  const [name, setName] = useState(guestName || "");
  const [mail, setMail] = useState(email || "");
  const [tel, setTel] = useState(phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  if (!open || !item) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome do hóspede é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      await onConfirm(name.trim(), mail || undefined, tel || undefined);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Falha ao criar reserva.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Confirmar Reserva" onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && (
          <div className="form-error">{error}</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Quarto</label>
            <div>{item.room_name} {item.room_number ? `#${item.room_number}` : ''}</div>
          </div>
          <div className="form-group">
            <label>Capacidade</label>
            <div>{item.capacity}</div>
          </div>
          <div className="form-group">
            <label>Check-in</label>
            <div>{checkin}</div>
          </div>
          <div className="form-group">
            <label>Check-out</label>
            <div>{checkout}</div>
          </div>
          <div className="form-group">
            <label>Origem Tarifário</label>
            <div>{item.pricing_source}</div>
          </div>
          <div className="form-group">
            <label>Total</label>
            <div>{formatMoney(item.total)}</div>
          </div>
        </div>

        <div className="form-divider" />

        <div className="form-group">
          <label htmlFor="guest-name">Nome do hóspede</label>
          <input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label htmlFor="guest-email">Email (opcional)</label>
            <input id="guest-email" type="email" value={mail} onChange={(e) => setMail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="guest-phone">Telefone (opcional)</label>
            <input id="guest-phone" type="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>Cancelar</button>
          <button className="primary" type="submit" disabled={saving}>Confirmar</button>
        </div>
      </form>
      
    </Modal>
  );
}
