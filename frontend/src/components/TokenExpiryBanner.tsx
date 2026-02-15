import { useEffect, useState } from "react";
import { useTokenExpiryWarning } from "../auth/useTokenExpiryWarning";

export default function TokenExpiryBanner() {
  const { expiringSoon, msRemaining, renew } = useTokenExpiryWarning();
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    setDismissed(localStorage.getItem("tokenExpiryBannerDismissed") === "true");
  }, []);

  if (!expiringSoon || dismissed) return null;

  const minutes = Math.max(0, Math.floor(((msRemaining || 0) / 60000)));

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("tokenExpiryBannerDismissed", "true");
  };

  return (
    <div
      style={{
        background: "var(--color-warning-100)",
        color: "var(--color-warning-700)",
        padding: "6px 10px",
        borderBottom: "1px solid var(--color-warning-300)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span>
        Sessão expira em ~{minutes} min.
      </span>
      <button
        onClick={async () => {
          await renew();
          localStorage.removeItem("tokenExpiryBannerDismissed");
          setDismissed(false);
        }}
        style={{ padding: "4px 8px", cursor: "pointer" }}
      >
        Renovar sessão
      </button>
      <button
        onClick={dismiss}
        style={{ padding: "4px 8px", cursor: "pointer", background: "transparent", border: "none", color: "var(--color-warning-700)" }}
        aria-label="Ignorar aviso de sessão"
      >
        Fechar
      </button>
    </div>
  );
}
