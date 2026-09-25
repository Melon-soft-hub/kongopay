import type { StyleProp, ViewStyle } from 'react-native';

import type { LatLng } from '@/lib/geo';

export type RideMapProps = {
  pickup: LatLng;
  destination?: LatLng | null;
  driver?: LatLng | null;
  /** Orientation du véhicule en degrés (0 = nord). */
  driverHeading?: number;
  route?: LatLng[];
  /** Véhicules disponibles aux alentours (écran d'accueil). */
  nearbyDrivers?: LatLng[];
  /** Hauteur masquée par le panneau du bas, pour recentrer la carte au-dessus. */
  bottomInset?: number;
  topInset?: number;
  style?: StyleProp<ViewStyle>;
};
