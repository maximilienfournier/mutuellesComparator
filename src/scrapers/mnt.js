const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents MNT (février 2026).
 * MNT distribue ses complémentaires via MGEN.
 * 5 formules : Essentielle, Équilibre, Confort, Optimale, Intégrale.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Note : les anciens noms "S1/S2/S3" étaient des estimations incorrectes.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'MNT',
    siren: '775678584',
    formules: {
      'Essentielle': { pourcentageBR: 100 },
      'Équilibre': { pourcentageBR: 100 },
      'Confort': { pourcentageBR: 160 },
      'Optimale': { pourcentageBR: 160 },
      'Intégrale': { pourcentageBR: 210 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale. Distribué via MGEN.',
    dataSource: 'scraped',
    confidenceScore: 0.7
  });
}

module.exports = { getVerifiedData };
