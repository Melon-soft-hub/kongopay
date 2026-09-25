import type { LatLng } from '@/lib/geo';

export type Place = {
  id: string;
  name: string;
  address: string;
  coords: LatLng;
  icon?: 'home' | 'briefcase' | 'airplane' | 'school' | 'cart' | 'football' | 'business' | 'location';
};

/** Position par défaut : centre de Gombe, Kinshasa. */
export const DEFAULT_LOCATION: Place = {
  id: 'current',
  name: 'Ma position',
  address: 'Gombe, Kinshasa',
  coords: { latitude: -4.3217, longitude: 15.3125 },
  icon: 'location',
};

export const PLACES: Place[] = [
  {
    id: 'ndjili',
    name: "Aéroport de N'djili",
    address: 'Boulevard Lumumba, Nsele',
    coords: { latitude: -4.3857, longitude: 15.4446 },
    icon: 'airplane',
  },
  {
    id: 'zando',
    name: 'Grand Marché (Zando)',
    address: 'Avenue du Commerce, Gombe',
    coords: { latitude: -4.3196, longitude: 15.3097 },
    icon: 'cart',
  },
  {
    id: 'unikin',
    name: 'Université de Kinshasa',
    address: 'Mont Amba, Lemba',
    coords: { latitude: -4.4194, longitude: 15.3083 },
    icon: 'school',
  },
  {
    id: 'martyrs',
    name: 'Stade des Martyrs',
    address: 'Avenue de la Libération, Lingwala',
    coords: { latitude: -4.3325, longitude: 15.2935 },
    icon: 'football',
  },
  {
    id: 'matonge',
    name: 'Matonge',
    address: 'Place Victoire, Kalamu',
    coords: { latitude: -4.3375, longitude: 15.3122 },
    icon: 'location',
  },
  {
    id: 'echangeur',
    name: "Tour de l'Échangeur",
    address: 'Boulevard Lumumba, Limete',
    coords: { latitude: -4.3522, longitude: 15.3419 },
    icon: 'location',
  },
  {
    id: 'kintambo',
    name: 'Kintambo Magasin',
    address: 'Rond-point Kintambo, Kintambo',
    coords: { latitude: -4.3272, longitude: 15.2742 },
    icon: 'location',
  },
  {
    id: 'fleuve',
    name: 'Hôtel Fleuve Congo',
    address: 'Boulevard du 30 Juin, Gombe',
    coords: { latitude: -4.3016, longitude: 15.3036 },
    icon: 'business',
  },
  {
    id: 'bandal',
    name: 'Bandalungwa',
    address: 'Avenue Kasa-Vubu, Bandal',
    coords: { latitude: -4.3481, longitude: 15.2856 },
    icon: 'location',
  },
  {
    id: 'masina',
    name: 'Marché de la Liberté',
    address: 'Boulevard Lumumba, Masina',
    coords: { latitude: -4.3811, longitude: 15.3912 },
    icon: 'cart',
  },
];

export const SAVED_PLACES: Place[] = [
  {
    id: 'home',
    name: 'Maison',
    address: 'Avenue de la Paix, Ngaliema',
    coords: { latitude: -4.3389, longitude: 15.2567 },
    icon: 'home',
  },
  {
    id: 'work',
    name: 'Travail',
    address: 'Boulevard du 30 Juin, Gombe',
    coords: { latitude: -4.3068, longitude: 15.3108 },
    icon: 'briefcase',
  },
];
