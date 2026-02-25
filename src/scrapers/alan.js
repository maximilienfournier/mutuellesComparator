const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels Alan (février 2026).
 * Catégorie : "Matériel médical" (inclut semelles orthopédiques / petit appareillage).
 *
 * Sources par formule (PDFs tableaux de garanties) :
 * - Alan Blue : https://www.coover.fr/wp-content/uploads/2022/06/alan-blue-tableau-des-garanties.pdf — 400% BR, lu directement
 * - Alan Green : https://www.coover.fr/wp-content/uploads/2022/06/Alan-green-tableau-de-garanties.pdf — 300% BR, lu directement
 * - Alan Purple : aucun PDF officiel trouvé. Estimé à 500% BR (formule la plus haut de gamme, au-dessus de Blue).
 *
 * Note : les anciennes valeurs (Blue=250%, Green=200%, Purple=300%) étaient largement sous-estimées.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Alan',
    siren: '813369193',
    formules: {
      'Green': { pourcentageBR: 300 },
      'Blue': { pourcentageBR: 400 },
      'Purple': { pourcentageBR: 500 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.8
  });
}

module.exports = { getVerifiedData };
