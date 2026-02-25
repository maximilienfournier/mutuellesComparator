const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents MGEFI (février 2026).
 * Produit principal : Mgéfi Santé, 3 formules.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Note : MGEFI propose aussi l'offre VicTerria mais les données sont
 * similaires pour l'offre principale Mgéfi Santé.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'MGEFI',
    siren: '499982098',
    formules: {
      'Mgéfi Maitri': { pourcentageBR: 100 },
      'Mgéfi Vita 2': { pourcentageBR: 200 },
      'Mgéfi Multi 2': { pourcentageBR: 200 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
