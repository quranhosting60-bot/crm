// Safe browser-only localStorage helpers
export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const d = window.localStorage.getItem(key);
    return d ? (JSON.parse(d) as T) : fallback;
  } catch { return fallback; }
}

export function lsSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function lsDel(key: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(key); } catch {}
}
