import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, type MapStyleElement } from 'react-native-maps';

import { Colors } from '@/constants/theme';

import { DestinationPin, DriverPin, NearbyCarPin, PickupPin } from './map-markers';
import type { RideMapProps } from './ride-map.types';

const DELTA = 0.035;

/** Style Google Maps épuré (Android) pour faire ressortir l'itinéraire. */
const MAP_STYLE: MapStyleElement[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdf3d3' }] },
  { featureType: 'landscape', stylers: [{ color: '#f2f3f7' }] },
  { featureType: 'water', stylers: [{ color: '#cfe4ff' }] },
];

export function RideMap({ pickup, destination, driver, driverHeading = 0, route, nearbyDrivers, bottomInset = 0, topInset = 0, style }: RideMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const points = [pickup, destination, driver].filter((p): p is NonNullable<typeof p> => !!p);
    if (points.length > 1) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: topInset + 80, right: 60, bottom: bottomInset + 60, left: 60 },
        animated: true,
      });
    } else {
      mapRef.current?.animateToRegion({ ...pickup, latitudeDelta: DELTA, longitudeDelta: DELTA }, 500);
    }
    // On ne recadre pas à chaque déplacement du chauffeur, seulement quand les points changent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, destination, !!driver, bottomInset, topInset]);

  return (
    <MapView
      ref={mapRef}
      style={[StyleSheet.absoluteFill, style]}
      initialRegion={{ ...pickup, latitudeDelta: DELTA, longitudeDelta: DELTA }}
      customMapStyle={MAP_STYLE}
      showsCompass={false}
      toolbarEnabled={false}
      showsPointsOfInterests={false}
      userInterfaceStyle="light">
      {route && route.length > 1 ? (
        <Polyline coordinates={route} strokeColor={Colors.ink} strokeWidth={5} lineCap="round" lineJoin="round" />
      ) : null}
      {nearbyDrivers?.map((coord, i) => (
        <Marker key={i} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <NearbyCarPin />
        </Marker>
      ))}
      <Marker coordinate={pickup} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
        <PickupPin />
      </Marker>
      {destination ? (
        <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <DestinationPin />
        </Marker>
      ) : null}
      {driver ? (
        <Marker coordinate={driver} anchor={{ x: 0.5, y: 0.5 }} flat>
          <DriverPin rotation={driverHeading} />
        </Marker>
      ) : null}
    </MapView>
  );
}
