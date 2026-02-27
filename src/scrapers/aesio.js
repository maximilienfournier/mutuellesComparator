const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels Aésio Mutuelle (février 2026).
 * Données partielles multi-produits : Santé Particuliers et Santé Pro.
 * Ligne de garantie : "Orthopédie, accessoires, appareillage, produits"
 * (section "Matériel médical").
 *
 * Sources par formule :
 * - Santé Particuliers N3 : PDF officiel "AÉSIO Santé Particuliers Niveau 3
 *   + Option Eco Pharma" (réf 25-008-012-3, version 2026), page 1,
 *   section "Matériel médical" — donnée lue directement : 150% BR Total
 *   (60% AMO + 90% AMC).
 *   https://mutuelle.fr/61-aesio-mutuelle/870-aesio-sante-particuliers-niveau-3-option-eco-pharma/tableauGarantie.pdf
 *
 * - Santé Pro N5 : PDF officiel "AÉSIO Santé Pro Niveau 5"
 *   (réf 20-219-006), page 1, section "Matériel médical" — donnée lue
 *   directement : 350% BR Total (60 ou 100% AMO + 290 ou 250% AMC).
 *   https://www.coover.fr/wp-content/uploads/2021/05/aesio-mutuelle-garanties-5.pdf
 *
 * - Santé Pro N6 : PDF officiel "AÉSIO Santé Pro Niveau 6"
 *   (réf 20-007-016), page 1, section "Matériel médical" — donnée lue
 *   directement : 500% BR Total (60 ou 100% AMO + 440 ou 400% AMC).
 *   https://www.coover.fr/wp-content/uploads/2021/05/adrea-mutuelle-garanties-aesio-6.pdf
 *
 * Les trois %BR sont confirmés par lecture directe des tableaux de garanties.
 * SIREN : 775 627 391 (AÉSIO mutuelle, confirmé dans le PDF Particuliers N3).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Aésio Mutuelle',
    siren: '775627391',
    formules: {
      'Santé Particuliers N3': { pourcentageBR: 150, forfaitPodologie: { montantAnnuel: 90, montantParSeance: 30, nbSeancesMax: 3, enveloppePartagee: 'médecines complémentaires' } },
      'Santé Pro N5': { pourcentageBR: 350, forfaitPodologie: { montantAnnuel: 110, montantParSeance: null, nbSeancesMax: null, enveloppePartagee: 'médecines douces' } },
      'Santé Pro N6': { pourcentageBR: 500, forfaitPodologie: { montantAnnuel: 150, montantParSeance: null, nbSeancesMax: null, enveloppePartagee: 'médecines douces' } }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
