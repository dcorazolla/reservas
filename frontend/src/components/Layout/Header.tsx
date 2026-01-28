import "./header.css";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../auth/useCurrentUser";
import { logout } from "../../api/auth";

type Props = {
  innName: string;
};

function initialsFrom(name?: string | null, email?: string) {
  const source = (name && name.trim()) || email || "";
  if (!source) return "?";
  const parts = source
    .replace(/[^\p{L} ]+/gu, "")
    .trim()
    .split(/\s+/);
  const first = parts[0] || source;
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const initials = `${first[0] || ""}${last[0] || ""}`.toUpperCase();
  return initials || (email ? email[0].toUpperCase() : "?");
}

export default function Header({ innName }: Props) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(() => initialsFrom(user?.name, user?.email), [user]);

  async function onLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="inn-name">{innName}</h1>
        <span className="subtitle">Gestão de Reservas</span>
        <div className="spacer" />
        <div className="user-area">
          <button
            type="button"
            className="avatar"
            aria-label="Menu do usuário"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="user-menu" role="menu">
              <div className="user-info">
                <div className="user-name">{user?.name || user?.email}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <button className="menu-item" onClick={onLogout}>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
