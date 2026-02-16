export function toNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

export function formatMoney(value: any): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
  return formatter.format(toNumber(value));
}

export function formatMoneyNullable(value: any): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
  return value == null ? '-' : formatter.format(toNumber(value));
}
