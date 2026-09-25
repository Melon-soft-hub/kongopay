import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { buildMapHtml } from './map-html';
import type { RideMapProps } from './ride-map.types';

/**
 * Carte Leaflet + OpenStreetMap dans une WebView : aucune clé d'API requise,
 * fonctionne à l'identique sur Android, iOS et dans Expo Go.
 */
export function RideMap({ pickup, destination, driver, driverHeading = 0, route, nearbyDrivers, bottomInset = 0, topInset = 0, style }: RideMapProps) {
  const webRef = useRef<WebView>(null);
  const ready = useRef(false);
  // La page n'est construite qu'une fois ; les mises à jour passent par updateMap().
  const [initialCenter] = useState(pickup);
  const html = useMemo(() => buildMapHtml(initialCenter), [initialCenter]);

  const payload = JSON.stringify({
    pickup,
    destination: destination ?? null,
    driver: driver ?? null,
    heading: driverHeading,
    route: route ?? null,
    nearby: nearbyDrivers ?? [],
    top: topInset,
    bottom: bottomInset,
  });
  const latest = useRef(payload);

  useEffect(() => {
    latest.current = payload;
    if (ready.current) webRef.current?.injectJavaScript(`window.updateMap(${payload}); true;`);
  }, [payload]);

  return (
    <WebView
      ref={webRef}
      style={[StyleSheet.absoluteFill, styles.map, style]}
      source={{ html, baseUrl: 'https://transnayo.app/' }}
      originWhitelist={['*']}
      onMessage={(e) => {
        if (e.nativeEvent.data !== 'ready') return;
        ready.current = true;
        webRef.current?.injectJavaScript(`window.updateMap(${latest.current}); true;`);
      }}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      setSupportMultipleWindows={false}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}

const styles = StyleSheet.create({
  map: { backgroundColor: '#EEF0F5' },
});
