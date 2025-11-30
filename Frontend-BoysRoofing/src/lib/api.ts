// src/lib/api.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3200";

/**
 * apiFetch: agrega automáticamente el token (si existe)
 * y aplica Content-Type por defecto.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("br_admin_token")
      : null;

  // headers que siempre se aplican
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // si hay token, lo agrega
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // merge con headers personalizados
  const mergedHeaders: HeadersInit = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  return res;
}
