import type { LatLng } from '@/lib/geo';
import { roadDistanceKm } from '@/lib/geo';
import type { Vehicle } from '@/constants/vehicles';

export type Quote = {
  distanceKm: number;
  durationMin: number;
  price: number;
};

export function quoteRide(vehicle: Vehicle, from: LatLng, to: LatLng): Quote {
  const distanceKm = roadDistanceKm(from, to);
  const durationMin = (distanceKm / vehicle.avgSpeedKmh) * 60 + 3;
  const raw = vehicle.baseFare + vehicle.perKm * distanceKm;
  // Arrondi à la centaine supérieure : plus simple pour payer en espèces.
  const price = Math.ceil(raw / 100) * 100;
  return { distanceKm, durationMin, price };
}
