import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import { getErrorMessage } from "../../utils/errors";

type Props = {
  open: boolean;
  title?: string;
  initial: { start_date?: string; end_date?: string; people_count?: number; price_per_day?: number };
  onClose: () => void;
  onSave: (values: { start_date: string; end_date: string; people_count: number; price_per_day: number }) => Promise<void>;
};

export default function RatePeriodModal({ open, title = "Tarifa por Período", initial, onClose, onSave }: Props) {
  const [values, setValues] = useState({
    start_date: initial.start_date ?? "",
    end_date: initial.end_date ?? "",
    people_count: initial.people_count ?? 2,
    price_per_day: initial.price_per_day ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setValues({
        start_date: initial.start_date ?? "",
        end_date: initial.end_date ?? "",
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
        start_date: values.start_date,
        end_date: values.end_date,
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
            <div>Início</div>
            <input type="date" value={values.start_date} onChange={(e)=>setValues({ ...values, start_date: e.target.value })} />
          </label>
          <label>
            <div>Fim</div>
            <input type="date" value={values.end_date} onChange={(e)=>setValues({ ...values, end_date: e.target.value })} />
          </label>
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
