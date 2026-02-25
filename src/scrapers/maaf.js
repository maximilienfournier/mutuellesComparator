const { fetchPage, parsePourcentageBR, buildScrapedEntry } = require('./utils');

const MAAF_URLS = {
  'Vivazen 1': 'https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_1&nomcontrat=Maaf+Vivazen+Niveau+1',
  'Vivazen 2': 'https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_2&nomcontrat=Maaf+Vivazen+Niveau+2',
  'Vivazen 3': 'https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_3&nomcontrat=Maaf+Vivazen+Niveau+3',
  'Vivazen 4': 'https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_4&nomcontrat=Maaf+Vivazen+Niveau+4',
  'Vivazen 5': 'https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_5&nomcontrat=Maaf+Vivazen+Niveau+5+'
};

/**
 * Données vérifiées depuis mutualib.fr (février 2026).
 * Les semelles orthopédiques relèvent du "petit appareillage et accessoires".
 *
 * Sources par formule :
 * - Vivazen 1 : https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_1 — petit appareillage 100% BR, lu directement
 * - Vivazen 2 : https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_2 — petit appareillage 100% BR, lu directement
 * - Vivazen 3 : https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_3 — petit appareillage 150% BR, lu directement
 * - Vivazen 4 : https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_4 — petit appareillage 200% BR, lu directement
 * - Vivazen 5 : https://mutualib.fr/guide/mutuelle/maaf/detail-contrat.php?codecontrat=MAAF_VIVAZEN_5 — petit appareillage 250% BR, lu directement
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'MAAF',
    siren: '542073580',
    formules: {
      'Vivazen 1': { pourcentageBR: 100 },
      'Vivazen 2': { pourcentageBR: 100 },
      'Vivazen 3': { pourcentageBR: 150 },
      'Vivazen 4': { pourcentageBR: 200 },
      'Vivazen 5': { pourcentageBR: 250 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.8
  });
}

async function scrapeMAAF() {
  const formules = {};
  for (const [nom, url] of Object.entries(MAAF_URLS)) {
    try {
      const html = await fetchPage(url);
      const pct = parsePourcentageBR(html);
      if (pct) {
        formules[nom] = { pourcentageBR: pct };
      }
    } catch (err) {
      console.error(`Erreur scraping MAAF ${nom}: ${err.message}`);
    }
  }

  return buildScrapedEntry({
    nom: 'MAAF',
    siren: '542073580',
    formules,
    dataSource: Object.keys(formules).length > 0 ? 'scraped' : 'estimated',
    confidenceScore: Object.keys(formules).length >= 3 ? 0.7 : 0.3
  });
}

module.exports = { scrapeMAAF, getVerifiedData, MAAF_URLS };
