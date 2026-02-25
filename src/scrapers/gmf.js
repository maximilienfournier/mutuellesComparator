const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les conditions générales GMF et comparateurs (février 2026).
 * Produit : Santé Pass, 4 niveaux (3 modules modulables × 4 niveaux chacun).
 * Ligne de garantie : "Médicaments, vaccins et petits appareillages prescrits
 * et remboursés par la Sécurité sociale" (module Soins Courants).
 *
 * Sources :
 * - Conditions générales GMF (PDF officiel 2016) : classification petit appareillage
 *   https://guide.reassurez-moi.fr/guide/wp-content/uploads/2016/06/conditions-generales-mutuelle-sante-GMF.pdf
 * - aayassur.com : tableau complet %BR par poste et par niveau (1-3)
 * - lesmutuellespascheres.com : extraits niveau 4 (matériel médical 220%, plafond 3000€/an)
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'GMF',
    siren: '398972901',
    formules: {
      'Santé Pass Niveau 1': { pourcentageBR: 100 },
      'Santé Pass Niveau 2': { pourcentageBR: 125 },
      'Santé Pass Niveau 3': { pourcentageBR: 175 },
      'Santé Pass Niveau 4': { pourcentageBR: 220 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale. Plafond matériel médical 3000€/an au niveau 4.',
    dataSource: 'scraped',
    confidenceScore: 0.6
  });
}

module.exports = { getVerifiedData };
