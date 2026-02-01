import { useEffect, useState } from "react";
import { getPropertyPricing, updatePropertyPricing } from "../../../api/pricing";
import type { PropertyPricing } from "../../../types/rate";
import PropertyPricingModal from "../../../components/rates/PropertyPricingModal";
import { formatMoneyNullable } from "../../../utils/money";

export default function BaseTariffsPage() {
  const [pricing, setPricing] = useState<PropertyPricing>({
    base_one_adult: null,
    base_two_adults: null,
    additional_adult: null,
    child_price: null,
    infant_max_age: null,
    child_max_age: null,
    child_factor: null,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getPropertyPricing();
        setPricing(p);
      } catch {}
    })();
  }, []);

  async function save(values: PropertyPricing) {
    const data = await updatePropertyPricing(values);
    setPricing(data);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tarifas Base</h2>
      </div>

      <section className="card">
        <div className="section-header">
          <h4>Propriedade</h4>
          <button className="primary" onClick={() => setOpen(true)}>Editar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div>Base (1 adulto)</div>
            <strong>{formatMoneyNullable(pricing.base_one_adult)}</strong>
          </div>
          <div>
            <div>Base (2 adultos)</div>
            <strong>{formatMoneyNullable(pricing.base_two_adults)}</strong>
          </div>
          <div>
            <div>Adicional por adulto</div>
            <strong>{formatMoneyNullable(pricing.additional_adult)}</strong>
          </div>
          <div>
            <div>Preço por criança</div>
            <strong>{formatMoneyNullable(pricing.child_price)}</strong>
          </div>
          <div>
            <div>Idade máxima bebê</div>
            <strong>{pricing.infant_max_age ?? '-'}</strong>
          </div>
          <div>
            <div>Idade máxima criança</div>
            <strong>{pricing.child_max_age ?? '-'}</strong>
          </div>
          <div>
            <div>Fator criança</div>
            <strong>{pricing.child_factor ?? '-'}</strong>
          </div>
        </div>
      </section>

      <PropertyPricingModal open={open} initial={pricing} onClose={()=>setOpen(false)} onSave={save} />
    </div>
  );
}
