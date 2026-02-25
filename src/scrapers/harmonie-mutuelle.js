const { fetchPage, buildScrapedEntry, updateMutuellesJson } = require('./utils');

// ===== CONFIGURATION =====
const SIREN = '538518473';
const MUTUELLE_NAME = 'Harmonie Mutuelle';

/**
 * URLs des tableaux de garanties officiels (PDFs) et pages web.
 *
 * Le produit actuel s'appelle "Protection Santé Particuliers" (PSP).
 * Les formules sont codées PSI XYZ :
 *   X = niveau Soins (1-4 étoiles Régime Général, 1-5 Régime Local)
 *   Y = niveau Équipement (1-3 étoiles) — c'est le seul qui impacte les semelles
 *   Z = variante (1 = Régime Général, 3 = Réflexe Éco Pharmacie+Chambre, 4 = Réflexe Éco Pharmacie)
 *
 * Pour les semelles orthopédiques, le remboursement est identique quel que soit
 * le niveau Soins (X) ou la variante (Z). Seul le niveau Équipement (Y) compte.
 */
const URLS = {
  // PDFs officiels des tableaux de garanties par niveau d'équipement
  pdfEquipement1: 'https://campagne.harmonie-mutuelle.fr/pdf/PSPART/PSI210.pdf',
  pdfEquipement2: 'https://campagne.harmonie-mutuelle.fr/pdf/PSPART/PSI220.pdf',
  pdfEquipement3: 'https://campagne.harmonie-mutuelle.fr/pdf/PSPART/PSI230.pdf',
  // Synthèse des garanties (vue d'ensemble)
  pdfSynthese: 'https://www.harmonie-mutuelle.fr/sites/default/files/pdf/SYNTHESE-GARANTIES-PROTECTION-SANTE-PARTICULIERS-DEC-2026_VF.pdf',
  // Page web FAQ semelles orthopédiques
  faqSemelles: 'https://www.harmonie-mutuelle.fr/fonction-publique/fonction-publique-remboursez-vous-semelles-orthopediques',
  // Page principale complémentaire santé
  pageComplementaire: 'https://www.harmonie-mutuelle.fr/particuliers/solutions/mutuelle-sante/complementaire-sante',
  // Devis en ligne (pour connaître les formules proposées)
  devisEnLigne: 'https://protection-sante-particuliers.harmonie-mutuelle.fr/'
};

/**
 * Parse le HTML de la page FAQ semelles pour vérifier les infos de remboursement.
 * Retourne un objet avec les données trouvées ou null.
 */
function parseFaqSemelles(html) {
  const results = {
    mentionsPrescription: false,
    mentionsRemboursement: false,
    pourcentageBR: null
  };

  // Chercher mention de prescription médicale
  if (/prescription\s+m[ée]dicale/i.test(html)) {
    results.mentionsPrescription = true;
  }

  // Chercher pourcentage BR dans le contexte orthopédique
  const brPattern = /(?:semelle|orthop[ée]d|appareillage)[^]*?(\d{2,3})\s*%\s*(?:de la\s*)?(?:BR|BRSS|base de remboursement|du tarif)/gi;
  const matches = [...html.matchAll(brPattern)];
  if (matches.length > 0) {
    results.pourcentageBR = parseInt(matches[0][1], 10);
    results.mentionsRemboursement = true;
  }

  // Chercher mention de forfait
  const forfaitPattern = /forfait[^€]*?(\d+)\s*€/gi;
  const forfaitMatches = [...html.matchAll(forfaitPattern)];
  if (forfaitMatches.length > 0) {
    results.forfait = parseInt(forfaitMatches[0][1], 10);
  }

  return results;
}

/**
 * Scrape les données Harmonie Mutuelle depuis les pages web.
 *
 * Note : les données principales viennent des PDFs officiels qui ne sont pas
 * parsables automatiquement (PDF formatés). Le scraping web ne sert qu'à
 * confirmer des informations partielles. Les données vérifiées dans
 * getVerifiedData() restent la source de référence.
 */
async function scrape() {
  let webDataFound = false;

  // Tenter de scraper la page FAQ semelles
  try {
    const html = await fetchPage(URLS.faqSemelles);
    const parsed = parseFaqSemelles(html);
    if (parsed.mentionsRemboursement || parsed.mentionsPrescription) {
      webDataFound = true;
      console.log('FAQ semelles - données trouvées:', parsed);
    }
  } catch (err) {
    console.warn(`Échec fetch FAQ semelles: ${err.message}`);
  }

  // Tenter de scraper la page complémentaire santé
  try {
    const html = await fetchPage(URLS.pageComplementaire);
    if (/protection\s+sant[ée]\s+particuliers/i.test(html)) {
      webDataFound = true;
      console.log('Page complémentaire - produit PSP confirmé');
    }
  } catch (err) {
    console.warn(`Échec fetch page complémentaire: ${err.message}`);
  }

  // Les données viennent principalement des PDFs officiels (vérifiés manuellement)
  // Le scraping web ne fait que confirmer des informations partielles
  const verified = getVerifiedData();
  if (webDataFound) {
    return { ...verified, confidenceScore: Math.min(verified.confidenceScore + 0.05, 1.0) };
  }
  return verified;
}

/**
 * Données vérifiées manuellement depuis les PDFs officiels Harmonie Mutuelle (février 2026).
 *
 * Produit : "Protection Santé Particuliers" (PSP)
 * Ligne de garantie : "Orthopédie, appareillage et accessoires médicaux acceptés
 *                      par la Sécurité sociale (semelles orthopédiques, minerve...)"
 *
 * Sources par formule :
 * - Équipement 1★ (PSI X1Z) : PDF PSI210 — 60% SS + 40% mutuelle = 100% BR, pas de forfait supplémentaire — lue directement
 * - Équipement 2★ (PSI X2Z) : PDF PSI220 — 60% SS + 40% mutuelle = 100% BR + forfait 100€/an — lue directement
 * - Équipement 3★ (PSI X3Z) : PDF PSI230 — 60% SS + 40% mutuelle = 100% BR + forfait 200€/an — lue directement
 *
 * URLs des PDFs :
 * - PSI210 : https://campagne.harmonie-mutuelle.fr/pdf/PSPART/PSI210.pdf
 * - PSI220 : https://campagne.harmonie-mutuelle.fr/pdf/PSPART/PSI220.pdf
 * - PSI230 : https://campagne.harmonie-mutuelle.fr/pdf/PSPART/PSI230.pdf
 * - Synthèse : https://www.harmonie-mutuelle.fr/sites/default/files/pdf/SYNTHESE-GARANTIES-PROTECTION-SANTE-PARTICULIERS-DEC-2026_VF.pdf
 *
 * Note importante : le %BR est de 100% pour TOUS les niveaux d'équipement.
 * La différence entre niveaux est le forfait annuel complémentaire (0€, 100€, 200€)
 * qui couvre les dépassements au-delà de la base de remboursement.
 * Les niveaux 2★ et 3★ ajoutent aussi une prise en charge des dispositifs
 * refusés par la Sécurité sociale (respectivement 100€/an et 200€/an).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: MUTUELLE_NAME,
    siren: SIREN,
    formules: {
      'Équipement 1★': { pourcentageBR: 100, forfaitAnnuel: 0 },
      'Équipement 2★': { pourcentageBR: 100, forfaitAnnuel: 100 },
      'Équipement 3★': { pourcentageBR: 100, forfaitAnnuel: 200 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale. Limité aux frais réellement dépensés.',
    dataSource: 'scraped',
    confidenceScore: 0.8
  });
}

module.exports = {
  scrape,
  getVerifiedData,
  parseFaqSemelles,
  SIREN,
  MUTUELLE_NAME,
  URLS
};

// Runner standalone : node src/scrapers/harmonie-mutuelle.js
if (require.main === module) {
  scrape().then(data => {
    console.log(`Données ${MUTUELLE_NAME}:`, JSON.stringify(data, null, 2));
    updateMutuellesJson(data);
    console.log('mutuelles.json mis à jour');
  }).catch(err => {
    console.error('Échec du scraping:', err);
    process.exit(1);
  });
}
