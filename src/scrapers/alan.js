const https = require('https');
const fs = require('fs');
const path = require('path');

const ALAN_SIREN = '813369193';
const MUTUELLE_NAME = 'Alan';
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'mutuelles.json');

// Alan's known guarantee pages
const SOURCES = [
  'https://alan.com/fr-fr/assurance-sante/remboursements-sante/a/semelles-orthopediques',
  'https://alan.com/fr-fr/assurance-sante/remboursements-sante/a/garanties-mutuelle-sante'
];

/**
 * Fetch a URL and return the HTML body as a string.
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MutuellesComparator/1.0' } }, (res) => {
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
 * Parse HTML content looking for orthopedic insole reimbursement data.
 *
 * Distinguishes between:
 * - BR values explicitly tied to a formula name (high confidence)
 * - Generic BR values found on page (low confidence — could be Sécu rates or examples)
 * - Forfait amounts near orthopedic/semelle context (medium confidence)
 * - Forfait amounts in unrelated context (ignored)
 */
function parseRemboursementData(html) {
  const results = {
    formules: {},
    forfaitAnnuel: null,
    confirmedForfait: null,
    frequence: null,
    conditions: null
  };

  // Look for BR percentage patterns (e.g., "150 % BR", "200%BR", "300 % de la BR")
  const brPattern = /(\d{2,3})\s*%\s*(?:de la\s*)?(?:BR|BRSS|base de remboursement)/gi;
  const brMatches = [...html.matchAll(brPattern)];
  if (brMatches.length > 0) {
    results.foundBRValues = brMatches.map(m => parseInt(m[1], 10));
  }

  // Look for formula-specific BR: "Alan Green : 200 % BR" or "Blue.*200%.*BR"
  const formulaBRPattern = /Alan\s+(Blue|Green|Purple|Pink)\s*[:\-–]?\s*(\d{2,3})\s*%\s*(?:de la\s*)?(?:BR|BRSS)/gi;
  const formulaBRMatches = [...html.matchAll(formulaBRPattern)];
  if (formulaBRMatches.length > 0) {
    results.formulaBRValues = {};
    for (const m of formulaBRMatches) {
      results.formulaBRValues[m[1]] = parseInt(m[2], 10);
    }
  }

  // Look for forfait near semelle/orthopédie context (within ~200 chars)
  const semelleForfaitPattern = /(?:semelle|orthop[ée]d|orthèse|appareillage)[^]*?forfait[^€]*?(\d+)\s*€|forfait[^€]*?(\d+)\s*€[^]*?(?:semelle|orthop[ée]d|orthèse|appareillage)/gi;
  const semelleForfaitMatches = [...html.matchAll(semelleForfaitPattern)];
  if (semelleForfaitMatches.length > 0) {
    results.confirmedForfait = parseInt(semelleForfaitMatches[0][1] || semelleForfaitMatches[0][2], 10);
  }

  // Generic forfait (low trust — could be any health domain)
  const forfaitPattern = /forfait[^€]*?(\d+)\s*€|(\d+)\s*€\s*(?:par an|\/an|annuel)/gi;
  const forfaitMatches = [...html.matchAll(forfaitPattern)];
  if (forfaitMatches.length > 0) {
    results.forfaitAnnuel = parseInt(forfaitMatches[0][1] || forfaitMatches[0][2], 10);
  }

  // Look for frequency patterns
  const freqPattern = /(1|2|une|deux)\s*paire[s]?\s*par\s*an/i;
  const freqMatch = html.match(freqPattern);
  if (freqMatch) {
    results.frequence = freqMatch[0];
  }

  // Look for formula names (Alan-specific: Blue, Green, Purple)
  const formulaPattern = /Alan\s+(Blue|Green|Purple|Pink)/gi;
  const formulaMatches = [...html.matchAll(formulaPattern)];
  if (formulaMatches.length > 0) {
    results.foundFormulas = [...new Set(formulaMatches.map(m => m[1]))];
  }

  return results;
}

/**
 * Build the mutuelle data entry for Alan.
 *
 * IMPORTANT: The BR percentages below are ESTIMATES, not confirmed data.
 * Alan's guarantee table PDFs are compressed and unreadable by automated tools.
 * No public comparator site lists Alan's exact % BR for orthopedic insoles.
 * These values are educated guesses based on general market positioning.
 */
function buildAlanData(scrapedData) {
  // WARNING: These are estimated values, NOT confirmed from official sources.
  // Alan's actual guarantee tables (PDFs) could not be parsed.
  // Confidence remains low until verified against official documents.
  const estimatedFormules = {
    Blue: { pourcentageBR: 250 },
    Green: { pourcentageBR: 200 },
    Purple: { pourcentageBR: 300 }
  };

  // Only upgrade from "estimated" if scraping found BR values that are
  // clearly tied to specific Alan formulas (not just generic Sécu rates)
  let dataSource = 'estimated';
  let confidenceScore = 0.2;
  let formules = estimatedFormules;

  if (scrapedData && scrapedData.formulaBRValues && Object.keys(scrapedData.formulaBRValues).length > 0) {
    // We found BR values explicitly associated with named formulas
    formules = {};
    for (const [name, br] of Object.entries(scrapedData.formulaBRValues)) {
      formules[name] = { pourcentageBR: br };
    }
    dataSource = 'scraped';
    confidenceScore = 0.8;
  } else if (scrapedData && scrapedData.foundBRValues && scrapedData.foundBRValues.length > 0) {
    // We found BR values but can't attribute them to specific formulas.
    // Keep estimated formules, note that some values were found on page.
    dataSource = 'estimated';
    confidenceScore = 0.3;
  }

  // Forfait: only trust if clearly associated with semelles/orthopédie context
  const forfait = scrapedData?.confirmedForfait ?? null;

  return {
    nom: MUTUELLE_NAME,
    siren: ALAN_SIREN,
    formules,
    forfaitAnnuel: forfait,
    frequence: scrapedData?.frequence || '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource,
    confidenceScore,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

/**
 * Run the scraper: fetch Alan's pages, parse data, update mutuelles.json.
 */
async function scrape() {
  let scrapedData = null;

  for (const url of SOURCES) {
    try {
      const html = await fetchPage(url);
      const parsed = parseRemboursementData(html);
      if (parsed.foundBRValues || parsed.forfaitAnnuel) {
        scrapedData = { ...scrapedData, ...parsed };
      }
    } catch (err) {
      console.warn(`Failed to fetch ${url}: ${err.message}`);
    }
  }

  const alanData = buildAlanData(scrapedData);
  return alanData;
}

/**
 * Update the mutuelles.json file with new Alan data.
 */
function updateMutuellesJson(alanData) {
  const mutuelles = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const index = mutuelles.findIndex(m => m.siren === ALAN_SIREN);

  if (index >= 0) {
    mutuelles[index] = alanData;
  } else {
    mutuelles.push(alanData);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(mutuelles, null, 2) + '\n', 'utf-8');
  return mutuelles[index >= 0 ? index : mutuelles.length - 1];
}

module.exports = {
  fetchPage,
  parseRemboursementData,
  buildAlanData,
  updateMutuellesJson,
  scrape,
  ALAN_SIREN,
  SOURCES
};

// Run directly: node src/scrapers/alan.js
if (require.main === module) {
  scrape().then(data => {
    console.log('Scraped Alan data:', JSON.stringify(data, null, 2));
    updateMutuellesJson(data);
    console.log('Updated mutuelles.json');
  }).catch(err => {
    console.error('Scrape failed:', err);
    process.exit(1);
  });
}
