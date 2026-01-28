export function generateDateRange(start: string, days: number): string[] {
  const result: string[] = [];
  const date = new Date(start);

  for (let i = 0; i < days; i++) {
    const d = new Date(date);
    d.setDate(date.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }

  return result;
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso.length > 10 ? iso : `${iso}T00:00:00`);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const ii = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${ii}:${ss}`;
}
