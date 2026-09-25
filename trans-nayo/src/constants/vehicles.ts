import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type VehicleId = 'moto' | 'taxi' | 'confort' | 'van';

export type Vehicle = {
  id: VehicleId;
  name: string;
  tagline: string;
  seats: number;
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Prise en charge, en francs congolais. */
  baseFare: number;
  /** Prix par kilomètre, en francs congolais. */
  perKm: number;
  /** Vitesse moyenne en ville (km/h), utilisée pour estimer la durée. */
  avgSpeedKmh: number;
};

export const VEHICLES: Vehicle[] = [
  {
    id: 'moto',
    name: 'Nayo Moto',
    tagline: 'Rapide dans les embouteillages',
    seats: 1,
    icon: 'bicycle',
    baseFare: 1500,
    perKm: 600,
    avgSpeedKmh: 28,
  },
  {
    id: 'taxi',
    name: 'Nayo Taxi',
    tagline: 'Le taxi jaune, au juste prix',
    seats: 4,
    icon: 'car',
    baseFare: 3000,
    perKm: 1100,
    avgSpeedKmh: 20,
  },
  {
    id: 'confort',
    name: 'Nayo Confort',
    tagline: 'Climatisé, chauffeurs 5 étoiles',
    seats: 4,
    icon: 'car-sport',
    baseFare: 6000,
    perKm: 1900,
    avgSpeedKmh: 20,
  },
  {
    id: 'van',
    name: 'Nayo Van',
    tagline: 'Groupes et bagages',
    seats: 7,
    icon: 'bus',
    baseFare: 8000,
    perKm: 2400,
    avgSpeedKmh: 18,
  },
];

export function getVehicle(id: VehicleId): Vehicle {
  return VEHICLES.find((v) => v.id === id) ?? VEHICLES[1];
}
