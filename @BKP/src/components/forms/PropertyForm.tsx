import { useEffect, useMemo, useState } from "react";
import type { Property } from "@typings/property";
import { createProperty, updateProperty } from "@api/properties";
import { ErrorDialog } from "@components/Common";

type Props = {
  property: Property | null;
  onSaved: () => void;
  onClose: () => void;
};

export default function PropertyForm({ property, onSaved, onClose }: Props) {
  const [form, setForm] = useState<Partial<Property>>({
    name: "",
    timezone: "",
    infant_max_age: null,
    child_max_age: null,
    child_factor: null,
    base_one_adult: null,
    base_two_adults: null,
    additional_adult: null,
    child_price: null,
  });

  const [showPricing, setShowPricing] = useState(false);
  const [error, setError] = useState<string>("");

  const browserTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
    } catch {
      return "America/Sao_Paulo";
    }
  }, []);

  const timezoneOptions = useMemo(() => (
    [
      "America/Sao_Paulo",
      "America/Bogota",
      "America/Mexico_City",
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "America/Denver",
      "America/Toronto",
      "America/Argentina/Buenos_Aires",
      "Europe/Lisbon",
      "Europe/Madrid",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Rome",
      "Africa/Johannesburg",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Singapore",
      "Australia/Sydney",
    ]
  ), []);

  useEffect(() => {
    if (property) {
      setForm({ ...property, timezone: property.timezone || browserTz });
    } else {
      setForm((f) => ({ ...f, timezone: browserTz }));
    }
  }, [property]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, timezone: form.timezone || browserTz };
      if (property) {
        await updateProperty(property.id, payload);
      } else {
        await createProperty(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Falha ao salvar a propriedade.");
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <div style={{ marginBottom: 12 }}>
        <h4>Dados da Propriedade</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Nome</label>
            <input
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select
              value={form.timezone || browserTz}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <small className="help">Detectado: {browserTz}</small>
          </div>
        </div>
      </div>

      <div className="form-divider" />

      <label className="checkbox">
        <input
          type="checkbox"
          checked={showPricing}
          onChange={(e) => setShowPricing(e.target.checked)}
        />
        <span>Editar tarifário base</span>
      </label>

      {showPricing && (
        <div>
          <h4>Valores Base</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Base (1 adulto)</label>
              <input
                type="number"
                step="0.01"
                value={form.base_one_adult ?? ""}
                onChange={(e) => setForm({ ...form, base_one_adult: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Base (2 adultos)</label>
              <input
                type="number"
                step="0.01"
                value={form.base_two_adults ?? ""}
                onChange={(e) => setForm({ ...form, base_two_adults: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Adicional por adulto</label>
              <input
                type="number"
                step="0.01"
                value={form.additional_adult ?? ""}
                onChange={(e) => setForm({ ...form, additional_adult: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Preço por criança</label>
              <input
                type="number"
                step="0.01"
                value={form.child_price ?? ""}
                onChange={(e) => setForm({ ...form, child_price: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>
          </div>

          <h4 style={{ marginTop: 16 }}>Regras de Idade e Crianças</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Idade máxima bebê</label>
              <input
                type="number"
                value={form.infant_max_age ?? ""}
                onChange={(e) => setForm({ ...form, infant_max_age: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Idade máxima criança</label>
              <input
                type="number"
                value={form.child_max_age ?? ""}
                onChange={(e) => setForm({ ...form, child_max_age: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Fator criança</label>
              <input
                type="number"
                step="0.01"
                value={form.child_factor ?? ""}
                onChange={(e) => setForm({ ...form, child_factor: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="primary">Salvar</button>
      </div>

      <ErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </form>
  );
}
