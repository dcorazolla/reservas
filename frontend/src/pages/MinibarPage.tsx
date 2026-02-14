import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listProducts, Product } from "../api/minibar";
import MinibarPanel from "../components/MinibarPanel";

export default function MinibarPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search] = useSearchParams();
  const reservationId = search.get("reservation_id");

  useEffect(() => {
    setLoading(true);
    listProducts()
      .then((res) => setProducts(res || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <h2>Frigobar</h2>
      {loading ? (
        <p>Carregando produtos...</p>
      ) : (
        <MinibarPanel products={products} onProductsChange={setProducts} initialReservationId={reservationId} />
      )}
    </div>
  );
}
