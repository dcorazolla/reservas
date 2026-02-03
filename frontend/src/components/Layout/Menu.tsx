import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./menu.css";

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);

  return (
    <nav className="app-menu horizontal">
      <NavLink to="/" end className="menu-link">
        Calendário
      </NavLink>

      <NavLink to="/reservas" className="menu-link">
        Reservas
      </NavLink>

      <div
        className="menu-entry"
        onMouseEnter={() => setFinanceOpen(true)}
        onMouseLeave={() => setFinanceOpen(false)}
      >
        <span className={`menu-link with-chevron ${financeOpen ? 'open' : ''}`}>
          Financeiro
          <span className="chevron">▾</span>
        </span>

        {financeOpen && (
          <div className="submenu">
            <NavLink to="/invoices">Faturas</NavLink>
          </div>
        )}
      </div>

      <div
        className="menu-entry"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span className={`menu-link with-chevron ${open ? "open" : ""}`}>
          Configurações
          <span className="chevron">▾</span>
        </span>

        {open && (
          <div className="submenu">
            <NavLink to="/config/propriedade">Propriedade</NavLink>
            <NavLink to="/config/parceiros">Parceiros</NavLink>
            <NavLink to="/config/quartos">Quartos</NavLink>
            <NavLink to="/config/categorias-quartos">Categorias de Quartos</NavLink>
            <div className="submenu-group">
              <span className="submenu-title">Tarifário</span>
              <NavLink to="/config/tarifario/base">Tarifas base</NavLink>
              <NavLink to="/config/tarifario/quartos">Tarifas de Quartos</NavLink>
              <NavLink to="/config/tarifario/periodos">Tarifas de Período</NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
