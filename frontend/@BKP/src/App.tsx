import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./app.css";
import { TokenExpiryBanner } from "@components/Common";

export default function App() {
  return (
    <>
      <TokenExpiryBanner />
      <RouterProvider router={router} />
    </>
  );
}
