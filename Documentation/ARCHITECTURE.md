# ARCHITECTURE — DreamsApp

## Vue d’ensemble
L’application suit une architecture **modulaire** simple et extensible, avec séparation nette **UI / services / types / constantes**. Le stockage est **local** via `AsyncStorage` (offline‑first).

```
dreams-report-app/
├── app/                         # point d’entrée Expo ; écrans & navigation
│   └── ...                      # (si Expo Router : fichiers/dossiers par écran)
├── components/
│   ├── DreamForm.tsx            # formulaire d’ajout/édition d’un rêve
│   ├── DreamList.tsx            # liste des rêves (lecture/suppression)
├── services/
│   └── AsyncStorageService.ts   # accès centralisé au stockage (CRUD)
├── constants/
│   └── AsyncStorageConfig.ts    # clés de persistance, constantes globales
├── interfaces/
│   └── DreamData.ts             # type/contrat de données d’un rêve
└── assets/                      # images, icônes, captures
```

> **Langage majoritaire** : TypeScript (~99%) — typage strict et DX améliorée.

## Flux de données
```mermaid
flowchart LR
UI[Composants (Form/List)] -->|create/update/read/delete| Service[AsyncStorageService]
Service -->|persiste JSON| Storage[(AsyncStorage)]
Storage -->|hydrate| UI
```
- **Entrée** : `DreamForm` collecte *titre, date, notes, tags…* puis **sérialise** vers `DreamData`.
- **Service** : `AsyncStorageService` implémente les fonctions `saveDream`, `getDreams`, `updateDream`, `deleteDream`.
- **Sortie** : `DreamList` récupère, trie/filtre et affiche ; actions (éditer/supprimer) renvoient au service.

## Navigation
- Dossier `app/` → structure compatible **Expo Router** (fichiers par écran).
- Routes usuelles : `index.tsx` (liste), `new.tsx` (création), `[id].tsx` (détail/édition). (*Adapter aux fichiers réels du projet*).

## UI / Design System
- **React Native Paper** : boutons, AppBar, TextInput, List, Dialog…
- Thème clair/sombre possible via le provider Paper.

## Persistance & Modèle
```ts
// interfaces/DreamData.ts (exemple)
export interface Dream {
  id: string;
  title: string;
  date: string;       // ISO 8601
  content: string;
  tags?: string[];
}
```
- **Clés de stockage** centralisées (`constants/AsyncStorageConfig.ts`) ex. `@dreams/list`.
- Données sérialisées en **JSON**.

## Erreurs & journalisation
- Les appels AsyncStorage sont **try/catch**és dans le service ; retourner des erreurs typées vers l’UI si besoin.
