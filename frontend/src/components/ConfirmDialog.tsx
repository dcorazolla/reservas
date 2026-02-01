type Props = {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirmação",
  message,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-modal question">
        <div className="dialog-header">
          <span className="dialog-icon question">?</span>
          <h3>{title}</h3>
        </div>
        <p style={{ marginTop: 8 }}>{message}</p>

        <div className="actions">
          <button onClick={onCancel}>Cancelar</button>
          <button className="danger" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
