"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  ClipboardDocumentIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  PhotoIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const MAPBOX_TOKEN = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() : "";
type GeocodeFeature = { place_name: string; center: [number, number] };

type MapProject = {
  id: number;
  token: string;
  name: string | null;
  latitude: number;
  longitude: number;
  logoUrl: string;
  reviewLink: string;
  _count?: { reviews: number };
};

type ProjectReview = {
  id: number;
  clientName: string | null;
  photoUrl: string | null;
  message: string;
  rating: number;
  approved: boolean;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProjectsPanel({ lang }: { lang: "es" | "en" }) {
  const [projects, setProjects] = useState<MapProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formLat, setFormLat] = useState("30.08");
  const [formLng, setFormLng] = useState("-94.13");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewsByProject, setReviewsByProject] = useState<Record<number, ProjectReview[]>>({});
  const [openReviewsId, setOpenReviewsId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  // Selector de dirección (Mapbox Geocoding)
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<GeocodeFeature[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  const t = lang === "es"
    ? {
        title: "Proyectos del mapa (Golden Triangle)",
        subtitle: "Cada proyecto aparece en el mapa con su logo. Al crear uno se genera un link para que el cliente deje una foto y reseña.",
        add: "Añadir proyecto",
        name: "Nombre (opcional)",
        lat: "Latitud",
        lng: "Longitud",
        logo: "Logo (subir imagen)",
        cancel: "Cancelar",
        create: "Crear y generar link",
        link: "Link para el cliente",
        copy: "Copiar link",
        copied: "Copiado",
        reviews: "Reseñas",
        noReviews: "Sin reseñas",
        approve: "Aprobar",
        delete: "Eliminar",
        deleteProject: "Eliminar proyecto",
        loading: "Cargando...",
        searchAddress: "Buscar dirección",
        searchPlaceholder: "Ej. 123 Main St, Beaumont, TX",
        orCoords: "O escribe lat/long abajo",
      }
    : {
        title: "Map projects (Golden Triangle)",
        subtitle: "Each project appears on the map with its logo. Creating one generates a link for the client to leave a photo and review.",
        add: "Add project",
        name: "Name (optional)",
        lat: "Latitude",
        lng: "Longitude",
        logo: "Logo (upload image)",
        searchAddress: "Search address",
        searchPlaceholder: "E.g. 123 Main St, Beaumont, TX",
        orCoords: "Or enter lat/long below",
        cancel: "Cancel",
        create: "Create and generate link",
        link: "Link for client",
        copy: "Copy link",
        copied: "Copied",
        reviews: "Reviews",
        noReviews: "No reviews",
        approve: "Approve",
        delete: "Delete",
        deleteProject: "Delete project",
        loading: "Loading...",
        searchAddress: "Search address",
        searchPlaceholder: "E.g. 123 Main St, Beaumont, TX",
        orCoords: "Or enter lat/long below",
      };

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/projects");
      if (res.status === 401) {
        setError(lang === "es" ? "Sesión expirada" : "Session expired");
        return;
      }
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function loadReviews(projectId: number) {
    try {
      const res = await apiFetch(`/projects/${projectId}/reviews`);
      if (!res.ok) return;
      const data = await res.json();
      setReviewsByProject((prev) => ({ ...prev, [projectId]: Array.isArray(data) ? data : [] }));
    } catch {
      //
    }
  }

  useEffect(() => {
    if (openReviewsId != null) loadReviews(openReviewsId);
  }, [openReviewsId]);

  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) {
      setAddressSuggestions([]);
      return;
    }
    setAddressLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=${MAPBOX_TOKEN}&limit=5&country=US&types=address,place`;
      const res = await fetch(url);
      if (!res.ok) {
        setAddressSuggestions([]);
        return;
      }
      const data = await res.json();
      const features: GeocodeFeature[] = Array.isArray(data.features)
        ? data.features.map((f: { place_name?: string; center?: [number, number] }) => ({
            place_name: f.place_name ?? "",
            center: Array.isArray(f.center) && f.center.length >= 2 ? [f.center[0], f.center[1]] : [0, 0],
          }))
        : [];
      setAddressSuggestions(features);
    } catch {
      setAddressSuggestions([]);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!addressQuery.trim()) {
      setAddressSuggestions([]);
      return;
    }
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    addressDebounceRef.current = setTimeout(() => {
      fetchAddressSuggestions(addressQuery);
    }, 300);
    return () => {
      if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    };
  }, [addressQuery, fetchAddressSuggestions]);

  function pickAddress(feature: GeocodeFeature) {
    const [lng, lat] = feature.center;
    setFormLng(String(lng));
    setFormLat(String(lat));
    setAddressQuery(feature.place_name);
    setAddressSuggestions([]);
  }

  function getFullLink(path: string) {
    if (typeof window !== "undefined") return `${window.location.origin}${path}`;
    return path;
  }

  function copyLink(project: MapProject) {
    const full = getFullLink(project.reviewLink);
    navigator.clipboard.writeText(full);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const token = typeof window !== "undefined" ? localStorage.getItem("br_admin_token") : null;
      const res = await fetch(`${API_BASE}/projects/upload-logo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      setLogoUrl(data.url || "");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!logoUrl.trim()) {
      setError(lang === "es" ? "Sube un logo" : "Upload a logo");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: formName.trim() || undefined,
          latitude: parseFloat(formLat) || 30.08,
          longitude: parseFloat(formLng) || -94.13,
          logoUrl: logoUrl.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error");
      }
      await load();
      setShowForm(false);
      setFormName("");
      setFormLat("30.08");
      setFormLng("-94.13");
      setLogoUrl("");
      setAddressQuery("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: number) {
    if (!confirm(lang === "es" ? "¿Eliminar este proyecto y sus reseñas?" : "Delete this project and its reviews?")) return;
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "DELETE" });
      if (res.ok) await load();
    } catch {
      //
    }
  }

  async function approveReview(reviewId: number) {
    try {
      const res = await apiFetch(`/projects/reviews/${reviewId}/approve`, { method: "PATCH" });
      if (res.ok && openReviewsId != null) loadReviews(openReviewsId);
    } catch {
      //
    }
  }

  async function deleteReview(reviewId: number) {
    if (!confirm(lang === "es" ? "¿Eliminar esta reseña?" : "Delete this review?")) return;
    try {
      const res = await apiFetch(`/projects/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok && openReviewsId != null) loadReviews(openReviewsId);
    } catch {
      //
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-br-pearl">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold admin-page-title tracking-tight">
          {t.title}
        </h1>
        <p className="mt-2 text-br-pearl text-sm max-w-2xl">{t.subtitle}</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-500/40 px-4 py-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-br-red-main/80 hover:bg-br-red-main text-white px-4 py-2.5 text-sm font-medium transition"
        >
          <PlusIcon className="h-5 w-5" />
          {t.add}
        </button>
      ) : (
        <form onSubmit={handleCreate} className="rounded-2xl border border-white/10 bg-br-smoke/30 p-6 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm text-br-pearl mb-1">{t.name}</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-br-carbon/80 px-4 py-2 text-white"
              placeholder="Ej. Casa Smith - Beaumont"
            />
          </div>
          <div className="relative">
            <label className="block text-sm text-br-pearl mb-1">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              {t.searchAddress}
            </label>
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              onBlur={() => setTimeout(() => setAddressSuggestions([]), 200)}
              className="w-full rounded-lg border border-white/10 bg-br-carbon/80 px-4 py-2 text-white placeholder:text-white/40"
              placeholder={t.searchPlaceholder}
            />
            {addressLoading && (
              <p className="absolute right-3 top-9 text-xs text-br-pearl">...</p>
            )}
            {addressSuggestions.length > 0 && (
              <div
                ref={addressDropdownRef}
                className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-white/20 bg-br-carbon shadow-xl max-h-48 overflow-y-auto"
              >
                {addressSuggestions.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickAddress(f)}
                    className="w-full text-left px-4 py-2.5 text-sm text-br-pearl hover:bg-white/10 border-b border-white/5 last:border-0"
                  >
                    {f.place_name}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-white/50 mt-1">{t.orCoords}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-br-pearl mb-1">{t.lat}</label>
              <input
                type="text"
                value={formLat}
                onChange={(e) => setFormLat(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-br-carbon/80 px-4 py-2 text-white"
                placeholder="30.08"
              />
            </div>
            <div>
              <label className="block text-sm text-br-pearl mb-1">{t.lng}</label>
              <input
                type="text"
                value={formLng}
                onChange={(e) => setFormLng(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-br-carbon/80 px-4 py-2 text-white"
                placeholder="-94.13"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-br-pearl mb-1">{t.logo}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadLogo}
              disabled={uploadingLogo}
              className="text-sm text-br-pearl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-br-red-main file:text-white"
            />
            {logoUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={logoUrl} alt="" className="h-12 w-12 rounded-lg object-cover border border-white/10" />
                <span className="text-xs text-green-400">✓</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !logoUrl.trim()}
              className="flex items-center gap-2 rounded-lg bg-br-red-main text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "..." : t.create}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); setAddressQuery(""); }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-br-pearl"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-white/10 bg-br-smoke/30 p-4 flex flex-wrap items-center gap-4"
          >
            <img src={p.logoUrl} alt="" className="h-14 w-14 rounded-xl object-cover border border-white/10" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{p.name || `Proyecto #${p.id}`}</p>
              <p className="text-xs text-br-pearl">
                {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)} · {p._count?.reviews ?? 0} {t.reviews.toLowerCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyLink(p)}
                className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-br-pearl hover:bg-white/5"
              >
                {copiedId === p.id ? (
                  <CheckIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
                {copiedId === p.id ? t.copied : t.copy}
              </button>
              <button
                type="button"
                onClick={() => setOpenReviewsId(openReviewsId === p.id ? null : p.id)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-br-pearl hover:bg-white/5"
              >
                {t.reviews}
              </button>
              <button
                type="button"
                onClick={() => deleteProject(p.id)}
                className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {openReviewsId != null && (
          <div className="rounded-2xl border border-white/10 bg-br-carbon/50 p-4 mt-4">
            <h3 className="font-semibold text-white mb-3">{t.reviews}</h3>
            {(reviewsByProject[openReviewsId] || []).length === 0 ? (
              <p className="text-br-pearl text-sm">{t.noReviews}</p>
            ) : (
              <ul className="space-y-3">
                {(reviewsByProject[openReviewsId] || []).map((r) => (
                  <li key={r.id} className="border border-white/10 rounded-xl p-3 bg-br-smoke/30">
                    {r.photoUrl && (
                      <img src={r.photoUrl} alt="" className="rounded-lg w-full max-h-40 object-cover mb-2" />
                    )}
                    <p className="text-white text-sm">{r.message}</p>
                    <p className="text-xs text-br-pearl mt-1">
                      {r.clientName || "—"} · {r.rating} ★ · {new Date(r.createdAt).toLocaleDateString()}
                      {!r.approved && " · Pendiente"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!r.approved && (
                        <button
                          type="button"
                          onClick={() => approveReview(r.id)}
                          className="rounded-lg bg-green-600/80 hover:bg-green-600 text-white px-3 py-1 text-xs"
                        >
                          {t.approve}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteReview(r.id)}
                        className="rounded-lg border border-red-500/40 text-red-400 px-3 py-1 text-xs hover:bg-red-500/10"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
