const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Klesia (février 2026).
 * 4 formules avec format hybride : %BR + forfait annuel matériel médical.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Klesia',
    siren: '529168007',
    formules: {
      'Essentiel': { pourcentageBR: 100, forfaitAnnuel: 0 },
      'Équilibre': { pourcentageBR: 150, forfaitAnnuel: 100 },
      'Confort': { pourcentageBR: 200, forfaitAnnuel: 150 },
      'Premium': { pourcentageBR: 300, forfaitAnnuel: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
