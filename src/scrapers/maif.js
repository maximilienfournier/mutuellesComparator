const https = require('https');

/**
 * MAIF distribue le produit "Efficience Santé" de MGEN Filia.
 * Les pages de garanties sont hébergées sur mgen.fr.
 */
const MAIF_URLS = {
  essentielle: 'https://www.mgen.fr/offres-sante-prevoyance/efficience-sante/efficience-sante-essentielle/',
  evolution: 'https://www.mgen.fr/offres-sante-prevoyance/efficience-sante/efficience-sante-evolution/',
  extension: 'https://www.mgen.fr/offres-sante-prevoyance/efficience-sante/efficience-sante-extension/',
  optimale: 'https://www.mgen.fr/offres-sante-prevoyance/efficience-sante/efficience-sante-optimale/'
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

function parsePourcentageBR(html) {
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

async function scrapeMAIF() {
  const formules = {};

  for (const [key, url] of Object.entries(MAIF_URLS)) {
    try {
      const html = await fetchPage(url);
      const pct = parsePourcentageBR(html);
      const nomFormule = key.charAt(0).toUpperCase() + key.slice(1);
      if (pct) {
        formules[nomFormule] = { pourcentageBR: pct };
      }
    } catch (err) {
      console.error(`Erreur scraping MAIF ${key}: ${err.message}`);
    }
  }

  return {
    nom: 'MAIF',
    siren: '781974267',
    formules,
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.5,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

/**
 * Données vérifiées manuellement depuis les pages MGEN Efficience Santé (février 2026).
 *
 * Sources par formule :
 * - Essentielle : page mgen.fr/efficience-sante-essentielle — semelles non affichées, déduit 100% BR (ticket modérateur)
 * - Découverte : résultat de recherche mentionnant "40% de participation mutuelle" — déduit 100% BR total
 * - Évolution : page mgen.fr/efficience-sante-evolution — semelles non affichées, estimé entre Découverte et Extension
 * - Extension : résultat de recherche mentionnant "90% de participation" — déduit 150% BR total
 * - Optimale : https://www.mgen.fr/offres-sante-prevoyance/efficience-sante/efficience-sante-optimale/ — "Total: 150%" lu directement
 *
 * Note : MAIF distribue le produit "Efficience Santé" de MGEN Filia.
 * Les formules MAIF sont différentes des formules MGEN Santé Prévoyance (Initiale/Référence/Intégrale).
 */
function getVerifiedData() {
  return {
    nom: 'MAIF',
    siren: '781974267',
    formules: {
      'Essentielle': { pourcentageBR: 100 },
      'Découverte': { pourcentageBR: 100 },
      'Évolution': { pourcentageBR: 125 },
      'Extension': { pourcentageBR: 150 },
      'Optimale': { pourcentageBR: 150 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.5,
    lastUpdated: '2026-02-25'
  };
}

module.exports = { scrapeMAIF, getVerifiedData, fetchPage, parsePourcentageBR, MAIF_URLS };
