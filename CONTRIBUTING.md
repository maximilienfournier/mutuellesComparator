# Guide de contribution — Mutuelles Comparator

## Workflow de développement

### Principe : une tâche = une issue = une branche

1. Créer une **GitHub Issue** décrivant le travail à faire
2. Créer une **branche dédiée** depuis `master` (ex : `task-12-description-courte`)
3. Travailler sur la branche, committer régulièrement
4. Lancer les tests avant de proposer le merge
5. Créer une PR, lancer le subagent reviewer (voir `~/Claude/CLAUDE.md` étape 8), merger après approbation

### Validation avant merge

```bash
npm test
```

## Qualité de code

### Principes généraux

- **Simplicité** — Écrire le code le plus simple qui résout le problème.
- **Fiabilité des données** — Toujours renseigner `dataSource`, `confidenceScore` et `lastUpdated` pour chaque mutuelle.
- **Un scraper = un fichier** — Chaque mutuelle a son propre scraper dans `src/scrapers/`, basé sur l'infrastructure partagée (`utils.js`).

### Structure du code

- **Logique métier** (`src/comparator.js`, `src/formatter.js`) — Fonctions pures et testables.
- **Scrapers** (`src/scrapers/`) — Un fichier par mutuelle avec `getVerifiedData()` + `scrape()`. Référence : `harmonie-mutuelle.js`.
- **Données** (`data/mutuelles.json`) — Source unique de vérité. Toujours mettre à jour via les scrapers.

## Tests

### Structure

```
tests/
├── comparator.test.js    # Tests logique de comparaison
├── formatter.test.js     # Tests formatage
├── api.test.js           # Tests API
└── scrapers/             # Tests par scraper
```

### Quand écrire des tests

| Modification | Tests attendus |
|---|---|
| Nouveau scraper | Test unitaire + test de cohérence avec mutuelles.json |
| Modification logique de comparaison | Test unitaire : cas nominaux, cas limites |
| Nouvelle route API | Test : codes de retour, validation, cas d'erreur |
| Bug fix | Test de non-régression reproduisant le bug |
| Ajout/modification de mutuelle | Vérifier la cohérence des données |

### Bonnes pratiques pour les tests

- **Tester le comportement, pas l'implémentation.**
- **Un test = un cas.**
- **Nommer clairement** — Le nom du test décrit le scénario et le résultat attendu.
- **Ne jamais appeler de services externes dans les tests** — Mocker les appels HTTP.
- **Couvrir les cas d'erreur** — Entrées invalides, mutuelles sans formules.

### Lancer les tests

```bash
npm test
```
