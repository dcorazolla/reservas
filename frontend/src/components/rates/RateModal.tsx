import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import { getErrorMessage } from "../../utils/errors";

type Props = {
  open: boolean;
  title?: string;
  initial: { people_count?: number; price_per_day?: number };
  onClose: () => void;
  onSave: (values: { people_count: number; price_per_day: number }) => Promise<void>;
};

export default function RateModal({ open, title = "Tarifa Base", initial, onClose, onSave }: Props) {
  const [values, setValues] = useState({
    people_count: initial.people_count ?? 2,
    price_per_day: initial.price_per_day ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setValues({
        people_count: initial.people_count ?? 2,
        price_per_day: initial.price_per_day ?? 0,
      });
    }
  }, [initial, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        people_count: Number(values.people_count),
        price_per_day: Number(values.price_per_day),
      });
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && <div className="form-error">{error}</div>}
        <div className="grid two">
          <label>
            <div>Pessoas</div>
            <input type="number" min={1} value={values.people_count} onChange={(e)=>setValues({ ...values, people_count: Number(e.target.value) })} />
          </label>
          <label>
            <div>Preço por dia</div>
            <input type="number" step="0.01" value={values.price_per_day} onChange={(e)=>setValues({ ...values, price_per_day: Number(e.target.value) })} />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className="primary" type="submit" disabled={saving}>Salvar</button>
        </div>
      </form>
    </Modal>
  );
}
