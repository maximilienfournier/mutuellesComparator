const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents April (février 2026).
 * Produit : Santé Mix, 7 niveaux.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * SIREN corrigé : 378724530 (April Santé Prévoyance).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'April',
    siren: '378724530',
    formules: {
      'Santé Mix N1': { pourcentageBR: 100 },
      'Santé Mix N2': { pourcentageBR: 100 },
      'Santé Mix N3': { pourcentageBR: 125 },
      'Santé Mix N4': { pourcentageBR: 150 },
      'Santé Mix N5': { pourcentageBR: 175 },
      'Santé Mix N6': { pourcentageBR: 200 },
      'Santé Mix N7': { pourcentageBR: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.7
  });
}

module.exports = { getVerifiedData };
