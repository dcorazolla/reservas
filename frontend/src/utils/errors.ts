export function getErrorMessage(err: any): string {
  if (!err) return "Erro inesperado";
  if (typeof err === 'string') return err;
  if (err.message) return String(err.message);
  try {
    return JSON.stringify(err);
  } catch {
    return "Erro inesperado";
  }
}
