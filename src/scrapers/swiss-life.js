const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le PDF officiel Swiss Life "Ma Santé" (février 2026).
 * Gamme Santé : 9 niveaux de remboursement pour le petit appareillage.
 * Ligne de garantie : "Prothèses et petit appareillage (dont orthopédie)".
 *
 * Source : tableau de garanties Swiss Life Santé (PDF texte).
 * SIREN corrigé : 322215021 (Swiss Life Assurance et Patrimoine).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Swiss Life',
    siren: '322215021',
    formules: {
      'Niveau 1': { pourcentageBR: 100 },
      'Niveau 2': { pourcentageBR: 100 },
      'Niveau 3': { pourcentageBR: 125 },
      'Niveau 4': { pourcentageBR: 150 },
      'Niveau 5': { pourcentageBR: 175 },
      'Niveau 6': { pourcentageBR: 200 },
      'Niveau 7': { pourcentageBR: 250 },
      'Niveau 8': { pourcentageBR: 300 },
      'Niveau 9': { pourcentageBR: 400 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
