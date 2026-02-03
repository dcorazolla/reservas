import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import RequireAuth from "../components/Auth/RequireAuth";
import LoginPage from "../pages/LoginPage";
import BaseTariffsPage from "../pages/config/tarifario/BaseTariffsPage";
import RoomTariffsPage from "../pages/config/tarifario/RoomTariffsPage";
import PeriodTariffsPage from "../pages/config/tarifario/PeriodTariffsPage";

import CalendarPage from "../pages/CalendarPage";
import ReservationsPage from "../pages/ReservationsPage";
import RoomsPage from "../pages/config/RoomsPage";
import RoomCategoriesPage from "../pages/config/RoomCategoriesPage";
import PropertiesPage from "../pages/config/PropertiesPage";
import PartnersPage from "../pages/config/PartnersPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout innName="Pousada Casa do Cerrado" />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <CalendarPage /> },
      { path: "/reservas", element: <ReservationsPage /> },
      { path: "/config/quartos", element: <RoomsPage /> },
      { path: "/config/categorias-quartos", element: <RoomCategoriesPage /> },
      { path: "/config/propriedade", element: <PropertiesPage /> },
      { path: "/config/parceiros", element: <PartnersPage /> },
      { path: "/config/tarifario/base", element: <BaseTariffsPage /> },
      { path: "/config/tarifario/quartos", element: <RoomTariffsPage /> },
      { path: "/config/tarifario/periodos", element: <PeriodTariffsPage /> },
    ],
  },
]);
