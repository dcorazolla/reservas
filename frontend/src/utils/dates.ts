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
