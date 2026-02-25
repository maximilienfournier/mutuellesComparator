const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le Règlement Mutualiste MGÉFI Santé 2026.
 * Source : « Règlement Mutualiste Mgéfi Santé — 2026 », Annexe I, page 32
 * https://www.mgefi.fr/sites/default/files/offre/statuts-reglements-mutualistes-mgefi.pdf
 *
 * Section : MATÉRIEL MÉDICAL > EQUIPEMENTS HORS PANIER 100% SANTÉ
 * Ligne de garantie : « Orthopédie / Prothèses (hors prothèses dentaires et auditives) /
 * Grand Appareillage »
 *
 * Sources par formule :
 * - Maitri Santé : PDF p.32 = 100% — lue directement
 * - Vita Santé 2 : PDF p.32 = 200% — lue directement
 * - Multi Santé 2 : PDF p.32 = 200% — lue directement
 *
 * Note : MGEFI propose aussi l'offre VicTerria (collectivités territoriales),
 * non incluse ici. Seule l'offre principale Mgéfi Santé est retenue.
 * SIREN : 499982098.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'MGEFI',
    siren: '499982098',
    formules: {
      'Mgéfi Maitri': { pourcentageBR: 100 },
      'Mgéfi Vita 2': { pourcentageBR: 200 },
      'Mgéfi Multi 2': { pourcentageBR: 200 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
