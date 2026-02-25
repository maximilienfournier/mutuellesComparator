const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Aésio Mutuelle (février 2026).
 * Données partielles multi-produits : Santé Particuliers et Santé Pro.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Simplification : on garde les formules les plus représentatives avec
 * les niveaux confirmés (N3=150% Particuliers, N5=350% et N6=500% Pro).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Aésio Mutuelle',
    siren: '775627391',
    formules: {
      'Santé Particuliers N3': { pourcentageBR: 150 },
      'Santé Pro N5': { pourcentageBR: 350 },
      'Santé Pro N6': { pourcentageBR: 500 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.7
  });
}

module.exports = { getVerifiedData };
