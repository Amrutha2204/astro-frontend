/**
 * Place/coordinates helpers. No hardcoded place list – suggestions and geocoding
 * are fetched from the backend (which uses OpenStreetMap Nominatim).
 */

/** Default (Delhi) when place is empty or not resolved. Used only as fallback. */
export function getCoordinatesFromCity(cityName: string): { lat: number; lng: number } {
  if (!cityName?.trim()) return { lat: 28.6139, lng: 77.209 };
  // All real resolution is done via astroApi.getGeocode(place) – no static list.
  return { lat: 28.6139, lng: 77.209 };
}

/** We no longer maintain a static list; backend resolves any place. */
export function isCityRecognized(_cityName: string): boolean {
  return false;
}
