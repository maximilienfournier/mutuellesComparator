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
  "conditions": "Sur prescription médicale",
  "dataSource": "estimated",
  "confidenceScore": 0.2,
  "lastUpdated": null
}
```

## Fiabilité des données

Chaque mutuelle porte 3 champs de traçabilité :
- `dataSource` : `"estimated"` (inventé), `"scraped"` (scrapé depuis le site), `"official"` (source officielle/PDF)
- `confidenceScore` : `0.0` à `1.0` — fiabilité des %BR et formules
- `lastUpdated` : date ISO de la dernière mise à jour, `null` si jamais vérifié

| dataSource | confidenceScore typique | Signification |
|---|---|---|
| `estimated` | 0.1 – 0.3 | Données inventées, non vérifiées |
| `scraped` | 0.5 – 0.8 | Scrapé depuis le site web, peut être obsolète |
| `official` | 0.9 – 1.0 | Source officielle (PDF tableau de garanties, API) |

## Scrapers — Comment récupérer les données

### Architecture
- `src/scrapers/utils.js` — infrastructure partagée (`fetchPage`, `parsePourcentageBR`, `buildScrapedEntry`, `updateMutuellesJson`)
- `src/scrapers/<mutuelle>.js` — un scraper par mutuelle, avec `getVerifiedData()` + `scrape()` + runner standalone
- `tests/scrapers/<mutuelle>.test.js` — tests unitaires + cohérence avec mutuelles.json
- Référence : `src/scrapers/harmonie-mutuelle.js`

### Lire les PDFs de tableaux de garanties
Beaucoup de mutuelles publient leurs garanties en PDF. Deux cas :

1. **PDF texte** (Swiss Life, MAAF, etc.) → `WebFetch` fonctionne directement
2. **PDF image** (AXA, Generali, Pro BTP, Henner, Klesia, etc.) → `WebFetch` échoue (retourne du binaire)

**Pour les PDFs image, utiliser `curl` + `Read` :**
```bash
curl -sL -o /tmp/mutuelle-garanties.pdf '<URL_DU_PDF>'
```
Puis lire avec l'outil `Read` :
```
Read({ file_path: '/tmp/mutuelle-garanties.pdf' })
```
L'outil `Read` est **multimodal** : il rend le PDF visuellement et peut en extraire le texte, même si le PDF est en format image. Chercher la ligne "petit appareillage", "appareillage orthopédique" ou "orthopédie" dans le tableau.

### Chaque issue GitHub contient
- Un commentaire de **recherche préliminaire** avec les données trouvées, URLs, et corrections vs données estimées
- Un commentaire de **méthodologie de scraping** avec les commandes exactes à utiliser

## Constantes

- **Base Sécu** : 28.86 € (pointure > 37)
- **Taux Sécu** : 60 % en parcours de soins coordonnés
- Le `pourcentageBR` inclut la part Sécu (ex : 300% BR = remboursement total de 86.58 €)
