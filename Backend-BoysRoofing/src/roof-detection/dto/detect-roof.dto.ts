export class DetectRoofDto {
  /** Longitude of map center */
  lng: number;
  /** Latitude of map center */
  lat: number;
  /** Zoom level (e.g. 19-20 for roof). Default 20 */
  zoom?: number;
  /** Image width in pixels. Default 640. Max 1280 */
  width?: number;
  /** Image height in pixels. Default 640. Max 1280 */
  height?: number;
}
