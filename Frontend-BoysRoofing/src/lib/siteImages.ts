import { apiFetch } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3200";

export type SiteImageMap = Record<string, string>;

/** Obtiene el mapa de imágenes (público, no requiere token) */
export async function getSiteImageMap(): Promise<SiteImageMap> {
  const res = await fetch(`${API_BASE}/site-images`);
  if (!res.ok) throw new Error("Failed to fetch site images");
  return res.json();
}

/** Actualiza la URL de una imagen (admin) */
export async function setSiteImageUrl(key: string, url: string): Promise<{ key: string; url: string }> {
  const res = await apiFetch(`/site-images/${encodeURIComponent(key)}`, {
    method: "PATCH",
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update image");
  }
  return res.json();
}

/** Sube un archivo a Cloudinary y devuelve la URL (admin) */
export async function uploadSiteImage(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const token = typeof window !== "undefined" ? localStorage.getItem("br_admin_token") : null;
  const res = await fetch(`${API_BASE}/site-images/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Upload failed");
  }
  return res.json();
}
