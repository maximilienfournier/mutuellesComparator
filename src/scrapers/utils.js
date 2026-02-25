const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'mutuelles.json');

/**
 * Fetch a URL and return the body as a string.
 * Follows redirects (301-399). Supports both http and https.
 */
function fetchPage(url) {
  const client = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MutuellesComparator/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchPage(redirectUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Parse le pourcentage BR pour les semelles orthopédiques depuis du HTML.
 * Cherche des patterns comme "230 %" dans le contexte de semelles/orthopédie.
 * Retourne le pourcentage (60-500) ou null.
 */
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

/**
 * Construit un objet mutuelle standardisé avec lastUpdated = aujourd'hui.
 */
function buildScrapedEntry({ nom, siren, formules, forfaitAnnuel, frequence, conditions, dataSource, confidenceScore }) {
  return {
    nom,
    siren,
    formules,
    forfaitAnnuel: forfaitAnnuel ?? null,
    frequence: frequence || '1 paire par an',
    conditions: conditions || 'Sur prescription médicale',
    dataSource: dataSource || 'estimated',
    confidenceScore: confidenceScore ?? 0.2,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

/**
 * Met à jour une mutuelle dans mutuelles.json (recherche par SIREN).
 */
function updateMutuellesJson(mutuelleData, dataFilePath) {
  const filePath = dataFilePath || DATA_FILE;
  const mutuelles = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const index = mutuelles.findIndex(m => m.siren === mutuelleData.siren);

  if (index >= 0) {
    mutuelles[index] = mutuelleData;
  } else {
    mutuelles.push(mutuelleData);
  }

  fs.writeFileSync(filePath, JSON.stringify(mutuelles, null, 2) + '\n', 'utf-8');
  return mutuelles[index >= 0 ? index : mutuelles.length - 1];
}

module.exports = {
  fetchPage,
  parsePourcentageBR,
  buildScrapedEntry,
  updateMutuellesJson,
  DATA_FILE
};
