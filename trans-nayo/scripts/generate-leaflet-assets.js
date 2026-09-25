// Embarque Leaflet dans l'application pour que la carte ne dépende d'aucun CDN.
// À relancer après une mise à jour du paquet leaflet : node scripts/generate-leaflet-assets.js
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'node_modules', 'leaflet', 'dist');
const js = fs.readFileSync(path.join(dist, 'leaflet.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = fs.readFileSync(path.join(dist, 'leaflet.css'), 'utf8');
const { version } = require(path.join(dist, '..', 'package.json'));

const out = `// Fichier généré par scripts/generate-leaflet-assets.js — ne pas modifier.
// Leaflet ${version} (BSD-2-Clause) © Volodymyr Agafonkin, CloudMade et contributeurs.
export const LEAFLET_JS = ${JSON.stringify(js)};
export const LEAFLET_CSS = ${JSON.stringify(css)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'components', 'map', 'leaflet-assets.ts'), out);
console.log(`Leaflet ${version} embarqué (${Math.round(out.length / 1024)} Ko).`);
