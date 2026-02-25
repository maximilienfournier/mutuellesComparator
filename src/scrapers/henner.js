const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le PDF officiel Henner Privilèges Santé P8 (février 2026).
 * Source : « Tableau des Garanties Privilèges Santé » — particuliers.henner.com
 * https://particuliers.henner.com/app/uploads/2015/03/tableau-des-garanties-privileges-8.pdf
 *
 * Section : APPAREILLAGE ET PRESTATIONS DIVERSES
 * Ligne de garantie : « Appareillage - Orthopédie - Prothèses auditives »
 *
 * Sources par formule :
 * - F1 : PDF p.1 = 100% — lue directement
 * - F2 : PDF p.1 = 120% — lue directement
 * - F3 : PDF p.1 = 150% — lue directement
 * - F4 : PDF p.1 = 170% — lue directement
 * - F5 : PDF p.1 = 200% — lue directement
 * - F6 : PDF p.1 = 250% — lue directement
 * - F7 : PDF p.1 = 300% — lue directement
 *
 * Note : Henner est un courtier-gestionnaire (TPA), porteur de risque = Groupama Gan Vie.
 * Le produit P8 est remplacé par P10 (4 formules), mais P8 reste le mieux documenté.
 * SIREN : 323377739.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Henner',
    siren: '323377739',
    formules: {
      'Privilèges F1': { pourcentageBR: 100 },
      'Privilèges F2': { pourcentageBR: 120 },
      'Privilèges F3': { pourcentageBR: 150 },
      'Privilèges F4': { pourcentageBR: 170 },
      'Privilèges F5': { pourcentageBR: 200 },
      'Privilèges F6': { pourcentageBR: 250 },
      'Privilèges F7': { pourcentageBR: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
