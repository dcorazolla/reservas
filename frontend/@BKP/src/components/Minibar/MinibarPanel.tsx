import React, { useState } from "react";
import { type Product, createConsumption } from "@api/minibar";
import MinibarModal from "./MinibarModal";
import './minibar.css';

type Props = {
  products: Product[];
  onProductsChange?: (p: Product[]) => void;
  initialReservationId?: string | null;
  onConsumptionCreated?: (consumption: any) => void;
};

export default function MinibarPanel({ products, onProductsChange, initialReservationId, onConsumptionCreated }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);

  const open = (p: Product) => setSelected(p);
  const close = () => setSelected(null);

  const handleCreate = async (reservationId: string | null, quantity: number) => {
    if (!selected) return;
    try {
      await createConsumption({ reservation_id: reservationId || undefined, product_id: selected.id, quantity });
      // notify parent that a consumption was created (minimal payload)
      onConsumptionCreated?.({ product_id: selected.id, quantity, reservation_id: reservationId || null });
      // after success, decrement local stock if present
      if (selected.stock !== undefined && selected.stock !== null) {
        const updated = products.map((prod) =>
          prod.id === selected.id ? { ...prod, stock: (prod.stock || 0) - quantity } : prod
        );
        onProductsChange?.(updated);
      }
      close();
    } catch (err) {
      // naive error handling — surface message in modal in future
      console.error("Falha ao criar consumo", err);
      throw err;
    }
  };

  return (
    <div>
      <div className="minibar-grid">
        {products.map((p) => (
          <div key={p.id} className="minibar-card">
            <div className="minibar-name">{p.name}</div>
            <div className="minibar-sku">{p.sku || ""}</div>
            <div className="minibar-price">
              <strong>R$ {p.price ?? "--"}</strong>
            </div>
            <div className="minibar-stock">Estoque: {p.stock ?? "—"}</div>
            <div className="minibar-actions">
              <button onClick={() => open(p)}>Registrar consumo</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <MinibarModal
          product={selected}
          onClose={close}
          onCreate={handleCreate}
          initialReservationId={initialReservationId ?? null}
        />
      )}
    </div>
  );
}
