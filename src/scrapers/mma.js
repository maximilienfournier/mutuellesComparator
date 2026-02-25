const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents MMA (février 2026).
 * Gamme : 5 formules × 4 niveaux. On retient les formules les plus représentatives.
 * Ligne de garantie : "Petit appareillage / orthopédie".
 *
 * Simplification : les niveaux sont regroupés par %BR identiques.
 * - Vitale Niv.4 = 150%, Essentielle Niv.4 = 200%
 * - Famille/Confort : Niv.1=125%, Niv.2=150%, Niv.3=200%, Niv.4=300%
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'MMA',
    siren: '440048882',
    formules: {
      'Famille Niveau 1': { pourcentageBR: 125 },
      'Vitale Niveau 4': { pourcentageBR: 150 },
      'Essentielle Niveau 4': { pourcentageBR: 200 },
      'Famille Niveau 3': { pourcentageBR: 200 },
      'Famille Niveau 4': { pourcentageBR: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.8
  });
}

module.exports = { getVerifiedData };
