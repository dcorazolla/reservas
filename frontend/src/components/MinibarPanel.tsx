import React, { useState } from "react";
import { Product, createConsumption } from "../api/minibar";
import MinibarModal from "./MinibarModal";

type Props = {
  products: Product[];
  onProductsChange?: (p: Product[]) => void;
  initialReservationId?: string | null;
};

export default function MinibarPanel({ products, onProductsChange, initialReservationId }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);

  const open = (p: Product) => setSelected(p);
  const close = () => setSelected(null);

  const handleCreate = async (reservationId: string | null, quantity: number) => {
    if (!selected) return;
    try {
      await createConsumption({ reservation_id: reservationId || undefined, product_id: selected.id, quantity });
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ color: "#666", fontSize: 13 }}>{p.sku || ""}</div>
            <div style={{ marginTop: 8 }}>
              <strong>R$ {p.price ?? "--"}</strong>
            </div>
            <div style={{ marginTop: 8 }}>Estoque: {p.stock ?? "—"}</div>
            <div style={{ marginTop: 10 }}>
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
