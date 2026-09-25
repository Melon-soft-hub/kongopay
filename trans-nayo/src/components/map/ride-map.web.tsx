import { StyleSheet, View, useWindowDimensions } from 'react-native';

import type { LatLng } from '@/lib/geo';

import { DestinationPin, DriverPin, NearbyCarPin, PickupPin } from './map-markers';
import type { RideMapProps } from './ride-map.types';

/**
 * react-native-maps ne fonctionne pas sur le web : on affiche une carte
 * stylisée (rues, fleuve Congo, itinéraire) pour la prévisualisation web.
 */
export function RideMap({ pickup, destination, driver, driverHeading = 0, route, nearbyDrivers, bottomInset = 0, topInset = 0, style }: RideMapProps) {
  const { width, height } = useWindowDimensions();

  const points = [pickup, destination, driver, ...(route ?? []), ...(nearbyDrivers ?? [])].filter((p): p is LatLng => !!p);
  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  const pad = 0.012;
  const minLat = Math.min(...lats) - pad;
  const maxLat = Math.max(...lats) + pad;
  const minLon = Math.min(...lons) - pad;
  const maxLon = Math.max(...lons) + pad;

  const areaTop = topInset + 70;
  const areaHeight = Math.max(120, height - bottomInset - areaTop - 30);
  const areaLeft = 40;
  const areaWidth = width - 80;
  // Même échelle sur les deux axes pour ne pas déformer la carte.
  const scale = Math.min(areaWidth / (maxLon - minLon), areaHeight / (maxLat - minLat));
  const offsetX = areaLeft + (areaWidth - (maxLon - minLon) * scale) / 2;
  const offsetY = areaTop + (areaHeight - (maxLat - minLat) * scale) / 2;

  const project = (p: LatLng) => ({
    left: offsetX + (p.longitude - minLon) * scale,
    top: offsetY + (maxLat - p.latitude) * scale,
  });

  const at = (p: LatLng, size: number) => {
    const { left, top } = project(p);
    return { position: 'absolute' as const, left: left - size / 2, top: top - size / 2 };
  };

  const segments = (route ?? []).slice(1).map((p, i) => {
    const a = project(route![i]);
    const b = project(p);
    const len = Math.hypot(b.left - a.left, b.top - a.top);
    const angle = Math.atan2(b.top - a.top, b.left - a.left);
    return {
      key: i,
      style: {
        position: 'absolute' as const,
        left: (a.left + b.left) / 2 - len / 2,
        top: (a.top + b.top) / 2 - 2.5,
        width: len + 2,
        height: 5,
        transform: [{ rotate: `${angle}rad` }],
      },
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.map, style]} pointerEvents="none">
      {Array.from({ length: 14 }, (_, i) => (
        <View key={`h${i}`} style={[styles.street, { top: `${i * 7.5}%`, left: 0, right: 0, height: i % 4 === 0 ? 10 : 5 }]} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <View key={`v${i}`} style={[styles.street, { left: `${i * 11}%`, top: 0, bottom: 0, width: i % 3 === 0 ? 10 : 5 }]} />
      ))}
      <View style={styles.avenue} />
      <View style={styles.river} />
      <View style={[styles.park, { top: '38%', left: '8%' }]} />
      <View style={[styles.park, { top: '62%', right: '12%', width: 90 }]} />
      {segments.map((s) => (
        <View key={s.key} style={[s.style, styles.route]} />
      ))}
      {nearbyDrivers?.map((coord, i) => (
        <View key={i} style={at(coord, 30)}>
          <NearbyCarPin />
        </View>
      ))}
      <View style={at(pickup, 26)}>
        <PickupPin />
      </View>
      {destination ? (
        <View style={at(destination, 22)}>
          <DestinationPin />
        </View>
      ) : null}
      {driver ? (
        <View style={at(driver, 36)}>
          <DriverPin rotation={driverHeading} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { backgroundColor: '#EEF0F5', overflow: 'hidden' },
  street: { position: 'absolute', backgroundColor: '#FFFFFF' },
  avenue: {
    position: 'absolute',
    top: '45%',
    left: '-10%',
    width: '130%',
    height: 14,
    backgroundColor: '#FDF0C4',
    transform: [{ rotate: '-18deg' }],
  },
  river: {
    position: 'absolute',
    top: -60,
    left: '-10%',
    width: '130%',
    height: 110,
    backgroundColor: '#CFE4FF',
    transform: [{ rotate: '-6deg' }],
  },
  park: { position: 'absolute', width: 70, height: 50, borderRadius: 12, backgroundColor: '#DDF3E4' },
  route: { backgroundColor: '#0F1B2D', borderRadius: 3 },
});
