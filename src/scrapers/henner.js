const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Henner (février 2026).
 * Produit : Privilèges P8, 7 formules (F1 à F7).
 * Ligne de garantie : "Petit appareillage / orthopédie".
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Henner',
    siren: '323377739',
    formules: {
      'Privilèges F1': { pourcentageBR: 100 },
      'Privilèges F2': { pourcentageBR: 120 },
      'Privilèges F3': { pourcentageBR: 150 },
      'Privilèges F4': { pourcentageBR: 170 },
      'Privilèges F5': { pourcentageBR: 200 },
      'Privilèges F6': { pourcentageBR: 250 },
      'Privilèges F7': { pourcentageBR: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.8
  });
}

module.exports = { getVerifiedData };
