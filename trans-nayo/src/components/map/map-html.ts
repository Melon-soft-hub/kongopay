import { Colors } from '@/constants/colors';

import { LEAFLET_CSS, LEAFLET_JS } from './leaflet-assets';

/**
 * Tuiles CARTO (données OpenStreetMap), utilisables sans clé d'API.
 * Pour un usage commercial à grande échelle, passer à un fournisseur avec
 * contrat (MapTiler, Stadia Maps, Mapbox…) en changeant simplement cette URL.
 */
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = '© OpenStreetMap © CARTO';

/**
 * Page HTML de la carte, chargée dans une WebView. React Native lui envoie
 * l'état à afficher via window.updateMap({...}).
 */
export function buildMapHtml(center: { latitude: number; longitude: number }): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>${LEAFLET_CSS}</style>
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #EEF0F5; }
  .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.7) !important; }
  .pin { box-sizing: border-box; }
  .pickup { width: 26px; height: 26px; border-radius: 13px; background: rgba(10,124,255,0.2); display: flex; align-items: center; justify-content: center; }
  .pickup::after { content: ''; width: 14px; height: 14px; border-radius: 7px; background: ${Colors.blue}; border: 3px solid #fff; box-sizing: border-box; }
  .dest { width: 22px; height: 22px; border-radius: 4px; background: ${Colors.ink}; display: flex; align-items: center; justify-content: center; }
  .dest::after { content: ''; width: 8px; height: 8px; border-radius: 1px; background: ${Colors.primary}; }
  .driver { width: 38px; height: 38px; border-radius: 19px; background: ${Colors.primary}; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(15,27,45,0.3); display: flex; align-items: center; justify-content: center; }
  .driver svg { transition: transform 0.4s linear; }
  .nearby { width: 30px; height: 30px; border-radius: 15px; background: #fff; box-shadow: 0 1px 4px rgba(15,27,45,0.25); display: flex; align-items: center; justify-content: center; }
  .leaflet-marker-icon.driver-marker { transition: transform 0.4s linear; }
</style>
<script>${LEAFLET_JS}</script>
</head>
<body>
<div id="map"></div>
<script>
  var ARROW = '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="${Colors.ink}" d="M21 3 3 10.5l7.2 1.8 1.8 7.2z"/></svg>';
  var CAR = '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="${Colors.ink}" d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2zm2.1 0h9.8l-1-3.2a1 1 0 0 0-1-.8H9.1a1 1 0 0 0-1 .8z"/></svg>';

  var map = L.map('map', { zoomControl: false, attributionControl: true })
    .setView([${center.latitude}, ${center.longitude}], 14);
  L.tileLayer('${TILE_URL}', { subdomains: 'abcd', maxZoom: 19, attribution: '${ATTRIBUTION}' }).addTo(map);
  map.attributionControl.setPrefix(false);

  function icon(cls, size, html) {
    return L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2], html: '<div class="pin ' + cls + '">' + (html || '') + '</div>' });
  }
  function ll(p) { return [p.latitude, p.longitude]; }

  var pickup = null, dest = null, driver = null, route = null, nearby = [];
  var lastFit = '';

  window.updateMap = function (s) {
    if (!pickup) pickup = L.marker(ll(s.pickup), { icon: icon('pickup', 26), zIndexOffset: 500 }).addTo(map);
    pickup.setLatLng(ll(s.pickup));

    if (s.destination) {
      if (!dest) dest = L.marker(ll(s.destination), { icon: icon('dest', 22), zIndexOffset: 400 }).addTo(map);
      dest.setLatLng(ll(s.destination));
    } else if (dest) { map.removeLayer(dest); dest = null; }

    if (s.route && s.route.length > 1) {
      var pts = s.route.map(ll);
      if (!route) route = L.polyline(pts, { color: '${Colors.ink}', weight: 5, lineCap: 'round', lineJoin: 'round' }).addTo(map);
      else route.setLatLngs(pts);
    } else if (route) { map.removeLayer(route); route = null; }

    nearby.forEach(function (m) { map.removeLayer(m); });
    nearby = (s.nearby || []).map(function (p) { return L.marker(ll(p), { icon: icon('nearby', 30, CAR) }).addTo(map); });

    if (s.driver) {
      if (!driver) driver = L.marker(ll(s.driver), { icon: icon('driver', 38, ARROW), zIndexOffset: 1000 }).addTo(map);
      driver.setLatLng(ll(s.driver));
      var el = driver.getElement();
      var svg = el && el.querySelector('svg');
      // La flèche dessinée pointe vers le nord-est : on compense de 45°.
      if (svg) svg.style.transform = 'rotate(' + ((s.heading || 0) - 45) + 'deg)';
    } else if (driver) { map.removeLayer(driver); driver = null; }

    // Recadrage uniquement quand les points principaux changent, pas à chaque déplacement du chauffeur.
    var key = JSON.stringify([s.pickup, s.destination, !!s.driver, s.nearby && s.nearby.length, s.top, s.bottom]);
    if (key === lastFit) return;
    lastFit = key;
    var bounds = [ll(s.pickup)];
    if (s.destination) bounds.push(ll(s.destination));
    if (s.driver) bounds.push(ll(s.driver));
    (s.nearby || []).forEach(function (p) { bounds.push(ll(p)); });
    var opts = { paddingTopLeft: [40, (s.top || 0) + 80], paddingBottomRight: [40, (s.bottom || 0) + 40], maxZoom: 15, animate: true };
    if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds), opts);
    else map.fitBounds(L.latLng(ll(s.pickup)).toBounds(1500), opts);
  };

  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('ready');
</script>
</body>
</html>`;
}
