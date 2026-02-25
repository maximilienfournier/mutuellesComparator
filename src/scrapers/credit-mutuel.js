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
 * Texte exact du PDF :
 *   - Matériel médical (hors aides auditives)
 *     PRIMO : 100%
 *     NIVEAU 15 : 100 % + 75 €
 *     NIVEAU 20 : 100 % + 100 €
 *     NIVEAU 30 : 100% + 150 €
 *     NIVEAU 40 : 100% + 225 €
 *
 * 5 niveaux avec format hybride : 100% BR + forfait annuel par bénéficiaire.
 * Le forfait couvre les dépassements au-delà de la base de remboursement.
 *
 * ACM IARD SA — 352 406 748 RCS Strasbourg (pied de page du PDF).
 * Note : l'ancien SIREN 353073075 correspondait à ACM Vie SA (même groupe).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Crédit Mutuel (ACM)',
    siren: '352406748',
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
