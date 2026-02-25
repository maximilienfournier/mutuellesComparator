const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le PDF officiel Groupama (février 2026).
 * Source : "Engagement lisibilité — Tableau de garanties 2024, Solution Groupama Santé Active"
 * https://assets.ctfassets.net/7awcp71bzphk/1mUlfRYpqMU4KFzn7dBXZe/e68ae1977be42cc2329a30403cdc03eb/Tableau_de_garanties_2023_-publication_27_oct.pdf
 *
 * Page 2, section "Matériel médical" (exemple : "Achat d'une paire de béquille").
 * Les semelles orthopédiques relèvent de la même catégorie petit appareillage.
 *
 * Tous les 5 niveaux sont maintenant confirmés par le PDF officiel.
 * Le Niveau 5 était précédemment estimé à 250% — la valeur réelle est 300%.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Groupama',
    siren: '343115135',
    formules: {
      'Santé Active Niveau 1': { pourcentageBR: 100 },
      'Santé Active Niveau 2': { pourcentageBR: 130 },
      'Santé Active Niveau 3': { pourcentageBR: 150 },
      'Santé Active Niveau 4': { pourcentageBR: 200 },
      'Santé Active Niveau 5': { pourcentageBR: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
