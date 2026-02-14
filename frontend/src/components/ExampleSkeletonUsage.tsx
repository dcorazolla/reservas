import React, { useEffect, useState } from "react";
import Skeleton from "./Skeleton";

type Item = { id: number; title: string; desc: string };

export const ExampleSkeletonUsage: React.FC = () => {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setItems([
        { id: 1, title: "Quarto A", desc: "Bom para casal" },
        { id: 2, title: "Quarto B", desc: "Single" },
        { id: 3, title: "Quarto C", desc: "Suite" },
      ]);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  if (!items) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <Skeleton variant="card" />
            <div style={{ marginTop: 8 }}>
              <Skeleton variant="text" style={{ width: "60%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((it) => (
        <div key={it.id} style={{ padding: 12, marginBottom: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <h3>{it.title}</h3>
          <p>{it.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default ExampleSkeletonUsage;
