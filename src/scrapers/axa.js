const { buildScrapedEntry } = require('./utils');

/**
 * Données pour AXA Modulango — semelles orthopédiques (petit appareillage).
 *
 * AXA propose les formules MaSanté (ex-Modulango) : Eco, 100%, 125%, 150%, 200%, 400%.
 * Les noms de formule indiquent le taux de remboursement général appliqué aux soins courants.
 * Les PDFs officiels de tableaux de garanties ne sont pas lisibles en scraping (binaires compressés).
 * Les pages web axa.mon-assurance.fr renvoient des 404.
 *
 * Sources et certitudes par formule :
 * - Modulango 100 : nom de formule indique 100% BR, corroboré par description "remboursement à 100% des tarifs conventionnés" — déduit, 0.5
 * - Modulango 125 : nom indique 125% BR, corroboré par "125% remboursement audition et appareillages" — déduit, 0.5
 * - Modulango 150 : nom indique 150% BR, corroboré par "150% remboursement audition et appareillages" — déduit, 0.5
 * - Modulango 200 : nom indique 200% BR — déduit, 0.5
 * - Modulango 400 : nom indique 400% BR — déduit, 0.4
 *
 * Note : les % réels pour "petit appareillage" peuvent différer du % général de la formule.
 * Le PDF officiel est à https://www.maaf.fr/fr/files/live/sites/maaf/... mais illisible en scraping.
 * Vérification humaine recommandée.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'AXA',
    siren: '310499959',
    formules: {
      'Modulango 100': { pourcentageBR: 100 },
      'Modulango 125': { pourcentageBR: 125 },
      'Modulango 150': { pourcentageBR: 150 },
      'Modulango 200': { pourcentageBR: 200 },
      'Modulango 400': { pourcentageBR: 400 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'estimated',
    confidenceScore: 0.4
  });
}

module.exports = { getVerifiedData };
