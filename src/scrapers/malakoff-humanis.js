const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis mutualib.fr (février 2026).
 * Les semelles orthopédiques relèvent du "petit appareillage et accessoires".
 *
 * Sources par formule :
 * - Niveau 1 : https://mutualib.fr/guide/mutuelle/april/detail-contrat.php?codecontrat=APRIL_MALAKOFF_1_0 — petit appareillage 100% BR, lu directement
 * - Niveau 2 : https://mutualib.fr/guide/mutuelle/april/detail-contrat.php?codecontrat=APRIL_MALAKOFF_2_0 — petit appareillage 125% BR, lu directement
 * - Niveau 3 : https://mutualib.fr/guide/mutuelle/april/detail-contrat.php?codecontrat=APRIL_MALAKOFF_3_0 — petit appareillage 150% BR, lu directement
 * - Niveau 4 : https://mutualib.fr/guide/mutuelle/april/detail-contrat.php?codecontrat=APRIL_MALAKOFF_4_0 — petit appareillage 175% BR, lu directement
 * - Niveau 5 : https://mutualib.fr/guide/mutuelle/april/detail-contrat.php?codecontrat=APRIL_MALAKOFF_5_0 — petit appareillage 200% BR, lu directement
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Malakoff Humanis',
    siren: '775691732',
    formules: {
      'Niveau 1': { pourcentageBR: 100 },
      'Niveau 2': { pourcentageBR: 125 },
      'Niveau 3': { pourcentageBR: 150, forfaitPodologie: { montantAnnuel: 80, montantParSeance: 10, nbSeancesMax: null, enveloppePartagee: null } },
      'Niveau 4': { pourcentageBR: 175, forfaitPodologie: { montantAnnuel: 120, montantParSeance: 15, nbSeancesMax: null, enveloppePartagee: null } },
      'Niveau 5': { pourcentageBR: 200, forfaitPodologie: { montantAnnuel: 160, montantParSeance: 20, nbSeancesMax: null, enveloppePartagee: null } }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.8
  });
}

module.exports = { getVerifiedData };
