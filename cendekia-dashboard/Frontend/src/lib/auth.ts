import type { SessionResponse, UserResponse } from "./types";

let session: SessionResponse | null = null;
let csrfRequest: Promise<string> | null = null;

function removeLegacySession() {
  if (typeof window === "undefined") return;
  for (const key of ["cendekia_access_token", "cendekia_user", "cendekia_expires_at"]) window.localStorage.removeItem(key);
}

export function saveAuthSession(response: SessionResponse) {
  removeLegacySession();
  session = response;
  // Antiforgery request tokens are bound to the authenticated identity.
  csrfRequest = null;
}

export function clearAuthSession() {
  removeLegacySession();
  session = null;
  csrfRequest = null;
}

export function getStoredUser(): UserResponse | null { return session?.user ?? null; }

export async function getCsrfToken(): Promise<string> {
  if (!csrfRequest) csrfRequest = fetch("/api/auth/csrf", { cache: "no-store", credentials: "same-origin" })
    .then(async response => {
      if (!response.ok) throw new Error("Sesi formulir tidak dapat dimuat. Coba kembali.");
      const payload = await response.json();
      if (!payload.data?.token) throw new Error("Sesi formulir tidak valid.");
      return payload.data.token as string;
    }).catch(error => { csrfRequest = null; throw error; });
  return csrfRequest;
}

export async function hasValidAuthSession(): Promise<boolean> {
  removeLegacySession();
  const response = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
  if (response.status === 401) { clearAuthSession(); return false; }
  if (!response.ok) throw new Error("Sesi login tidak dapat diperiksa. Coba kembali.");
  const payload = await response.json();
  session = payload.data as SessionResponse;
  return true;
}

export async function signOut() {
  csrfRequest = null;
  const token = await getCsrfToken();
  const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", headers: { "X-CSRF-TOKEN": token } });
  if (!response.ok && response.status !== 401) throw new Error("Gagal keluar. Silakan coba kembali.");
  clearAuthSession();
}

export function redirectToSignIn() {
  if (typeof window === "undefined") return;
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/signin?next=${encodeURIComponent(next)}`;
}
