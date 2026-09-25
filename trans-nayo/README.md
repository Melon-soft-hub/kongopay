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

## Télécharger l'application (Android)

À chaque modification poussée, GitHub Actions (workflow `.github/workflows/android-apk.yml`) :

1. compile deux APK optimisés : **Trans-nayo.apk** (téléphones 64 bits, la grande majorité)
   et **Trans-nayo-32bits.apk** (anciens téléphones et Android Go) ;
2. les teste sur un émulateur Android (`scripts/smoke_test.py` : inscription, accueil, commande d'une course) ;
3. les publie dans l'onglet **Releases** du dépôt (pré-version `trans-nayo-build-N`).

Sur le téléphone Android : ouvrez la page de la release dans **Chrome** (pas dans le navigateur
intégré d'une autre application), téléchargez l'APK, ouvrez-le et autorisez l'installation
depuis cette source si Android le demande.

L'APK est signé avec la clé de débogage générée par Expo : parfait pour tester et distribuer
directement. Pour le Google Play Store, il faut un build signé avec votre propre clé
(`npx eas-cli@latest build -p android` produit un fichier `.aab` prêt pour le Play Store).

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
    map/               Carte Leaflet + OpenStreetMap (WebView) et carte stylisée pour le web
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
- **Tuiles de carte** : la carte utilise les tuiles gratuites CARTO / OpenStreetMap, sans clé d'API.
  Pour un usage commercial à grande échelle, prendre un fournisseur sous contrat (MapTiler, Stadia Maps, Mapbox…)
  et changer `TILE_URL` dans `src/components/map/map-html.ts`.

Build des applications avec EAS :

```bash
npx eas-cli@latest build -p android
npx eas-cli@latest build -p ios
```
