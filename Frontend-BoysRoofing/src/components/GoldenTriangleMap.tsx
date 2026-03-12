"use client";

import { useEffect, useRef, useState } from "react";
import { getMapProjects, type MapProject } from "@/lib/projects";
import { translateText } from "@/lib/translate";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Golden Triangle Texas: Beaumont, Port Arthur, Orange
const GOLDEN_TRIANGLE_COORDS: [number, number][] = [
  [-94.1266, 30.0802], // Beaumont
  [-93.9427, 29.8852], // Port Arthur
  [-93.7366, 30.093],  // Orange
];
const MAP_CENTER: [number, number] = [-93.95, 30.0];
const DEFAULT_ZOOM = 9;

const MAP_TEXTS = {
  es: {
    title: "Nuestra zona de servicio",
    description: "Atendemos el Golden Triangle de Texas: Beaumont, Port Arthur, Orange y alrededores.",
    loading: "Cargando mapa…",
    projectsCount: (n: number) => (n === 1 ? "1 proyecto en el mapa" : `${n} proyectos en el mapa`),
    errorNoToken: "Configura NEXT_PUBLIC_MAPBOX_TOKEN (token público pk.). Si ya lo añadiste en Railway, haz un nuevo deploy del frontend.",
    errorUsePk: "Usa el token público de Mapbox (empieza con pk.), no el secreto (sk.).",
    errorContainer: "No se pudo crear el contenedor del mapa.",
    errorTokenInvalid: "Token de Mapbox inválido. En account.mapbox.com revisa el token público (pk.) y sus restricciones de URL.",
    errorMapboxReject: "Mapbox rechazó el token. En account.mapbox.com → Access tokens: usa el token público (pk.); en \"URL restrictions\" añade tu dominio o déjalo en blanco; luego redeploy del frontend.",
    errorLoad: "No se pudo cargar el mapa.",
    project: "Proyecto",
    client: "Cliente",
  },
  en: {
    title: "Our service area",
    description: "We serve the Golden Triangle of Texas: Beaumont, Port Arthur, Orange and surrounding areas.",
    loading: "Loading map…",
    projectsCount: (n: number) => (n === 1 ? "1 project on the map" : `${n} projects on the map`),
    errorNoToken: "Configure NEXT_PUBLIC_MAPBOX_TOKEN (public pk. token). If you already added it in Railway, redeploy the frontend.",
    errorUsePk: "Use the public Mapbox token (starts with pk.), not the secret (sk.).",
    errorContainer: "Could not create the map container.",
    errorTokenInvalid: "Invalid Mapbox token. Check the public token (pk.) and URL restrictions at account.mapbox.com.",
    errorMapboxReject: "Mapbox rejected the token. At account.mapbox.com → Access tokens use the public token (pk.); add your domain in URL restrictions or leave blank; then redeploy the frontend.",
    errorLoad: "Could not load the map.",
    project: "Project",
    client: "Client",
  },
};

export default function GoldenTriangleMap({ lang = "es" }: { lang?: "es" | "en" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [projects, setProjects] = useState<MapProject[]>([]);
  const [displayProjects, setDisplayProjects] = useState<MapProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const texts = MAP_TEXTS[lang];

  useEffect(() => {
    getMapProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  // Traducir reseñas del mapa cuando el sitio está en inglés
  useEffect(() => {
    if (!projects.length) {
      setDisplayProjects([]);
      return;
    }
    if (lang === "es") {
      setDisplayProjects(projects);
      return;
    }
    let cancelled = false;
    (async () => {
      const translated = await Promise.all(
        projects.map(async (p) => ({
          ...p,
          name: p.name ? await translateText(p.name, "es", "en") : null,
          reviews: p.reviews?.length
            ? await Promise.all(
                (p.reviews ?? []).map(async (r) => ({
                  ...r,
                  message: await translateText(r.message, "es", "en"),
                  clientName: r.clientName
                    ? await translateText(r.clientName, "es", "en")
                    : null,
                }))
              )
            : [],
        }))
      );
      if (!cancelled) setDisplayProjects(translated);
    })();
    return () => {
      cancelled = true;
    };
  }, [projects, lang]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
    const t = MAP_TEXTS[lang];
    if (!token) {
      setLoaded(true);
      setError(t.errorNoToken);
      return;
    }
    if (token.startsWith("sk.")) {
      setLoaded(true);
      setError(t.errorUsePk);
      return;
    }

    let map: mapboxgl.Map | null = null;
    const container = containerRef.current;
    if (!container) {
      setLoaded(true);
      setError(t.errorContainer);
      return;
    }

    const init = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;

        mapboxgl.accessToken = token;
        map = new mapboxgl.Map({
          container,
          style: "mapbox://styles/mapbox/dark-v11",
          center: MAP_CENTER,
          zoom: DEFAULT_ZOOM,
        });

        map.on("error", (e) => {
          const msg = String(e?.error?.message ?? "");
          if (msg.includes("token") || msg.includes("access") || msg.includes("401") || msg.includes("403")) {
            setError(MAP_TEXTS[lang].errorMapboxReject);
          }
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.on("load", () => {
          if (!map) return;
          map.addSource("golden-triangle", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [[...GOLDEN_TRIANGLE_COORDS, GOLDEN_TRIANGLE_COORDS[0]]],
              },
            },
          });
          map.addLayer({
            id: "triangle-fill",
            type: "fill",
            source: "golden-triangle",
            paint: {
              "fill-color": "rgba(180, 24, 27, 0.15)",
              "fill-outline-color": "rgba(180, 24, 27, 0.8)",
            },
          });
          mapRef.current = map;
          map.resize(); // asegura que el mapa ocupe todo el contenedor
          setLoaded(true);
        });
      } catch (err) {
        const msg = (err as Error)?.message ?? "";
        const t = MAP_TEXTS[lang];
        if (msg.includes("token") || msg.includes("access") || msg.includes("401")) {
          setError(t.errorTokenInvalid);
        } else {
          setError(t.errorLoad + (msg ? " " + msg.slice(0, 100) : ""));
        }
        setLoaded(true);
      }
    };

    init();

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (map) map.remove();
      mapRef.current = null;
    };
  }, [lang]);

  // Redimensionar mapa en resize/orientation (móvil)
  useEffect(() => {
    const onResize = () => mapRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loaded]);

  // Markers when map and displayProjects are ready
  useEffect(() => {
    const list = displayProjects.length ? displayProjects : projects;
    if (!mapRef.current || !loaded || list.length === 0) return;

    const mapboxgl = require("mapbox-gl");
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const t = MAP_TEXTS[lang];
    list.forEach((p) => {
      const el = document.createElement("div");
      el.className = "map-marker-logo";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid rgb(180, 24, 27)";
      el.style.overflow = "hidden";
      el.style.background = "#1a1a1a";
      el.style.cursor = "pointer";
      const img = document.createElement("img");
      img.src = p.logoUrl;
      img.alt = p.name || t.project;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.onerror = () => {
        el.style.background = "rgba(180,24,27,0.5)";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.textContent = "•";
      };
      el.appendChild(img);

      const reviews = p.reviews ?? [];
      const reviewsHtml =
        reviews.length === 0
          ? ""
          : `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;max-height:180px;overflow-y:auto">${reviews
              .map(
                (r, idx) =>
                  `<div style="padding-bottom:10px;margin-bottom:10px;${idx < reviews.length - 1 ? "border-bottom:1px solid #f3f4f6;" : ""}text-align:left">
                    <p style="font-weight:600;color:#1f2937;font-size:12px;margin:0;display:flex;align-items:center;gap:6px"><span style="display:inline-flex;width:22px;height:22px;border-radius:50%;background:#fef3c7;color:#b45309;font-size:11px;align-items:center;justify-content:center">${escapeHtml((r.clientName || "C").charAt(0).toUpperCase())}</span>${escapeHtml(r.clientName || t.client)}</p>
                    <p style="color:#d97706;font-size:11px;margin:4px 0 0 0">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</p>
                    <p style="color:#4b5563;font-size:13px;margin:6px 0 0 0;line-height:1.4">${escapeHtml(r.message)}</p>
                  </div>`
              )
              .join("")}</div>`;
      const popupHtml = `<div style="min-width:220px;max-width:300px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 8px 10px -6px rgba(0,0,0,0.1);border:1px solid #f3f4f6;text-align:left">
        <p style="font-weight:700;color:#111;font-size:14px;margin:0;padding-bottom:8px;border-bottom:2px solid rgba(186,24,27,0.25)">${escapeHtml(p.name || t.project)}</p>
        ${reviewsHtml}
      </div>`;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.longitude, p.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, className: "mapbox-popup-custom" }).setHTML(popupHtml)
        )
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [loaded, projects, displayProjects, lang]);

  return (
    <section className="home-section-dark border-b border-white/5 py-10 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full min-w-0">
        <h2 className="page-h2 text-br-red-light text-center mb-2">
          {texts.title}
        </h2>
        <p className="text-center text-br-pearl text-sm md:text-base max-w-2xl mx-auto mb-6 sm:mb-8">
          {texts.description}
        </p>

        <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-[16/10] min-h-[220px] sm:min-h-[280px] md:min-h-[320px] relative w-full">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-br-pearl p-6 text-center text-sm">
              {error}
            </div>
          ) : (
            <>
              <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full min-h-[180px] sm:min-h-[260px]"
              />
              {!loaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-br-pearl text-sm">
                  {texts.loading}
                </div>
              )}
            </>
          )}
        </div>

        {projects.length > 0 && !error && (
          <p className="text-center text-br-pearl text-xs mt-3">
            {texts.projectsCount(projects.length)}
          </p>
        )}
      </div>
    </section>
  );
}
