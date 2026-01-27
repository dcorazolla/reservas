import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";

import CalendarPage from "../pages/CalendarPage";
import ReservationsPage from "../pages/ReservationsPage";
import RoomsPage from "../pages/config/RoomsPage";
import RoomCategoriesPage from "../pages/config/RoomCategoriesPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout innName="Pousada Casa do Cerrado" />,
    children: [
      {
        path: "/",
        element: <CalendarPage />,
      },
      {
        path: "/reservas",
        element: <ReservationsPage />,
      },
      {
        path: "/config/quartos",
        element: <RoomsPage />,
      },
      {
        path: "/config/categorias-quartos",
        element: <RoomCategoriesPage />,
      },
    ],
  },
]);
