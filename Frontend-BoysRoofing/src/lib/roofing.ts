/**
 * Cálculos estándar para roofing (USA).
 * - 1 square = 100 sq ft de área de techo.
 * - Pitch: inclinación (rise/12). El multiplicador convierte área en planta (footprint) a área real.
 * - Waste: 10-15% para cortes, solapes y valles.
 * - Materiales por square: ~3 bundles shingles, ~1 roll underlayment, ~5 lbs nails,
 *   ~18 ft ridge cap, drip edge = perímetro.
 */

export const PITCH_OPTIONS = [
  { value: "0", label: "Plano (satélite)", multiplier: 1 },
  { value: "2", label: "2/12", multiplier: 1.014 },
  { value: "4", label: "4/12", multiplier: 1.054 },
  { value: "6", label: "6/12", multiplier: 1.118 },
  { value: "8", label: "8/12", multiplier: 1.202 },
  { value: "10", label: "10/12", multiplier: 1.302 },
  { value: "12", label: "12/12", multiplier: 1.414 },
] as const;

export const WASTE_OPTIONS = [
  { value: 0, label: "0%" },
  { value: 10, label: "10%" },
  { value: 15, label: "15%" },
] as const;

/** Materiales típicos por square (100 sq ft) — industria USA */
export const MATERIALS_PER_SQUARE = {
  bundlesShingles: 3,
  underlaymentRolls: 1, // 1 roll ≈ 100–200 sq ft, usamos 1 por square
  nailsLbs: 5,
  ridgeCapLinearFt: 18, // 16–20 ft por square
} as const;

export type RoofingSummary = {
  /** Área en planta (footprint) desde satélite — ft² */
  footprintFt2: number;
  /** Pitch seleccionado (ej. "6" = 6/12) */
  pitchKey: string;
  /** Multiplicador de pitch usado */
  pitchMultiplier: number;
  /** Área real del techo (footprint × pitch) — ft² */
  actualRoofAreaFt2: number;
  /** Squares (actualRoofAreaFt2 / 100) */
  squares: number;
  /** % desperdicio (0, 10, 15) */
  wastePercent: number;
  /** Squares incluyendo desperdicio (para comprar material) */
  squaresWithWaste: number;
  /** Materiales sugeridos para pedido */
  materials: {
    bundlesShingles: number;
    underlaymentRolls: number;
    nailsLbs: number;
    ridgeCapLinearFt: number;
    dripEdgeLinearFt: number; // = perímetro en ft
  };
  /** Perímetro en ft (drip edge / flashing) */
  perimeterFt: number;
};

export function getPitchMultiplier(pitchKey: string): number {
  const found = PITCH_OPTIONS.find((p) => p.value === pitchKey);
  return found ? found.multiplier : 1;
}

export function computeRoofingSummary(
  footprintFt2: number,
  perimeterFt: number,
  pitchKey: string,
  wastePercent: number,
  /** Si se conoce la longitud de cumbrera (ridge), se usa en lugar del estimado por square */
  ridgeLengthFtOverride?: number | null
): RoofingSummary {
  const pitchMultiplier = getPitchMultiplier(pitchKey);
  const actualRoofAreaFt2 = footprintFt2 * pitchMultiplier;
  const squares = actualRoofAreaFt2 / 100;
  const squaresWithWaste = squares * (1 + wastePercent / 100);

  const bundlesShingles = Math.ceil(squaresWithWaste * MATERIALS_PER_SQUARE.bundlesShingles);
  const underlaymentRolls = Math.ceil(squaresWithWaste * MATERIALS_PER_SQUARE.underlaymentRolls);
  const nailsLbs = Math.ceil(squaresWithWaste * MATERIALS_PER_SQUARE.nailsLbs);
  const ridgeCapLinearFt =
    ridgeLengthFtOverride != null && ridgeLengthFtOverride > 0
      ? Math.ceil(ridgeLengthFtOverride)
      : Math.ceil(squaresWithWaste * MATERIALS_PER_SQUARE.ridgeCapLinearFt);

  return {
    footprintFt2,
    pitchKey,
    pitchMultiplier,
    actualRoofAreaFt2,
    squares,
    wastePercent,
    squaresWithWaste,
    perimeterFt,
    materials: {
      bundlesShingles,
      underlaymentRolls,
      nailsLbs,
      ridgeCapLinearFt,
      dripEdgeLinearFt: Math.ceil(perimeterFt),
    },
  };
}
