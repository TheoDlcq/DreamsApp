# DreamsApp — Journal de Rêves
> **README**

Ce dépôt correspond à une application *Expo / React Native / TypeScript* permettant de saisir et consulter des rêves avec persistance **locale** via `AsyncStorage` et une UI basée sur **React Native Paper**.

## Prérequis
- Node.js LTS (≥ 18)
- npm (ou pnpm/yarn)
- Smartphone avec **Expo Go** (iOS/Android) *ou* un émulateur Android/iOS
- (Optionnel) Git pour cloner le projet

## Installation
```bash
# 1) Cloner le projet
git clone https://github.com/TheoDlcq/DreamsApp
cd DreamsApp

# 2) Installer les dépendances
npm install
```

## Démarrer en développement
```bash
# Lancer le serveur Metro + outils Expo
npx expo start
```
- **Sur appareil physique** : scanner le QR code avec l’app **Expo Go**.
- **Sur émulateur** : choisir “Run on Android device/emulator”, “Run on iOS simulator” ou “Run Web” dans Expo DevTools.

### Astuce 
```bash
npx expo start -c
```
Réinitialise le cache si vous observez des comportements étranges.

## Commandes utiles (selon scripts du projet)
```bash
npm start           # alias de npx expo start
npm run android      
npm run ios         
```

## Build 
Pour un binaire de production, privilégier **EAS Build** (compte Expo requis).

## Structure rapide
Voir `ARCHITECTURE.md` pour le détail. L’essentiel :
```
app/                 # écrans / navigation (structure type Expo Router)
components/          # composants UI (ex: formulaires, listes)
services/            # logique d’accès aux données (AsyncStorageService.ts)
constants/           # constantes & clés de stockage (AsyncStorageConfig.ts)
interfaces/          # types/DTO (DreamData.ts)
assets/              # images, icônes…
```
