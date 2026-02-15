type DialogType = 'error' | 'success' | 'info' | 'question';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: DialogType;
};

function defaultTitle(type: DialogType): string {
  switch (type) {
    case 'success': return 'Sucesso';
    case 'info': return 'Informação';
    case 'question': return 'Confirmação';
    case 'error':
    default: return 'Erro';
  }
}

function Icon({ type }: { type: DialogType }) {
  const style: React.CSSProperties = { width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--text-on-dark)' };
    const map: Record<DialogType, { bg: string; char: string }> = {
      error: { bg: 'var(--color-danger)', char: '!' },
      success: { bg: 'var(--color-success)', char: '✓' },
      info: { bg: 'var(--color-primary-400)', char: 'i' },
      question: { bg: 'var(--color-warning)', char: '?' },
  };
  const { bg, char } = map[type];
  return <span className={`dialog-icon ${type}`} style={{ ...style, background: bg }}>{char}</span>;
}

export default function ErrorDialog({ open, title, message, onClose, type = 'error' }: Props) {
  if (!open) return null;
  const heading = title || defaultTitle(type);
  return (
    <div className="confirm-backdrop">
      <div className={`confirm-modal ${type}`}>
        <div className="dialog-header">
          <Icon type={type} />
          <h3>{heading}</h3>
        </div>
        <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{message}</p>
        <div className="actions">
          <button className={type === 'error' ? 'danger' : type === 'success' ? 'primary' : 'primary'} onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
