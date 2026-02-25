const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents La Mutuelle Générale (février 2026).
 * Produit : Itineo Dynamisme, 4 formules.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Note : les estimations initiales surestimaient largement les taux (200-300% BR).
 * En réalité, le max est 115% BR pour la formule Exigence.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'La Mutuelle Générale',
    siren: '775685340',
    formules: {
      'Itineo Eco': { pourcentageBR: 100 },
      'Itineo Essentiel': { pourcentageBR: 100 },
      'Itineo Renfort': { pourcentageBR: 100 },
      'Itineo Exigence': { pourcentageBR: 115 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.7
  });
}

module.exports = { getVerifiedData };
