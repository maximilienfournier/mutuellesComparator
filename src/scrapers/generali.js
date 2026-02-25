const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels Generali (février 2026).
 *
 * Gamme Santé Pro (TNS/indépendants) — 6 formules P0 à P5.
 * Source : Tableau des garanties Generali Santé Pro (novembre 2024)
 * https://www.generali.fr/sites/default/files-d8/2024-11/SG1756MARK-24_Tableau-des-garanties_GSP_V3.pdf
 * Page 3, section "Matériel médical" :
 * "Prothèses orthopédiques, capillaires et mammaires, grand et petit appareillage,
 *  autre dispositif médical non mentionné par ailleurs dans le tableau des garanties,
 *  remboursés par la Sécurité sociale"
 * Résultat : P0=100%, P1=100%, P2=150%, P3=200%, P4=300%, P5=500% BRSS — lus directement
 *
 * Gamme Santé Seniors (retraités 55+) — 6 formules 1S à 5S (3S déclinée en 2 variantes).
 * Source : Brochure Generali Santé Seniors (janvier 2025)
 * https://www.generali.fr/sites/default/files-d8/2025-01/GV2A82BRC-25_Ficheweb_Generali_sante%CC%81_se%CC%81niors.pdf
 * Page 4, section "Matériel médical" :
 * "Prothèses orthopédiques, petit et grand appareillage, autre dispositif médical
 *  non mentionné par ailleurs dans le tableau des garanties, remboursés par la Sécurité sociale"
 * Résultat : 1S=100%, 2S=150%, 3S Opt/Dent=150%, 3S Hospi/Soins=250%, 4S=400%, 5S=500% BRSS — lus directement
 *
 * SIREN : 552062663 (Generali Iard, confirmé page 9 du PDF Seniors)
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Generali',
    siren: '552062663',
    formules: {
      'Santé Pro P0': { pourcentageBR: 100 },
      'Santé Pro P1': { pourcentageBR: 100 },
      'Santé Pro P2': { pourcentageBR: 150 },
      'Santé Pro P3': { pourcentageBR: 200 },
      'Santé Pro P4': { pourcentageBR: 300 },
      'Santé Pro P5': { pourcentageBR: 500 },
      'Seniors 1S': { pourcentageBR: 100 },
      'Seniors 2S': { pourcentageBR: 150 },
      'Seniors 3S Optique/Dentaire': { pourcentageBR: 150 },
      'Seniors 3S Hospitalisation/Soins': { pourcentageBR: 250 },
      'Seniors 4S': { pourcentageBR: 400 },
      'Seniors 5S': { pourcentageBR: 500 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
