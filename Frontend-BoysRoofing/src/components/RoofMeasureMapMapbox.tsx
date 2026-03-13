"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPinIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  CubeIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { Map as MapboxMap, LngLatLike } from "mapbox-gl";
import {
  PITCH_OPTIONS,
  WASTE_OPTIONS,
  computeRoofingSummary,
  type RoofingSummary,
} from "@/lib/roofing";
import { API_BASE_URL } from "@/lib/api";

type Measure = {
  areaM2: number;
  areaFt2: number;
  perimeterM: number;
  perimeterFt: number;
};

function toFeet(m: number) {
  return m * 3.280839895;
}
function m2ToFt2(m2: number) {
  return m2 * 10.7639104167;
}

function fmt(n: number, d = 1) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(d);
}

// Conversión aproximada de (lng, lat) en grados a coordenadas en metros (Web Mercator),
// suficiente para calcular área y perímetro del polígono.
const R = 6378137;
function lngLatToMeters(lng: number, lat: number): { x: number; y: number } {
  const x = (lng * Math.PI * R) / 180;
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * R;
  return { x, y };
}

function computeAreaAndPerimeter(coords: [number, number][]): { areaM2: number; perimeterM: number } {
  if (coords.length < 3) {
    return { areaM2: 0, perimeterM: 0 };
  }

  // Asegurar que el polígono esté cerrado
  const pts = [...coords];
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    pts.push(first);
  }

  const projected = pts.map(([lng, lat]) => lngLatToMeters(lng, lat));

  // Área por fórmula del "shoelace"
  let area2 = 0;
  for (let i = 0; i < projected.length - 1; i++) {
    const p1 = projected[i];
    const p2 = projected[i + 1];
    area2 += p1.x * p2.y - p2.x * p1.y;
  }
  const areaM2 = Math.abs(area2) / 2;

  // Perímetro
  let perimeterM = 0;
  for (let i = 0; i < projected.length - 1; i++) {
    const p1 = projected[i];
    const p2 = projected[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    perimeterM += Math.sqrt(dx * dx + dy * dy);
  }

  return { areaM2, perimeterM };
}

export default function RoofMeasureMapMapbox() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [measure, setMeasure] = useState<Measure | null>(null);
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [detectingRoof, setDetectingRoof] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pitchKey, setPitchKey] = useState<string>("0");
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [ridgeLengthOverride, setRidgeLengthOverride] = useState<string>("");

  const mapboxToken = useMemo(() => (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "").trim(), []);

  const ridgeOverrideNum = useMemo(() => {
    const n = parseFloat(ridgeLengthOverride.replace(/,/g, "."));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [ridgeLengthOverride]);

  const roofingSummary = useMemo((): RoofingSummary | null => {
    if (!measure) return null;
    return computeRoofingSummary(
      measure.areaFt2,
      measure.perimeterFt,
      pitchKey,
      wastePercent,
      ridgeOverrideNum
    );
  }, [measure, pitchKey, wastePercent, ridgeOverrideNum]);

  function updateMeasureFromDraw() {
    const draw = drawRef.current;
    if (!draw) return;
    const data = draw.getAll();
    const poly = data.features.find((f) => f.geometry && f.geometry.type === "Polygon");
    if (!poly || poly.geometry.type !== "Polygon") {
      setMeasure(null);
      return;
    }
    const ring = poly.geometry.coordinates[0] as [number, number][];
    if (!ring || ring.length < 3) {
      setMeasure(null);
      return;
    }
    const { areaM2, perimeterM } = computeAreaAndPerimeter(ring);
    setMeasure({
      areaM2,
      areaFt2: m2ToFt2(areaM2),
      perimeterM,
      perimeterFt: toFeet(perimeterM),
    });
  }

  function clearPolygon() {
    const draw = drawRef.current;
    if (draw) {
      draw.deleteAll();
    }
    setMeasure(null);
  }

  function flyTo(center: LngLatLike, zoom = 20) {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center, zoom, essential: true });
  }

  async function geocodeAddress(address: string) {
    if (!mapboxToken) return null;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?country=us&limit=1&access_token=${mapboxToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    return feature as {
      place_name: string;
      center: [number, number];
      bbox?: [number, number, number, number];
    };
  }

  async function reverseGeocode(lng: number, lat: number) {
    if (!mapboxToken) return null;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address&limit=1&access_token=${mapboxToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    return feature as { place_name: string; center: [number, number] };
  }

  async function goToMyLocation() {
    const map = mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización.");
      return;
    }
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const center: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        flyTo(center, 20);
        try {
          const rev = await reverseGeocode(center[0], center[1]);
          if (rev) {
            setSelectedPlace(rev.place_name);
            setQuery(rev.place_name);
            sessionStorage.setItem(
              "br_last_place",
              JSON.stringify({ place_name: rev.place_name, center: rev.center })
            );
          }
        } catch {
          // ignorar fallos de geocodificación inversa
        }
      },
      () => setErrorMsg("No se pudo obtener tu ubicación (permiso o error)."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function searchExact() {
    if (!query.trim()) return;
    setSearching(true);
    setErrorMsg("");
    try {
      const result = await geocodeAddress(query.trim());
      if (!result) {
        setErrorMsg("No encontré esa dirección. Intenta con más detalle.");
        return;
      }
      setSelectedPlace(result.place_name);
      setQuery(result.place_name);
      flyTo(result.center, 20);
      try {
        sessionStorage.setItem("br_last_place", JSON.stringify(result));
      } catch {}
    } catch {
      setErrorMsg("Error al buscar la dirección.");
    } finally {
      setSearching(false);
    }
  }

  function copySummaryToClipboard() {
    if (!roofingSummary || !measure) return;
    const pitchLabel = PITCH_OPTIONS.find((p) => p.value === pitchKey)?.label ?? pitchKey + "/12";
    const text = [
      "BOYS ROOFING — Medición de techo",
      "────────────────────────────",
      `Dirección: ${selectedPlace || query.trim()}`,
      `Fecha: ${new Date().toLocaleString()}`,
      "",
      "Áreas:",
      `  Planta (satélite): ${fmt(measure.areaFt2, 0)} ft²`,
      `  Pitch: ${pitchLabel}`,
      `  Techo real: ${fmt(roofingSummary.actualRoofAreaFt2, 0)} ft²`,
      `  Squares: ${fmt(roofingSummary.squares, 2)} (a ordenar: ${fmt(
        roofingSummary.squaresWithWaste,
        2
      )} con ${wastePercent}% desperdicio)`,
      `  Perímetro: ${fmt(measure.perimeterFt, 0)} ft`,
      "",
      "Materiales sugeridos:",
      `  Bundles (tejas): ${roofingSummary.materials.bundlesShingles}`,
      `  Rollos underlayment: ${roofingSummary.materials.underlaymentRolls}`,
      `  Clavos: ${roofingSummary.materials.nailsLbs} lbs`,
      `  Ridge cap: ${roofingSummary.materials.ridgeCapLinearFt} ft${
        ridgeOverrideNum != null ? " (medido)" : ""
      }`,
      `  Drip edge: ${roofingSummary.materials.dripEdgeLinearFt} ft`,
      "",
      "* Estimación por satélite (Mapbox). Verificar en sitio.",
    ].join("\n");
    navigator.clipboard.writeText(text).then(
      () => {
        setSuccessMsg("Resumen copiado al portapapeles.");
        setTimeout(() => setSuccessMsg(""), 3000);
      },
      () => setErrorMsg("No se pudo copiar.")
    );
  }

  async function detectRoofAuto() {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const center = map.getCenter();
    const zoom = Math.min(22, Math.max(18, Math.round(map.getZoom() ?? 20)));
    setDetectingRoof(true);
    setErrorMsg("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("br_admin_token") : null;
      const res = await fetch(`${API_BASE_URL}/roof-detection/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lng: center.lng,
          lat: center.lat,
          zoom,
          width: 640,
          height: 640,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg("Sesión expirada. Inicia sesión de nuevo.");
          return;
        }
        const text = await res.text();
        throw new Error(text || "Error al detectar techo");
      }
      const data = await res.json();
      const polygon = data?.polygon;
      if (!polygon || !Array.isArray(polygon) || polygon.length < 3) {
        setErrorMsg(data?.message ?? "No se detectó un contorno de techo. Centra el mapa sobre la casa e intenta de nuevo.");
        return;
      }
      const draw = drawRef.current;
      if (!draw) return;
      let ring = polygon as [number, number][];
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) ring = [...ring, [first[0], first[1]]];
      draw.deleteAll();
      draw.add({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [ring],
        },
      });
      updateMeasureFromDraw();
      setSuccessMsg("Contorno detectado. Ajusta los vértices si hace falta.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      setErrorMsg((e as Error)?.message ?? "No se pudo detectar el techo.");
    } finally {
      setDetectingRoof(false);
    }
  }

  async function downloadReportPdf() {
    const address = selectedPlace || query.trim();
    if (!address) {
      setErrorMsg("Primero busca y selecciona una dirección.");
      return;
    }
    if (!measure || !roofingSummary) {
      setErrorMsg("Primero dibuja el polígono del techo.");
      return;
    }
    setDownloadingPdf(true);
    setErrorMsg("");
    try {
      let polygon: number[][] | undefined;
      const draw = drawRef.current;
      if (draw) {
        const data = draw.getAll();
        const poly = data.features.find((f) => f.geometry?.type === "Polygon");
        if (poly && poly.geometry.type === "Polygon" && poly.geometry.coordinates[0]?.length) {
          polygon = poly.geometry.coordinates[0] as number[][];
        }
      }
      const token = typeof window !== "undefined" ? localStorage.getItem("br_admin_token") : null;
      const res = await fetch(`${API_BASE_URL}/roof-report/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          address,
          measure: {
            areaM2: measure.areaM2,
            areaFt2: measure.areaFt2,
            perimeterM: measure.perimeterM,
            perimeterFt: measure.perimeterFt,
          },
          roofingSummary: {
            footprintFt2: roofingSummary.footprintFt2,
            pitchKey: roofingSummary.pitchKey,
            pitchMultiplier: roofingSummary.pitchMultiplier,
            actualRoofAreaFt2: roofingSummary.actualRoofAreaFt2,
            squares: roofingSummary.squares,
            wastePercent: roofingSummary.wastePercent,
            squaresWithWaste: roofingSummary.squaresWithWaste,
            perimeterFt: roofingSummary.perimeterFt,
            materials: roofingSummary.materials,
          },
          polygon,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 401) {
          setErrorMsg("Sesión expirada. Inicia sesión de nuevo.");
          return;
        }
        throw new Error(text || "Error al generar el informe");
      }
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition");
      const filename = disp?.match(/filename="?([^"]+)"?/)?.[1] ?? "boys-roofing-report.pdf";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg("Informe PDF descargado.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      setErrorMsg((e as Error)?.message ?? "No se pudo descargar el informe PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function saveMeasurement() {
    if (!selectedPlace && !query.trim()) {
      setSuccessMsg("");
      setErrorMsg("Primero busca y selecciona una dirección.");
      return;
    }
    if (!measure) {
      setSuccessMsg("");
      setErrorMsg("Primero dibuja el polígono del techo.");
      return;
    }
    try {
      setSaving(true);
      setErrorMsg("");
      const draw = drawRef.current;
      let polygonGeoJSON: { type: "Polygon"; coordinates: [number, number][][] } | null = null;
      if (draw) {
        const data = draw.getAll();
        const poly = data.features.find((f) => f.geometry && f.geometry.type === "Polygon");
        if (poly && poly.geometry.type === "Polygon") {
          polygonGeoJSON = {
            type: "Polygon",
            coordinates: poly.geometry.coordinates as [number, number][][],
          };
        }
      }
      const payload = {
        address: selectedPlace || query.trim(),
        measure,
        roofingSummary: roofingSummary ?? undefined,
        polygon: polygonGeoJSON ? { type: "Feature", geometry: polygonGeoJSON } : undefined,
        savedAt: new Date().toISOString(),
      };
      const key = "br_saved_measurements";
      const prev = sessionStorage.getItem(key);
      const list = prev ? (JSON.parse(prev) as object[]) : [];
      list.unshift(payload);
      sessionStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
      setSuccessMsg("Medición guardada correctamente.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
      setSuccessMsg("");
      setErrorMsg("No se pudo guardar la medición.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!containerRef.current || !mapboxToken) {
      if (!mapboxToken) {
        setErrorMsg("Falta NEXT_PUBLIC_MAPBOX_TOKEN en .env.local");
      }
      return;
    }

    let map: MapboxMap | null = null;
    let draw: MapboxDraw | null = null;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        mapboxgl.accessToken = mapboxToken;

        map = new mapboxgl.Map({
          container: containerRef.current!,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: [-97.7431, 30.2672],
          zoom: 18,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: true, trash: true },
          defaultMode: "draw_polygon",
        });
        map.addControl(draw, "top-left");

        drawRef.current = draw;
        mapRef.current = map;

        map.on("load", () => {
          setMapReady(true);
          // Reposicionar al último lugar usado (compatibilidad con versión Google)
          try {
            const last = sessionStorage.getItem("br_last_place");
            if (last) {
              const parsed = JSON.parse(last) as { center?: [number, number]; place_name?: string };
              if (parsed.center) {
                map!.setCenter(parsed.center);
                map!.setZoom(20);
              }
              if (parsed.place_name) {
                setSelectedPlace(parsed.place_name);
                setQuery(parsed.place_name);
              }
            }
          } catch {
            // ignorar
          }
        });

        const onChange = () => updateMeasureFromDraw();
        map.on("draw.create", onChange as any);
        map.on("draw.update", onChange as any);
        map.on("draw.delete", onChange as any);

        map.on("error", (e) => {
          const msg = String((e as any)?.error?.message ?? "");
          if (msg.includes("token") || msg.includes("access") || msg.includes("401") || msg.includes("403")) {
            setErrorMsg(
              "Mapbox rechazó el token. Usa el token público (pk.) y revisa las URL permitidas en tu cuenta de Mapbox."
            );
          }
        });
      } catch (err) {
        console.error("Error loading Mapbox:", err);
        setErrorMsg("Error al cargar el mapa. Revisa tu token de Mapbox.");
      }
    })();

    return () => {
      if (map) {
        map.remove();
      }
      mapRef.current = null;
      drawRef.current = null;
      setMapReady(false);
    };
  }, [mapboxToken]);

  useEffect(() => {
    const onResize = () => mapRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-br-white/60">
              Busca una dirección, dibuja el polígono del techo y guarda la medición.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-br-smoke-light bg-br-smoke/40 px-4 py-2 text-xs font-medium text-br-pearl hover:bg-br-smoke-light/60 transition"
              onClick={goToMyLocation}
              aria-label="Ir a mi ubicación"
              disabled={!mapReady}
            >
              <MapPinIcon className="h-4 w-4" />
              Mi ubicación
            </button>
            <button
              type="button"
              disabled={!mapReady || detectingRoof}
              className="inline-flex items-center gap-2 rounded-full border border-br-red-main/50 bg-br-red-main/10 px-4 py-2 text-xs font-medium text-br-red-light hover:bg-br-red-main/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={detectRoofAuto}
              aria-label="Detectar techo automáticamente"
              title="Centra el mapa sobre la casa y pulsa para detectar el contorno del techo"
            >
              <SparklesIcon className="h-4 w-4" />
              {detectingRoof ? "Detectando…" : "Detectar techo"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-br-smoke-light bg-br-smoke/40 px-4 py-2 text-xs font-medium text-br-pearl hover:bg-br-smoke-light/60 transition"
              onClick={clearPolygon}
              aria-label="Limpiar polígono"
            >
              <TrashIcon className="h-4 w-4" />
              Limpiar
            </button>
            <button
              type="button"
              disabled={!measure || !roofingSummary}
              className="inline-flex items-center gap-2 rounded-full border border-br-smoke-light bg-br-smoke/40 px-4 py-2 text-xs font-medium text-br-pearl hover:bg-br-smoke-light/60 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={copySummaryToClipboard}
              aria-label="Copiar resumen"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              Copiar resumen
            </button>
            <button
              type="button"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-br-red-main px-5 py-2 text-xs font-semibold text-white hover:bg-br-red-light disabled:opacity-60 disabled:cursor-not-allowed transition"
              onClick={saveMeasurement}
              aria-label="Guardar medición"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              disabled={!measure || !roofingSummary || downloadingPdf}
              className="inline-flex items-center gap-2 rounded-full border border-br-red-main/60 bg-br-red-main/10 px-5 py-2 text-xs font-semibold text-br-red-light hover:bg-br-red-main/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={downloadReportPdf}
              aria-label="Descargar informe PDF"
            >
              <DocumentTextIcon className="h-4 w-4" />
              {downloadingPdf ? "Generando PDF…" : "Informe PDF"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchExact();
              }
            }}
            placeholder='Ej: "123 Main St, Austin, TX 78701"'
            className="w-full rounded-lg bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl placeholder:text-br-white/40"
          />
          <button
            type="button"
            onClick={searchExact}
            disabled={searching || !query.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-br-red-main px-4 py-2 text-sm font-semibold text-white hover:bg-br-red-light disabled:opacity-60 disabled:cursor-not-allowed transition"
            aria-label="Buscar dirección"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {errorMsg && (
          <div
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-br-white/90"
            role="alert"
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-br-white/90 inline-flex items-center gap-2"
            role="status"
          >
            <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="h-[560px] w-full rounded-2xl border border-br-smoke-light overflow-hidden bg-br-smoke/20">
          <div ref={containerRef} className="w-full h-full" />
        </div>

        <aside className="rounded-2xl border border-br-smoke-light bg-br-carbon/60 p-4 shadow-inner overflow-y-auto max-h-[560px]">
          <h3 className="text-sm font-semibold text-br-pearl border-b border-br-smoke-light pb-2">
            Medición y materiales
          </h3>
          <div className="mt-3 text-xs text-br-white/60">
            <p className="text-br-white/50 mb-1">Dirección</p>
            <p className="text-br-pearl font-medium break-words">
              {selectedPlace || (query.trim() ? query.trim() : "—")}
            </p>
          </div>

          {!measure ? (
            <div className="mt-4 rounded-lg border border-dashed border-br-smoke-light/60 bg-br-smoke/20 p-4 text-center">
              <p className="text-xs text-br-white/50">
                Usa la herramienta de polígono en el mapa para dibujar el techo. Luego podrás editar los vértices.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-br-white/50 mb-1.5">Pendiente (pitch)</p>
                <select
                  value={pitchKey}
                  onChange={(e) => setPitchKey(e.target.value)}
                  className="w-full rounded-lg bg-br-smoke border border-br-smoke-light px-2 py-1.5 text-xs text-br-pearl focus:ring-1 focus:ring-br-red-main"
                >
                  {PITCH_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-br-white/50 mb-1.5">Desperdicio (material)</p>
                <select
                  value={wastePercent}
                  onChange={(e) => setWastePercent(Number(e.target.value))}
                  className="w-full rounded-lg bg-br-smoke border border-br-smoke-light px-2 py-1.5 text-xs text-br-pearl focus:ring-1 focus:ring-br-red-main"
                >
                  {WASTE_OPTIONS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-br-white/50 mb-1.5">
                  Cumbrera / ridge (ft) — opcional
                </p>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej: 45"
                  value={ridgeLengthOverride}
                  onChange={(e) => setRidgeLengthOverride(e.target.value)}
                  className="w-full rounded-lg bg-br-smoke border border-br-smoke-light px-2 py-1.5 text-xs text-br-pearl placeholder:text-br-white/30 focus:ring-1 focus:ring-br-red-main"
                />
              </div>

              {roofingSummary && (
                <>
                  <div className="rounded-lg bg-br-red-main/15 border border-br-red-main/30 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-br-white/50">Squares (a ordenar)</p>
                    <p className="text-2xl font-bold text-br-red-main">
                      {fmt(roofingSummary.squaresWithWaste, 2)}
                    </p>
                    <p className="text-[10px] text-br-white/50 mt-0.5">
                      {fmt(roofingSummary.squares, 2)} sin desperdicio
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-br-smoke/40 px-2 py-1.5">
                      <span className="text-br-white/50">Planta (ft²)</span>
                      <span className="block font-semibold text-br-pearl">
                        {fmt(measure.areaFt2, 0)}
                      </span>
                    </div>
                    <div className="rounded bg-br-smoke/40 px-2 py-1.5">
                      <span className="text-br-white/50">Techo real (ft²)</span>
                      <span className="block font-semibold text-br-pearl">
                        {fmt(roofingSummary.actualRoofAreaFt2, 0)}
                      </span>
                    </div>
                    <div className="rounded bg-br-smoke/40 px-2 py-1.5 col-span-2">
                      <span className="text-br-white/50">Perímetro (drip edge)</span>
                      <span className="block font-semibold text-br-pearl">
                        {fmt(measure.perimeterFt, 0)} ft lineal
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-br-smoke-light bg-br-smoke/30 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-br-white/50 mb-2 flex items-center gap-1">
                      <CubeIcon className="h-3.5 w-3.5" /> Materiales sugeridos
                    </p>
                    <ul className="space-y-1.5 text-xs text-br-pearl">
                      <li className="flex justify-between">
                        <span>Bundles (tejas)</span>
                        <span className="font-semibold">
                          {roofingSummary.materials.bundlesShingles}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Rollos underlayment</span>
                        <span className="font-semibold">
                          {roofingSummary.materials.underlaymentRolls}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Clavos (lbs)</span>
                        <span className="font-semibold">
                          {roofingSummary.materials.nailsLbs}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Ridge cap (ft)</span>
                        <span className="font-semibold">
                          {roofingSummary.materials.ridgeCapLinearFt}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Drip edge (ft)</span>
                        <span className="font-semibold">
                          {roofingSummary.materials.dripEdgeLinearFt}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-[11px] text-br-white/45">
                    * Planta desde satélite (Mapbox). Verificar en sitio.
                  </p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

