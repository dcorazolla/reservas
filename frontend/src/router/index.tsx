import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/Layout";
import { RequireAuth } from "../components/Auth";
import LoginPage from "../pages/Login/LoginPage";
import BaseTariffsPage from "../pages/config/tarifario/BaseTariffsPage";
import RoomTariffsPage from "../pages/config/tarifario/RoomTariffsPage";
import PeriodTariffsPage from "../pages/config/tarifario/PeriodTariffsPage";
import MinibarPage from "../pages/Minibar/MinibarPage";

import CalendarPage from "../pages/Calendar/CalendarPage";
import SearchPage from "../pages/SearchPage";
import ReservationsListPage from "../pages/ReservationsPage";
import CreateInvoiceFromReservations from "../pages/Invoice/CreateInvoiceFromReservations";
import InvoicesPage from "../pages/Invoice/InvoicesPage";
import InvoiceDetailPage from "../pages/Invoice/InvoiceDetailPage";
import RoomsPage from "../pages/config/RoomsPage";
import RoomCategoriesPage from "../pages/config/RoomCategoriesPage";
import PropertiesPage from "../pages/config/PropertiesPage";
import PartnersPage from "../pages/config/PartnersPage";
import RoomBlocksSettingsPage from "../pages/config/RoomBlocksSettingsPage";

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
      { path: "/search", element: <SearchPage /> },
      { path: "/reservas/list", element: <ReservationsListPage /> },
      { path: "/invoices/from-reservations", element: <CreateInvoiceFromReservations /> },
      { path: "/invoices", element: <InvoicesPage /> },
      { path: "/invoices/:id", element: <InvoiceDetailPage /> },
      { path: "/config/quartos", element: <RoomsPage /> },
      { path: "/config/categorias-quartos", element: <RoomCategoriesPage /> },
      { path: "/config/propriedade", element: <PropertiesPage /> },
      { path: "/config/parceiros", element: <PartnersPage /> },
      { path: "/config/bloqueios", element: <RoomBlocksSettingsPage /> },
      { path: "/config/tarifario/base", element: <BaseTariffsPage /> },
      { path: "/config/tarifario/quartos", element: <RoomTariffsPage /> },
      { path: "/config/tarifario/periodos", element: <PeriodTariffsPage /> },
      { path: "/minibar", element: <MinibarPage /> },
    ],
  },
]);
