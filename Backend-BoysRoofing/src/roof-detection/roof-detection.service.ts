import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

const MAPBOX_SATELLITE_STYLE = 'mapbox/satellite-v9';
const DEFAULT_ZOOM = 20;
const IMG_SIZE = 640;
/** ROI central donde buscar la casa (donde el usuario puso el pin) */
const ROI_CENTER_FRACTION = 0.5;
/** Umbral de gris: píxeles más oscuros que esto se consideran "techo" (casa negra/gris) */
const DARK_ROOF_THRESHOLD = 95;

/** Web Mercator: at zoom z, approximate degrees per pixel at given latitude */
function scaleLng(zoom: number, latDeg: number): number {
  return (360 / (256 * Math.pow(2, zoom))) / Math.cos((latDeg * Math.PI) / 180);
}
function scaleLat(zoom: number): number {
  return 360 / (256 * Math.pow(2, zoom));
}

/** Convert pixel (px, py) in image to [lng, lat]. Center (lng, lat), image size (w, h) */
function pixelToLngLat(
  px: number,
  py: number,
  centerLng: number,
  centerLat: number,
  zoom: number,
  w: number,
  h: number,
): [number, number] {
  const slng = scaleLng(zoom, centerLat);
  const slat = scaleLat(zoom);
  const lng = centerLng + (px - w / 2) * slng;
  const lat = centerLat - (py - h / 2) * slat;
  return [lng, lat];
}

/** Encuentra la componente conexa de píxeles oscuros que contiene (cx, cy). 4-vecinos. */
function findDarkComponentContainingCenter(
  gray: Uint8Array,
  w: number,
  h: number,
  threshold: number,
  roiMinX: number,
  roiMaxX: number,
  roiMinY: number,
  roiMaxY: number,
  cx: number,
  cy: number,
): [number, number][] {
  const dark = new Uint8Array(w * h);
  for (let y = roiMinY; y < roiMaxY; y++) {
    for (let x = roiMinX; x < roiMaxX; x++) {
      if ((gray[y * w + x] ?? 255) <= threshold) dark[y * w + x] = 1;
    }
  }
  const visited = new Uint8Array(w * h);
  const stack: [number, number][] = [];
  const push = (x: number, y: number) => {
    if (x < roiMinX || x >= roiMaxX || y < roiMinY || y >= roiMaxY) return;
    const i = y * w + x;
    if (!dark[i] || visited[i]) return;
    visited[i] = 1;
    stack.push([x, y]);
  };
  const centerIdx = cy * w + cx;
  if (!dark[centerIdx]) return [];
  push(cx, cy);
  const points: [number, number][] = [];
  const dx4 = [0, 1, 0, -1];
  const dy4 = [1, 0, -1, 0];
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    points.push([x, y]);
    for (let k = 0; k < 4; k++) {
      push(x + dx4[k], y + dy4[k]);
    }
  }
  return points;
}

/** 2D cross product for orientation */
function cross(o: [number, number], a: [number, number], b: [number, number]): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/** Graham scan convex hull. Points as [x,y][]. Returns hull in counter-clockwise order */
function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const start = sorted[0];
  const rest = sorted.slice(1).sort((a, b) => {
    const angleA = Math.atan2(a[1] - start[1], a[0] - start[0]);
    const angleB = Math.atan2(b[1] - start[1], b[0] - start[0]);
    return angleA - angleB;
  });
  const hull: [number, number][] = [start];
  for (const p of rest) {
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
      hull.pop();
    }
    hull.push(p);
  }
  return hull;
}

/** Douglas-Peucker simplify polygon. Points as [x,y][], epsilon in same units as coordinates */
function douglasPeucker(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let maxIdx = 0;
  const end = points.length - 1;
  const [sx, sy] = points[0];
  const [ex, ey] = points[end];
  for (let i = 1; i < end; i++) {
    const [px, py] = points[i];
    const dist =
      Math.abs((ey - sy) * px - (ex - sx) * py + ex * sy - ey * sx) /
      Math.sqrt((ey - sy) ** 2 + (ex - sx) ** 2);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }
  if (maxDist < epsilon) return [points[0], points[end]];
  const left = douglasPeucker(points.slice(0, maxIdx + 1), epsilon);
  const right = douglasPeucker(points.slice(maxIdx), epsilon);
  return [...left.slice(0, -1), ...right];
}

@Injectable()
export class RoofDetectionService {
  async detectRoof(
    lng: number,
    lat: number,
    zoom: number,
    width: number,
    height: number,
    mapboxToken: string,
  ): Promise<{ polygon: [number, number][] } | null> {
    const url = `https://api.mapbox.com/styles/v1/${MAPBOX_SATELLITE_STYLE}/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${encodeURIComponent(mapboxToken)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch satellite image');
    const buf = Buffer.from(await res.arrayBuffer());

    const { data, info } = await sharp(buf)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const gray = new Uint8Array(data);
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const roiMinX = Math.floor(w * (1 - ROI_CENTER_FRACTION) / 2);
    const roiMaxX = Math.floor(w * (1 + ROI_CENTER_FRACTION) / 2);
    const roiMinY = Math.floor(h * (1 - ROI_CENTER_FRACTION) / 2);
    const roiMaxY = Math.floor(h * (1 + ROI_CENTER_FRACTION) / 2);

    // Detectar la mancha oscura (techo/casa negra) que contiene el pin; no bordes ni terreno
    let darkPoints = findDarkComponentContainingCenter(
      gray,
      w,
      h,
      DARK_ROOF_THRESHOLD,
      roiMinX,
      roiMaxX,
      roiMinY,
      roiMaxY,
      cx,
      cy,
    );
    if (darkPoints.length < 30) {
      darkPoints = findDarkComponentContainingCenter(
        gray,
        w,
        h,
        110,
        roiMinX,
        roiMaxX,
        roiMinY,
        roiMaxY,
        cx,
        cy,
      );
    }
    if (darkPoints.length < 30) return null;

    const hull = convexHull(darkPoints);
    const simplified = douglasPeucker(hull, 3);
    if (simplified.length < 3) return null;

    // Close the ring (first = last) and convert to lng/lat (use actual image size from sharp)
    const polygon: [number, number][] = simplified.map(([px, py]) =>
      pixelToLngLat(px, py, lng, lat, zoom, w, h),
    );
    const first = polygon[0];
    const last = polygon[polygon.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) polygon.push([first[0], first[1]]);

    return { polygon };
  }
}
