# Choix de conception et fonctionnalités implémentées

## Tech stack choisi
- Expo + React Native (TS) : développement mobile multiplateforme rapide.
- react-native-paper : composants UI cohérents et accessibles.
- AsyncStorage : persistance locale simple, suffisant pour ce type d’app.
- expo-router : routing par dossier (tabs).

## Fonctionnalités principales implémentées
- Création d’un rêve :
  - `title`, `dreamText`, `date`, `location`
  - `tags` et `characters` (sélection via menu)
  - `emotionBefore` / `emotionAfter` + intensités séparées (1..10)
  - `clarity` et `sleepQuality` (notes 1..10)
  - `meaning` (signification libre) et `tone` (positive/neutral/negative)
- Affichage :
  - Liste des rêves en cartes (`Card`), affichage date + lieu, émotions + intensités, tags/chips, signification et tonalité.
- Recherche :
  - Champ de recherche filtrant par titre, texte, tags, personnages et signification (insensible à la casse).
- Édition :
  - Crayon : charge le rêve dans le formulaire (draft en AsyncStorage). À la soumission, remplace l’entrée existante au même index.
- Suppression :
  - Icône poubelle sur chaque carte : suppression immédiate d’un rêve.
  - Cases à cocher sur chaque carte et bouton "Supprimer la sélection (N)" dans l’en‑tête pour suppression multiple.
- Gestion tags/personnages :
  - Écran `three.tsx` pour ajouter/supprimer items non‑par défaut.
  - Bouton “Réinitialiser les rêves” déplacé sur la 3ᵉ page (Gérer Tags).
- Robustesse :
  - Normalisation à la lecture dans `DreamList` pour ajouter des champs manquants et éviter les erreurs runtime (`.map` undefined etc.).
  - Défensive rendering pour listes (`(dream.tags || [])`).

## Contraintes & décisions
- Édition via draft AsyncStorage : simple et compatible avec la navigation actuelle. Alternative (modal inline) est possible mais demande plus de refactor.
- Pas de backend : tout est local — convient pour prototypage/persistance privée.
- UX : boutons d’intensité 1..10 pour contrôle visuel (rapide à choisir) au lieu d’un slider pour garder la précision et la compatibilité tactile.
- Sécurité : suppression multiple demande confirmation (recommandé). J’ai implémenté suppression mais sans Alert (à valider) — je peux ajouter la confirmation.

## Petits contrats (inputs/outputs)
- Input (formulaire) → Output (stored DreamData): shape conforme à `interfaces/DreamData.tsx`.
- Edit flow: input index + draft → modifier l’élément existant en AsyncStorage, success → UI rafraîchie.
- Error modes: si lecture AsyncStorage retourne null ou objets plus anciens, normalisation applique valeurs par défaut.
