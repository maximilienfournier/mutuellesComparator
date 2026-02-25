const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Generali (février 2026).
 * Gamme : Santé Pro, 6 niveaux (P0 à P5).
 * Ligne de garantie : "Prothèses et petit appareillage / orthopédie".
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Generali',
    siren: '552062663',
    formules: {
      'Santé Pro P0': { pourcentageBR: 100 },
      'Santé Pro P1': { pourcentageBR: 100 },
      'Santé Pro P2': { pourcentageBR: 150 },
      'Santé Pro P3': { pourcentageBR: 200 },
      'Santé Pro P4': { pourcentageBR: 300 },
      'Santé Pro P5': { pourcentageBR: 500 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.7
  });
}

module.exports = { getVerifiedData };
