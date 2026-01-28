import React, { useState } from "react";
import Modal from "../Modal/Modal";
import { getErrorMessage } from "../../utils/errors";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (values: { start_date: string; end_date: string; base_one_adult?: number | null; base_two_adults?: number | null; additional_adult?: number | null; child_price?: number | null; description?: string | null }) => Promise<void>;
};

export default function CategoryRatePeriodModal({ open, onClose, onSave }: Props) {
  const [values, setValues] = useState<{ start_date: string; end_date: string; base_one_adult?: number | null; base_two_adults?: number | null; additional_adult?: number | null; child_price?: number | null; description?: string | null }>({ start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(values);
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Período da Categoria" onClose={onClose}>
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
            <div>Base (1 adulto)</div>
            <input type="number" step="0.01" value={values.base_one_adult ?? ''} onChange={(e)=>setValues({ ...values, base_one_adult: e.target.value === '' ? null : Number(e.target.value) })} />
          </label>
          <label>
            <div>Base (2 adultos)</div>
            <input type="number" step="0.01" value={values.base_two_adults ?? ''} onChange={(e)=>setValues({ ...values, base_two_adults: e.target.value === '' ? null : Number(e.target.value) })} />
          </label>
          <label>
            <div>Adicional adulto</div>
            <input type="number" step="0.01" value={values.additional_adult ?? ''} onChange={(e)=>setValues({ ...values, additional_adult: e.target.value === '' ? null : Number(e.target.value) })} />
          </label>
          <label>
            <div>Preço criança</div>
            <input type="number" step="0.01" value={values.child_price ?? ''} onChange={(e)=>setValues({ ...values, child_price: e.target.value === '' ? null : Number(e.target.value) })} />
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
