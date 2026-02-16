import React, { useState, useEffect } from "react";
import type { Product } from "@api/minibar";
import { listReservations } from "@api/reservations";
import './minibar.css';

type Props = {
  product: Product;
  onClose: () => void;
  onCreate: (reservationId: string | null, quantity: number) => Promise<void>;
  initialReservationId?: string | null;
};

export default function MinibarModal({ product, onClose, onCreate, initialReservationId }: Props) {
  const [reservationId, setReservationId] = useState<string | null>(() => initialReservationId ?? null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[] | null>(null);
  const [resLoading, setResLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    setResLoading(true);
    // fetch reservations and keep only those checked-in (currently in-house)
    listReservations()
      .then((data: any) => {
        if (!mounted) return;
        const items = (data || []).filter((r: any) => r.status === 'checked_in');
        setReservations(items);
        // if initialReservationId provided, ensure it exists in the list
        if (initialReservationId && items.find((i:any) => i.id === initialReservationId)) {
          setReservationId(initialReservationId);
        }
      })
      .catch((e) => {
        console.warn('Falha ao carregar reservas para frigobar', e);
        if (mounted) setReservations([]);
      })
      .finally(() => mounted && setResLoading(false));

    return () => { mounted = false; };
  }, [initialReservationId]);

  // If an initial reservation id is provided (via query param), prefill it
  // We set it on mount so the parent can pass reservation context when opening /minibar?reservation_id=...
  React.useEffect(() => {
    // @ts-ignore - function receives prop but typed earlier
    if ((arguments as any)[0] && (arguments as any)[0].initialReservationId) {
      // This branch is not used; keep for type-compat only
    }
  }, []);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await onCreate(reservationId, quantity);
    } catch (e: any) {
      setError(e?.message || "Erro ao criar consumo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="minibar-overlay">
      <div className="minibar-dialog">
        <h3>Registrar consumo</h3>
        <div className="minibar-field">
          <strong>{product.name}</strong>
        </div>
        <div className="minibar-field">
          <label>Reserva (somente hospedados)</label>
          {resLoading ? (
            <div>Carregando reservas…</div>
          ) : (
            <select value={reservationId ?? ""} onChange={(e) => setReservationId(e.target.value || null)} className="minibar-select">
              <option value="">(avulso / sem reserva)</option>
              {(reservations || []).map((r: any) => (
                <option key={r.id} value={r.id}>{`(${r.room?.number || r.room_name || r.room_id}) ${r.guest_name}`}</option>
              ))}
            </select>
          )}
        </div>
        <div className="minibar-field">
          <label>Quantidade</label>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value || 1))} className="minibar-input" />
        </div>
        {error && <div className="minibar-error">{error}</div>}
        <div className="minibar-actions-row">
          <button onClick={onClose} disabled={loading}>Fechar</button>
          <button onClick={submit} disabled={loading}>{loading ? "Enviando..." : "Confirmar"}</button>
        </div>
      </div>
    </div>
  );
}
