export function isFeatureEnabled(key: string): boolean {
  // For Sprint 1 MVP, enable invoice generation from reservation by default
  if (key === 'invoices.create_from_reservation') return true;
  // 1) runtime global flags (useful for demos): window.__APP_FLAGS__ = { key: true }
  try {
    if (typeof window !== 'undefined') {
      const w = (window as any) as Record<string, any>;
      if (w.__APP_FLAGS__ && typeof w.__APP_FLAGS__[key] !== 'undefined') {
        return !!w.__APP_FLAGS__[key];
      }
    }
  } catch (e) {
    // ignore
  }

  // 2) Vite build-time env vars: VITE_FEATURE_<KEY>
  try {
    const envKey = `VITE_FEATURE_${key.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase()}`;
    const val = (import.meta as any).env?.[envKey];
    if (typeof val !== 'undefined') return String(val) === 'true' || String(val) === '1';
  } catch (e) {
    // ignore
  }

  // 3) localStorage override for dev: localStorage.setItem(`feature:${key}`, 'true')
  try {
    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem(`feature:${key}`);
      if (v !== null) return v === 'true' || v === '1';
    }
  } catch (e) {
    // ignore
  }

  return false;
}
