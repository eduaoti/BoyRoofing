"use client";

import { useEffect, useRef, useState } from "react";
import { getMapProjects, type MapProject } from "@/lib/projects";

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
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) {
      setLoaded(true);
      setError(!token ? "Configura NEXT_PUBLIC_MAPBOX_TOKEN para ver el mapa." : null);
      return;
    }

    let map: mapboxgl.Map | null = null;

    const init = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      mapboxgl.accessToken = token;
      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: MAP_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("load", () => {
        map!.addSource("golden-triangle", {
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
        map!.addLayer({
          id: "triangle-fill",
          type: "fill",
          source: "golden-triangle",
          paint: {
            "fill-color": "rgba(180, 24, 27, 0.15)",
            "fill-outline-color": "rgba(180, 24, 27, 0.8)",
          },
        });
        mapRef.current = map;
        setLoaded(true);
      });
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

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.longitude, p.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2 text-sm text-white"><strong>${p.name || "Proyecto"}</strong></div>`
          )
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

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-[16/10] min-h-[320px]">
          {error ? (
            <div className="w-full h-full flex items-center justify-center text-br-pearl p-6 text-center">
              {error}
            </div>
          ) : (
            <div ref={containerRef} className="w-full h-full" />
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
