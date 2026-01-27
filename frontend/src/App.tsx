import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./app.css";

export default function App() {
  return <RouterProvider router={router} />;
}
