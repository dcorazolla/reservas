import { Outlet } from "react-router-dom";
import Header from "./Header";
import Menu from "./Menu";
import "./layout.css";

type Props = {
  innName: string;
};

export default function AppLayout({
  innName
}: Props) {
  return (
    <div className="app-layout">
      <Header innName={innName} />
      <Menu />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
