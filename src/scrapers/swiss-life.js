const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le PDF officiel SwissLife Santé Particuliers (01/2022).
 * Gamme : SwissLife Santé Particuliers, 9 niveaux linéaires (assurés < 60 ans).
 *
 * Source : Tableau de garanties 100 % Santé — réf. 5210 - 01.2022
 * https://www.swisslife.fr/content/dam/france/swisslife/SwissLife%20Sant%C3%A9%20Particuliers%20-%20Tableau%20de%20garanties%20012022.pdf
 *
 * Ligne de garantie (page 2, section "Soins courants > Matériel médical") :
 * "Matériel médical, prothèses et appareillages orthopédiques, prothèse capillaire"
 * Niveaux 1-9 : 100%, 100%, 125%, 150%, 175%, 200%, 250%, 300%, 400% — lus directement.
 *
 * SIREN : 322215021 (SwissLife Prévoyance et Santé).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Swiss Life',
    siren: '322215021',
    formules: {
      'Niveau 1': { pourcentageBR: 100 },
      'Niveau 2': { pourcentageBR: 100 },
      'Niveau 3': { pourcentageBR: 125 },
      'Niveau 4': { pourcentageBR: 150 },
      'Niveau 5': { pourcentageBR: 175 },
      'Niveau 6': { pourcentageBR: 200 },
      'Niveau 7': { pourcentageBR: 250 },
      'Niveau 8': { pourcentageBR: 300 },
      'Niveau 9': { pourcentageBR: 400 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
