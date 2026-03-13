export class RoofReportMeasureDto {
  areaM2: number;
  areaFt2: number;
  perimeterM: number;
  perimeterFt: number;
}

export class RoofReportMaterialsDto {
  bundlesShingles: number;
  underlaymentRolls: number;
  nailsLbs: number;
  ridgeCapLinearFt: number;
  dripEdgeLinearFt: number;
}

export class RoofReportSummaryDto {
  footprintFt2: number;
  pitchKey: string;
  pitchMultiplier: number;
  actualRoofAreaFt2: number;
  squares: number;
  wastePercent: number;
  squaresWithWaste: number;
  perimeterFt: number;
  materials: RoofReportMaterialsDto;
}

export class GenerateRoofReportDto {
  address: string;
  measure: RoofReportMeasureDto;
  roofingSummary: RoofReportSummaryDto;
  /** Optional: polygon coordinates [lng, lat][] for diagram (first ring only) */
  polygon?: number[][];
}
