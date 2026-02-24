# Mutuelles Comparator — Semelles Orthopédiques

## Objectif

Comparer les conditions de remboursement des semelles orthopédiques entre différentes mutuelles françaises. Permettre à un utilisateur de trouver rapidement quelle mutuelle offre le meilleur remboursement selon sa situation.

## Stack

- **Backend** : Node.js
- **Tests** : Jest
- **Données** : JSON (fichier local `data/mutuelles.json`)
- **API externe** : API Recherche d'Entreprises (data.gouv.fr) pour enrichir les métadonnées

## Structure

```
mutuellesComparator/
├── CLAUDE.md              # Ce fichier
├── data/
│   └── mutuelles.json     # 13 mutuelles réelles avec formules et % BR
├── src/
│   ├── index.js           # Point d'entrée CLI
│   ├── comparator.js      # Logique de comparaison (% BR, formules)
│   ├── formatter.js       # Formatage des résultats
│   └── api.js             # Client API Recherche d'Entreprises
├── tests/
│   ├── comparator.test.js # Tests de la logique de comparaison
│   ├── formatter.test.js  # Tests du formatage
│   └── api.test.js        # Tests d'intégration API
└── package.json
```

## Fonctions principales

- `loadMutuelles()` — Charge les données des mutuelles depuis le JSON
- `calculerRemboursement(mutuelle, formuleNom, prixSemelles)` — Calcule le remboursement pour une formule donnée
- `comparerRemboursements(mutuelles, prixSemelles, formuleFilter?)` — Compare toutes les formules de toutes les mutuelles
- `trouverMeilleure(mutuelles, prixSemelles)` — Retourne la formule avec le meilleur remboursement
- `rechercherMutuelles({ page, perPage, query })` — Recherche des mutuelles via l'API gouv
- `enrichirMutuelles(mutuelles)` — Enrichit les données locales avec l'API (adresse, taille, etc.)

## Modèle de données (mutuelle)

```json
{
  "nom": "Harmonie Mutuelle",
  "siren": "538518473",
  "formules": {
    "Essentiel": { "pourcentageBR": 60 },
    "Optimum": { "pourcentageBR": 300 }
  },
  "forfaitAnnuel": null,
  "frequence": "1 paire par an",
  "conditions": "Sur prescription médicale"
}
```

## Constantes

- **Base Sécu** : 28.86 € (pointure > 37)
- **Taux Sécu** : 60 % en parcours de soins coordonnés
- Le `pourcentageBR` inclut la part Sécu (ex : 300% BR = remboursement total de 86.58 €)
