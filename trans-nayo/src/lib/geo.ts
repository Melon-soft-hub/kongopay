export type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
/** Les routes ne sont jamais en ligne droite : on majore la distance à vol d'oiseau. */
const ROAD_FACTOR = 1.3;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function roadDistanceKm(a: LatLng, b: LatLng): number {
  return Math.max(0.5, haversineKm(a, b) * ROAD_FACTOR);
}

/**
 * Trace un itinéraire courbe (Bézier quadratique) entre deux points.
 * Suffisant pour la démo, à remplacer par une API d'itinéraires en production.
 */
export function buildRoute(from: LatLng, to: LatLng, steps = 40): LatLng[] {
  const dLat = to.latitude - from.latitude;
  const dLon = to.longitude - from.longitude;
  const control: LatLng = {
    latitude: from.latitude + dLat / 2 - dLon * 0.18,
    longitude: from.longitude + dLon / 2 + dLat * 0.18,
  };
  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    points.push({
      latitude: u * u * from.latitude + 2 * u * t * control.latitude + t * t * to.latitude,
      longitude: u * u * from.longitude + 2 * u * t * control.longitude + t * t * to.longitude,
    });
  }
  return points;
}

/** Point de départ fictif du chauffeur, à environ 1 km du point de prise en charge. */
export function nearbyPoint(origin: LatLng, km = 1.1): LatLng {
  const angle = Math.random() * Math.PI * 2;
  const dLat = (km / EARTH_RADIUS_KM) * (180 / Math.PI);
  return {
    latitude: origin.latitude + dLat * Math.sin(angle),
    longitude: origin.longitude + (dLat * Math.cos(angle)) / Math.cos(toRad(origin.latitude)),
  };
}

export function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(toRad(b.longitude - a.longitude)) * Math.cos(toRad(b.latitude));
  const x =
    Math.cos(toRad(a.latitude)) * Math.sin(toRad(b.latitude)) -
    Math.sin(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.cos(toRad(b.longitude - a.longitude));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
