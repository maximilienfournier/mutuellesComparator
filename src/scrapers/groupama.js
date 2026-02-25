const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Groupama (février 2026).
 * Gamme : Santé Active, 5 niveaux.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Note : Niveaux 1 et 5 sont des estimations déduites des niveaux confirmés
 * (2=130%, 3=150%, 4=200%). D'où confidenceScore à 0.5.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Groupama',
    siren: '343115135',
    formules: {
      'Santé Active Niveau 1': { pourcentageBR: 100 },
      'Santé Active Niveau 2': { pourcentageBR: 130 },
      'Santé Active Niveau 3': { pourcentageBR: 150 },
      'Santé Active Niveau 4': { pourcentageBR: 200 },
      'Santé Active Niveau 5': { pourcentageBR: 250 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.5
  });
}

module.exports = { getVerifiedData };
