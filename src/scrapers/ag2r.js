const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents AG2R La Mondiale (février 2026).
 * Produit : PROTECVIA, 5 niveaux d'indice.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Note : Indice 20 exclu (non couvert ou minimal pour le petit appareillage).
 * Indice 45 est estimé/déduit entre Indice 30 et Indice 60.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'AG2R La Mondiale',
    siren: '486197757',
    formules: {
      'Protecvia Indice 30': { pourcentageBR: 100 },
      'Protecvia Indice 45': { pourcentageBR: 125 },
      'Protecvia Indice 60': { pourcentageBR: 150 },
      'Protecvia Indice 90': { pourcentageBR: 200 },
      'Protecvia Indice 120': { pourcentageBR: 250 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.7
  });
}

module.exports = { getVerifiedData };
