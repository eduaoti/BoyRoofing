import { API_BASE_URL } from "./api";

export type MapProjectReview = {
  clientName: string | null;
  message: string;
  rating: number;
  photoUrl: string | null;
};

export type MapProject = {
  id: number;
  name: string | null;
  latitude: number;
  longitude: number;
  logoUrl: string;
  reviews?: MapProjectReview[];
};

export type ProjectReview = {
  id: number;
  clientName: string | null;
  photoUrl: string | null;
  message: string;
  rating: number;
  createdAt: string;
  project: { name: string | null; logoUrl: string };
};

export async function getMapProjects(): Promise<MapProject[]> {
  const res = await fetch(`${API_BASE_URL}/projects/map`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getApprovedReviews(): Promise<ProjectReview[]> {
  const res = await fetch(`${API_BASE_URL}/projects/reviews`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getProjectByToken(token: string): Promise<{
  id: number;
  name: string | null;
  logoUrl: string;
  token: string;
}> {
  const res = await fetch(`${API_BASE_URL}/projects/review/${encodeURIComponent(token)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Link inválido o expirado");
  }
  return res.json();
}

export async function uploadReviewPhoto(
  token: string,
  file: File
): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${API_BASE_URL}/projects/review/${encodeURIComponent(token)}/upload-photo`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al subir la foto");
  }
  return res.json();
}

export async function submitProjectReview(
  token: string,
  data: { clientName?: string; message: string; rating?: number; photoUrl?: string }
): Promise<unknown> {
  const res = await fetch(
    `${API_BASE_URL}/projects/review/${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al enviar la reseña");
  }
  return res.json();
}
