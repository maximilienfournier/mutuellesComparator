const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Crédit Mutuel / ACM (février 2026).
 * 6 niveaux avec format hybride : %BR + forfait annuel complémentaire.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Le forfait couvre les dépassements au-delà de la base de remboursement.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Crédit Mutuel (ACM)',
    siren: '353073075',
    formules: {
      'Niveau 1': { pourcentageBR: 100, forfaitAnnuel: 0 },
      'Niveau 2': { pourcentageBR: 100, forfaitAnnuel: 75 },
      'Niveau 3': { pourcentageBR: 100, forfaitAnnuel: 100 },
      'Niveau 4': { pourcentageBR: 100, forfaitAnnuel: 150 },
      'Niveau 5': { pourcentageBR: 100, forfaitAnnuel: 225 },
      'Niveau 6': { pourcentageBR: 100, forfaitAnnuel: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
