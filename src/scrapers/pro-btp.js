const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels Pro BTP Santé (février 2026).
 * Gamme nationale PRO BTP Santé, en vigueur au 1er janvier 2025.
 *
 * Sources :
 * - Tableau de garanties PRO BTP Santé 2025 (gamme nationale, actifs) :
 *   https://www.probtp.com/files/live/sites/probtp/files/media/pdf/tableau_garanties_pro_btp_sante.pdf
 *   Page 2, section "Matériel médical", ligne "Appareillages orthopédiques et autres prothèses"
 *   => S1 = 100%, S2 = 250%, S3 = 350%, S3+ = 500%, S4 = 550%
 *
 * - Règlement des frais médicaux individuels des Retraités 2025 (gamme nationale) :
 *   https://www.probtp.com/files/live/sites/probtp/files/media/pdf/PART/sante/garanties-frais-medicaux-individuels-actifs-et-retraites.pdf
 *   Page 2, même ligne "Appareillages orthopédiques et autres prothèses"
 *   => S1 = 100%, S2 = 250%, S3 = 350%, S3+ = 500%, S4 = 550%, S5/S6 = 650%
 *
 * Note : le produit principal (actifs) comporte 5 niveaux S (S1, S2, S3, S3+, S4).
 * Le produit retraités ajoute un niveau S5/S6 à 650% BR.
 * On référence ici les 5 niveaux actifs + le niveau retraités S5/S6.
 *
 * SIREN : 784621468 (BTP-Prévoyance, confirmé en dernière page du PDF retraités).
 *
 * Données lues directement dans les PDFs officiels — confidenceScore 0.9.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Pro BTP',
    siren: '784621468',
    formules: {
      'S1': { pourcentageBR: 100 },
      'S2': { pourcentageBR: 250 },
      'S3': { pourcentageBR: 350 },
      'S3+': { pourcentageBR: 500 },
      'S4': { pourcentageBR: 550 },
      'S5/S6': { pourcentageBR: 650 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
