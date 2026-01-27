import "./header.css";

type Props = {
  innName: string;
};

export default function Header({ innName }: Props) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="inn-name">{innName}</h1>
        <span className="subtitle">Gestão de Reservas</span>
      </div>
    </header>
  );
}
