"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSiteImageMap, setSiteImageUrl, uploadSiteImage, type SiteImageMap } from "@/lib/siteImages";
import { SITE_IMAGE_SLOTS, GALLERY_SLOTS, getImageUrlForPreview } from "@/lib/siteImagesConstants";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const ALL_SLOTS = [...SITE_IMAGE_SLOTS, ...GALLERY_SLOTS];
const GROUP_LABELS: Record<string, { en: string; es: string }> = {
  home: { en: "Home", es: "Inicio" },
  about: { en: "About us", es: "Nosotros" },
  services: { en: "Services", es: "Servicios" },
  carousel: { en: "Work carousel", es: "Carrusel de trabajo" },
  brand: { en: "Brand", es: "Marca" },
  gallery: { en: "Gallery", es: "Galería" },
};

export default function SiteImagesPanel({ lang }: { lang: "en" | "es" }) {
  const router = useRouter();
  const [map, setMap] = useState<SiteImageMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const t = (slot: { labelEn: string; labelEs: string }) => (lang === "es" ? slot.labelEs : slot.labelEn);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteImageMap();
      setMap(data);
    } catch (e) {
      setError((e as Error).message);
      setMap({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileChange(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !map) return;
    setUpdating(key);
    setError(null);
    try {
      const { url } = await uploadSiteImage(file);
      await setSiteImageUrl(key, url);
      setMap((prev) => (prev ? { ...prev, [key]: url } : { [key]: url }));
    } catch (err) {
      if ((err as Error & { status?: number })?.status === 401) {
        localStorage.removeItem("br_admin_token");
        router.push(lang === "es" ? "/admin/es/login" : "/admin/en/login");
        return;
      }
      setError((err as Error).message);
    } finally {
      setUpdating(null);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-br-pearl">{lang === "es" ? "Cargando imágenes…" : "Loading images…"}</p>
      </div>
    );
  }

  const title = lang === "es" ? "Imágenes del sitio" : "Site images";
  const subtitle = lang === "es"
    ? "Actualiza las imágenes que se muestran en la web. Se suben a Cloudinary."
    : "Update the images shown on the website. They are uploaded to Cloudinary.";
  const previewTitle = lang === "es" ? "Vista previa" : "Preview";
  const updateBtn = lang === "es" ? "Actualizar" : "Update";

  const groups = Array.from(new Set(ALL_SLOTS.map((s) => s.group)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold admin-page-title tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-br-pearl text-sm max-w-2xl">{subtitle}</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-500/40 px-4 py-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Vista previa: hero + about + services */}
      {map && (
        <section className="rounded-2xl border border-white/10 bg-br-smoke/50 p-6">
          <h2 className="page-h3 text-br-red-light mb-4">{previewTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <p className="text-xs text-br-pearl px-2 py-1">Hero</p>
              <div
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: `url(${getImageUrlForPreview(map.hero || "/gallery/hero.png")})` }}
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <p className="text-xs text-br-pearl px-2 py-1">About · Team</p>
              <img
                src={getImageUrlForPreview(map.about_team || "/gallery/trabajo.jpg")}
                alt="Preview"
                className="w-full h-24 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <p className="text-xs text-br-pearl px-2 py-1">Roofing Before/After</p>
              <div className="flex h-24">
                <img
                  src={getImageUrlForPreview(map.service_roofing_before || "/gallery/proceso5.jpg")}
                  alt="Before"
                  className="w-1/2 object-cover"
                />
                <img
                  src={getImageUrlForPreview(map.service_roofing_after || "/gallery/DesPues.jpg")}
                  alt="After"
                  className="w-1/2 object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Listado por grupos */}
      {map && (
        <div className="space-y-8">
          {groups.map((group) => {
            const slots = ALL_SLOTS.filter((s) => s.group === group);
            const groupLabel = GROUP_LABELS[group] ? (lang === "es" ? GROUP_LABELS[group].es : GROUP_LABELS[group].en) : group;
            return (
              <section key={group} className="rounded-2xl border border-white/10 bg-br-smoke/30 p-6">
                <h2 className="page-h3 text-br-red-light mb-4">{groupLabel}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {slots.map((slot) => {
                    const url = map[slot.key] || "";
                    const displayUrl = getImageUrlForPreview(url || `/gallery/${slot.key}.jpg`);
                    const isUpdating = updating === slot.key;
                    return (
                      <div
                        key={slot.key}
                        className="rounded-xl border border-white/10 bg-br-carbon/80 p-4 flex flex-col"
                      >
                        <p className="text-xs font-medium text-br-pearl mb-2 truncate" title={t(slot)}>
                          {t(slot)}
                        </p>
                        <div className="aspect-video rounded-lg overflow-hidden bg-black/40 mb-3">
                          <img
                            src={displayUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23333'%3E%3Crect width='100' height='100'/%3E%3Ctext x='50' y='50' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <input
                          ref={(el) => { fileInputRefs.current[slot.key] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(slot.key, e)}
                        />
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => fileInputRefs.current[slot.key]?.click()}
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-br-red-main/80 hover:bg-br-red-main text-white text-sm font-medium disabled:opacity-50 transition"
                        >
                          {isUpdating ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              {lang === "es" ? "Subiendo…" : "Uploading…"}
                            </>
                          ) : (
                            <>
                              <ArrowUpTrayIcon className="h-4 w-4" />
                              {updateBtn}
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
