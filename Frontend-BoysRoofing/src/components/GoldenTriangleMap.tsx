"use client";

import { useEffect, useRef, useState } from "react";
import { getMapProjects, type MapProject } from "@/lib/projects";

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

export default function GoldenTriangleMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [projects, setProjects] = useState<MapProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMapProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
    if (!token) {
      setLoaded(true);
      setError("Configura NEXT_PUBLIC_MAPBOX_TOKEN (token público pk.). Si ya lo añadiste en Railway, haz un nuevo deploy del frontend.");
      return;
    }
    if (token.startsWith("sk.")) {
      setLoaded(true);
      setError("Usa el token público de Mapbox (empieza con pk.), no el secreto (sk.).");
      return;
    }

    let map: mapboxgl.Map | null = null;
    const container = containerRef.current;
    if (!container) {
      setLoaded(true);
      setError("No se pudo crear el contenedor del mapa.");
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
            setError(
              "Mapbox rechazó el token. En account.mapbox.com → Access tokens: usa el token público (pk.); en \"URL restrictions\" añade tu dominio o déjalo en blanco; luego redeploy del frontend."
            );
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
        if (msg.includes("token") || msg.includes("access") || msg.includes("401")) {
          setError("Token de Mapbox inválido. En account.mapbox.com revisa el token público (pk.) y sus restricciones de URL.");
        } else {
          setError("No se pudo cargar el mapa. " + (msg ? msg.slice(0, 100) : ""));
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
  }, []);

  // Markers when map and projects are ready
  useEffect(() => {
    if (!mapRef.current || !loaded || projects.length === 0) return;

    const mapboxgl = require("mapbox-gl");
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    projects.forEach((p) => {
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
      img.alt = p.name || "Proyecto";
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
          : `<div class="mt-2 pt-2 border-t border-gray-200 space-y-2 max-h-40 overflow-y-auto">${reviews
              .map(
                (r) =>
                  `<div class="text-left">
                    <p class="font-medium text-gray-800 text-xs">${escapeHtml(r.clientName || "Cliente")} · ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</p>
                    <p class="text-gray-700 text-sm mt-0.5">${escapeHtml(r.message)}</p>
                  </div>`
              )
              .join("")}</div>`;
      const popupHtml = `<div class="map-popup-content text-left min-w-[200px] max-w-[280px] p-3 bg-white rounded-lg shadow-lg">
        <p class="font-semibold text-gray-900">${escapeHtml(p.name || "Proyecto")}</p>
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
  }, [loaded, projects]);

  return (
    <section className="home-section-dark border-b border-white/5 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="page-h2 text-br-red-light text-center mb-2">
          Nuestra zona de servicio
        </h2>
        <p className="text-center text-br-pearl text-sm md:text-base max-w-2xl mx-auto mb-8">
          Atendemos el Golden Triangle de Texas: Beaumont, Port Arthur, Orange y alrededores.
        </p>

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-[16/10] min-h-[320px] relative">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-br-pearl p-6 text-center text-sm">
              {error}
            </div>
          ) : (
            <>
              <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full min-h-[280px]"
                style={{ minHeight: 280 }}
              />
              {!loaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-br-pearl text-sm">
                  Cargando mapa…
                </div>
              )}
            </>
          )}
        </div>

        {projects.length > 0 && !error && (
          <p className="text-center text-br-pearl text-xs mt-3">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""} en el mapa
          </p>
        )}
      </div>
    </section>
  );
}
