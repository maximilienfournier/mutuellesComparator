const https = require('https');

const MGEN_URLS = {
  initiale: 'https://www.mgen.fr/offres-sante-prevoyance/mgen-sante-prevoyance/mgen-initiale/',
  reference: 'https://www.mgen.fr/offres-sante-prevoyance/mgen-sante-prevoyance/mgen-reference/',
  integrale: 'https://www.mgen.fr/offres-sante-prevoyance/mgen-sante-prevoyance/mgen-integrale/'
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Parse le pourcentage BR pour les semelles orthopédiques depuis le HTML d'une page MGEN.
 * Cherche des patterns comme "230 %" ou "350%" dans le contexte de semelles/orthopédie.
 */
function parsePourcentageBR(html) {
  // Chercher un pattern de pourcentage dans le contexte "semelles" ou "orthopédie" ou "appareillage"
  const patterns = [
    /semelles?\s+orthop[ée]diques?[^]*?(\d{2,3})\s*%/i,
    /orthop[ée]die[^]*?(\d{2,3})\s*%/i,
    /petit\s+appareillage[^]*?(\d{2,3})\s*%/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const pct = parseInt(match[1], 10);
      if (pct >= 60 && pct <= 500) return pct;
    }
  }
  return null;
}

/**
 * Scrape les données MGEN depuis les pages officielles.
 * Retourne les données de la mutuelle au format mutuelles.json.
 */
async function scrapeMGEN() {
  const formules = {};

  for (const [key, url] of Object.entries(MGEN_URLS)) {
    try {
      const html = await fetchPage(url);
      const pct = parsePourcentageBR(html);
      const nomFormule = key === 'initiale' ? 'Initiale'
        : key === 'reference' ? 'Référence'
        : 'Intégrale';
      if (pct) {
        formules[nomFormule] = { pourcentageBR: pct };
      }
    } catch (err) {
      console.error(`Erreur scraping MGEN ${key}: ${err.message}`);
    }
  }

  return {
    nom: 'MGEN',
    siren: '775685399',
    formules,
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.7,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

/**
 * Données vérifiées manuellement depuis les pages officielles MGEN (février 2026).
 * Sources :
 *   - https://www.mgen.fr/offres-sante-prevoyance/mgen-sante-prevoyance/mgen-initiale/
 *   - https://www.mgen.fr/offres-sante-prevoyance/mgen-sante-prevoyance/mgen-reference/
 *   - https://www.mgen.fr/offres-sante-prevoyance/mgen-sante-prevoyance/mgen-integrale/
 */
function getVerifiedData() {
  return {
    nom: 'MGEN',
    siren: '775685399',
    formules: {
      'Initiale': { pourcentageBR: 100, forfaitPodologie: { montantAnnuel: 80, montantParSeance: 40, nbSeancesMax: null, enveloppePartagee: 'médecines douces' } },
      'Référence': { pourcentageBR: 230, forfaitPodologie: { montantAnnuel: 100, montantParSeance: 40, nbSeancesMax: null, enveloppePartagee: 'médecines douces' } },
      'Intégrale': { pourcentageBR: 350, forfaitPodologie: { montantAnnuel: 160, montantParSeance: 40, nbSeancesMax: null, enveloppePartagee: 'médecines douces' } }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.8,
    lastUpdated: '2026-02-25'
  };
}

module.exports = { scrapeMGEN, getVerifiedData, fetchPage, parsePourcentageBR, MGEN_URLS };
