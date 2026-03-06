"use client";

import dynamic from "next/dynamic";
import {
  MapPinIcon,
  PencilSquareIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

const RoofMeasureMap = dynamic(() => import("./RoofMeasureMap"), { ssr: false });

export default function MeasurePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight admin-page-title">
            Medir techo
          </h1>
          <p className="mt-1 text-sm text-br-white/60">
            Traza el contorno del techo en vista satélite para calcular área, perímetro y squares.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-br-white/50">
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-br-red-main/20 text-br-red-main font-semibold">1</span>
              <MapPinIcon className="h-4 w-4" /> Buscar dirección
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-br-red-main/20 text-br-red-main font-semibold">2</span>
              <PencilSquareIcon className="h-4 w-4" /> Dibujar polígono
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-br-red-main/20 text-br-red-main font-semibold">3</span>
              <DocumentCheckIcon className="h-4 w-4" /> Guardar
            </span>
          </div>
        </div>
        <p className="text-xs text-br-white/50 shrink-0">
          * Estimación por satélite. Verificar en sitio.
        </p>
      </header>

      <div className="admin-card-glow p-4 md:p-6">
        <RoofMeasureMap />
      </div>
    </div>
  );
}
