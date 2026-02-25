const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Pro BTP (février 2026).
 * 6 niveaux S (S1 à S6).
 * Ligne de garantie : "Petit appareillage / orthopédie".
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Pro BTP',
    siren: '784621468',
    formules: {
      'S1': { pourcentageBR: 60 },
      'S2': { pourcentageBR: 100 },
      'S3': { pourcentageBR: 250 },
      'S4': { pourcentageBR: 350 },
      'S5': { pourcentageBR: 500 },
      'S6': { pourcentageBR: 550 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.6
  });
}

module.exports = { getVerifiedData };
