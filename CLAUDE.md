# Mutuelles Comparator — Semelles Orthopédiques

## Objectif

Comparer les conditions de remboursement des semelles orthopédiques entre différentes mutuelles françaises. Permettre à un utilisateur de trouver rapidement quelle mutuelle offre le meilleur remboursement selon sa situation.

## Stack

- **Backend** : Node.js
- **Tests** : Jest
- **Données** : JSON (fichier local `data/mutuelles.json`)

## Structure

```
mutuellesComparator/
├── CLAUDE.md              # Ce fichier
├── data/
│   └── mutuelles.json     # Base de données des mutuelles et remboursements
├── src/
│   ├── index.js           # Point d'entrée
│   ├── comparator.js      # Logique de comparaison
│   └── formatter.js       # Formatage des résultats
├── tests/
│   ├── comparator.test.js # Tests de la logique de comparaison
│   └── formatter.test.js  # Tests du formatage
└── package.json
```

## Fonctions principales

- `loadMutuelles()` — Charge les données des mutuelles depuis le JSON
- `comparerRemboursements(options)` — Compare les remboursements selon critères (prix semelles, fréquence, etc.)
- `trouverMeilleure(options)` — Retourne la mutuelle avec le meilleur remboursement
- `formaterResultats(resultats)` — Formate les résultats pour affichage

## Modèle de données (mutuelle)

```json
{
  "nom": "Nom de la mutuelle",
  "remboursementMax": 120,
  "pourcentage": 100,
  "plafondAnnuel": 240,
  "frequence": "1 paire par an",
  "conditions": "Sur prescription médicale",
  "baseSecu": 28.86
}
```
