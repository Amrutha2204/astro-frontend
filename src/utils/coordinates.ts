// Simple city to coordinates mapping (similar to backend)
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  surat: { lat: 21.1702, lng: 72.8311 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  patna: { lat: 25.5941, lng: 85.1376 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  agra: { lat: 27.1767, lng: 78.0081 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  srinagar: { lat: 34.0837, lng: 74.7973 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  guwahati: { lat: 26.1445, lng: 91.7362 },
  bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  gwalior: { lat: 26.2183, lng: 78.1828 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  raipur: { lat: 21.2514, lng: 81.6296 },
  kota: { lat: 25.2138, lng: 75.8648 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  // Major international (e.g. for NRI / global users)
  london: { lat: 51.5074, lng: -0.1278 },
  "new york": { lat: 40.7128, lng: -74.006 },
  newyork: { lat: 40.7128, lng: -74.006 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
  "hong kong": { lat: 22.3193, lng: 114.1694 },
  hongkong: { lat: 22.3193, lng: 114.1694 },
  "kuala lumpur": { lat: 3.139, lng: 101.6869 },
  kualalumpur: { lat: 3.139, lng: 101.6869 },
  "abu dhabi": { lat: 24.4539, lng: 54.3773 },
  abudhabi: { lat: 24.4539, lng: 54.3773 },
  doha: { lat: 25.2854, lng: 51.5310 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  sanfrancisco: { lat: 37.7749, lng: -122.4194 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  losangeles: { lat: 34.0522, lng: -118.2437 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  houston: { lat: 29.7604, lng: -95.3698 },
  boston: { lat: 42.3601, lng: -71.0589 },
};

export function getCoordinatesFromCity(cityName: string): {
  lat: number;
  lng: number;
} {
  if (!cityName) {
    return { lat: 28.6139, lng: 77.209 }; // Default to Delhi
  }

  const normalizedCity = cityName.toLowerCase().trim();
  const coordinates = CITY_COORDINATES[normalizedCity];

  if (coordinates) {
    return coordinates;
  }

  // Try partial match
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalizedCity.includes(city) || city.includes(normalizedCity)) {
      return coords;
    }
  }

  // Default to Delhi if not found
  return { lat: 28.6139, lng: 77.209 };
}

/** Returns true if the given city name was found in the known list (no fallback used). */
export function isCityRecognized(cityName: string): boolean {
  if (!cityName?.trim()) return false;
  const normalizedCity = cityName.toLowerCase().trim();
  if (CITY_COORDINATES[normalizedCity]) return true;
  for (const city of Object.keys(CITY_COORDINATES)) {
    if (normalizedCity.includes(city) || city.includes(normalizedCity)) return true;
  }
  return false;
}

