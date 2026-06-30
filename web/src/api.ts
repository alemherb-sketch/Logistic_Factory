// Central API helper: base URL + auth token handling for the admin panel.
export const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'https://logistic-factory-api.onrender.com';

const TOKEN_KEY = 'lf_token';
const USER_KEY = 'lf_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): any | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(token: string, user: any) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// fetch wrapper that attaches the bearer token and kicks back to /login on 401.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearAuth();
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }
  return res;
}
