const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le PDF officiel ACM IARD SA (Crédit Mutuel) V. 01/2025.
 * Source : « Tableau de garanties Complémentaire Santé V. 01/2025 »
 * https://www.creditmutuel.fr/partage/fr/CC/telechargements/complementaire-sante/tableau-garanties-complementaire-sante.pdf
 *
 * Section : MATERIEL MEDICAL
 * Ligne de garantie : « Matériel médical (hors aides auditives) »
 * Page 2 du PDF.
 *
 * Sources par formule :
 * - Primo : PDF p.2 = 100% — lue directement
 * - Niveau 15 : PDF p.2 = 100% + 75€ — lue directement
 * - Niveau 20 : PDF p.2 = 100% + 100€ — lue directement
 * - Niveau 30 : PDF p.2 = 100% + 150€ — lue directement
 * - Niveau 40 : PDF p.2 = 100% + 225€ — lue directement
 *
 * Format hybride : 100% BR + forfait annuel par bénéficiaire.
 * Le forfait couvre les dépassements au-delà de la base de remboursement.
 *
 * Note : ACM IARD SA — 352 406 748 RCS Strasbourg (pied de page du PDF).
 * SIREN 353073075 = ACM Vie SA (même groupe Assurances du Crédit Mutuel).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Crédit Mutuel (ACM)',
    siren: '353073075',
    formules: {
      'Primo': { pourcentageBR: 100, forfaitAnnuel: 0 },
      'Niveau 15': { pourcentageBR: 100, forfaitAnnuel: 75 },
      'Niveau 20': { pourcentageBR: 100, forfaitAnnuel: 100 },
      'Niveau 30': { pourcentageBR: 100, forfaitAnnuel: 150 },
      'Niveau 40': { pourcentageBR: 100, forfaitAnnuel: 225 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
