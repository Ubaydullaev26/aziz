import type { ImportCityKey } from "./types";

// City centers used as a fallback pin when a source doesn't publish venue
// coordinates (very common — most listing sites give an address string at
// best). Real coordinates from JSON-LD `geo` always take priority.
export const CITY_CENTERS: Record<ImportCityKey, { latitude: number; longitude: number }> = {
  tashkent: { latitude: 41.2995, longitude: 69.2401 },
  samarkand: { latitude: 39.6542, longitude: 66.9597 },
};

const CITY_HINTS: Record<ImportCityKey, RegExp> = {
  tashkent: /ташкент|toshkent|tashkent/i,
  // Landmark names that unambiguously place a venue in Samarkand even when
  // the city name itself isn't spelled out (e.g. a venue address of just
  // "Площадь Регистан" — a real gtickets.uz example).
  samarkand: /самарканд|samarqand|samarkand|регистан|registan|шахи-?зинда|shah-?i-?zinda|гур-?эмир|gur-?emir/i,
};

/** Best-effort city guess from free-text (address, title, description). */
export function guessCity(text: string): ImportCityKey | null {
  for (const [city, pattern] of Object.entries(CITY_HINTS) as [ImportCityKey, RegExp][]) {
    if (pattern.test(text)) return city;
  }
  return null;
}
