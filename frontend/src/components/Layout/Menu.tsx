import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./menu.css";

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="app-menu horizontal">
      <NavLink to="/" end className="menu-link">
        Calendário
      </NavLink>

      <NavLink to="/reservas" className="menu-link">
        Reservas
      </NavLink>

      <div
        className="menu-item"
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
