import React, { useEffect, useState } from "react";
import type { PropertyPricing } from "../../types/rate";
import Modal from "../Modal/Modal";
import { getErrorMessage } from "../../utils/errors";

type Props = {
  open: boolean;
  initial: PropertyPricing;
  onClose: () => void;
  onSave: (values: PropertyPricing) => Promise<void>;
};

export default function PropertyPricingModal({ open, initial, onClose, onSave }: Props) {
  const [values, setValues] = useState<PropertyPricing>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setValues(initial);
    }
  }, [initial, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        base_one_adult: values.base_one_adult ?? null,
        base_two_adults: values.base_two_adults ?? null,
        additional_adult: values.additional_adult ?? null,
        child_price: values.child_price ?? null,
        infant_max_age: values.infant_max_age ?? null,
        child_max_age: values.child_max_age ?? null,
        child_factor: values.child_factor ?? null,
      });
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Editar Tarifário Padrão" onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && <div className="form-error">{error}</div>}
        <div className="grid two">
          <label>
            <div>Base (1 adulto)</div>
            <input
              type="number"
              step="0.01"
              value={values.base_one_adult ?? ""}
              onChange={(e) => setValues({ ...values, base_one_adult: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Base (2 adultos)</div>
            <input
              type="number"
              step="0.01"
              value={values.base_two_adults ?? ""}
              onChange={(e) => setValues({ ...values, base_two_adults: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Adicional por adulto</div>
            <input
              type="number"
              step="0.01"
              value={values.additional_adult ?? ""}
              onChange={(e) => setValues({ ...values, additional_adult: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Preço por criança</div>
            <input
              type="number"
              step="0.01"
              value={values.child_price ?? ""}
              onChange={(e) => setValues({ ...values, child_price: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Idade máxima bebê</div>
            <input
              type="number"
              value={values.infant_max_age ?? ""}
              onChange={(e) => setValues({ ...values, infant_max_age: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Idade máxima criança</div>
            <input
              type="number"
              value={values.child_max_age ?? ""}
              onChange={(e) => setValues({ ...values, child_max_age: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Fator criança</div>
            <input
              type="number"
              step="0.01"
              value={values.child_factor ?? ""}
              onChange={(e) => setValues({ ...values, child_factor: e.target.value === "" ? null : Number(e.target.value) })}
            />
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
