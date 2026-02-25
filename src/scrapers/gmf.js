const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis des sources tierces pour GMF (février 2026).
 * Produit : Santé Pass, 3 niveaux.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Très faible confiance : pas de source officielle (PDF ou site) trouvée.
 * Les données proviennent uniquement de comparateurs tiers.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'GMF',
    siren: '398972901',
    formules: {
      'Santé Pass Niveau 1': { pourcentageBR: 100 },
      'Santé Pass Niveau 2': { pourcentageBR: 125 },
      'Santé Pass Niveau 3': { pourcentageBR: 175 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.4
  });
}

module.exports = { getVerifiedData };
