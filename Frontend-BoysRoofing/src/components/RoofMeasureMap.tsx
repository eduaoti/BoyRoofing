// RoofMeasureMap.tsx — Google Maps (satélite + dibujo + Places)
// .env.local: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key
// Habilitar en Google Cloud: Maps JavaScript API, Places API, Geocoding API

"use client";

import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPinIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  CubeIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import {
  PITCH_OPTIONS,
  WASTE_OPTIONS,
  computeRoofingSummary,
  type RoofingSummary,
} from "@/lib/roofing";

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

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function RoofMeasureMap() {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const [mapReady, setMapReady] = useState(false);
  const [measure, setMeasure] = useState<Measure | null>(null);
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mapType, setMapType] = useState<"satellite" | "hybrid">("hybrid");

  const [pitchKey, setPitchKey] = useState<string>("0");
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [ridgeLengthOverride, setRidgeLengthOverride] = useState<string>("");

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

  function updateMeasureFromPolygon(poly: google.maps.Polygon) {
    const path = poly.getPath();
    const len = path.getLength();
    if (len < 3) {
      setMeasure(null);
      return;
    }
    const areaM2 = google.maps.geometry.spherical.computeArea(path);
    const perimeterM = google.maps.geometry.spherical.computeLength(path);
    setMeasure({
      areaM2,
      areaFt2: m2ToFt2(areaM2),
      perimeterM,
      perimeterFt: toFeet(perimeterM),
    });
  }

  function clearPolygon() {
    const poly = polygonRef.current;
    if (poly) {
      poly.setMap(null);
      polygonRef.current = null;
    }
    setMeasure(null);
  }

  function goToMyLocation() {
    const map = mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización.");
      return;
    }
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(latLng);
        map.setZoom(20);
        // Geocodificación inversa: obtener dirección y rellenar el campo
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const addr = results[0].formatted_address || "";
            setQuery(addr);
            setSelectedPlace(addr);
            try {
              sessionStorage.setItem(
                "br_last_place",
                JSON.stringify({
                  place_name: addr,
                  center: [latLng.lng, latLng.lat],
                })
              );
            } catch {}
          }
        });
      },
      () => setErrorMsg("No se pudo obtener tu ubicación (permiso o error)."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function applyPlaceToMap(place: google.maps.places.PlaceResult) {
    const map = mapRef.current;
    if (!map || !place.geometry?.location) return;
    const addr = place.formatted_address || "";
    setSelectedPlace(addr);
    setQuery(addr);
    const loc = place.geometry.location;
    const viewport = place.geometry.viewport;
    try {
      sessionStorage.setItem(
        "br_last_place",
        JSON.stringify({
          place_name: addr,
          center: [loc.lng(), loc.lat()],
          bbox: viewport
            ? [
                viewport.getSouthWest().lng(),
                viewport.getSouthWest().lat(),
                viewport.getNorthEast().lng(),
                viewport.getNorthEast().lat(),
              ]
            : undefined,
        })
      );
    } catch {}
    if (viewport) {
      map.fitBounds(viewport, 70);
      setTimeout(() => {
        map.setCenter(loc);
        map.setZoom(20);
      }, 400);
    } else {
      map.setCenter(loc);
      map.setZoom(20);
    }
  }

  function searchExact() {
    const map = mapRef.current;
    if (!map || !query.trim()) return;
    setSearching(true);
    setErrorMsg("");
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query.trim(), region: "us" }, (results, status) => {
      setSearching(false);
      if (status === "OK" && results && results[0]) {
        const place = results[0];
        applyPlaceToMap({
          formatted_address: place.formatted_address,
          geometry: {
            location: place.geometry?.location,
            viewport: place.geometry?.viewport,
          },
        });
      } else {
        setErrorMsg("No encontré esa dirección. Intenta con más detalle.");
      }
    });
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
      `  Squares: ${fmt(roofingSummary.squares, 2)} (a ordenar: ${fmt(roofingSummary.squaresWithWaste, 2)} con ${wastePercent}% desperdicio)`,
      `  Perímetro: ${fmt(measure.perimeterFt, 0)} ft`,
      "",
      "Materiales sugeridos:",
      `  Bundles (tejas): ${roofingSummary.materials.bundlesShingles}`,
      `  Rollos underlayment: ${roofingSummary.materials.underlaymentRolls}`,
      `  Clavos: ${roofingSummary.materials.nailsLbs} lbs`,
      `  Ridge cap: ${roofingSummary.materials.ridgeCapLinearFt} ft${ridgeOverrideNum != null ? " (medido)" : ""}`,
      `  Drip edge: ${roofingSummary.materials.dripEdgeLinearFt} ft`,
      "",
      "* Estimación por satélite (Google). Verificar en sitio.",
    ].join("\n");
    navigator.clipboard.writeText(text).then(
      () => {
        setSuccessMsg("Resumen copiado al portapapeles.");
        setTimeout(() => setSuccessMsg(""), 3000);
      },
      () => setErrorMsg("No se pudo copiar.")
    );
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
      const poly = polygonRef.current;
      let polygonGeoJSON: { type: "Polygon"; coordinates: [number, number][][] } | null = null;
      if (poly) {
        const path = poly.getPath();
        const arr = path.getArray();
        const coords = arr.map((ll) => [ll.lng(), ll.lat()] as [number, number]);
        if (coords.length > 0) coords.push(coords[0]);
        polygonGeoJSON = { type: "Polygon", coordinates: [coords] };
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
    if (!mapElRef.current || !apiKey) {
      if (!apiKey) setErrorMsg("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local");
      return;
    }

    setOptions({
      key: apiKey,
      v: "weekly",
    });

    let drawingManager: google.maps.drawing.DrawingManager | null = null;

    (async () => {
      try {
        await importLibrary("geometry");
        await importLibrary("places");
        const { Map } = await importLibrary("maps");
        const { DrawingManager } = await importLibrary("drawing");

        const map = new Map(mapElRef.current!, {
          center: { lat: 30.2672, lng: -97.7431 },
          zoom: 18,
          mapTypeId: "hybrid",
          mapTypeControl: true,
          mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          scaleControl: true,
        });
        mapRef.current = map;

        drawingManager = new DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
          },
          polygonOptions: {
            fillColor: "#BA181B",
            fillOpacity: 0.35,
            strokeWeight: 2,
            strokeColor: "#E5383B",
            editable: true,
            draggable: true,
          },
        });
        drawingManager.setMap(map);
        drawingManagerRef.current = drawingManager;

        google.maps.event.addListener(drawingManager, "polygoncomplete", (poly: google.maps.Polygon) => {
          if (polygonRef.current) {
            polygonRef.current.setMap(null);
          }
          polygonRef.current = poly;
          updateMeasureFromPolygon(poly);
          poly.getPath().addListener("set_at", () => updateMeasureFromPolygon(poly));
          poly.getPath().addListener("insert_at", () => updateMeasureFromPolygon(poly));
          poly.getPath().addListener("remove_at", () => updateMeasureFromPolygon(poly));
        });

        try {
          const last = sessionStorage.getItem("br_last_place");
          if (last) {
            const parsed = JSON.parse(last) as { place_name?: string; center?: [number, number] };
            if (parsed.place_name) setSelectedPlace(parsed.place_name);
            if (parsed.center) {
              map.setCenter({ lng: parsed.center[0], lat: parsed.center[1] });
              map.setZoom(20);
            }
          }
        } catch {}

        setMapReady(true);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setErrorMsg("Error al cargar el mapa. Revisa tu API key y APIs habilitadas.");
      }
    })();

    return () => {
      if (drawingManagerRef.current) drawingManagerRef.current.setMap(null);
      if (polygonRef.current) polygonRef.current.setMap(null);
      if (mapRef.current) mapRef.current = null;
      setMapReady(false);
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapReady || !searchInputRef.current || !window.google?.maps?.places) return;
    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) applyPlaceToMap(place);
    });
    autocompleteRef.current = autocomplete;
    return () => {
      if (autocompleteRef.current) window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setMapTypeId(mapType);
  }, [mapType]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-br-white/60">
              Busca una dirección, dibuja el polígono del techo y guarda la medición.
            </p>
            <label className="flex items-center gap-2 text-xs text-br-white/60">
              <span>Mapa:</span>
              <select
                value={mapType}
                onChange={(e) => setMapType(e.target.value as "satellite" | "hybrid")}
                className="rounded-lg border border-br-smoke-light bg-br-carbon px-2 py-1.5 text-xs text-br-pearl focus:ring-1 focus:ring-br-red-main"
                aria-label="Tipo de mapa"
              >
                <option value="hybrid">Satélite + etiquetas</option>
                <option value="satellite">Satélite solo</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-br-smoke-light bg-br-smoke/40 px-4 py-2 text-xs font-medium text-br-pearl hover:bg-br-smoke-light/60 transition"
              onClick={goToMyLocation}
              aria-label="Ir a mi ubicación"
            >
              <MapPinIcon className="h-4 w-4" />
              Mi ubicación
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
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <input
            ref={searchInputRef}
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
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-br-white/90" role="alert">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-br-white/90 inline-flex items-center gap-2" role="status">
            <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div
          className="h-[560px] w-full rounded-2xl border border-br-smoke-light overflow-hidden bg-br-smoke/20"
          ref={mapElRef}
        />

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
                Usa el ícono de polígono (arriba izquierda del mapa) para dibujar el techo. Luego podrás editar los vértices.
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
                    <option key={p.value} value={p.value}>{p.label}</option>
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
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-br-white/50 mb-1.5">Cumbrera / ridge (ft) — opcional</p>
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
                    <p className="text-2xl font-bold text-br-red-main">{fmt(roofingSummary.squaresWithWaste, 2)}</p>
                    <p className="text-[10px] text-br-white/50 mt-0.5">{fmt(roofingSummary.squares, 2)} sin desperdicio</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-br-smoke/40 px-2 py-1.5">
                      <span className="text-br-white/50">Planta (ft²)</span>
                      <span className="block font-semibold text-br-pearl">{fmt(measure.areaFt2, 0)}</span>
                    </div>
                    <div className="rounded bg-br-smoke/40 px-2 py-1.5">
                      <span className="text-br-white/50">Techo real (ft²)</span>
                      <span className="block font-semibold text-br-pearl">{fmt(roofingSummary.actualRoofAreaFt2, 0)}</span>
                    </div>
                    <div className="rounded bg-br-smoke/40 px-2 py-1.5 col-span-2">
                      <span className="text-br-white/50">Perímetro (drip edge)</span>
                      <span className="block font-semibold text-br-pearl">{fmt(measure.perimeterFt, 0)} ft lineal</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-br-smoke-light bg-br-smoke/30 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-br-white/50 mb-2 flex items-center gap-1">
                      <CubeIcon className="h-3.5 w-3.5" /> Materiales sugeridos
                    </p>
                    <ul className="space-y-1.5 text-xs text-br-pearl">
                      <li className="flex justify-between"><span>Bundles (tejas)</span><span className="font-semibold">{roofingSummary.materials.bundlesShingles}</span></li>
                      <li className="flex justify-between"><span>Rollos underlayment</span><span className="font-semibold">{roofingSummary.materials.underlaymentRolls}</span></li>
                      <li className="flex justify-between"><span>Clavos (lbs)</span><span className="font-semibold">{roofingSummary.materials.nailsLbs}</span></li>
                      <li className="flex justify-between"><span>Ridge cap (ft)</span><span className="font-semibold">{roofingSummary.materials.ridgeCapLinearFt}</span></li>
                      <li className="flex justify-between"><span>Drip edge (ft)</span><span className="font-semibold">{roofingSummary.materials.dripEdgeLinearFt}</span></li>
                    </ul>
                  </div>
                  <p className="text-[11px] text-br-white/45">* Planta desde satélite (Google). Verificar en sitio.</p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
