const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels AXA "Ma Santé" (février 2026).
 * Le produit actuel s'appelle "Ma Santé" (ex-Modulango).
 * Ligne de garantie : "Prothèses, pansements, petits matériels et autres produits
 * définis sur la LPP (hors lunettes et aides auditives)".
 *
 * Sources par formule (PDFs tableaux de garanties sur media.axa.fr) :
 * - Hospi Tradi : https://media.axa.fr/content/dam/axa-fr/image/particuliers/sante/document-pdf/tableau-garanties-ma-sante-hospi-tradi.pdf — non couvert, lu directement
 * - Eco Tradi : https://media.axa.fr/content/dam/axa-fr/image/particuliers/sante/document-pdf/tableau-garanties-ma-sante-eco-tradi.pdf — 95% BR, lu directement
 * - 100% Néo : https://media.axa.fr/content/dam/axa-fr/image/particuliers/sante/document-pdf/tableau-garanties-ma-sante-100-neo.pdf — 100% BR, lu directement
 * - 125% Néo : https://media.axa.fr/content/dam/axa-fr/image/particuliers/sante/document-pdf/tableau-garanties-ma-sante-125-neo.pdf — 125% BR, lu directement
 * - 150% Néo : https://media.axa.fr/content/dam/axa-fr/image/particuliers/sante/document-pdf/tableau-garanties-ma-sante-150-neo.pdf — 150% BR, lu directement
 * - 200% Néo : https://media.axa.fr/content/dam/axa-fr/image/particuliers/sante/document-pdf/tableau-garanties-ma-sante-200-neo.pdf — 200% BR, lu directement
 * - 400% Tradi : https://media.axa.fr/content/dam/axa-fr/image/particuliers/sante/document-pdf/tableau-garanties-ma-sante-400-tradi.pdf — 400% BR, lu directement
 *
 * Note : Hospi Tradi exclue car ne couvre pas le petit appareillage.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'AXA',
    siren: '310499959',
    formules: {
      'Ma Santé Eco Tradi': { pourcentageBR: 95 },
      'Ma Santé 100% Néo': { pourcentageBR: 100 },
      'Ma Santé 125% Néo': { pourcentageBR: 125 },
      'Ma Santé 150% Néo': { pourcentageBR: 150 },
      'Ma Santé 200% Néo': { pourcentageBR: 200 },
      'Ma Santé 400% Tradi': { pourcentageBR: 400 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale. Formule Hospi Tradi non couverte pour le petit appareillage.',
    dataSource: 'scraped',
    confidenceScore: 0.8
  });
}

module.exports = { getVerifiedData };
