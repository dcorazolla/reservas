import { useTokenExpiryWarning } from "../auth/useTokenExpiryWarning";

export default function TokenExpiryBanner() {
  const { expiringSoon, msRemaining, renew } = useTokenExpiryWarning();
  if (!expiringSoon) return null;

  const minutes = Math.max(0, Math.floor(((msRemaining || 0) / 60000)));

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#fff3cd",
        color: "#664d03",
        padding: "8px 12px",
        borderBottom: "1px solid #ffecb5",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span>
        Sessão expira em ~{minutes} min.
      </span>
      <button
        onClick={renew}
        style={{ marginLeft: 12, padding: "6px 10px", cursor: "pointer" }}
      >
        Renovar sessão
      </button>
    </div>
  );
}
