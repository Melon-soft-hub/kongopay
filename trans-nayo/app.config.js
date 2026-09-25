// Ajoute la clé Google Maps (Android) depuis l'environnement, sans la versionner.
// Exemple : GOOGLE_MAPS_API_KEY=xxx npx eas-cli@latest build -p android
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY }],
  ],
});
