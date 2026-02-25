const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Macif / Apivia (février 2026).
 * Gamme : Apivia Vitamin, 5 niveaux (V1 à V5).
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * SIREN corrigé : 779558501 (Macif - Mutuelle Assurance des Commerçants
 * et Industriels de France).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Macif (Apivia)',
    siren: '779558501',
    formules: {
      'Vitamin V1': { pourcentageBR: 100 },
      'Vitamin V2': { pourcentageBR: 125 },
      'Vitamin V3': { pourcentageBR: 150 },
      'Vitamin V4': { pourcentageBR: 175 },
      'Vitamin V5': { pourcentageBR: 200 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.5
  });
}

module.exports = { getVerifiedData };
