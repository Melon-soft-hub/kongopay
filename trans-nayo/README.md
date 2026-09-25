# Trans-nayo 🚕

Application mobile de réservation de courses (VTC) pour Kinshasa : moto, taxi, confort et van,
avec paiement en espèces, portefeuille intégré ou mobile money (M-Pesa, Orange Money, Airtel Money).

Construite avec **React Native + Expo (SDK 57)** et **Expo Router** : un seul code TypeScript pour Android, iOS et le web.

## Fonctionnalités

| Écran | Contenu |
| --- | --- |
| Bienvenue / connexion | Présentation, inscription par numéro +243 et code SMS (OTP) |
| Accueil | Carte avec véhicules proches, recherche, adresses enregistrées (Maison, Travail), services |
| Recherche | Point de départ et destination, lieux populaires de Kinshasa, trajets récents |
| Choix de la course | Itinéraire, 4 catégories de véhicules avec prix et durée estimés, moyen de paiement |
| Suivi en temps réel | Recherche du chauffeur, approche, code de prise en charge, trajet, appel / SMS / partage / SOS |
| Fin de course | Récapitulatif, note du chauffeur, pourboire |
| Trajets | Historique, total dépensé, « Refaire ce trajet » |
| Portefeuille | Solde, recharge mobile money, moyen de paiement par défaut, transactions |
| Profil | Infos du compte, parrainage, adresses, paramètres, déconnexion |

Les données (compte, solde, historique) sont conservées sur l'appareil avec AsyncStorage.

## Démarrer

```bash
cd trans-nayo
npm install
npx expo start
```

Scannez ensuite le QR code avec l'application **Expo Go** (Android / iOS), ou appuyez sur `w` pour la version web.

En mode démo, n'importe quel code à 4 chiffres est accepté à l'étape de vérification.

## Vérifications

```bash
npm run lint
npm run typecheck
```

## Structure

```
src/
  app/                 Écrans (Expo Router : un fichier = une route)
    (auth)/            Bienvenue, connexion, vérification OTP
    (tabs)/            Accueil, Trajets, Portefeuille, Profil
    ride/              Choix de la course, suivi, fin de course
    search.tsx         Recherche de destination (modale)
    topup.tsx          Recharge du portefeuille (modale)
  components/
    map/               Carte native (react-native-maps) et carte stylisée pour le web
    ui/                Boutons, lignes de liste, avatar, logo…
  constants/           Thème, lieux, véhicules et tarifs, moyens de paiement, chauffeurs
  hooks/               Simulation du cycle de vie d'une course
  lib/                 Géographie, tarification, formatage (FC, km, durées)
  store/               État global (compte, course, portefeuille) et persistance
```

## Tarifs

Les tarifs se règlent dans `src/constants/vehicles.ts` (prise en charge + prix au km, en francs congolais),
et la liste des lieux proposés dans `src/constants/places.ts`.

## Mise en production

Cette version est une application front-end complète avec des données simulées. Pour la production, il faut brancher :

- **Authentification** : un service d'envoi de SMS/OTP (`src/app/(auth)/verify.tsx`).
- **Courses** : une API et des mises à jour temps réel (WebSocket) pour remplacer `src/hooks/use-ride-simulation.ts`
  et les chauffeurs fictifs de `src/constants/drivers.ts`.
- **Itinéraires** : une API d'itinéraires (Google Directions, Mapbox, OSRM…) à la place de `buildRoute` dans `src/lib/geo.ts`.
- **Paiements** : les API marchandes M-Pesa, Orange Money et Airtel Money (`src/app/topup.tsx`).
- **Google Maps sur Android** : définir `GOOGLE_MAPS_API_KEY` lors du build (voir `app.config.js`).

Build des applications avec EAS :

```bash
npx eas-cli@latest build -p android
npx eas-cli@latest build -p ios
```
